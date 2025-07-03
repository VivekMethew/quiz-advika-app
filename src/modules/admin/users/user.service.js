const { HTTP_CODES, MESSAGES, CONSTANTS, URLS } = require("../../../config");
const { User } = require("../../../models/users.model");
const { BadRequestException } = require("../../../helpers/errorResponse");
const { serviceResponse } = require("../../../helpers/response");
const { jwt } = require("../../../utils");
const {
  generateOtp,
  generateUniqueID,
} = require("../../../utils/generate.utils");
const { OtpModel } = require("../../../models/otp.model");
const ses = require("../../../utils/sendgrid");
const bcrypt = require("bcrypt");
const { FileModel } = require("../../../models/files.model");

exports.register = async (payload) => {
  if (!payload.password) {
    return serviceResponse(false, HTTP_CODES.BAD_REQUEST, MESSAGES.PASS_REQ);
  }
  payload.fname = payload.fullname.split(" ")[0];
  payload.lname = payload.fullname.split(" ")[1];

  const user = await User.findOne({ email: payload.email });
  if (user) {
    return serviceResponse(false, HTTP_CODES.BAD_REQUEST, MESSAGES.EMAIL_EXIST);
  }

  const userCount = await User.countDocuments({});

  payload.idd = generateUniqueID(userCount ? userCount + 1 : 1);

  const response = await User.create(payload);
  return serviceResponse(true, HTTP_CODES.CREATED, MESSAGES.CREATED, {
    id: response._id,
    role: response.role,
    status: response.status,
  });
};

exports.login = async (params) => {
  const { email, password } = params;

  const user = await User.findOne({ email });
  if (!user) throw new BadRequestException(MESSAGES.LOGIN_FAILED);

  const isMatch = await user.isValidPassword(password);
  if (!isMatch) throw new BadRequestException(MESSAGES.LOGIN_FAILED);

  const accessToken = jwt.generateAccessToken({
    id: user._id,
    email: user.email,
    role: CONSTANTS.USER.ROLES.ADMIN,
  });
  const refreshToken = jwt.generateRefreshToken({
    id: user._id,
    email: user.email,
    role: CONSTANTS.USER.ROLES.ADMIN,
  });

  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.LOGIN, {
    id: user._id,
    fname: user.fname,
    lname: user.lname || "",
    email: user.email,
    role: CONSTANTS.USER.ROLES.ADMIN,
    accessToken,
    refreshToken,
  });
};

exports.getProfile = async (userId) => {
  const response = await User.findById(userId)
    .populate({
      path: "avatar",
      select: "url",
      model: FileModel,
    })
    .select(
      "idd role isAuth fname lname email phone description avatar status"
    );
  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.FETCH, response);
};

exports.generateID = async () => {
  const response = await User.find().select("idd");
  response.forEach(async (item, index) => {
    const idds = generateUniqueID(index + 1);
    await User.findByIdAndUpdate(
      { _id: item._id },
      { idd: idds },
      { new: true }
    );
  });
  return serviceResponse(
    true,
    HTTP_CODES.OK,
    MESSAGES.FETCH,
    await User.find().select("idd")
  );
};

exports.deleteProfile = async (email) => {
  const response = await User.findOne({
    email: email,
    isDeleted: null,
  }).select("role isAuth fname lname email phone description avatar status");

  if (!response) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }

  await User.findByIdAndUpdate(
    { _id: response._id },
    { isDeleted: new Date() },
    { new: true }
  );

  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.DELETED);
};

exports.updateProfile = async (userId, payload) => {
  if (payload.fullname) {
    payload.fname = payload.fullname.split(" ")[0];
    payload.lname = payload.fullname.split(" ")[1];
    delete payload.fullname;
  }
  const response = await User.findByIdAndUpdate(userId, payload, { new: true });
  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.UPDATED, response);
};

exports.changePassword = async (userId, payload) => {
  const user = await User.findById(userId);
  if (!user) throw new BadRequestException(MESSAGES.USER.LOGIN.INVALID_CREDS);
  const isMatch = await user.isValidPassword(payload.oldPassword);
  if (!isMatch)
    throw new BadRequestException(MESSAGES.USER.LOGIN.INVALID_CREDS);
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(payload.password, salt);
  const response = await User.findByIdAndUpdate(
    userId,
    { password: hashPassword },
    { new: true }
  );
  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.PASS_CHANGED, {
    id: response._id,
  });
};

exports.forgetPassword = async (payload) => {
  const response = await User.findOne({ email: payload.email });
  if (!response) {
    return serviceResponse(false, HTTP_CODES.BAD_REQUEST, MESSAGES.NOT_FOUND);
  }
  const otoCode = generateOtp();

  const code = jwt.generateResetPasswordLinkCode({
    id: response._id,
    email: response.email,
    role: CONSTANTS.USER.ROLES.MODERATOR,
  });

  await OtpModel.create({
    userId: response._id,
    otp: otoCode,
    code: code,
  });

  const options = {
    email: response.email,
    name: response.fname,
    lname: response.fname,
    resetLink: `${URLS.FRONTEND}/otp?code=${code}`,
  };

  try {
    ses.send(ses.resetPassword, options);
  } catch (e) {
    console.log(e.message);
  }

  return serviceResponse(true, HTTP_CODES.CREATED, MESSAGES.OTP_SENT, {
    id: response._id,
    role: response.role,
    email: response.email,
    link: options.resetLink,
    createdAt: response.createdAt,
  });
};

exports.UserLogout = async () => {
  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.LOGOUT);
};

exports.validateOtp = async (payload) => {
  const result = await OtpModel.findOne({
    code: payload.code,
    otp: payload.otp,
    status: CONSTANTS.USER.OTPS.L1,
  });
  if (!result) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }
  const response = await User.findById(result.userId);
  if (!response) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }
  if (response.isBlock) {
    return serviceResponse(false, HTTP_CODES.FORBIDDEN, MESSAGES.BLOCKED);
  }

  const isValidate = await OtpModel.findOne({
    userId: response._id,
    otp: payload.otp,
    status: CONSTANTS.USER.OTPS.L1,
  });
  if (!isValidate) {
    return serviceResponse(false, HTTP_CODES.BAD_REQUEST, MESSAGES.INVALID_OTP);
  }

  await OtpModel.findOneAndUpdate(
    { userId: response._id, otp: payload.otp, status: CONSTANTS.USER.OTPS.L1 },
    { status: CONSTANTS.USER.OTPS.L2 },
    { new: true }
  );

  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.VERIFIED_OTP, {
    id: response._id,
    email: response.email,
    code: isValidate.code,
  });
};

exports.resetPassword = async (payload) => {
  const response = await User.findOne({
    email: payload.email,
  });
  if (!response) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }
  if (response.isBlock) {
    return serviceResponse(false, HTTP_CODES.FORBIDDEN, MESSAGES.BLOCKED);
  }

  const isValidate = await OtpModel.findOne({
    userId: response._id,
    code: payload.code,
    status: CONSTANTS.USER.OTPS.L2,
  });
  if (!isValidate) {
    return serviceResponse(
      false,
      HTTP_CODES.BAD_REQUEST,
      MESSAGES.INVALID_CODE
    );
  }
  if (isValidate.isUsed) {
    return serviceResponse(false, HTTP_CODES.BAD_REQUEST, MESSAGES.CODE_USED);
  }

  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(payload.password, salt);

  await User.findByIdAndUpdate(
    response._id,
    { password: hashPassword },
    { new: true }
  );

  await OtpModel.findByIdAndUpdate(
    isValidate._id,
    { isUsed: true },
    { new: true }
  );

  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.PASS_CHANGED, {
    id: response._id,
    email: response.email,
  });
};

exports.getToken = async (userId) => {
  const response = await User.findOne({ _id: userId, isDeleted: null });
  if (!response) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }
  if (response.isBlock) {
    return serviceResponse(false, HTTP_CODES.FORBIDDEN, MESSAGES.BLOCKED);
  }

  const options = {
    id: response._id,
    phone: response.phone,
    role: CONSTANTS.USER.ROLES.ADMIN,
  };
  const accessToken = jwt.generateAccessToken(options);
  const refreshToken = jwt.generateRefreshToken(options);

  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.OK, {
    accessToken,
    refreshToken,
  });
};

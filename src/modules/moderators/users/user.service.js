const { HTTP_CODES, MESSAGES, CONSTANTS, URLS } = require("../../../config");
const { User } = require("../../../models/users.model");
const { AuthModel } = require("../../../models/auth.model");
const { BadRequestException } = require("../../../helpers/errorResponse");
const { serviceResponse } = require("../../../helpers/response");
const { jwt, logger } = require("../../../utils");
const {
  generateOtp,
  generateUniqueID,
} = require("../../../utils/generate.utils");
const { OtpModel } = require("../../../models/otp.model");
const ses = require("../../../utils/sendgrid");
const bcrypt = require("bcrypt");
const { fileModel, FileModel } = require("../../../models/files.model");
const {
  loginPlanChooses,
} = require("../subscriptionPlans/choose.plans.service");
const { MySubscriptionModel } = require("../../../models/plans.selected.model");
const {
  SubscriptionsModel,
} = require("../../../models/subsription.plans.model");

exports.register = async (payload) => {
  if (!payload.password) {
    return serviceResponse(false, HTTP_CODES.BAD_REQUEST, MESSAGES.PASS_REQ);
  }
  payload.fname = payload.fullname.split(" ")[0];
  payload.lname =
    payload.fullname.indexOf(" ") !== -1
      ? payload.fullname.substring(payload.fullname.indexOf(" ") + 1)
      : "";

  const user = await User.findOne({ email: payload.email });
  if (user) {
    return serviceResponse(false, HTTP_CODES.BAD_REQUEST, MESSAGES.EMAIL_EXIST);
  }

  payload.idd = generateUniqueID((await User.countDocuments({})) + 1);

  const response = await User.create(payload);
  return serviceResponse(true, HTTP_CODES.CREATED, MESSAGES.CREATED, {
    id: response._id,
    role: response.role,
    status: response.status,
  });
};

exports.login = async (params) => {
  const { email, password } = params;

  const user = await User.findOne({ email, isDeleted: null });
  if (!user) throw new BadRequestException(MESSAGES.LOGIN_FAILED);
  if (user.isBlock === true)
    throw new BadRequestException(MESSAGES.ACCOUNT_DEACTIVATED);

  const isMatch = await user.isValidPassword(password);
  if (!isMatch) throw new BadRequestException(MESSAGES.LOGIN_FAILED);

  let jwtPayload = {
    id: user._id,
    email: user.email,
    LoginType: "email",
    role: user.role,
  };

  try {
    let findQuery = { name: "trial", isDeleted: null };
    const response = await SubscriptionsModel.findOne(findQuery);

    if (!response) {
      console.log("plan does not exist");
    }
    const isChoosePlan = await MySubscriptionModel.findOne({
      purchasedBy: user._id,
      isDeleted: null,
    }).populate({ path: "subId", model: SubscriptionsModel });

    if (!isChoosePlan) {
      await loginPlanChooses(response._id, {
        purchasedBy: user._id,
        planDurationType: "trial",
      });
    } else {
      logger.info(`plan :=> ${isChoosePlan.subId.name}`);
    }
  } catch (error) {
    console.log(error.message);
  }

  const accessToken = jwt.generateAccessToken(jwtPayload);
  const refreshToken = jwt.generateRefreshToken(jwtPayload);

  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.LOGIN, {
    id: user._id,
    fname: user.fname,
    lname: user.lname || "",
    email: user.email,
    role: user.role,
    LoginType: "email",
    accessToken,
    refreshToken,
  });
};

exports.authLogin = async (params) => {
  let payload = {};

  payload.authUserId = params.id;
  payload.fullname = params.displayName;
  payload.email = params.type === "google" && params._json.email.toLowerCase();
  payload.url =
    params.type === "google"
      ? params._json.picture
      : params._json.picture.data.url;

  // 1 : IF USER ALREADY EXIST
  let user = await AuthModel.findOne({ authUserId: params.id }).populate({
    path: "userId",
    model: User,
  });

  if (!user) {
    if (params.type === "google") {
      const isUser = await User.findOne({
        email: payload.email,
      });
      if (isUser) {
        const otoCode = generateOtp();
        const code = jwt.generateResetPasswordLinkCode({
          id: isUser._id,
          email: isUser.email,
          role: CONSTANTS.USER.ROLES.MODERATOR,
        });

        await OtpModel.create({
          userId: isUser._id,
          otp: otoCode,
          code: code,
        });

        const options = {
          email: isUser.email,
          fname: isUser.fname,
          lname: isUser.lname,
          otp: otoCode,
          resetLink: `${URLS.FRONTEND}/otp?code=${code}`,
        };

        try {
          ses.send(ses.resetPassword, options);
        } catch (e) {
          console.log(e.message);
        }

        payload.userId = isUser._id;
        await AuthModel.create(payload);

        const accessToken = jwt.generateAccessToken({
          id: isUser._id,
          LoginType: params.type === "google" ? "google" : "facebook",
          email: isUser.email,
          role: CONSTANTS.USER.ROLES.MODERATOR,
        });
        const refreshToken = jwt.generateRefreshToken({
          id: isUser._id,
          LoginType: params.type === "google" ? "google" : "facebook",
          email: isUser.email,
          role: CONSTANTS.USER.ROLES.MODERATOR,
        });

        return serviceResponse(true, HTTP_CODES.CREATED, MESSAGES.LOGIN, {
          id: isUser._id,
          email: isUser.email,
          fname: isUser.fname,
          lname: isUser.lname || "",
          LoginType: params.type === "google" ? "google" : "facebook",
          social: params.type,
          role: CONSTANTS.USER.ROLES.MODERATOR,
          accessToken,
          refreshToken,
        });
      }
    }

    let UserPayload = {
      isAuth: true,
      fname: payload.fullname,
      profileUrl: payload.url,
      password: CONSTANTS.USER.DEFAULT_PASSWORD,
    };

    if (payload.email) {
      UserPayload.email = payload.email;
    }

    UserPayload.idd = generateUniqueID((await User.countDocuments({})) + 1);
    const response = await User.create(UserPayload);
    payload.userId = response._id;

    await AuthModel.create(payload);

    try {
      let findQuery = { name: "trial", isDeleted: null };
      const response1 = await SubscriptionsModel.findOne(findQuery);

      if (!response1) {
        logger.info("plan does not exist");
      }
      const isChoosePlan = await MySubscriptionModel.findOne({
        purchasedBy: response._id,
        isDeleted: null,
      }).populate({ path: "subId", model: SubscriptionsModel });

      if (!isChoosePlan) {
        await loginPlanChooses(response1._id, {
          purchasedBy: response._id,
          planDurationType: "trial",
        });
      } else {
        logger.info(`plan :=> ${isChoosePlan.subId.name}`);
      }
    } catch (error) {
      console.log(error.message);
    }

    const accessToken = jwt.generateAccessToken({
      id: response._id,
      LoginType: params.type === "google" ? "google" : "facebook",
      email: response.email ? response.email : null,
      role: CONSTANTS.USER.ROLES.MODERATOR,
    });
    const refreshToken = jwt.generateRefreshToken({
      id: response._id,
      LoginType: params.type === "google" ? "google" : "facebook",
      email: response.email ? response.email : null,
      role: CONSTANTS.USER.ROLES.MODERATOR,
    });

    return serviceResponse(true, HTTP_CODES.CREATED, MESSAGES.LOGIN, {
      id: response._id,
      fname: response.fname,
      lname: response.lname || "",
      email: response.email && response.email,
      LoginType: params.type === "google" ? "google" : "facebook",
      social: params.type,
      role: CONSTANTS.USER.ROLES.MODERATOR,
      accessToken,
      refreshToken,
    });
  } else {
    try {
      let findQuery = { name: "trial", isDeleted: null };
      const response = await SubscriptionsModel.findOne(findQuery);

      if (!response) {
        console.log("plan does not exist");
      }
      const isChoosePlan = await MySubscriptionModel.findOne({
        purchasedBy: response._id,
        isDeleted: null,
      }).populate({ path: "subId", model: SubscriptionsModel });

      if (!isChoosePlan) {
        await loginPlanChooses(response._id, {
          purchasedBy: user.userId._id,
          planDurationType: "trial",
        });
      } else {
        logger.info(`plan :=> ${isChoosePlan.subId.name}`);
      }
    } catch (error) {
      console.log(error.message);
    }

    if (!user.userId && params.type === "google") {
      const isUser = await User.findOne({
        email: user.email,
      });

      if (!isUser) {
        let UserPayload = {
          isAuth: true,
          fname: user.fullname,
          profileUrl: payload.url,
          password: CONSTANTS.USER.DEFAULT_PASSWORD,
        };

        if (user.email) UserPayload.email = user.email;
        UserPayload.idd = generateUniqueID((await User.countDocuments({})) + 1);
        const response = await User.create(UserPayload);
        await AuthModel.findOneAndUpdate(
          { _id: user._id, isDeleted: null },
          { userId: response._id },
          { new: true }
        );
      } else {
        await AuthModel.findOneAndUpdate(
          { _id: user._id, isDeleted: null },
          { userId: isUser._id },
          { new: true }
        );
      }
    }

    if (!user.userId && params.type === "facebook") {
      let UserPayload = {
        isAuth: true,
        fname: user.fullname,
        avatar: payload.url,
        password: CONSTANTS.USER.DEFAULT_PASSWORD,
      };

      UserPayload.idd = generateUniqueID((await User.countDocuments({})) + 1);

      const response = await User.create(UserPayload);
      await AuthModel.findOneAndUpdate(
        { _id: user._id, isDeleted: null },
        { userId: response._id },
        { new: true }
      );
    }

    const authUser = await AuthModel.findOne({
      authUserId: user.authUserId,
    }).populate({
      path: "userId",
      model: User,
    });

    const accessToken = jwt.generateAccessToken({
      id: authUser.userId._id,
      email: authUser.userId.email && authUser.userId.email,
      role: CONSTANTS.USER.ROLES.MODERATOR,
    });

    const refreshToken = jwt.generateRefreshToken({
      id: authUser.userId._id,
      email: authUser.userId.email && authUser.userId.email,
      role: CONSTANTS.USER.ROLES.MODERATOR,
    });
    return serviceResponse(true, HTTP_CODES.OK, MESSAGES.LOGIN, {
      id: authUser.userId._id,
      fname: authUser.userId.fname,
      lname: authUser.userId.lname || "",
      email: authUser.userId.email && user.userId.email,
      LoginType: params.type === "google" ? "google" : "facebook",
      social: params.type,
      role: CONSTANTS.USER.ROLES.MODERATOR,
      accessToken,
      refreshToken,
    });
  }
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

exports.updateProfile = async (userId, payload) => {
  if (payload.email) {
    const user = await User.findOne({ email: payload.email, isDeleted: null });
    if (user)
      return serviceResponse(
        false,
        HTTP_CODES.BAD_REQUEST,
        MESSAGES.EMAIL_EXIST
      );
  }

  if (payload.fullname) {
    const names = payload.fullname.split(" ");
    payload.fname = names[0];
    payload.lname = names.slice(1).join(" ");
    delete payload.fullname;
  }
  await User.findByIdAndUpdate(userId, payload, { new: true });
  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.UPDATED);
};

exports.updateProfilePriority = async (user) => {
  let findQuery = { _id: user.id, isDeleted: null };
  const response = await User.findOne(findQuery).select("id priority");
  if (!response) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }

  if (response.priority === true) {
    await User.findOneAndUpdate(findQuery, { priority: false }, { new: true });
  } else {
    await User.findOneAndUpdate(findQuery, { priority: true }, { new: true });
  }

  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.UPDATED);
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
  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.UPDATED, {
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
    fname: response.fname,
    lname: response.lname,
    otp: otoCode,
    resetLink: `${URLS.FRONTEND}/otp?code=${code}`,
  };

  try {
    ses.send(ses.resetPassword, options);
  } catch (e) {
    console.log(e.message);
  }

  return serviceResponse(true, HTTP_CODES.CREATED, MESSAGES.OTP_SENT, {
    id: response._id,
    email: response.email,
    code: code,
  });
};

exports.loginFailed = async () => {
  return serviceResponse(false, HTTP_CODES.BAD_REQUEST, MESSAGES.LOGIN_FAILED);
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
    return serviceResponse(
      false,
      HTTP_CODES.NOT_FOUND,
      MESSAGES.INVALID_CODE,
      {}
    );
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

  const options = {
    email: response.email,
    fname: response.fname,
    lname: response.lname,
    date: new Date(),
  };

  try {
    ses.send(ses.changedPassword, options);
  } catch (e) {
    console.log(e.message);
  }

  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.UPDATED, {
    id: response._id,
    email: response.email,
  });
};

exports.getUserProfile = async (userId) => {
  const response = await db.User.findOne({
    where: { id: userId },
    attributes: [
      "id",
      "idd",
      "firstName",
      "lastName",
      "email",
      "phone",
      "isBlock",
      "status",
      "createdAt",
    ],
  });
  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.FETCH, response);
};

exports.uploadBucket = async (payload) => {
  const response = await fileModel.create(payload);
  return serviceResponse(true, HTTP_CODES.CREATED, MESSAGES.UPLOADED, {
    url: response.url,
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
    role: CONSTANTS.USER.ROLES.MODERATOR,
  };
  const accessToken = jwt.generateAccessToken(options);
  const refreshToken = jwt.generateRefreshToken(options);

  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.OK, {
    accessToken,
    refreshToken,
  });
};

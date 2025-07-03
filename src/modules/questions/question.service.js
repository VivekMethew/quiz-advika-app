const { HTTP_CODES, MESSAGES, CONSTANTS } = require("../../config");
const { serviceResponse } = require("../../helpers/response");
const { FileModel } = require("../../models/files.model");
const { MySubscriptionModel } = require("../../models/plans.selected.model");
const { QuestionModel } = require("../../models/questions.model");
const { quizPollModel } = require("../../models/quiz.poll.model");
const { SubscriptionsModel } = require("../../models/subsription.plans.model");

exports.createRecord = async (payload, quizId) => {
  if (payload.customMessage && payload.customMessage.file === "") {
    payload.customMessage.file = null;
  }

  if (payload.optionType === "image" || payload.optionType === "video") {
    const isSubs = await MySubscriptionModel.findOne({
      purchasedBy: payload.userId,
      isDeleted: null,
    }).populate({
      path: "subId",
      select: "name status",
      model: SubscriptionsModel,
    });

    if (!isSubs)
      return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);

    if (isSubs.subId.name !== CONSTANTS.PLAN_NAMES.PLATINUM) {
      return serviceResponse(
        false,
        HTTP_CODES.BAD_REQUEST,
        MESSAGES.VIDEO_IMAGE_ERROR
      );
    }
  }

  if (payload.answerText === null && payload.isTextFree === false) {
    payload.isTextFree = true;
  }

  const create = await QuestionModel.create(payload);
  const populatedQuestion = await QuestionModel.findById(create._id)
    .populate({
      path: 'image',
      select: 'url',
      model: FileModel
    })
    .populate({
      path: 'thumbnail',
      select: 'url',
      model: FileModel
    })
    .populate({
      path: 'customMessage.file',
      select: 'url',
      model: FileModel
    });

  if (quizId) {
    const response = await quizPollModel.findOneAndUpdate(
      { _id: quizId, isDeleted: null },
      { $push: { questions: create.id } },
      { new: true }
    );
    if (!response) {
      return serviceResponse(
        false,
        HTTP_CODES.BAD_REQUEST,
        MESSAGES.BAD_REQUEST
      );
    }
    return serviceResponse(
      true,
      HTTP_CODES.CREATED,
      MESSAGES.CREATED,
      response
    );
  } else {
    return serviceResponse(true, HTTP_CODES.CREATED, MESSAGES.CREATED, populatedQuestion);
  }
};

exports.getList = async (id, query) => {
  let findQuery = { userId: id, isDeleted: null };

  if (query.type) {
    findQuery.type = query.type;
  }
  if (query.isCreatedByChatgpt) {
    findQuery.isCreatedByChatgpt = query.isCreatedByChatgpt;
  }

  if (query.new) {
    findQuery.isUsed = false;
  } else {
    findQuery.isUsed = true;
  }

  const response = await QuestionModel.find(findQuery).populate({
    path: "image",
    select: "url",
    model: FileModel,
  })
  .populate({
    path:"thumbnail",
    select:"url",
    model: FileModel
  })
  .populate({
    path:"customMessage.file",
    select:"url",
    model: FileModel
  });
  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.FETCH, response);
};

exports.getView = async (id) => {
  const response = await QuestionModel.findOne({
    _id: id,
    isDeleted: null,
  }).populate({
    path: "image",
    select: "url",
    model: FileModel,
  }).populate({
    path:"thumbnail",
    select:"url",
    model: FileModel
  })
  .populate({
    path:"customMessage.file",
    select:"url",
    model: FileModel
  });
  if (!response) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }
  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.FETCH, response);
};

exports.updateRecord = async (id, payload) => {
  if (payload.image && payload.image === "") {
    payload.image = null;
  }

  if (payload.customMessage && payload.customMessage.file === "") {
    payload.customMessage.file = null;
  }

  const response = await QuestionModel.findOneAndUpdate(
    { _id: id, isDeleted: null },
    payload,
    { new: true }
  );
  if (!response) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }
  const populateResponse=await QuestionModel.findOne(
    { _id: id, isDeleted: null })
    .populate({
      path: 'image',
      select: 'url',
      model: FileModel
    })
    .populate({
      path: 'thumbnail',
      select: 'url',
      model: FileModel
    })
    .populate({
      path: 'customMessage.file',
      select: 'url',
      model: FileModel
    });;

  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.UPDATED, populateResponse);
};

exports.deleteRecord = async (id, quizId) => {
  const create = await QuestionModel.findOneAndUpdate(
    { _id: id, isDeleted: null },
    { isDeleted: new Date() },
    { new: true }
  );
  if (quizId) {
    const response = await quizPollModel.findOneAndUpdate(
      { _id: quizId, isDeleted: null },
      { $pull: { questions: id } },
      { new: true }
    );
    if (!response) {
      return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
    }
    return serviceResponse(true, HTTP_CODES.OK, MESSAGES.DELETED, response);
  }
  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.DELETED, create);
};

exports.deleteBulk = async (ids, quizId) => {
  for (let i = 0; i < ids.length; i++) {
    await QuestionModel.findOneAndUpdate(
      { _id: ids[i], isDeleted: null },
      { isDeleted: new Date() },
      { new: true }
    );
  }
  // const map = new Map();
  // for (let i = 0; i < ids.length; i++) {
  //   const response = await QuestionModel.findOneAndUpdate(
  //     { _id: ids[i], isDeleted: null },
  //     { isDeleted: new Date() },
  //     { new: true }
  //   );
  //   const response = await quizPollModel.findOneAndUpdate(
  //     { _id: quizId },
  //     { $pull: { questions: ids[i] } },
  //     { new: true }
  //   );
  //   if (response) {
  //     map.set(ids[i], true);
  //   } else {
  //     map.set(ids[i], false);
  //   }
  // }

  // if (!Array.from(map.values()).every((value) => value === true)) {
  //   return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  // }
  if (quizId) {
    const response = await quizPollModel.findOneAndUpdate(
      { _id: quizId, isDeleted: null },
      { $pullAll: { questions: ids } },
      { new: true }
    );
    if (!response) {
      return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
    }
    return serviceResponse(true, HTTP_CODES.OK, MESSAGES.DELETED, response);
  } else {
    return serviceResponse(true, HTTP_CODES.OK, MESSAGES.DELETED);
  }
};

exports.updateBulk = async (payload) => {
  let ids = payload.ids;
  delete payload.ids;
  const map = new Map();
  const durationValue = payload.duration;
  for (let i = 0; i < ids.length; i++) {
    let findQuery = { _id: ids[i], isDeleted: null };
    const response = await QuestionModel.findOne(findQuery).select(
      "optionType duration"
    );

    if (response) {
      if (response.optionType === "image" || response.optionType === "video") {
        payload.duration = 0;
      } else {
        payload.duration = durationValue;
      }
      const updated = await QuestionModel.findOneAndUpdate(findQuery, payload, {
        new: true,
      });
      if (updated) {
        map.set(ids[i], true);
      } else {
        map.set(ids[i], false);
      }
    }
  }

  if (!Array.from(map.values()).every((value) => value === true)) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }
  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.UPDATED);
};

exports.updateChatGPT = async (payload) => {
  let ids = payload.ids;
  for (let i = 0; i < ids.length; i++) {
    await QuestionModel.findOneAndUpdate(
      { _id: ids[i], isDeleted: null },
      { isCreatedByChatgpt: false },
      { new: true }
    );
  }

  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.UPDATED);
};

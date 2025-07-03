const { HTTP_CODES, MESSAGES } = require("../../../config");
const { serviceResponse } = require("../../../helpers/response");
const { QuestionModel } = require("../../../models/questions.model");
const { chatGPT } = require("../../../utils");

exports.createRecord = async ({ prompt, noOfQues, userId }) => {
  const response = await chatGPT.createQuestions(prompt, noOfQues);

  if (response.status) {
    const quesArr = response.questions.map((obj) => {
      return {
        userId: userId,
        title: obj.title,
        type: "quiz",
        optionType: "mcq",
        duration: 30,
        point: 15,
        options: obj.options,
        answers: obj.answers,
        isCreatedByChatgpt: true,
      };
    });

    const response1 = await QuestionModel.insertMany(quesArr);
    return serviceResponse(
      true,
      HTTP_CODES.CREATED,
      MESSAGES.CREATED,
      response1
    );
  } else {
    return serviceResponse(
      false,
      HTTP_CODES.BAD_REQUEST,
      MESSAGES.BAD_REQUEST,
      response.error
    );
  }
};

exports.createPoll = async ({ prompt, noOfQues, userId }) => {
  const response = await chatGPT.createPoll(prompt, noOfQues);
  if (response.status) {
    const quesArr = response.questions.map((obj) => {
      return {
        userId: userId,
        title: obj.title,
        type: "poll",
        optionType: "mcq",
        duration: 30,
        point: 15,
        options: obj.options,
        isCreatedByChatgpt: true,
      };
    });

    const response1 = await QuestionModel.insertMany(quesArr);
    return serviceResponse(
      true,
      HTTP_CODES.CREATED,
      MESSAGES.CREATED,
      response1
    );
  } else {
    return serviceResponse(
      false,
      HTTP_CODES.BAD_REQUEST,
      MESSAGES.BAD_REQUEST,
      response.error
    );
  }
};

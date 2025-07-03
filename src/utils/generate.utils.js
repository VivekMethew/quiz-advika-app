const { quizPollModel } = require("../models/quiz.poll.model");

exports.generateOtp = () => {
  return Math.floor(Math.random() * 9000) + 1000;
};

exports.generateQuizPollCode = async () => {
  return Math.floor(Math.random() * 1000000 + 1);
};

exports.generateQuizPollUniqCode = async () => {
  let isUnique = false;
  let code;

  while (!isUnique) {
    const randomCode = Math.floor(Math.random() * 1000000 + 1);
    if (randomCode.toString().length === 6) {
      const existCode = await quizPollModel
        .findOne({ code: randomCode })
        .select("code");
      if (!existCode) {
        code = randomCode;
        isUnique = true;
      }
    }
  }

  return code;
};

exports.generateQuizPollCode2 = () => {
  const codeLength = 6;
  const characters = "0123456789";
  let code = "";

  while (code.length < codeLength) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    const randomChar = characters.charAt(randomIndex);

    // Make sure the generated character is not already in the code
    if (!code.includes(randomChar)) {
      code += randomChar;
    }
  }

  return code;
};

exports.generateUniqueID = (index) => {
  const currentYear = new Date().getFullYear();
  const uniqueID = `MID${currentYear}${index.toString().padStart(5, "0")}`;
  return uniqueID;
};

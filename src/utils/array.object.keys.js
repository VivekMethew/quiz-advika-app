const { QuestionModel } = require("../models/questions.model");

exports.arrayObjectKeys = (arr, keys) => {
  let errors = [];
  for (let i = 0; i < keys.length; i++) {
    if (!arr.every((obj) => obj.hasOwnProperty(keys[i]))) {
      errors.push({ message: `${keys[i]} required` });
    }
  }
  return errors;
};

exports.isCheckAnswers = (data, answers) => {
  const map = new Map();
  let isAnswers = false;

  if (data.optionType === "mcq") {
    if (data.answers.length <= answers.length) {
      answers.forEach((ans) => {
        map.set(ans, data.answers.includes(parseInt(ans)));
      });
    } else {
      answers.forEach((ans) => {
        map.set(ans, false);
      });
    }

    const allValuesTrue = Array.from(map.values()).every(
      (value) => value === true
    );

    if (allValuesTrue) {
      isAnswers = true;
    }

    return { Answers: map, isAnswers, type: data.optionType };
  }

  console.log("data.optionType :=>***************************************");
  console.log("data.optionType :=> ", data.optionType, data.isTextFree);
  console.log("data.optionType :=>***************************************");

  if (data.optionType === "text") {
    if (!data.isTextFree) {
      if (data.answerText?.toLowerCase() === answers?.toLowerCase()) {
        map.set(answers.toLowerCase(), true);
      } else {
        map.set(answers.toLowerCase(), false);
      }
      const allValuesTrue = Array.from(map.values()).every(
        (value) => value === true
      );

      if (allValuesTrue) {
        isAnswers = true;
      }
      return { Answers: map, isAnswers };
    } else {
      map.set(answers, data.optionType);

      console.log("answers", answers, data.optionType);

      if (answers.length > 0) {
        isAnswers = true;
      }
      return { Answers: map, isAnswers, type: data.optionType };
    }
  }

  if (data.optionType === "image" || data.optionType === "video") {
    isAnswers = true;
    return { Answers: map, isAnswers, type: data.optionType };
  }
};

exports.isCheckTextAnswers = (data, answers) => {
  const map = new Map();
  let isAnswers = false;

  if (data.optionType === "mcq") {
    if (data.answers.length <= answers.length) {
      answers.forEach((ans) => {
        map.set(ans, data.answers.includes(parseInt(ans)));
      });
    } else {
      answers.forEach((ans) => {
        map.set(ans, false);
      });
    }
  }

  const allValuesTrue = Array.from(map.values()).every(
    (value) => value === true
  );

  if (allValuesTrue) {
    isAnswers = true;
  }

  return { Answers: map, isAnswers };
};

exports.isCheckPollAnswers = (data, answers) => {
  const map = new Map();
  let isAnswers = true;

  if (data.optionType === "mcq") {
    answers.forEach((ans) => {
      map.set(ans, true);
    });
    return { Answers: map, isAnswers, type: data.optionType };
  }

  if (data.optionType === "text") {
    map.set(answers, data.optionType);
    if (answers.length > 0) {
      isAnswers = true;
    }
    return { Answers: map, isAnswers, type: data.optionType };
  }

  if (data.optionType === "image" || data.optionType === "video") {
    isAnswers = true;
    return { Answers: map, isAnswers, type: data.optionType };
  }
};

exports.isQuestionsUsed = async (questions) => {
  const map = new Map();
  for (let i = 0; i < questions.length; i++) {
    const isMatched = await QuestionModel.findOne({
      _id: questions[i],
      isDeleted: null,
    });

    if (isMatched && isMatched.isUsed) {
      map.set(questions[i], true);
    } else if (isMatched && !isMatched.isUsed) {
      map.set(questions[i], false);
    } else if (!isMatched) {
      map.set(questions[i], null);
    }
  }

  const isQuestions = Array.from(map.values()).every((value) => value === true);
  let isValue = isQuestions;
  if (!isQuestions) {
    for (let key of map.keys()) {
      if (map.get(key) !== isValue) {
        isValue = true;
      }
    }
  }

  return isValue;
};

exports.isQuestionsExists = async (questions) => {
  const map = new Map();
  for (let i = 0; i < questions.length; i++) {
    const isMatched = await QuestionModel.findOne({
      _id: questions[i],
      isDeleted: null,
    }).select("isUsed");

    if (isMatched) {
      map.set(questions[i], true);
    } else {
      map.set(questions[i], false);
    }
  }

  const isQuestions = Array.from(map.values()).every((value) => value === true);

  return isQuestions;
};

exports.analyticSummary = (points, map, totalPoint) => {
  console.log(points);
  const keys = Array.from(map.keys());
  for (let i = 0; i < points.length; i++) {
    if (points[i] >= keys[0] && points[i] <= totalPoint) {
      map.get(keys[0]).value += points[i];
    } else if (points[i] >= keys[1] && points[i] < keys[0]) {
      map.get(keys[1]).value += points[i];
    } else if (points[i] >= keys[2] && points[i] < keys[1]) {
      map.get(keys[2]).value += points[i];
    }
  }

  let totalPoints = 0;

  // Calcaulate Total Points
  for (let item of map.values()) {
    totalPoints += item.value;
  }

  // Distrute Percentages values
  for (let key of map.keys()) {
    if (map.has(key)) {
      let percetage;
      if (map.get(key).value > 0) {
        percetage = (map.get(key).value / totalPoints) * 100;
      } else {
        percetage = 0;
      }

      map.get(key).desc = `${percetage.toFixed(2)} %`;
    }
  }

  return Array.from(map.values());
};

exports.calculatePercentage = (map) => {
  let totalPoints = 0;

  // Calcaulate Total Points
  for (let item of map.values()) {
    totalPoints += item.value;
  }

  // Distrute Percentages values
  for (let key of map.keys()) {
    if (map.has(key)) {
      let percetage;
      if (map.get(key).value > 0) {
        percetage = (map.get(key).value / totalPoints) * 100;
      } else {
        percetage = 0;
      }

      map.get(key).desc = `${percetage.toFixed(2)} %`;
    }
  }

  return Array.from(map.values());
};

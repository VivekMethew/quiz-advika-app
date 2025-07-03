const { HTTP_CODES, CONSTANTS, MESSAGES } = require("../../config");
const { serviceResponse } = require("../../helpers/response");
const { FileModel } = require("../../models/files.model");
const { PlayerModel } = require("../../models/player.model");
const { QuestionModel } = require("../../models/questions.model");
const { quizPollModel } = require("../../models/quiz.poll.model");
const {
  WallOfFameAnswerModel,
} = require("../../models/wallOfFame.answers.model");
const { WinnerModel } = require("../../models/winners");
const { pagination } = require("../../utils");
const { analyticSummary } = require("../../utils/array.object.keys");

exports.getSummary = async (id, user) => {
  let summary = {};
  let findQuery = { _id: id, userId: user.id, isDeleted: null };
  const resonse1 = await quizPollModel
    .findOne(findQuery)
    .populate({ path: "questions",
      populate: [
        {
          path: "thumbnail",
          select: "url",
          model: FileModel
        },
        {
          path: "image",
          select: "url",
          model: FileModel
        },
        {
          path:"customMessage.file",
          select: "url",
          model: FileModel
        }
      ],
      model: QuestionModel })
    .select(
      "type userId isForEver code title duration startDateTime endDateTime status questions"
    );

  if (!resonse1) {
    return serviceResponse(true, HTTP_CODES.NOT_FOUND, "Record Not Found");
  }

  if (resonse1.type === "quiz") {
    summary.title = resonse1.title;
    summary.code = resonse1.code;
    summary.userId = resonse1.userId;
    summary.type = resonse1.type;
    summary.totalQues = resonse1.questions.length;
    summary.startDateTime = resonse1.startDateTime;
    summary.endDateTime = resonse1.endDateTime;
    summary.duration = resonse1.duration;
    summary.isForEver = resonse1.isForEver;

    let allottedTime =
      resonse1.questions
        .map((obj) => obj.duration)
        .reduce((acc, current) => acc + current, 0) / 60;
    summary.allottedTime = allottedTime;
    summary.totalPoint = resonse1.questions
      .map((obj) => obj.point)
      .reduce((acc, current) => acc + current, 0);

    const conditions = [];
    conditions.push((summary.totalPoint * 4) / 5);
    conditions.push((summary.totalPoint * 3) / 5);
    conditions.push((summary.totalPoint * 2) / 5);

    const map = new Map();
    conditions.forEach((elem) => {
      if (!map.has(elem)) {
        map.set(elem, {
          name: `Scored above ${elem} points`,
          value: 0,
          desc: "",
        });
      }
    });

    const winners = await WinnerModel.find(
      {
        code: resonse1.code,
        isDeleted: null,
      },
      { __v: 0 }
    )
      .populate({ path: "playerId", select: "name",model: PlayerModel })
      .sort({
        points: "desc",
      });

    if (!winners) {
      return serviceResponse(true, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
    }

    const points = winners.map((obj) => obj.points);
    const data = analyticSummary(points, map, summary.totalPoint);

    if (winners.length > 0) {
      summary.totalPlayedTime =
        winners
          .map((obj) => obj.playedTime)
          .reduce((acc, current) => acc + current, 0) / 60;

      const calcAvg = summary.totalPlayedTime / winners.length;

      summary.avgTime = calcAvg.toFixed(2);
    } else {
      summary.totalPlayedTime = 0;
      summary.avgTime = 0;
    }

    const players = await PlayerModel.find({
      code: resonse1.code,
      isDeleted: null,
    });

    summary.chartData = data;
    summary.totalJoined = 0;
    summary.totalPlayed = 0;
    summary.totalPlayedTime = 0;
    players.map((obj) => {
      if (obj.isPlayed === "joined") {
        summary.totalJoined++;
      } else if (obj.isPlayed === "played") {
        summary.totalPlayed++;
      }
    });

    summary.totalJoined += summary.totalPlayed;
  } else if (resonse1.type === "poll") {
    summary.title = resonse1.title;
    summary.code = resonse1.code;
    summary.userId = resonse1.userId;
    summary.type = resonse1.type;
    summary.totalQues = resonse1.questions.length;
    summary.startDateTime = resonse1.startDateTime;
    summary.endDateTime = resonse1.endDateTime;
    summary.duration = resonse1.duration;
    summary.isForEver = resonse1.isForEver;

    let allottedTime =
      resonse1.questions
        .map((obj) => obj.duration)
        .reduce((acc, current) => acc + current, 0) / 60;
    summary.allottedTime = allottedTime;

    summary.avgTime = allottedTime;

    const players = await PlayerModel.find({
      code: resonse1.code,
      isDeleted: null,
    });

    summary.totalJoined = 0;
    summary.totalPlayed = 0;

    players.map((obj) => {
      if (obj.isPlayed === "joined") {
        summary.totalJoined++;
      } else if (obj.isPlayed === "played") {
        summary.totalPlayed++;
      }
    });

    summary.totalJoined += summary.totalPlayed;
  }

  return serviceResponse(
    true,
    HTTP_CODES.OK,
    "Successfuly get report",
    summary
  );
};

exports.getPlayersInfo = async (id, query) => {
  let { page, limit, order } = query;
  let result = [];
  let findQuery = { _id: id, isDeleted: null };
  const quizPollDetail = await quizPollModel
    .findOne(findQuery)
    .populate({ path: "questions",
      populate: [
        {
          path: "thumbnail",
          select: "url",
          model: FileModel
        },
        {
          path: "image",
          select: "url",
          model: FileModel
        },
        {
          path:"customMessage.file",
          select: "url",
          model: FileModel
        }
      ],
      model: QuestionModel })
      .populate({
        path:"coverImage",
        select:"url",
        model:FileModel
      })
    .select("type code isForEver title description coverImage");
  if (!quizPollDetail) {
    return serviceResponse(true, HTTP_CODES.NOT_FOUND, "Record Not Found");
  }

  let sort = {};

  if (!page && !limit) {
    page = 1;
    limit = 10;
  } else {
    page = parseInt(page);
    limit = parseInt(limit);
  }

  if (order === "latest") {
    sort.isDated = "desc";
  } else if (order === "oldest") {
    sort.isDated = "asc";
  } else {
    sort.isDated = "desc";
  }

  const offset = page === 1 ? 0 : limit * (page - 1);

  let winnerQuery = {};
  winnerQuery["$and"] = [];
  winnerQuery["$and"].push({ code: quizPollDetail.code, isDeleted: null });

  if (quizPollDetail.type === "quiz") {
    const winners = await WinnerModel.find(winnerQuery)
      .populate({
        path: "playerId",
        select: "name email avatar isPlayed isEliminate",
        model: PlayerModel
      })
      .sort({ points: -1, playedTime: -1 })
      .skip(offset)
      .limit(limit);

    const response = winners.filter((winner) => !winner.playerId.isEliminate);

    if (!response) {
      return serviceResponse(true, HTTP_CODES.NOT_FOUND, "Record Not Found");
    }
    let rank = 1;
    for (let item of response) {
      let options = {};
      options.rank = rank;
      options.eventType = item.eventType;
      options.userId = item.playerId._id;
      options.name = item.playerId.name;
      options.email = item.playerId.email;
      options.avatar = item.playerId.avatar;
      options.obtainPoint = item.points;
      options.totalPoint = item.totalPoint;

      for (let ques of JSON.parse(item.playedQuestions)) {
        const wallOfFame = await WallOfFameAnswerModel.findOne({
          eventId: item.eventId,
          playerId: item.playerId._id,
          quisId: ques.quesId,
        });

        if (wallOfFame && wallOfFame.isDeleted !== null) {
          options.obtainPoint = options.obtainPoint - wallOfFame.point;
        }
      }

      const isString = item.playedQuestions.every(
        (value) => typeof value === "string"
      );

      if (isString) {
        if (item.playedQuestions.length > 0) {
          options.playedInfo = JSON.parse(item.playedQuestions);
        } else {
          options.playedInfo = item.playedQuestions;
        }
      } else {
        options.playedInfo = item.playedQuestions;
      }

      options.RightAnswers = options.playedInfo
        .map((obj) => {
          return { isAnswers: obj.isAnswer?.isAnswers, isSkip: obj.isSkip };
        })
        .filter(
          (item) => item.isAnswers === true && item.isSkip === true
        ).length;

      options.WrongAnswers = options.playedInfo
        .map((obj) => {
          return { isAnswers: obj.isAnswer?.isAnswers, isSkip: obj.isSkip };
        })
        .filter(
          (item) => item.isAnswers === false && item.isSkip === true
        ).length;

      options.skipQuestions = options.playedInfo
        .map((obj) => {
          return { isAnswers: obj.isAnswer?.isAnswers, isSkip: obj.isSkip };
        })
        .filter(
          (item) => item.isAnswers === false && item.isSkip === false
        ).length;

      options.totalAtteptQuestions =
        options.playedInfo.length - options.skipQuestions;

      delete options.playedInfo;

      result.push(options);
      rank++;
    }

    result = result
      .sort((a, b) => b.obtainPoint - a.obtainPoint)
      .map((obj, index) => ({ ...obj, rank: index + 1, index: index++ }));
  } else if (quizPollDetail.type === "poll") {
    const response = await WinnerModel.find(winnerQuery)
      .populate({ path: "playerId", select: "name email avatar isPlayed",model: PlayerModel })
      .sort({ playedTime: -1 })
      .skip(offset)
      .limit(limit);

    if (!response) {
      return serviceResponse(true, HTTP_CODES.NOT_FOUND, "Record Not Found");
    }

    response.map((item, index) => {
      let options = {};
      options.rank = index + 1;
      options.eventType = item.eventType;
      options.userId = item.playerId._id;
      options.name = item.playerId.name;
      options.email = item.playerId.email;
      options.avatar = item.playerId.avatar;

      const isString = item.playedQuestions.every(
        (value) => typeof value === "string"
      );

      if (isString) {
        if (item.playedQuestions.length > 0) {
          options.playedInfo = JSON.parse(item.playedQuestions);
        } else {
          options.playedInfo = item.playedQuestions;
        }
      } else {
        options.playedInfo = item.playedQuestions;
      }

      options.skipQuestions = options.playedInfo
        .map((obj) => {
          return { isAnswers: obj.isAnswer?.isAnswers, isSkip: obj.isSkip };
        })
        .filter(
          (item) => item.isAnswers === false && item.isSkip === false
        ).length;

      options.totalAtteptQuestions =
        options.playedInfo.length - options.skipQuestions;

      delete options.playedInfo;

      result.push(options);
    });
  }

  return serviceResponse(
    true,
    HTTP_CODES.OK,
    "Successfully get record",
    pagination.getPagingData(
      {
        count: await WinnerModel.countDocuments(winnerQuery),
        rows: result,
      },
      page,
      limit
    )
  );
};

exports.getPlayerReports = async (id, query) => {
  const { playerId } = query;
  let findQuery = { _id: id, isDeleted: null };
  const quizPollDetail = await quizPollModel
    .findOne(findQuery)
    .populate({ path: "questions",
      populate: [
        {
          path: "thumbnail",
          select: "url",
          model: FileModel
        },
        {
          path: "image",
          select: "url",
          model: FileModel
        },
        {
          path:"customMessage.file",
          select: "url",
          model: FileModel
        }
      ],
      model: QuestionModel })
    .populate({
      path:"coverImage",
      select:"url",
      model:FileModel
    })
    .select("type code  title description coverImage questions");
  if (!quizPollDetail) {
    return serviceResponse(true, HTTP_CODES.NOT_FOUND, "Record Not Found");
  }

  console.log("TYPE=>", quizPollDetail.type);

  let options = {};
  if (quizPollDetail.type === "quiz") {
    const item = await WinnerModel.findOne(
      {
        playerId: playerId,
        code: quizPollDetail.code,
        isDeleted: null,
      },
      { __v: 0 }
    ).populate({ path: "playerId", select: "name email avatar isPlayed",model: PlayerModel });

    if (!item) {
      return serviceResponse(true, HTTP_CODES.NOT_FOUND, "Record Not Found");
    }

    options.rank = 1;
    options.userId = item.playerId._id;
    options.eventType = item.playerId.eventType;
    options.name = item.playerId.name;
    options.email = item.playerId.email;
    options.avatar = item.playerId.avatar;
    options.obtainPoint = item.points;
    options.totalPoint = item.totalPoint;

    for (let ques of JSON.parse(item.playedQuestions)) {
      const wallOfFame = await WallOfFameAnswerModel.findOne({
        eventId: item.eventId,
        playerId: item.playerId._id,
        quisId: ques.quesId,
      });

      if (wallOfFame && wallOfFame.isDeleted !== null) {
        options.obtainPoint = options.obtainPoint - wallOfFame.point;
      }
    }

    const isString = item.playedQuestions.every(
      (value) => typeof value === "string"
    );

    if (isString) {
      if (item.playedQuestions.length > 0) {
        options.playedInfo = JSON.parse(item.playedQuestions);
      } else {
        options.playedInfo = item.playedQuestions;
      }
    } else {
      options.playedInfo = item.playedQuestions;
    }

    options.RightAnswers = options.playedInfo
      .map((obj) => {
        return { isAnswers: obj.isAnswer?.isAnswers, isSkip: obj.isSkip };
      })
      .filter((item) => item.isAnswers === true && item.isSkip === true).length;

    options.WrongAnswers = options.playedInfo
      .map((obj) => {
        return { isAnswers: obj.isAnswer?.isAnswers, isSkip: obj.isSkip };
      })
      .filter(
        (item) => item.isAnswers === false && item.isSkip === true
      ).length;

    options.skipQuestions = options.playedInfo
      .map((obj) => {
        return { isAnswers: obj.isAnswer?.isAnswers, isSkip: obj.isSkip };
      })
      .filter(
        (item) => item.isAnswers === false && item.isSkip === false
      ).length;

    options.totalAtteptQuestions =
      options.playedInfo.length - options.skipQuestions;

    // initialize questions list
    const map = new Map();
    quizPollDetail.questions.forEach((item) => {
      if (!map.has(item._id.toString())) {
        const options = new Map();
        item.options.map((option, index) => {
          if (!options.has(index)) {
            options.set(index, {
              title: option,
              isAnswer: item.answers[0] === index ? true : false,
              count: 0,
              isPlayer: false,
            });
          }
        });

        map.set(item._id.toString(), {
          title: item.title,
          image: item.image,
          options: options,
          gallery: [],
          typeQues: item.optionType,
          content: "",
        });
      }
    });

    const winners = await WinnerModel.find({
      code: quizPollDetail.code,
      playerId: playerId,
      isDeleted: null,
    });

    // winners.forEach((winner) => {
    for (const winner of winners) {
      let parseData = [];
      const isString = winner.playedQuestions.every(
        (value) => typeof value === "string"
      );

      if (isString) {
        if (winner.playedQuestions.length > 0) {
          parseData.push(...JSON.parse(winner.playedQuestions));
        } else {
          parseData.push(...winner.playedQuestions);
        }
      } else {
        parseData.push(...winner.playedQuestions);
      }

      // parseData.forEach(async (elem) => {
      let total = 0;
      for (const elem of parseData) {
        if (map.has(elem.quesId)) {
          console.log({ total: total + 1, elem: JSON.stringify(elem) });
          // map.get(elem.quesId).typeQues

          const wallOfFame = await WallOfFameAnswerModel.findOne({
            eventId: winner.eventId,
            playerId: winner.playerId,
            quisId: elem.quesId,
            isDeleted: null,
          })

          const fileObj = wallOfFame?.answers &&  wallOfFame.answers.length>0  ? await FileModel.find({_id: { $in: wallOfFame.answers } }).select('url'):[]

          if (wallOfFame) {
            if (Array.isArray(wallOfFame.answers)) {
              map.get(elem.quesId).gallery.push(...fileObj);
            } else {
              map.get(elem.quesId).gallery.push(fileObj);
            }
          }

          if (Array.isArray(elem.isAnswer.Answers)) {
            if (map.get(elem.quesId).typeQues === "text") {
              map.get(elem.quesId).content = elem.isAnswer.Answers[0];
            } else {
              for (let index of elem.isAnswer.Answers) {
                const option = +index;
                if (
                  !isNaN(option) &&
                  map.get(elem.quesId).options.has(option)
                ) {
                  map.get(elem.quesId).options.get(option).count++;
                }
              }
            }
          }
        }
      }
    }

    options.playedInfo.forEach((elem) => {
      if (map.has(elem.quesId)) {
        if (Array.isArray(elem.isAnswer.Answers)) {
          for (let index of elem.isAnswer.Answers) {
            const option = +index;
            if (map.get(elem.quesId).options.has(option)) {
              map.get(elem.quesId).options.get(option).isPlayer = true;
            }
          }
        }
      }
    });

    delete options.playedInfo;

    for (let key of map.keys()) {
      const newMap = map.get(key).options;
      let totalPoints = 0;

      // Calcaulate Total Points
      for (let item of newMap.values()) {
        totalPoints += item.count;
      }

      // Distrute Percentages values
      for (let key of newMap.keys()) {
        if (newMap.has(key)) {
          let percetage;
          if (newMap.get(key).count > 0) {
            percetage = (newMap.get(key).count / totalPoints) * 100;
          } else {
            percetage = 0;
          }

          newMap.get(key).desc = `${percetage.toFixed(2)} %`;
        }
      }

      map.get(key).options = Array.from(map.get(key).options.values());
    }

    options.questions = Array.from(map.values());
  } else if (quizPollDetail.type === "poll") {
    const item = await WinnerModel.findOne(
      {
        playerId: playerId,
        code: quizPollDetail.code,
        isDeleted: null,
      },
      { __v: 0 }
    ).populate({ path: "playerId", select: "name email avatar isPlayed",model: PlayerModel });

    if (!item) {
      return serviceResponse(true, HTTP_CODES.NOT_FOUND, "Record Not Found");
    }

    options.rank = 1;
    options.userId = item.playerId._id;
    options.eventType = item.playerId.eventType;
    options.name = item.playerId.name;
    options.email = item.playerId.email;
    options.avatar = item.playerId.avatar;

    const isString = item.playedQuestions.every(
      (value) => typeof value === "string"
    );

    if (isString) {
      if (item.playedQuestions.length > 0) {
        options.playedInfo = JSON.parse(item.playedQuestions);
      } else {
        options.playedInfo = item.playedQuestions;
      }
    } else {
      options.playedInfo = item.playedQuestions;
    }

    options.skipQuestions = options.playedInfo
      .map((obj) => {
        return { isAnswers: obj?.isAnswer?.isAnswers, isSkip: obj.isSkip };
      })
      .filter((item) => item.isSkip === false).length;

    options.totalAtteptQuestions =
      options.playedInfo.length - options.skipQuestions;

    // initialize questions list
    const map = new Map();
    quizPollDetail.questions.forEach((item) => {
      if (!map.has(item._id.toString())) {
        const options = new Map();
        item.options.map((option, index) => {
          if (!options.has(index)) {
            options.set(index, {
              title: option,
              isAnswer: item.answers[0] === index ? true : false,
              count: 0,
              isPlayer: false,
            });
          }
        });

        map.set(item._id.toString(), {
          title: item.title,
          image: item.image,
          options: options,
          gallery: [],
          typeQues: item.optionType,
          content: "",
        });
      }
    });

    const winners = await WinnerModel.find({
      code: quizPollDetail.code,
      playerId: playerId,
      isDeleted: null,
    });

    for (let winner of winners) {
      let parseData = [];
      const isString = winner.playedQuestions.every(
        (value) => typeof value === "string"
      );

      if (isString) {
        if (winner.playedQuestions.length > 0) {
          parseData.push(...JSON.parse(winner.playedQuestions));
        } else {
          parseData.push(...winner.playedQuestions);
        }
      } else {
        parseData.push(...winner.playedQuestions);
      }

      for (let elem of parseData) {
        if (map.has(elem.quesId)) {
          const wallOfFame = await WallOfFameAnswerModel.findOne({
            eventId: winner.eventId,
            playerId: winner.playerId,
            quisId: elem.quesId,
            isDeleted: null,
          });

          if (wallOfFame) {
            if (Array.isArray(wallOfFame.answers)) {
              map.get(elem.quesId).gallery.push(...wallOfFame.answers);
            } else {
              map.get(elem.quesId).gallery.push(wallOfFame.answers);
            }
          }

          if (Array.isArray(elem.isAnswer.Answers)) {
            if (map.get(elem.quesId).typeQues === "text") {
              map.get(elem.quesId).content = elem.isSkip
                ? elem.isAnswer.Answers[0]
                : "";
            } else {
              for (let index of elem.isAnswer.Answers) {
                const option = +index;
                if (map.get(elem.quesId).options.has(option)) {
                  map.get(elem.quesId).options.get(option).count++;
                }
              }
            }
          }
        }
      }
    }

    options.playedInfo.forEach((elem) => {
      if (map.has(elem.quesId)) {
        if (Array.isArray(elem.isAnswer.Answers)) {
          for (let index of elem.isAnswer.Answers) {
            const option = +index;
            if (map.get(elem.quesId).options.has(option)) {
              map.get(elem.quesId).options.get(option).isPlayer = true;
            }
          }
        }
      }
    });

    delete options.playedInfo;

    for (let key of map.keys()) {
      const newMap = map.get(key).options;
      let totalPoints = 0;

      // Calcaulate Total Points
      for (let item of newMap.values()) {
        totalPoints += item.count;
      }

      // Distrute Percentages values
      for (let key of newMap.keys()) {
        if (newMap.has(key)) {
          let percetage;
          if (newMap.get(key).count > 0) {
            percetage = (newMap.get(key).count / totalPoints) * 100;
          } else {
            percetage = 0;
          }

          newMap.get(key).desc = `${percetage.toFixed(2)} %`;
        }
      }

      map.get(key).options = Array.from(map.get(key).options.values());
    }

    options.questions = Array.from(map.values());
  }

  return serviceResponse(
    true,
    HTTP_CODES.OK,
    "Successfully get record",
    options
  );
};

exports.getQuizReport = async (id) => {
  let findQuery = { _id: id, isDeleted: null };
  const quizPollDetail = await quizPollModel
    .findOne(findQuery)
    .populate({ path: "questions" ,
      populate: [
        {
          path: "thumbnail",
          select: "url",
          model: FileModel
        },
        {
          path: "image",
          select: "url",
          model: FileModel
        },
        {
          path:"customMessage.file",
          select: "url",
          model: FileModel
        }
      ],
      model: QuestionModel})
      .populate({
        path:"coverImage",
        select:"url",
        model:FileModel
      })
    .select("type code isForEver title description coverImage questions");
  if (!quizPollDetail) {
    return serviceResponse(true, HTTP_CODES.NOT_FOUND, "Record Not Found");
  }

  let options = {};

  options.title = quizPollDetail.title;
  options.code = quizPollDetail.code;
  options.userId = quizPollDetail.userId;
  options.type = quizPollDetail.type;
  options.totalQues = quizPollDetail.questions.length;
  options.startDateTime = quizPollDetail.startDateTime;
  options.endDateTime = quizPollDetail.endDateTime;
  options.duration = quizPollDetail.duration;

  options.isForEver = quizPollDetail.isForEver;

  let allottedTime =
    quizPollDetail.questions
      .map((obj) => obj.duration)
      .reduce((acc, current) => acc + current, 0) / 60;
  options.allottedTime = allottedTime;
  options.totalPoint = quizPollDetail.questions
    .map((obj) => obj.point)
    .reduce((acc, current) => acc + current, 0);

  // initialize questions list
  const map = new Map();
  quizPollDetail.questions.forEach((item) => {
    if (!map.has(item._id.toString())) {
      const options = new Map();
      item.options.map((option, index) => {
        if (!options.has(index)) {
          options.set(index, {
            title: option,
            isAnswer: item.answers[0] === index ? true : false,
            count: 0,
            isPlayer: false,
          });
        }
      });
      map.set(item._id.toString(), {
        title: item.title,
        typeQues: item?.optionType,
        image: item.image,
        options: options,
        content: item?.answerText,
      });
    }
  });

  const winners = await WinnerModel.find({
    code: quizPollDetail.code,
    isDeleted: null,
  });

  const spenTimes = winners.map((obj) => obj.playedTime);
  const spentTimeInMinutes =
    spenTimes.reduce((acc, current) => acc + current, 0) / 60;
  const avgTime = spentTimeInMinutes / spenTimes.length;

  options.avgTime = avgTime.toFixed(2);
  options.totalTimeSpent = spentTimeInMinutes.toFixed(2);

  winners.forEach((winner, index) => {
    let parseData = [];
    const isString = winner.playedQuestions.every(
      (value) => typeof value === "string"
    );

    if (isString) {
      if (winner.playedQuestions.length > 0) {
        parseData.push(...JSON.parse(winner.playedQuestions));
      } else {
        parseData.push(...winner.playedQuestions);
      }
    } else {
      parseData.push(...winner.playedQuestions);
    }

    parseData.forEach((elem) => {
      if (map.has(elem.quesId)) {
        if (Array.isArray(elem?.isAnswer?.Answers)) {
          for (let index of elem.isAnswer.Answers) {
            if (map.get(elem.quesId).options.has(index)) {
              map.get(elem.quesId).options.get(index).count++;
              map.get(elem.quesId).options.get(index).isPlayer = true;
            }
          }
        }
      }
    });

    // modified
  });

  for (let key of map.keys()) {
    const newMap = map.get(key).options;
    let totalPoints = 0;

    // Calcaulate Total Points
    for (let item of newMap.values()) {
      totalPoints += item.count;
    }

    // Distrute Percentages values
    for (let key of newMap.keys()) {
      if (newMap.has(key)) {
        let percetage;
        if (newMap.get(key).count > 0) {
          percetage = (newMap.get(key).count / totalPoints) * 100;
        } else {
          percetage = 0;
        }

        newMap.get(key).desc = `${percetage.toFixed(2)} %`;
      }
    }

    map.get(key).options = Array.from(map.get(key).options.values());
  }

  options.questions = Array.from(map.values());

  return serviceResponse(
    true,
    HTTP_CODES.OK,
    "Successfully get record",
    options
  );
};

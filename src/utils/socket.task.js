const { CONSTANTS } = require("../config");
const { quizPollModel } = require("../models/quiz.poll.model");
const {
  listParticipants,
  getQuizPoll,
  fetchQuizAndPoll,
} = require("../modules/socket.io/moderators/moderator.services");
const {
  successResponseMessage,
} = require("../modules/socket.io/moderators/res.handler");

exports.updateInvitedUsers = async (io, roomCode) => {
  io.to(parseInt(roomCode)).emit(
    CONSTANTS.SOCKET.MODERATOR.PARTICIPANTS,
    successResponseMessage(
      "Successfully get participants",
      await listParticipants(parseInt(roomCode))
    )
  );
};

exports.updateQuizPermissions = async (io, roomCode) => {
  io.to(parseInt(roomCode)).emit(
    CONSTANTS.SOCKET.MODERATOR.PARTICIPANTS,
    successResponseMessage(
      "Successfully get participants",
      await listParticipants(parseInt(roomCode))
    )
  );

  const quizPollDetail = await getQuizPoll({ roomCode: parseInt(roomCode) });
  if (quizPollDetail.success) {
    io.to(parseInt(roomCode)).emit(
      CONSTANTS.SOCKET.MODERATOR.QUIZ_POLL_DETAIL,
      successResponseMessage("Quiz/Poll Detail", quizPollDetail.data)
    );
  }
};

exports.timerCountdown = async ({ io, roomCode, userId }) => {
  try {
    const response = await quizPollModel.findOne({
      code: roomCode,
      isDeleted: null,
    });

    if (!response) {
      io.to(parseInt(roomCode)).emit("error", { error: "Quiz not found" });
      return;
    }

    const flag = {
      startIn: "on",
      endsIn: "off",
      finish: "off",
      timeRemaining: 0,
    };

    console.log("response.startDateTime", response.startDateTime);

    console.log("response.status", response.status);
    // Determine the end time based on the status of the quiz
    if (response.status === "active") {
      const startTimeInIST = new Date(
        new Date(response.startDateTime).getTime() + 5.5 * 60 * 60 * 1000
      );

      const startTimeInSeconds = startTimeInIST.getTime();

      // Get the current time in IST by shifting the current time manually
      const now = new Date();
      const currentInIST = new Date(
        now.getTime() + 5.5 * 60 * 60 * 1000 // Add 5 hours and 30 minutes for IST offset
      );

      // Calculate the time remaining in seconds
      let timeRemaining = Math.floor(
        (startTimeInSeconds - currentInIST.getTime()) / 1000
      );

      console.log({
        startTimeInIST,
        startTimeInSeconds,
        currentInIST,
        timeRemaining,
      });

      // Update the flag with the initial time remaining
      flag.timeRemaining = timeRemaining;

      // Emit countdown updates every second
      const countdownInterval = setInterval(() => {
        console.log("timeRemaining", timeRemaining);
        if (timeRemaining >= 0) {
          io.to(parseInt(roomCode)).emit("countdown-update", flag);
          timeRemaining--;
          flag.timeRemaining = timeRemaining;
          console.log("active state remain time ", flag);
        } else {
          clearInterval(countdownInterval);
          flag.startIn = "on";
          flag.endsIn = "off";
          flag.finish = "off";
          flag.timeRemaining = 0;
          this.sendQuizPollInfo(io, { roomCode, userId });
        }
      }, 1000);
    } else if (response.status === "running") {
      const endTimeInIST = new Date(
        new Date(response.endDateTime).getTime() + 5.5 * 60 * 60 * 1000
      );

      const endTimeInSeconds = endTimeInIST.getTime();

      // Get the current time in IST by shifting the current time manually
      const now = new Date();
      const currentInIST = new Date(
        now.getTime() + 5.5 * 60 * 60 * 1000 // Add 5 hours and 30 minutes for IST offset
      );

      // Calculate the time remaining in seconds
      let timeRemaining = Math.floor((endTimeInSeconds - currentInIST) / 1000);
      console.log({ endTimeInSeconds, currentInIST, timeRemaining });

      // Update the flag with the initial time remaining
      flag.timeRemaining = timeRemaining;

      // Emit countdown updates every second
      const countdownInterval = setInterval(() => {
        if (timeRemaining >= 0) {
          io.to(parseInt(roomCode)).emit("countdown-update", flag);
          timeRemaining--;
          flag.startIn = "off";
          flag.endsIn = "on";
          flag.timeRemaining = timeRemaining;
          console.log("active state remain time ", flag);
        } else {
          clearInterval(countdownInterval);
          flag.startIn = "off";
          flag.endsIn = "off";
          flag.finish = "on";
          flag.timeRemaining = 0;
          io.to(parseInt(roomCode)).emit("countdown-update", flag);
          this.sendQuizPollInfo(io, { roomCode, userId });
        }
      }, 1000);
    } else {
      flag.startIn = "off";
      flag.endsIn = "off";
      flag.finish = "closed";
      flag.timeRemaining = 0;

      io.to(parseInt(roomCode)).emit("countdown-update", flag);
    }
  } catch (error) {
    console.log(error);
  }
};

exports.sendQuizPollInfo = async (io, options) => {
  io.to(options.userId.toString()).emit(
    CONSTANTS.SOCKET.PLAYER.QUIZ_INFO,
    successResponseMessage(
      "Successfully Fetch Quiz/Poll Info",
      (await fetchQuizAndPoll({ roomCode: parseInt(options.roomCode) })).data
    )
  );
};

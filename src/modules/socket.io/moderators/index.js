const { CONSTANTS } = require("../../../config");
const { REDIS } = require("../../../config/constants");
const { logger, RDS } = require("../../../utils");
const { getScoreBoard } = require("./moderator.controls");
const { fetchParticipants, fetchQuizAndPoll } = require("./moderator.services");
const {
  successResponseMessage,
  errorResponseMessage,
} = require("./res.handler");

module.exports = async (io, socket) => {
  // Subscribe to the Redis chat channel
  RDS.sub.subscribe("moderator_states");

  // Listen for messages on the subscribed Redis channel and broadcast them to all connected clients
  RDS.sub.on("message", async (channel, message) => {
    const response = JSON.parse(message);
    console.log(`Received message on channel ${channel}:`, response.event);

    if (response.FROM === "MODERATOR") {
      if (
        response.event === REDIS.PUB_EVENT.ACITVATED ||
        response.event === REDIS.PUB_EVENT.DEACTIVATED ||
        response.event === REDIS.PUB_EVENT.RUNNING ||
        response.event === REDIS.PUB_EVENT.END
      ) {
        io.to(parseInt(response.roomDetail.roomCode)).emit(
          CONSTANTS.SOCKET.PLAYER.QUIZ_INFO,
          successResponseMessage(
            "Successfully Fetch Quiz/Poll Info",
            (
              await fetchQuizAndPoll({
                roomCode: parseInt(response.roomDetail.roomCode),
              })
            ).data
          )
        );
      }
    }
  });

  socket.on(CONSTANTS.SOCKET.MODERATOR.JOIN, async (options, callback) => {
    try {
      logger.info(options);
      socket.join(parseInt(options.roomCode));
      socket.join(options.userId.toString());

      io.to(parseInt(options.roomCode)).emit(
        CONSTANTS.SOCKET.MODERATOR.PARTICIPANTS,
        successResponseMessage(
          "Successfully get participants",
          await fetchParticipants(parseInt(options.roomCode))
        )
      );

      io.to(options.userId.toString()).emit(
        CONSTANTS.SOCKET.PLAYER.QUIZ_INFO,
        successResponseMessage(
          "Successfully Fetch Quiz/Poll Info",
          (await fetchQuizAndPoll({ roomCode: parseInt(options.roomCode) }))
            .data
        )
      );

      try {
        io.to(parseInt(options.roomCode)).emit(
          CONSTANTS.SOCKET.MODERATOR.SCOREBOARD,
          successResponseMessage(
            "Successfully get scoreboard",
            await getScoreBoard(parseInt(options.roomCode))
          )
        );
      } catch (error) {
        console.log({ error });
      }

      callback(successResponseMessage("success", options));
    } catch (error) {
      console.log("error", error.message);
      return callback(errorResponseMessage(error.message));
    }
  });

  socket.on(CONSTANTS.SOCKET.DISCONNECTED, async () => {
    logger.info(socket.user);

    if (socket.user) {
      logger.info(
        `${CONSTANTS.SOCKET.OWNER} => ${socket.user.email} has left!`
      );
      socket.leave(socket.id);
      socket.leave(socket.user.id);
    }
  });
};

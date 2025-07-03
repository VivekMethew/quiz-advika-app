const { kafka } = require("../config/kafka");

exports.createConsumer = async function (topics) {
  const consumer = kafka.consumer({ groupId: "user-1" });
  console.log("consumer connecting...");
  await consumer.connect();

  console.log("consumer Connected Successfully");

  await consumer.subscribe({
    topics: topics,
    fromBeginning: true,
  });

  await consumer.run({
    autoCommit: true,
    // autoCommitInterval: 0.5,
    eachMessage: async ({ message, pause }) => {
      try {
        if (!message.value) return;
        const value = JSON.parse(message.value.toString());
        console.log({ value });
        if (value.event === CONSTANTS.SOCKET.MODERATOR.SCOREBOARD) {
          if (global.io) {
            logger.info(`EVENT HIT => ${value.event}`);
            if (isMatch.type === "quiz") {
              global.io
                .to(parseInt(value.RoomDetail.roomCode))
                .emit(
                  value.event,
                  successResponseMessage(
                    value.message,
                    await getScoreBoard(parseInt(value.RoomDetail.roomCode))
                  )
                );
            }
          }
        }

        if (value.event === CONSTANTS.SOCKET.MODERATOR.PARTICIPANTS) {
          if (global.io) {
            logger.info(`EVENT HIT => ${value.event}`);
            global.io
              .to(parseInt(value.RoomDetail.roomCode))
              .emit(
                value.event,
                successResponseMessage(
                  value.message,
                  await listParticipants(parseInt(value.RoomDetail.roomCode))
                )
              );
          }
        }
      } catch (error) {
        pause();
        setTimeout(() => {
          consumer.resume([{ topic: "MESSAGES" }]);
        }, 500);
      }
    },
  });
};

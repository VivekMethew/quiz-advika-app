const { CONSTANTS } = require("../config");
const { kafka } = require("../config/kafka");

exports.produceMessage = async (payload) => {
  const producer = kafka.producer();
  await producer.connect();

  console.log("Producer Connected Successfully");

  await producer.send({
    topic: payload.topic,
    messages: [
      {
        partition: 0,
        key: `message-${Date.now()}`,
        value: JSON.stringify(payload.message),
      },
    ],
  });

  console.log(`Message producer with topic : [${payload.topic}]`);

  if (CONSTANTS.SOCKET.PLAYER.QUIZ_INFO === payload.message.event) {
    logger.info(`EVENT HIT => ${payload.message.event}`);
    io.to(parseInt(value.RoomDetail.roomCode)).emit(
      payload.message.event,
      successResponseMessage(
        payload.message.message,
        (
          await fetchQuizAndPoll({
            roomCode: parseInt(payload.message.RoomDetail.roomCode),
          })
        ).data
      )
    );
  }

  producer.disconnect();
};

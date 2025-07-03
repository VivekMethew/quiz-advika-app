const { RDS } = require(".");
const CHANNEL = "moderator_states";

exports.radisPublishAction = async (event, userId, code) => {
  const message = JSON.stringify({
    FROM: "MODERATOR",
    event: event,
    message: "message successfully publish",
    roomDetail: { userid: userId.toString(), roomCode: code },
  });
  // Publish messages in parallel
  await RDS.pub.publish(CHANNEL, message);
  console.log("actions sent...");
  return;
};

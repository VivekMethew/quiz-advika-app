require("dotenv").config();
const { parentPort } = require("worker_threads");
const { quizPollModel } = require("../models/quiz.poll.model");
const { mongooseConnection, CONSTANTS } = require("../config");
const moment = require("moment-timezone");
const { generateStartTimeEnd } = require("../utils/dateUtils");
const Redis = require("ioredis"); // Ensure the Redis library is imported
const { REDIS } = require("../config/constants");
mongooseConnection();

const CLIENT = new Redis(process.env.REDIS_CONNECTION_STRING); // Redis connection

(async () => {
  try {
    const currentTime = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST offset is UTC+5:30
    const istDate = new Date(currentTime.getTime() + istOffset);
    const formattedISTDate = istDate.toISOString();

    const findQuery = {
      startDateTime: { $lte: formattedISTDate },
      isAutostart: true,
      status: { $nin: ["pending", "running", "closed", "deactivated"] },
    };

    const polls = await quizPollModel.find(findQuery);

    if (polls.length > 0) {
      const updateOps = [];
      const redisMessages = [];

      for (const poll of polls) {
        const { startISO, endISO, timezon } = generateStartTimeEnd(
          formattedISTDate,
          poll.duration
        );

        // Prepare the update operation
        updateOps.push({
          updateOne: {
            filter: { _id: poll._id },
            update: {
              $set: {
                startDateTime: startISO,
                endDateTime: endISO,
                timezon: timezon,
                duration: poll.duration,
                status: "running",
              },
            },
          },
        });

        // Prepare Redis message
        const message = JSON.stringify({
          FROM: "MODERATOR",
          event: REDIS.PUB_EVENT.RUNNING,
          message: "message successfully publish",
          roomDetail: {
            userid: poll.userId.toString(),
            roomCode: poll.code,
          },
        });
        redisMessages.push(message);
      }

      // Bulk update MongoDB in one operation
      if (updateOps.length > 0) {
        await quizPollModel.bulkWrite(updateOps);
        console.log(`${polls.length} Quiz/Polls are now running`);
      }

      // Publish all Redis messages in parallel
      if (redisMessages.length > 0) {
        await Promise.all(
          redisMessages.map((msg) => CLIENT.publish("quiz_poll_states", msg))
        );
        console.log("All Redis actions sent...");
      }
    } else {
      console.log("No polls to start.");
    }
  } catch (error) {
    console.error("ERROR =>", error);
  } finally {
    // Ensure Redis connection is closed after task completion
    CLIENT.quit()
      .then(() => {
        console.log("Redis connection closed.");
        if (parentPort) parentPort.postMessage("done");
        else process.exit(0);
      })
      .catch((err) => {
        console.error("Error closing Redis connection:", err);
        if (parentPort) parentPort.postMessage("done");
        else process.exit(0);
      });
  }
})();

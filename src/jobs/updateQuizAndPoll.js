require("dotenv").config();
const { parentPort } = require("worker_threads");
const { quizPollModel } = require("../models/quiz.poll.model");
const { mongooseConnection, CONSTANTS } = require("../config");
const moment = require("moment-timezone");
const Redis = require("ioredis"); // Redis client
const { REDIS } = require("../config/constants");

mongooseConnection();
const CLIENT = new Redis(process.env.REDIS_CONNECTION_STRING); // Redis connection

(async () => {
  try {
    //console.log("-----------------START STATUS CLOSED------------------------");
    const currentTime = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST offset is UTC+5:30
    const istDate = new Date(currentTime.getTime() + istOffset);
    const formattedISTDate = istDate.toISOString();

    const findQuery = {
      isForEver: false,
      endDateTime: { $lt: formattedISTDate },
      status: { $nin: ["closed", "deactivated", "order"] },
    };

    const polls = await quizPollModel.find(findQuery);

    if (polls.length > 0) {
      // Bulk update MongoDB in one operation
      await quizPollModel.updateMany(findQuery, { $set: { status: "closed" } });
      console.log(`${polls.length} Quiz/Poll has been closed`);

      try {
        // Create Redis messages
        const messages = polls.map((poll) => {
          return JSON.stringify({
            FROM: "MODERATOR",
            event: REDIS.PUB_EVENT.DEACTIVATED,
            message: "message successfully publish",
            roomDetail: {
              userid: poll.userId.toString(),
              roomCode: poll.code,
            },
          });
        });

        // Publish all Redis messages in parallel
        if (messages.length > 0) {
          await Promise.all(
            messages.map((msg) => CLIENT.publish("quiz_poll_states", msg))
          );
          console.log("All Redis actions sent...");
        }
      } catch (redisError) {
        console.error(`Redis Publish Error: ${redisError.message}`);
      }
    } else {
      console.log("No polls to close.");
    }
  } catch (dbError) {
    console.error("MongoDB Query Error:", dbError);
  } finally {
    // Ensure Redis connection is closed after task completion
    CLIENT.quit()
      .then(() => {
        console.log("Redis connection closed.");
        if (parentPort) parentPort.postMessage("done");
        else process.exit(0);
      })
      .catch((quitError) => {
        console.error("Error closing Redis connection:", quitError);
        if (parentPort) parentPort.postMessage("done");
        else process.exit(0);
      });
  }
})();

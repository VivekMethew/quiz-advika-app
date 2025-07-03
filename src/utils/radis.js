require("dotenv").config();
const Redis = require("ioredis");
const logger = require("./logger");

const CLIENT = new Redis(process.env.REDIS_CONNECTION_STRING);
const pub = new Redis(process.env.REDIS_CONNECTION_STRING);
const sub = new Redis(process.env.REDIS_CONNECTION_STRING);

//  Error handling for Redis instances
const handleRedisError = (client, clientName) => {
  client.on("error", (error) => {
    logger.error(`${clientName} Redis connection error:`, error);
  });

  client.on("connect", () => {
    logger.info(`${clientName} Redis connected`);
  });

  client.on("ready", () => {
    logger.info(`${clientName} Redis connection is ready`);
  });

  client.on("reconnecting", () => {
    logger.info(`${clientName} Redis reconnecting...`);
  });

  client.on("end", () => {
    logger.info(`${clientName} Redis connection closed`);
  });
};

// Attach error handlers to both pub and sub clients
handleRedisError(pub, "Publisher");
handleRedisError(sub, "Subscriber");

const findGameInfor = async (key) => {
  return JSON.parse(await CLIENT.get(key));
};

const getTotalPointDetail = async (key) => {
  return await CLIENT.get(key);
};

const saveTotalPointDetail = async (key, payload) => {
  // Store result in cache with a TTL of 10 seconds
  await CLIENT.set(key, JSON.stringify(payload), "EX", 10);
  return true;
};

module.exports = {
  findGameInfor,
  saveTotalPointDetail,
  getTotalPointDetail,
  pub,
  sub,
};

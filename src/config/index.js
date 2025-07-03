const constants = require("./constants");
const messages = require("./messages");
const httpCodes = require("./httpCodes");

const ALLOW_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "https://play.eskoops.com",
  "https://app.eskoops.com",
];

module.exports = {
  CONSTANTS: constants,
  MESSAGES: messages,
  HTTP_CODES: httpCodes,
  DEFAULT_IMAGE: {
    POLL_DEFAULT_IMAGE: "66ae67aa1259b4835b55f1fb",
    QUIZ_DEFAULT_IMAGE: "66ae678c1259b4835b55f1f8",
  },
  allowedOrigins: process.env?.ALLOW_ORIGINS?.split(",") || ALLOW_ORIGINS,
  KAFKA_GROUP: { GROUP_ID: "eskoops" },
  LOGIN_SESSION_SECRET:
    process.env.LOGIN_SESSION_SECRET || "qTWfh90nz2Cwb8EeW8zKN3KprO5pAhTd",
  DB: {
    MONGODB_CONNECTION_STRING:
      process.env.MONGODB_CONNECTION_STRING || "mongodb://localhost/eskoops",
  },
  URLS: {
    FRONTEND: process.env.CLIENT_BASE_URL || "https://app.eskoops.com",
    PLAYER_CLIENT_BASE_URL:
      process.env.PLAYER_CLIENT_BASE_URL || "https://play.eskoops.com",
    MODE_BACKEND: process.env.SERVER_BASE_URL || "https://api.eskoops.com",
  },
  mongooseConnection: require("./mongoose.connection"),
  JWT: {
    ACCESS_TOKEN_SECRET:
      process.env.ACCESS_TOKEN_SECRET ||
      "f8ebb38637060c7191e62c7bd8a46c5a6cbc51e523632d689fe089a9c29d0430f2e67119c73212aa1306ceb0d40bc4a22603ffbdfb0b2913012ad328b6175244",
    REFRESH_TOKEN_SECRET:
      process.env.REFRESH_TOKEN_SECRET ||
      "6613a794e8404c58c44a0b6d79079559787c70a3dde2623da16c7be317a37e3491bfb8ad0718ba82264666cdb9b62c09117e374d4a228975150962ad7607677c",
    ACCESS_TOKEN_TIME: "1d",
    REFRESH_TOKEN_TIME: "7d",
    RESET_PASSWORD_SECRET:
      process.env.RESET_PASSWORD_SECRET ||
      "6613a794e8404c58c44a0b6d79079559787c70a3dde2623da16c7be317a37e3491bfb8ad0718ba82264666cdb9b62c09117e374d4a228975150962ad7607677c",
    RESET_PASSWORD_TIME: "7d",
  },
};

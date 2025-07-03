const pino = require("pino");

const logger = pino({
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "yyyy-dd-mm, h:MM:ss TT",
    },
  },
});

// const { createLogger } = require("winston");
// const LokiTransport = require("winston-loki");

// const options = {
//   transports: [
//     new LokiTransport({
//       labels: {
//         appName: "eskoops",
//       },
//       host: "http://127.0.0.1:3100",
//     }),
//   ],
// };

// const logger = createLogger(options);

module.exports = logger;

const client = require("prom-client");
const logger = require("./logger");
exports.collectDefaultMatrics = () => {
  logger.info("Default Metrics Collection Start...");
  const collectDefaultMatrics = client.collectDefaultMetrics;
  collectDefaultMatrics({ register: client.register });
};

// exports.collectServerLogs = () => {
//   logger.info("Collect Metrics Collection Start...");
//   const collectDefaultMatrics = client.collectDefaultMetrics;
//   collectDefaultMatrics({ register: client.register });
// };

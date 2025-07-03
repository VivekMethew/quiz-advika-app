const validateSocketAuth = require("./middlewares/socket_auth");

module.exports = (io) => {
  io.use(validateSocketAuth); //SOCKET_SECRET_KEY
  io.on("connection", async (socket) => {
    console.log("Web Socket Connected...");
    require("./moderators")(io, socket);
  });
};

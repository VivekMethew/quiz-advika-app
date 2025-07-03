const validateSocketAuth = (socket, next) => {
  const secretKey = socket.handshake.auth.secretKey;
  if (!secretKey) {
    const err = new Error("Authentication error");
    err.data = { content: "Please provide a valid secret key." }; // Additional details
    next(err);
  }
  if (secretKey === process.env.SOCKET_SECRET_KEY) {
    next(); // Proceed to the connection
  } else {
    const err = new Error("Authentication error");
    err.data = { content: "Please provide a valid secret key." }; // Additional details
    next(err);
  }
};

module.exports = validateSocketAuth;

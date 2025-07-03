const basicAuth = require("basic-auth");
exports.swaggerAuthenticate = (req, res, next) => {
  const credentials = basicAuth(req);
  if (
    !credentials ||
    credentials.name !== "admin" ||
    credentials.pass !== "123456"
  ) {
    res.set("WWW-Authenticate", 'Basic realm="example"');
    return res.status(401).send("Authentication required.");
  }
  next();
};

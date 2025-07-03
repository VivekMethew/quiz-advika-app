require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const { logger } = require("./src/utils");
const routes = require("./src/routes");
const { errorHandler, routeHandler } = require("./src/helpers");
const {
  mongooseConnection,
  allowedOrigins,
  LOGIN_SESSION_SECRET,
} = require("./src/config");
const session = require("express-session");
const passport = require("passport");
const path = require("path");

// Passport Auth Initialization
// require("./src/modules/auth/googleAuth");
// require("./src/modules/auth/facebookAuth");

const app = express();

mongooseConnection();

app.use(
  session({
    secret: LOGIN_SESSION_SECRET, // Change this to a more secure key in production
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set to true if using HTTPS
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(
  express.urlencoded({
    limit: "500mb",
    extended: true,
    parameterLimit: 1000000,
  })
);
app.use(express.json({ limit: "500mb" }));
app.use(compression());
app.use(cookieParser());

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true); // Allow the request
      } else {
        callback(new Error("Not allowed by CORS")); // Reject the request
      }
    },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    optionsSuccessStatus: 204,
  })
);

app.use(helmet());
app.use(
  morgan(
    "[:date[web]] :method :url :status :response-time ms - :res[content-length]"
  )
);

// Enable CORS
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,PATCH,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // intercept OPTIONS method
  if (req.method === "OPTIONS") {
    res.send(200);
  } else {
    next();
  }
});

const publicDirectoryPath = path.join(__dirname, "src/public");
app.use(express.static(publicDirectoryPath));

app.use("/api/v1", routes);
app.use(errorHandler);
app.use(routeHandler);
process.on("uncaughtException", function (err) {
  logger.error(err);
});

// eslint-disable-next-line no-unused-vars
process.on("unhandledRejection", function (reason, p) {
  logger.error(reason);
});

// application related to server side code

module.exports = app;

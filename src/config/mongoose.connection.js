require("dotenv").config();
const mongoose = require("mongoose");

module.exports = () => {
  mongoose
    .connect(process.env.MONGODB_CONNECTION_STRING, {
      dbName: process.env.DB_NAME,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("mongodb connected...");
    })
    .catch((err) => console.log(err.message));

  mongoose.connection.on("connected", () => {
    console.log("Mongoose connected to db...");
  });

  mongoose.connection.on("error", (err) => {
    console.log(err.message);
  });

  mongoose.connection.on("disconnected", () => {
    console.log("Mongoose connection is disconnected...");
  });

  process.on("SIGINT", async () => {
    try {
      await mongoose.connection.close();
      console.log(
        "Mongoose connection is disconnected due to app termination..."
      );
      process.exit(0);
    } catch (err) {
      console.error("Error during Mongoose disconnection:", err);
      process.exit(1);
    }
  });
};

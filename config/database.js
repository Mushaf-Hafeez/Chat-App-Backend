const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = () => {
  mongoose
    .connect(process.env.DATABASE_URL)
    .then(() => console.log("Database connected."))
    .catch((error) => {
      console.log("Error while connecting to the database: ", error.message);
      process.exit(1);
    });
};

module.exports = connectDB;

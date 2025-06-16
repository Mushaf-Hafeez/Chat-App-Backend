const express = require("express");
const { app, server } = require("./config/socket.js");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const connectDB = require("./config/database");
const connectToCloudinary = require("./config/cloudinary");

// importing the routes
const authRouter = require("./routes/auth.route.js");
const messageRouter = require("./routes/message.route.js");

const port = process.env.PORT;

// adding middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "PUT", "POST", "DELETE"],
  })
);
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);
app.use("/api/auth", authRouter);
app.use("/api/message", messageRouter);

// database connection
connectDB();

// cloudinary connection
connectToCloudinary();

// default route
app.get("/", (req, res) => {
  res.send("This is a chat app.");
});

// making the server to listen to the requests
server.listen(port, () => {
  console.log(`App is running on port ${port}`);
});

const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    credentials: true,
  },
});

const onlineUsers = {};

const getReceiverSocketId = (userId) => {
  return onlineUsers[userId];
};

io.on("connection", (socket) => {
  console.log("A user connected: ", socket.id);
  console.log("User ID: ", socket.handshake.query.userId);

  onlineUsers[socket.handshake.query.userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(onlineUsers));

  socket.on("disconnect", () => {
    console.log("User disconnected: ", socket.id);
    delete onlineUsers[socket.handshake.query.userId];
    io.emit("getOnlineUsers", Object.keys(onlineUsers));
  });
});

module.exports = { app, server, io, getReceiverSocketId };

const express = require("express");
const router = express.Router();

const { auth } = require("../middlewares/auth.middleware.js");
const {
  getUsers,
  getMessages,
  sendMessage,
} = require("../controllers/message.controller.js");

router.get("/users", auth, getUsers);
router.get("/:id", auth, getMessages);
router.post("/send/:id", auth, sendMessage);

module.exports = router;

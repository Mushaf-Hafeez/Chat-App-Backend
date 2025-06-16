const express = require("express");
const router = express.Router();

const {
  signup,
  login,
  logout,
  isAuthenticated,
  changeImage,
} = require("../controllers/auth.controller.js");
const { auth } = require("../middlewares/auth.middleware.js");

router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", auth, logout);
router.get("/checkAuth", auth, isAuthenticated);
router.put("/changeImage", auth, changeImage);

module.exports = router;

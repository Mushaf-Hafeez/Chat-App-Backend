const User = require("../models/user.model.js");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.auth = async (req, res, next) => {
  try {
    // get the token from the cookie
    const token = req.cookies.token;

    // return if the token is not found
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is missing.",
      });
    }

    // decode the token
    const decodedData = jwt.decode(token, process.env.JWT_SECRET);

    // check if the user with the id exists in the database
    const doesExist = await User.findById({ _id: decodedData.id }).select(
      "-password"
    );

    // if the user does not exists then return the response
    if (!doesExist) {
      return res.status(400).json({
        success: false,
        message: "Invalid token.",
      });
    }

    (req.body.id = decodedData.id), (req.body.email = decodedData.email);

    next();
  } catch (error) {
    console.log("Error in the middleware function:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error in middleware.",
    });
  }
};

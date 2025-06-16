const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

// function to create the token and to set the cookie
exports.createToken = (id, email, res) => {
  const token = jwt.sign({ id, email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    secure: process.env.NODE_ENV !== "development",
  });

  return token;
};

// function to upload images to cloudinary
exports.uploadImage = async (image) => {
  return await cloudinary.uploader.upload(image, {
    folder: process.env.CLOUDINARY_FOLDER_NAME,
  });
};

exports.isImageSupported = (type) => {
  return ["jpg", "jpeg", "png"].includes(type.toLowerCase());
};

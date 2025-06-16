const cloudinary = require("cloudinary").v2;
require("dotenv").config();

const connectToCloudinary = () => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    console.log("Connected to cloudinary.");
  } catch (error) {
    console.log("Could not connected to cloudinary: ", error.message);
  }
};

module.exports = connectToCloudinary;

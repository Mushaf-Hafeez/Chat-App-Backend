const mongoose = require("mongoose");
const User = require("../models/user.model.js");
const Message = require("../models/message.model.js");
const { uploadImage, isImageSupported } = require("../config/util.js");
const { io, getReceiverSocketId } = require("../config/socket.js");

// controller to get all the users
exports.getUsers = async (req, res) => {
  try {
    // find all the users from the database but not he yourself
    const users = await User.find({ _id: { $ne: req.body.id } });

    return res.status(200).json({
      success: true,
      data: users,
      message: "All the users fetched successfully.",
    });
  } catch (error) {
    console.log("Error in get users controller: ", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// controller to get all the messages
exports.getMessages = async (req, res) => {
  const myId = req.body.id;
  const receiverId = req.params.id;
  try {
    // validation
    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: "Receiver ID not found.",
      });
    }

    // check if the user exists with this id
    const doesExist = await User.findById({ _id: receiverId });

    // return res if user with this ID not found
    if (!doesExist) {
      return res.status(404).json({
        success: false,
        message: "Invalid user id.",
      });
    }

    // find all the message
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId },
        { senderId: receiverId, receiverId: myId },
      ],
    });

    // return res with all trhe messages
    return res.status(200).json({
      success: true,
      data: messages,
      message: "Messages fetched successfully.",
    });
  } catch (error) {
    console.log("Error in get messages controller: ", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// controller for sending the message
exports.sendMessage = async (req, res) => {
  const receiverId = req.params.id;
  const myId = req.body.id;
  const text = req.body.text;
  let imageURL = null;

  try {
    // validation
    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: "Receiver ID is missing.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid receiver ID type.",
      });
    }

    // check the if the receiver id exists in the database
    const doesExist = await User.findById({ _id: receiverId });

    // return res if the user not found
    if (!doesExist) {
      return res.status(404).json({
        success: false,
        message: "Invalid receiver ID.",
      });
    }

    // validation for the image and the text, because we cannot send an empty message
    if (!text && (!req.files || !req.files.image)) {
      return res.status(400).json({
        success: false,
        message: "Please provide text/image.",
      });
    }

    if (req.files && req.files.image) {
      // store the image in a variable
      const image = req.files.image;

      // return if the image is supported
      if (!isImageSupported(image.name.split(".")[1])) {
        return res.status(400).json({
          success: false,
          message: "File type is not supported.",
        });
      }

      // upload the image to cloudinary
      const uploadRes = await uploadImage(image.tempFilePath);

      // return if there is not response
      if (!uploadRes) {
        return res.status(400).json({
          success: false,
          message: "Error while uploading the image to cloudinary.",
        });
      }

      // store the link of the uploaded image
      imageURL = uploadRes.secure_url;
    }

    const response = await Message.create({
      senderId: myId,
      receiverId,
      text,
      image: imageURL,
    });

    if (!response) {
      return res.status(400).json({
        success: false,
        message: "Error while creating the entry in the database.",
      });
    }

    // send message in the real time
    const socket = getReceiverSocketId(receiverId);
    if (socket) {
      io.to(socket).emit("newMessage", {
        receiverId,
        text,
        image: imageURL || null,
        createdAt: new Date(),
      });
    }

    return res.status(200).json({
      success: true,
      data: response,
      message: "Message sent successfullly.",
    });
  } catch (error) {
    console.log("Error in the send message controller: ", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

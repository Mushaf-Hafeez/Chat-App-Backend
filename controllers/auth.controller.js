const User = require("../models/user.model.js");
const {
  createToken,
  uploadImage,
  isImageSupported,
} = require("../config/util.js");
const bcrypt = require("bcrypt");

// signup controller function
exports.signup = async (req, res) => {
  let { name, email, password, confirmPassword } = req.body;

  try {
    // validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All the fields are required.",
      });
    }
    // return if the length of the password is less than 8
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be 8 characters long.",
      });
    }

    // return if both of the passwords are not same
    if (password !== confirmPassword) {
      return res.status(401).json({
        success: false,
        message: "Passwords must be same.",
      });
    }

    // check if the user already exists
    const doesExist = await User.findOne({ email });

    //   return if the user exists
    if (doesExist) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email.",
      });
    }

    // removing the extra whitespaces from the name
    name = name.replace(/\s+/g, " ").trim();

    // now hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // return if the password not hashed
    if (!hashedPassword) {
      return res.status(400).json({
        success: false,
        message: "Error while hashing the password",
      });
    }

    // create the user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // return if the user not created
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Error while creating the account.",
      });
    }

    // create token and store it in the cookie
    const token = createToken(user._id, email, res);

    // return with success message
    return res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      message: "User created successfully.",
    });
  } catch (error) {
    {
      console.log("Error in the signup controller: ", error.message);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
};

// login controller function
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All the fields are required.",
      });
    }

    // check if the user exist
    const doesExist = await User.findOne({ email });

    // return if the user does not exists
    if (!doesExist) {
      return res.status(404).json({
        success: false,
        message: "Please sign up before logging in.",
      });
    }

    // compare the password
    if (!(await bcrypt.compare(password, doesExist.password))) {
      return res.status(400).json({
        success: false,
        message: "Incorrect credentials.",
      });
    }

    // create jwt token
    const token = createToken(doesExist._id, doesExist.email, res);

    // return success message
    return res.status(200).json({
      success: true,
      data: {
        id: doesExist._id,
        name: doesExist.name,
        email: doesExist.email,
        image: doesExist.image,
        createdAt: doesExist.createdAt,
      },
      message: "Login successful.",
    });
  } catch (error) {
    {
      console.log("Error in the signup controller: ", error.message);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
};

// logout controller function
exports.logout = async (req, res) => {
  try {
    return res
      .cookie("token", "", {
        maxAge: 0,
      })
      .json({
        success: true,
        message: "logout successfully.",
      });
  } catch (error) {
    {
      console.log("Error in the signup controller: ", error.message);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
};

exports.isAuthenticated = (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "User is authenticated.",
    });
  } catch (error) {
    console.log("Error in the isAuthenticated controller: ", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// controller function to update the profile pic of the user
exports.changeImage = async (req, res) => {
  const image = req.files.image;
  const id = req.body.id;
  try {
    // validation
    if (!image) {
      return res.status(400).json({
        success: false,
        message: "Image not found.",
      });
    }

    // check the file type
    if (!isImageSupported(image.name.split(".")[1])) {
      return res.status(400).json({
        success: false,
        message: "FIle type is not supported.",
      });
    }

    // upload image to cloudinary
    const uploadRes = await uploadImage(image.tempFilePath);

    // return if there is not response
    if (!uploadRes) {
      return res.status(400).json({
        success: false,
        message: "Error while uploading the image to cloudinary.",
      });
    }

    // update the user data in the database
    await User.findOneAndUpdate({ _id: id }, { image: uploadRes.secure_url });

    // return the success message
    return res.status(200).json({
      success: true,
      data: {
        image: uploadRes.secure_url,
      },
      message: "Profile updated.",
    });
  } catch (error) {
    console.log("Error in the change image controller: ", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

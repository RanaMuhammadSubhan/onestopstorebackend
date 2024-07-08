const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

const registerUser = async (req, res) => {
  const { email, password, name, age, gender, profilePicture } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  const user = await User.create({
    email,
    password,
    name,
    age,
    gender,
    profilePicture,
  });

  if (user) {
    return res.status(201).json({
      _id: user._id,
      email: user.email,
      name: user.name,
      age: user.age,
      gender: user.gender,
      profilePicture: user.profilePicture,
      token: generateToken(user._id),
    });
  } else {
    return res.status(400).json({ message: "Invalid user data" });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email } || { name });

  if (user && (await user.matchPassword(password))) {
    return res.json({
      _id: user._id,
      email: user.email,
      name: user.name,
      age: user.age,
      gender: user.gender,
      profilePicture: user.profilePicture,
      token: generateToken(user._id),
    });
  } else {
    return res.status(401).json({ message: "Invalid email or password" });
  }
};

const profile = async (req, res) => {
  const { name, age, gender, email } = req.body;
  const profilePicture = req.file ? req.file.path : req.body.profilePicture; // Use the uploaded file's URL if available
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id, // Authenticated user ID
      { name, age, gender, email, profilePicture },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Profile update error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
module.exports = { registerUser, loginUser, profile };

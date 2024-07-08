const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: false, unique: true },
    password: { type: String, required: false },
    name: { type: String, required: false },
    age: { type: Number, required: false },
    gender: { type: String, required: false },
    profilePicture: { type: String },
  },
  {
    timestamps: false, // Enable Mongoose's automatic timestamps
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;

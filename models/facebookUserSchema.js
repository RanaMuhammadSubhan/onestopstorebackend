const mongoose = require("mongoose");

const facebookUserSchema = new mongoose.Schema({
  facebookId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String },
  profilePicture: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const FacebookUser = mongoose.model("FacebookUser", facebookUserSchema);

module.exports = FacebookUser;

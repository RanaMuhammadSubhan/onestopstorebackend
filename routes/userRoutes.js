const express = require("express");
const {
  registerUser,
  loginUser,
  profile,
} = require("../controllers/userController");
const authenticateUser = require("../Middleware/middleware");
const upload = require("../Config/cloudinary"); // Assuming this is the path to your Cloudinary setup

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.put(
  "/profile",
  authenticateUser,
  upload.single("profilePicture"),
  profile
);

module.exports = router;

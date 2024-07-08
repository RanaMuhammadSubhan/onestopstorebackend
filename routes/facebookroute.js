const express = require("express");
const passport = require("passport");
const router = express.Router();

// Route for initiating Facebook authentication
router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);

// Route for handling callback from Facebook
router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    successRedirect: "http://localhost:5173/", // Redirect to profile page on frontend
    failureRedirect: "http://localhost:5173/login", // Redirect to login page on frontend
  })
);

module.exports = router;

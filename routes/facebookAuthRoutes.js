const express = require("express");
const passport = require("../passport");
const router = express.Router();

// Route for initiating Facebook authentication
router.get(
  "/auth/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);

// Route for handling callback from Facebook
router.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", {
    successRedirect: "/profile", // Redirect to profile page after successful authentication
    failureRedirect: "/login", // Redirect to login page if authentication fails
  })
);

// Route for logging out
router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

module.exports = router;

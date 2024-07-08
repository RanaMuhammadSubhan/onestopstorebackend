const express = require("express");
const session = require("express-session");
const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
const mongoose = require("mongoose");
const FacebookUser = require("./models/facebookUserSchema"); // Assuming this is where your model is defined
require("dotenv").config();

// Connect to MongoDB (replace with your actual MongoDB URI)
mongoose.connect("mongodb+srv://subhan:admin123@store.cg89rrm.mongodb.net", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.on("error", (error) => console.error(error));
mongoose.connection.once("open", () => console.log("Connected to database"));

// Passport.js setup
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: "6fadb9e89d68e5ad5d105124d7daa25d",
      callbackURL: process.env.FACEBOOK_CALLBACK_URL,
      profileFields: ["id", "displayName", "email", "picture.type(large)"], // Specify the profile fields you want to retrieve
    },
    async (accessToken, refreshToken, profile, done) => {
      // Check if the user already exists in your database
      try {
        let user = await FacebookUser.findOne({ facebookId: profile.id });

        if (user) {
          return done(null, user);
        } else {
          // Create a new user if not exists
          const newUser = new FacebookUser({
            facebookId: profile.id,
            name: profile.displayName,
            email: profile.emails ? profile.emails[0].value : null,
            profilePicture: profile.photos ? profile.photos[0].value : null,
          });
          await newUser.save();
          return done(null, newUser);
        }
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await FacebookUser.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "your_session_secret", // Replace with a random string for session encryption
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Routes
const authRoutes = require("./facebookroute");
app.use("/auth", authRoutes); // Assuming your routes are defined in authRoutes.js

// Logout route
app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

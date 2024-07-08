// passport.js

const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
const FacebookUser = require("./models/facebookUserSchema"); // Adjust path as per your project structure
require("dotenv").config();

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "http://localhost:5000/auth/facebook/callback",
      profileFields: ["id", "displayName", "email", "photos"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let facebookUser = await FacebookUser.findOne({
          facebookId: profile.id,
        });

        if (!facebookUser) {
          facebookUser = await FacebookUser.create({
            facebookId: profile.id,
            name: profile.displayName,
            email: profile.emails ? profile.emails[0].value : "",
            profilePicture: profile.photos ? profile.photos[0].value : "",
          });
        }

        return done(null, facebookUser);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  FacebookUser.findById(id, (err, user) => {
    done(err, user);
    
  });
});

module.exports = passport;

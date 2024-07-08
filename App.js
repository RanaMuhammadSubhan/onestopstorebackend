const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./Config/db");
const userRoutes = require("./routes/userRoutes");
const cors = require("cors"); // Import CORS middleware
const session = require("express-session");
const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
const FacebookUser = require("./models/facebookUserSchema"); // Assuming this is where your model is defined
dotenv.config();
connectDB();
const app = express();
app.use(cors());
app.use(express.json());
passport.use(
  new FacebookStrategy(
    {
      clientID: "7817098028369740",
      clientSecret: "6fadb9e89d68e5ad5d105124d7daa25d",
      callbackURL: "http://localhost:5000/auth/facebook/callback",
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

app.use("/api/users", userRoutes);
app.get("/api/test", (req, res) => {
  res.send("API is working");
});
const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running on port ${PORT}`));

// app.use(session({ secret: "secret", resave: false, saveUninitialized: true }));
// app.use(passport.initialize());
// app.use(passport.session());
// app.get(
//   "/auth/google",
//   passport.authenticate("google", { scope: ["profile"] })
// );

// app.get(
//   "/auth/google/callback",
//   passport.authenticate("google", { failureRedirect: "/login" }),
//   function (req, res) {
//     // Successful authentication, redirect home.
//     res.redirect("/");
//   }
// );

// const express = require("express");
// const session = require("express-session");
// const passport = require("passport");
// const FacebookStrategy = require("passport-facebook").Strategy;
// const mongoose = require("mongoose");
// const User = require("./models/User"); // Assuming your user model is defined here
// const dotenv = require("dotenv");
// const cors = require("cors");
// dotenv.config();

// const connectDB = require("./Config/db");
// connectDB();
// // Initialize Express
// const app = express();
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Setup sessions
// app.use(
//   session({
//     secret: "secret",
//     resave: false,
//     saveUninitialized: true,
//   })
// );

// // Initialize Passport
// app.use(passport.initialize());
// app.use(passport.session());
// const FACEBOOK_APP_ID = 7817098028369740;
// const FACEBOOK_APP_SECRET = "6fadb9e89d68e5ad5d105124d7daa25d";
// // Configure Facebook Strategy
// passport.use(
//   new FacebookStrategy(
//     {
//       clientID: FACEBOOK_APP_ID,
//       clientSecret: FACEBOOK_APP_SECRET,
//       callbackURL: "http://localhost:5000/auth/facebook/callback",
//       profileFields: ["id", "displayName", "email", "photos"],
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         // Check if user already exists in database
//         let user = await User.findOne({ facebookId: profile.id });

//         if (!user) {
//           // If user does not exist, create a new user
//           user = await User.create({
//             facebookId: profile.id,
//             email: profile.emails ? profile.emails[0].value : "",
//             name: profile.displayName,
//             profilePicture: profile.photos ? profile.photos[0].value : "",
//           });
//         }

//         return done(null, user);
//       } catch (err) {
//         return done(err);
//       }
//     }
//   )
// );

// // Serialize and deserialize user
// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });

// passport.deserializeUser((id, done) => {
//   User.findById(id, (err, user) => {
//     done(err, user);
//   });
// });

// // Routes
// app.get("/", (req, res) => {
//   if (req.isAuthenticated()) {
//     res.send(`Hello, ${req.user.name}!`);
//   } else {
//     res.send("Hello, Guest!");
//   }
// });

// app.get(
//   "/auth/facebook",
//   passport.authenticate("facebook", { scope: ["email"] })
// );

// app.get(
//   "/auth/facebook/callback",
//   passport.authenticate("facebook", { failureRedirect: "/login" }),
//   (req, res) => {
//     // Successful authentication, redirect home.
//     res.redirect("/");
//   }
// );

// app.get("/logout", (req, res) => {
//   req.logout();
//   res.redirect("/");
// });

// // Start server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });

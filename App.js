const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./Config/db");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/facebookroute");

const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
const FacebookUser = require("./models/facebookUserSchema");

dotenv.config();
connectDB();

const app = express();

// CORS Options
const corsOptions = {
  origin: "https://onestopstore1.netlify.app", // Specify your frontend URL
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // If you need to include cookies or authentication tokens
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options("*", cors(corsOptions));

app.use(express.json());

// Handle Vercel deployment
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Your logic here

  next();
});
// Passport configuration and routes
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL,
      profileFields: ["id", "displayName", "email", "picture.type(large)"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await FacebookUser.findOne({ facebookId: profile.id });
        if (user) {
          return done(null, user);
        } else {
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
    secret: "your_session_secret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Routes

app.use("/auth", authRoutes);
app.use("/api/users", userRoutes);
app.get("/api/test", (req, res) => {
  res.send("API is working");
});
app.use((req, res) => {
  res.status(404).json({ message: "Not Found" });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
module.exports = app;

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

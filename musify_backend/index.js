
// ------------------ MongoDB Database ------------------

const mongoose = require('mongoose'); 
require('dotenv').config();

// Connect to MongoDB database
mongoose.connect("mongodb+srv://"+ process.env.MONGO_USER + ":" + process.env.MONGO_PASS + "@cluster0.2qccoqq.mongodb.net/?retryWrites=true&w=majority",
                {
                    useNewUrlParser: true,
                    useUnifiedTopology: true
                }
).then((x) => {
    console.log("Connected to MongoDB database");}
).catch((err) => {
    console.log("Error connecting to MongoDB database " + err);
});

// ------------------ Setup Passport for Authentication ------------------

const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy, ExtractJwt = require('passport-jwt').ExtractJwt;
const UserModel = require('./models/User');

let opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.JWT_SECRET;
passport.use(
    new JwtStrategy(opts, function (jwt_payload, done) {
        UserModel.findOne({_id: jwt_payload.identifier}, function (err, user) {
            // done(error, doesTheUserExist)
            if (err) {
                return done(err, false);
            }
            if (user) {
                return done(null, user);
            } else {
                return done(null, false);
                // or you could create a new account
            }
        });
    })
);

// ------------------ Node Server ------------------

const express = require('express');
const app = express();

const cors = require('cors');

app.use(express.json());
app.use(cors({
    credentials: true,
    origin: process.env.FRONTEND_URL,
}));

if (process.env.NODE_ENV !== "development") {
  
}

const port = 8000;
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const adminRoutes = require('./routes/admin');
const userInfoRoutes = require('./routes/user-info');
const songRoutes = require('./routes/songs');
const albumRoutes = require('./routes/albums');
const welcomeRoutes = require('./routes/welcome');

app.use("/", welcomeRoutes);
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use("/admin", adminRoutes);
app.use("/user-info", userInfoRoutes);
app.use("/songs", songRoutes);
app.use("/albumsPlaylist", albumRoutes);

// Start server and listen on port 8000
app.listen(port, () => {
    console.log(`Node Server is listening at http://localhost:${port}`);
});
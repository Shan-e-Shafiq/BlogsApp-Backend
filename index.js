const express = require('express')
const cors = require('cors')
const ConnectToDB = require('./db')
const routes = require('./src/routes')
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const cookieParser = require('cookie-parser')
const passport = require('passport')
const session = require('express-session');
const MongoStore = require('connect-mongo');
const { GoogleLogin, FacebookLogin } = require('./src/controllers/auth.controller');
require('dotenv').config()


const app = express()

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}))

// PASSPORT.JS SETUP FOR SOCIAL AUTH

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_AUTH_CLIENT_ID,
    clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
    callbackURL: `${process.env.SERVER_URL}/api/user/auth/google/callback`,
}, GoogleLogin))

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_AUTH_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_AUTH_CLIENT_SECRET,
    callbackURL: `${process.env.SERVER_URL}/api/user/auth/facebook/callback`,
    profileFields: ['id', 'displayName', 'email']
}, FacebookLogin));

passport.serializeUser((user, done) => {
    done(null, user);
});
passport.deserializeUser((user, done) => {
    done(null, user);
});


// // MIDDLEWARES

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        collectionName: 'sessions',
        ttl: 7 * 24 * 60 * 60 // 7 days in seconds
    }),
    cookie: {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
    }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
// app.use(cookieParser())

// ROUTES

app.get('/', (req, res) => {
    res.status(200).json({ msg: 'Server is UP' })
})
app.use('/api', routes)


// TESTING ROUTE

// app.get('/api/testingRoute', (req, res) => {
//     console.log(req.headers.cookie.split('=')[1])
//     return res.status(200).json({ msg: "created" })
// })


app.listen(3000, async () => {
    await ConnectToDB()
    // console.log("http://localhost:3000")
})




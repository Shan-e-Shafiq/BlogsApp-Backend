const express = require('express')
const cors = require('cors')
const ConnectToDB = require('./db')
const routes = require('./src/routes')
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const passport = require('passport')
const session = require('express-session');
const { GoogleLogin, FacebookLogin } = require('./src/controllers/auth.controller');
require('dotenv').config()


const app = express()


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


// MIDDLEWARES

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        // sameSite: 'strict',
        secure: true
    }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(cors({
    origin: "https://blogs-app-frontend-ebon.vercel.app",
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    // to allow cookies exchange between client and server
    credentials: true
}))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cookieParser())

// ROUTES

app.get('/', (req, res) => {
    res.status(200).json({ msg: 'server is up', client: process.env.CLIENT_URL, server: process.env.SERVER_URL, port: process.env.PORT })
})
app.use('/api', routes)


// TESTING ROUTE

// app.get('/api/testingRoute', (req, res) => {
//     console.log(req.headers.cookie.split('=')[1])
//     return res.status(200).json({ msg: "created" })
// })

const PORT = process.env.PORT || 3000

app.listen(PORT, async () => {
    await ConnectToDB()
    // console.log("http://localhost:3000")
})




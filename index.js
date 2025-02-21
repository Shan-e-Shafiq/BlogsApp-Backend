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

app.use(cors({
    // origin: process.env.CLIENT_URL,
    // credentials: true,
    origin: ['http://localhost:5173', 'http://localhost:3000'], // Add any other allowed origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Enable if you're using cookies/sessions
    maxAge: 86400 // Cache preflight requests for 24 hours
}))

// // Add CORS headers to all responses
// app.use((req, res, next) => {
//     res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173'); // Allow requests from your frontend
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); // Specify allowed methods
//     res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Specify allowed headers
//     next();
// })

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
        sameSite: 'none',
        // sameSite: 'lax',
        // sameSite: 'strict',
        secure: true
    }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cookieParser())

// ROUTES

app.get('/', (req, res) => {
    res.status(200).json({ msg: 'server is up' })
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




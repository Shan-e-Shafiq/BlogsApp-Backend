const jwt = require('jsonwebtoken')
const userModel = require('../models/user.model')
const googleUserModel = require('../models/googleUser.model')
const facebookUserModel = require('../models/facebookUser.model')
const bcrypt = require('bcrypt')
require('dotenv').config()

const cookieOptions = {
    httpOnly: true,
    sameSite: 'none',
    // sameSite: 'lax',
    // sameSite:'strict',
    secure: true,
}

function GenerateAccessToken(payload) {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY })
}

function GenerateRefreshToken(payload) {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY })
}

async function LoginUser(req, res) {
    try {
        const { email, password } = req.body

        const user = await userModel.findOne({ email: email.toLowerCase() })

        if (!user) {
            return res.status(404).json({ msg: "User doesn't exist. Please create a new account" })
        }

        const passwordMatch = await bcrypt.compare(password, user.password)
        if (!passwordMatch) {
            return res.status(401).json({ msg: "Incorrect username or password" })
        }

        delete user._doc["password"]

        const { _id, userType } = user._doc
        const payload = { _id, userType }

        const refresh_token = GenerateRefreshToken(payload)
        const access_token = GenerateAccessToken(payload)

        res.cookie('refreshToken', refresh_token, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000 // in ms (cookie expires in 7 days)
        })

        return res.status(200).json({
            msg: "Login Successful",
            user: {
                ...user._doc,
                accessToken: access_token
            }
        })
    } catch (error) {
        // console.log(error)
        return res.status(500).json({ msg: "Internal server error" })
    }
}

async function SignupUser(req, res) {
    try {
        const userData = req.body

        const isAlreadyExist = await userModel.exists({ email: userData.email.toLowerCase() })

        if (isAlreadyExist) {
            return res.status(409).json({
                msg: "User Already exists with this account."
            })
        }

        const hashPassword = await bcrypt.hash(userData.password, 10)

        const user = await userModel.create({
            ...userData,
            email: userData.email.toLowerCase(),
            password: hashPassword,
        })

        delete user._doc["password"]

        const { _id, userType } = user._doc
        const payload = { _id, userType }

        const refresh_token = GenerateRefreshToken(payload)
        const access_token = GenerateAccessToken(payload)

        res.cookie('refreshToken', refresh_token, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000 // in ms (cookie expires in 7 days)
        })

        return res.status(201).json({
            msg: "Account creation Successful",
            user: {
                ...user._doc,
                accessToken: access_token
            }
        })

    } catch (error) {
        // console.log(error)
        return res.status(500).json({ msg: "Internal server error" })
    }
}

async function LogoutUser(req, res) {
    try {
        res.clearCookie('refreshToken', {
            ...cookieOptions
        })
        return res.status(200).json({ msg: "Logout Successful" })
    } catch (error) {
        // console.log(error)
        return res.status(500).json({ msg: "Internal server error" })
    }
}

async function refreshAccessToken(req, res) {
    try {
        const payload = req.user
        const newAccessToken = GenerateAccessToken(payload)

        return res.status(200).json({
            accessToken: newAccessToken,
        })
    } catch (error) {
        // console.log(error)
        return res.status(500).json({ msg: "Internal server error" })
    }
}

async function getUserData(req, res) {
    try {
        const payload = req.user
        const newAccessToken = GenerateAccessToken(payload)
        let userData
        switch (req.user.userType) {
            case "Users":
                userData = await userModel.findOne({ _id: req.user._id })
                break;
            case "GoogleUsers":
                userData = await googleUserModel.findOne({ _id: req.user._id })
                break;
            case "FacebookUsers":
                userData = await facebookUserModel.findOne({ _id: req.user._id })
                break;
        }
        userData = userData._doc
        delete userData["password"]

        res.status(200).json({ ...userData, accessToken: newAccessToken })

    } catch (error) {
        // console.log(error)
        return res.status(500).json({ msg: "Internal server error" })
    }
}

async function GoogleLogin(accessToken, refreshToken, profile, done) {

    // check if user already exist in database
    const userAlreadyExist = await googleUserModel.findOne({ uid: profile.id })
    if (userAlreadyExist) {
        return done(null, userAlreadyExist);
    }
    // save new user login into database
    const googleUser = await googleUserModel.create({
        uid: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value
    })
    return done(null, googleUser);
}

async function FacebookLogin(accessToken, refreshToken, profile, done) {

    // check if user already exist in database
    const userAlreadyExist = await facebookUserModel.findOne({ uid: profile.id })
    if (userAlreadyExist) {
        return done(null, userAlreadyExist);
    }
    // save new user login into database
    const facebookUser = await facebookUserModel.create({
        uid: profile.id,
        name: profile.displayName,
    })
    return done(null, facebookUser);
}

function SocialLoginSuccess(req, res) {
    try {
        const { _id, userType } = req.user._doc
        const payload = { _id, userType }
        const refreshToken = GenerateRefreshToken(payload)
        res.cookie("refreshToken", refreshToken, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000 // in ms (cookie expires in 7 days)
        })
        res.redirect(`${process.env.CLIENT_URL}/auth`)
    } catch (error) {
        // console.log(error)
        return res.status(500).json({ msg: "Internal server error" })
    }
}

function GoogleLogout(req, res) {
    req.logout(err => {
        if (err) { return next(err); }
        res.clearCookie('refreshToken', {
            ...cookieOptions
        })
        res.clearCookie('connect.sid', { httpOnly: true, sameSite: 'lax' })
        return res.status(200).json({ msg: "Logout Successful" })
    });
}

function FacebookLogout(req, res) {
    req.logout(err => {
        if (err) { return next(err); }
        res.clearCookie('refreshToken', {
            ...cookieOptions
        })
        res.clearCookie('connect.sid', { httpOnly: true, sameSite: 'lax' })
        return res.status(200).json({ msg: "Logout Successful" })
    });
}

module.exports = {
    LoginUser,
    SignupUser,
    LogoutUser,
    refreshAccessToken,
    SocialLoginSuccess,
    GoogleLogin,
    FacebookLogin,
    GoogleLogout,
    FacebookLogout,
    getUserData,
}
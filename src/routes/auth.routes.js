const router = require('express').Router()
const passport = require('passport')
const {
    LoginUser,
    SignupUser,
    LogoutUser,
    refreshAccessToken,
    GoogleLogout,
    SocialLoginSuccess,
    FacebookLogout,
    getUserData
} = require('../controllers/auth.controller')
const { verifyRefreshToken } = require('../middleware/auth.middleware')


// ROUTES

router.post('/user/login', LoginUser)
router.post('/user/signup', SignupUser)
router.get('/user/logout', LogoutUser)
router.get('/user/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }))
router.get('/user/auth/facebook', passport.authenticate('facebook', { scope: ['public_profile'] }))
router.get('/user/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), SocialLoginSuccess)
router.get('/user/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), SocialLoginSuccess)
router.get('/user/auth/google/logout', GoogleLogout)
router.get('/user/auth/facebook/logout', FacebookLogout)
router.get('/user/refresh', verifyRefreshToken, refreshAccessToken)
router.get('/user/auth/getData', verifyRefreshToken, getUserData)


module.exports = router
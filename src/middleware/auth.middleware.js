const jwt = require('jsonwebtoken')
require('dotenv').config()


function protect(req, res, next) {
    try {
        const accessToken = req.headers.authorization.split(' ')[1]
        if (accessToken) {
            const payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
            req.user = payload
            next()
        } else {
            return res.status(400).json({ msg: "Bad request" })
        }
    } catch (error) {
        console.log(error)
        res.status(401).json({ msg: "Un-authorized access denied" })
    }
}


function verifyRefreshToken(req, res, next) {
    try {
        const refreshToken = req?.cookies?.refreshToken
        if (refreshToken) {
            const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
            delete payload.iat
            delete payload.exp
            req.user = payload
            next()
        } else {
            return res.status(400).json({ msg: "Bad request" })
        }
    } catch (error) {
        console.log(error)
        res.status(401).json({ msg: "Un-authorized access denied" })
    }
}


module.exports = {
    protect,
    verifyRefreshToken
}
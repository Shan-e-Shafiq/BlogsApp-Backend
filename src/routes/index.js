const router = require('express').Router()
const authRoute = require('./auth.routes')
const blogRoute = require('./blog.routes')


router.use(authRoute)
router.use(blogRoute)


module.exports = router
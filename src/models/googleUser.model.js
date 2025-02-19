const mongoose = require('mongoose')

const googleUser = new mongoose.Schema({
    uid: {
        type: String,
        index: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    userType: {
        type: String,
        default: "GoogleUsers"
    },
    likedBlogs: {
        type: [String],
        default: []
    },
    createdAt: {
        type: Date,
        immutable: true,
        default: () => Date.now()
    },
    updatedAt: {
        type: Date,
        default: () => Date.now()
    }
})


module.exports = mongoose.model('GoogleUsers', googleUser)
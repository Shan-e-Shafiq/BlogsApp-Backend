const mongoose = require('mongoose')


const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        required: true,
        index: true,
    },
    password: {
        type: String,
        required: true,
        minLength: 8
    },
    userType: {
        type: String,
        default: "Users"
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
}, { timestamps: true })

module.exports = mongoose.model("Users", UserSchema)



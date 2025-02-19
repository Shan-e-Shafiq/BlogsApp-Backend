const mongoose = require('mongoose')


const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        default: "General",
        enum: ["General", "News", "Sports", "Technology", "Economy", "Blockchain"]
    },
    content: {
        type: String,
        required: true
    },
    likes: {
        type: Number,
        default: 0
    },
    comments: {
        type: [{
            _id: false,
            name: { type: String },
            comment: { type: String },
        }]
    },
    publisher: {
        _id: false, // to prevent mongodb from generating ids for this nested object
        type: {
            id: { type: mongoose.SchemaTypes.ObjectId, refPath: 'publisher.userType' },
            name: { type: String },
            userType: {
                type: String,
                enum: ["Users", "GoogleUsers", "FacebookUsers"],
                required: true
            }
        }
    },
    createdAt: {
        type: Date,
        immutable: true,
        default: () => Date.now()
    },
    updatedAt: {
        type: Date,
        default: () => Date.now()
    },
})

blogSchema.index({ "publisher.id": 1 })


module.exports = mongoose.model("Blogs", blogSchema)
const mongoose = require('mongoose')
const blogModel = require('../models/blog.model')
const userModel = require('../models/user.model')
const googleUserModel = require('../models/googleUser.model')
const facebookUserModel = require('../models/facebookUser.model')


async function getAllBlogs(req, res) {
    try {
        let { page, limit } = req.query
        page = Number(page)
        limit = Number(limit)
        const start = page * limit
        const totalBlogs = await blogModel.estimatedDocumentCount() // with constant time complexity :)
        const blogs = await blogModel.find({}, { comments: 0 })
            .skip(start)
            .limit(limit)
        const hasMoreBlogs = totalBlogs > (start + limit)
        return res.status(200).json({
            blogs: blogs,
            total: totalBlogs,
            hasMoreBlogs: hasMoreBlogs
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "Internal server error" })
    }
}

async function getBlogsPublisherID(req, res) {
    try {
        let { publisherId, page, limit } = req.query
        console.log('publisherId', publisherId)
        page = Number(page)
        limit = Number(limit)
        const start = page * limit
        const totalBlogs = await blogModel.countDocuments({ "publisher.id": publisherId }) // with constant time complexity because publisher.id is an index in db
        const blogs = await blogModel.find({ "publisher.id": publisherId }, { comments: 0 })
            .skip(start)
            .limit(limit)
        const hasMoreBlogs = totalBlogs > (start + limit)
        return res.status(200).json({
            blogs: blogs,
            total: totalBlogs,
            hasMoreBlogs: hasMoreBlogs
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "Internal server error" })
    }
}

async function getLikedBlogs(req, res) {
    try {
        let { likedBlogs } = req.body
        likedBlogs = likedBlogs.map(item => new mongoose.Types.ObjectId(item))
        const blogs = await blogModel.aggregate([
            {
                $match: {
                    _id: { $in: likedBlogs }
                }
            },
            {
                $project: {
                    comments: 0
                }
            }
        ])
        return res.status(200).json({ blogs: blogs })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "Internal server error" })
    }
}

async function getBlogById(req, res) {
    try {
        const { id } = req.params
        const ObjectId = new mongoose.Types.ObjectId(id)
        const blog = await blogModel.aggregate([
            {
                $match: {
                    _id: ObjectId
                }
            },
            {
                $addFields: {
                    commentsLength: { $size: "$comments" },
                    commentsArray: { $slice: ["$comments", 0, 8] }
                }
            },
            { $project: { comments: 0 } },
        ])
        const hasMoreComments = blog[0].commentsLength > blog[0].commentsArray.length
        return res.status(200).json({ blog: { ...blog[0], hasMoreComments: hasMoreComments } })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "Internal server error" })
    }
}

async function getBlogComments(req, res) {
    try {
        let { id, page } = req.query
        page = Number(page)
        let start = page * 8
        let stop = start + 8
        const ObjectId = new mongoose.Types.ObjectId(id)
        const comments = await blogModel.aggregate([
            { $match: { _id: ObjectId } },
            {
                $project: {
                    _id: 1,
                    length: { $size: "$comments" },
                    commentsArray: { $slice: ["$comments", start, stop] }
                }
            }
        ])
        const hasMoreComments = comments[0].length > stop
        return res.status(200).json({ ...comments[0], hasMoreComments: hasMoreComments })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "Internal server error" })
    }
}

async function addNewBlog(req, res) {
    try {
        const newBlog = await blogModel.create(req.body)
        console.log(newBlog)
        return res.status(201).json({
            msg: "Blog posted successfully",
            blog: newBlog
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "Internal server error" })
    }
}

async function editBlog(req, res) {
    try {
        const { id } = req.params
        const { title, content, category } = req.body

        const blog = await blogModel.findOneAndUpdate(
            { _id: id },
            {
                $set: {
                    title: title,
                    content: content,
                    category: category,
                    updatedAt: new Date()
                }
            },
            {
                $project: { comments: 0 }
            },
            { new: true, runValidators: true }  // Returns the updated document & runs schema validations defined in model
        )

        return res.status(201).json({
            msg: "Updated Successfully",
            blog: blog
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "Internal server error" })
    }
}

async function deleteBlog(req, res) {
    try {
        const { id } = req.params

        await blogModel.findByIdAndDelete(id)

        return res.status(200).json({ msg: "Deleted Successfully" })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "Internal server error" })
    }
}

async function likeBlog(req, res) {
    try {
        const { id } = req.params
        const user = req.user

        await blogModel.updateOne(
            { _id: id },
            { $inc: { likes: 1 } }
        )

        switch (user.userType) {
            case "Users":
                await userModel.updateOne(
                    { _id: user._id },
                    { $push: { likedBlogs: id } }
                )
                break;
            case "GoogleUsers":
                await googleUserModel.updateOne(
                    { _id: user._id },
                    { $push: { likedBlogs: id } }
                )
                break;
            case "FacebookUsers":
                await facebookUserModel.updateOne(
                    { _id: user._id },
                    { $push: { likedBlogs: id } }
                )
                break;
        }

        return res.status(200).json({ msg: "Liked" })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "Internal server error" })
    }
}

async function unLikeBlog(req, res) {
    try {
        const { id } = req.params
        const user = req.user

        await blogModel.updateOne(
            { _id: id },
            { $inc: { likes: -1 } }
        )

        switch (user.userType) {
            case "Users":
                await userModel.updateOne(
                    { _id: user._id },
                    { $pull: { likedBlogs: id } }
                )
                break;
            case "GoogleUsers":
                await googleUserModel.updateOne(
                    { _id: user._id },
                    { $pull: { likedBlogs: id } }
                )
                break;
            case "FacebookUsers":
                await facebookUserModel.updateOne(
                    { _id: user._id },
                    { $pull: { likedBlogs: id } }
                )
                break;
        }

        return res.status(200).json({ msg: "unLiked" })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "Internal server error" })
    }
}

async function postComment(req, res) {
    try {
        const { id } = req.params
        const { name, comment } = req.body
        const newComment = { name, comment }

        const result = await blogModel.updateOne(
            { _id: id },
            {
                $push: {
                    comments: newComment
                }
            }
        )

        if (result.matchedCount === 0) {
            return res.status(404).json({ msg: "Blog not found!" })
        }
        if (result.modifiedCount === 0) {
            return res.status(400).json({ msg: "Comment can't be posted at this moment. Please try again!" })
        }

        return res.status(201).json({ msg: 'Comment posted successfully' })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "Internal server error" })
    }
}


module.exports = {
    getAllBlogs, getBlogsPublisherID, addNewBlog, editBlog, deleteBlog, likeBlog, unLikeBlog, postComment, getBlogById, getBlogComments, getLikedBlogs
}
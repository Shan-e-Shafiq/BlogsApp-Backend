const router = require('express').Router()
const { getAllBlogs, addNewBlog, editBlog, deleteBlog, likeBlog, unLikeBlog, postComment, getBlogById, getBlogComments, getBlogsPublisherID, getLikedBlogs } = require('../controllers/blog.controller')
const { protect } = require('../middleware/auth.middleware')



router.get('/blogs/all', getAllBlogs)
router.get('/blogs/publisher', getBlogsPublisherID)
router.post('/blogs/liked-blogs', getLikedBlogs)
router.get('/blogs/view-blog/:id', getBlogById)
router.get('/blogs/blog-data/comments', getBlogComments)
router.post('/blogs/post-blog/new', protect, addNewBlog)
router.put('/blogs/edit-blog/:id', protect, editBlog)
router.delete('/blogs/delete-blog/:id', protect, deleteBlog)
router.put('/blogs/like-blog/:id', protect, likeBlog)
router.put('/blogs/unlike-blog/:id', protect, unLikeBlog)
router.post('/blogs/post-comment/:id', protect, postComment)



module.exports = router

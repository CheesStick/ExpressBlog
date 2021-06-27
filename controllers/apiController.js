const Blog = require('../models/blog');

exports.api_blogs_get = async (req, res) => {
    const {select} = req.query;

    try{
        const blogs = await Blog.find().sort({createdAt: -1}).select(select);
        res.status(200).json({
            status: 'success',
            blogs
        });
    } catch (err) {
        console.log(err.name, err.message);
        res.status(404).json({
            status: 'failed',
            message: err.message
        });
    }
};

exports.api_blog_get = async (req, res) => {
    const {author} = req.params;
    const {select} = req.query;

    try {
        const blog = await Blog.findOne({author}).select(select);
        res.status(200).json({
            status: 'success',
            blog
        });
    } catch (err) {
        console.log(err.name, err.message);
        res.status(500).json({
            status: 'failed',
            message: err.message
        });
    }
};
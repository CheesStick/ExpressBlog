const jwt = require('jsonwebtoken');
const Blog = require('../models/blog');
const User = require('../models/user');

// Blogs GET Handler

exports.blog_index = (req, res) => {

    Blog.find().sort({createdAt: -1})
    .then((blogs) => res.render('blogs/blogs', {title: 'Home', blogs}))
    .catch((err) => console.log(err));
};

// Blog Details Handler

exports.blog_details = (req, res) => {
    const {id} = req.params;

    Blog.findById(id)
    .then(blog => res.render('blogs/detail', {title: 'Blog Details' , blog}))
    .catch(err => {
        console.log(err);
        res.status(400).redirect('/');
    });
};

// Blog Create GET Handler

exports.blog_create_get = (req, res) => {
    res.render('blogs/create', {title: 'Create Blog'});
};

// Blog Create POST Handler

exports.blog_create_post = async (req, res) => {

    const {title, snippet, content} = req.body;
    const {id} = await jwt.verify(req.cookies.jwt, process.env.JWT_SECRET_KEY);
    const user = await User.findById(id);

    Blog.create({title, snippet, content, author: user.username, authorId: user.id})
    .then(blog => res.redirect('/blogs'))
    .catch(err => {
        console.log(err);
        res.status(403).redirect('/blogs/create');
    });
};

// Blog Edit GET Handler

exports.blog_edit_get = async (req, res) => {
    const userId = await jwt.verify(req.cookies.jwt, process.env.JWT_SECRET_KEY).id;

    const blog = await Blog.findById(req.params.id);
    
    if (blog.authorId.toString() === userId) res.render('blogs/edit', {title: 'Edit-Blog', blog});
    if (blog.authorId.toString() !== userId)res.status(403).redirect('/blogs');
};

// Blog Edit POST Handler

exports.blog_edit_post = async (req, res) => {
    const {title, snippet, content} = req.body;

    Blog.findOneAndUpdate(req.params.id, {title, snippet, content}, {new: true})
    .then(blog => res.status(201).redirect(`/blogs/${blog.id}`))
    .catch(err => {
        console.log(err);
        res.status(400).redirect('/blogs')
    });
};

// Blog DELETE Handler

exports.blog_delete = async (req, res) => {
  
    Blog.findByIdAndDelete(req.params.id)
    .then(blog => res.json({redirect: '/blogs'}))
    .catch(err => {
        console.log(err);
        res.status(403).redirect('/blogs')
    });
};
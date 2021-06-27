const router = require('express').Router();

const apiController = require('../controllers/apiController');

router
    .route('/blogs')
    .get(apiController.api_blogs_get);

router
    .route('/blogs/:author')
    .get(apiController.api_blog_get);

module.exports = router;
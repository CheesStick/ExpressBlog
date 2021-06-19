const router = require('express').Router();
const blogController = require('../controllers/blogController');
const {requireAuth} = require('../middlewares/authMiddleware');

// blog routes
router.get('/create', requireAuth, blogController.blog_create_get);

router
    .route('/')
    .get(blogController.blog_index)
    .post(requireAuth, blogController.blog_create_post);

router
    .route('/:id')
    .get(blogController.blog_details)
    .delete(requireAuth, blogController.blog_delete);

router
    .route('/edit/:id')
    .get(requireAuth, blogController.blog_edit_get)
    .post(requireAuth, blogController.blog_edit_post);

module.exports = router;
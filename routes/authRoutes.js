const router = require('express').Router();
const authController = require('../controllers/authController');
const requireAuth = require('../middlewares/authMiddleware').requireAuth;

router
    .route('/register')
    .get(authController.register_get)
    .post(authController.register_post);


router
    .route('/login')
    .get(authController.login_get)
    .post(authController.login_post);
    
router
    .route('/forgot-password')
    .get(authController.forgot_password_get)
    .post(authController.forgot_password_post);

router
    .route('/reset-password/:token')
    .get(authController.reset_password_get)
    .post(authController.reset_password_post);

router.get('/logout', requireAuth, authController.logout_get);

module.exports = router;
const router = require('express').Router();
const userController = require('../controllers/userController');
const {requireAuth} = require('../middlewares/authMiddleware');
const userMiddleware = require('../middlewares/userMiddleware');

// user routes
router
    .route('/account')
    .get(requireAuth, userController.account_get)
    .post(requireAuth, userMiddleware.uploadUserPhoto, userMiddleware.resizeUserPhoto, userController.account_post)
    .delete(requireAuth, userController.account_delete);

router.post('/account-passwordUpdate', requireAuth, userController.account_password_update);

router.get('/donate', requireAuth, userController.donate_get);

module.exports = router;
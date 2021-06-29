const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user');
const {authHandleErrors} = require('../helpers/handleErrors');
const Email = require('../config/email');

const maxAge = 3 * 24 * 60 * 60;

const createToken = (id) => jwt.sign({id}, process.env.JWT_SECRET_KEY, {expiresIn: maxAge});

// Rgestration GET Handler

exports.register_get = (req, res) => res.render('users/register', {title: 'Regsitration'});

// Regestration POST Handler

exports.register_post = async (req, res) => {

    const {username, email, password, confirmPassword} = req.body;

    try {
        const user = await User.create({username, email, password, confirmPassword});
        await new Email(user, '').sendWelcome();
        const token = createToken(user.id);
        res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge * 1000, secure: true});
        res.status(201).json({user});
    } catch (err) {
        res.status(400).json(authHandleErrors(err));
    }
};

// LogingIn GET Handeler

exports.login_get = (req, res) => res.render('users/login', {title: 'Login'});

// LogingIn POST Handler

exports.login_post = (req, res) => {
    const {email, password} = req.body;

    User.login(email, password)
    .then(user => {
        const token = createToken(user.id);
        res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge * 1000, secure: true});
        res.status(200).json(user);
    })
    .catch(err => {
        res.status(400).json(authHandleErrors(err))
    });

};

// LogingOut Handeler

exports.logout_get = (req, res) => {

    res.cookie('jwt', '', {maxAge: 1});
    res.redirect('/blogs');

};

// ForgotPassword GET Handler
exports.forgot_password_get = (req, res) => res.render('users/forgot', {title: 'Forgot Password'});

// ForgotPassword POST Handler
exports.forgot_password_post = async (req, res) => {

    const user = await User.findOne({email: req.body.email});

    User.createPasswordResetToken({email: req.body.email})
    .then(async resetToken => {
        try {
            const url = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

            await new Email(user, url).sendResetPassword();

            res.status(200).json({ok: true});
        
        } catch (err) {
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save();
            res.status(500).json({err});
        }
    })
    .catch(err => res.status(400).json(authHandleErrors(err)))
};

// ResetPassword GET Handler
exports.reset_password_get = async (req, res) => {

    const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordExpiresAt: {$gt: Date.now()}
    });
    if (!user) res.status(400).send('The password resting token is expired!');
    res.render('users/reset', {title: 'Reset-Password', token: req.params.token});
    
};

// ResetPassword POST Handler
exports.reset_password_post = async (req, res) => {
    const {password, ConfirmPassword} = req.body;
    
    const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordExpiresAt: {$gt: Date.now()}
    });

    
    user.password = password;
    user.confirmPassword = ConfirmPassword;
    user.passwordChangedAt = Date.now();
    user.passwordResetToken = undefined;
    user.passwordExpiresAt = undefined;
    await user.save();

    const token = createToken(user.id);
    res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge * 1000, secure: true});
    res.status(201).json({user});
};
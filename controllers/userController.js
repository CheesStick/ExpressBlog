const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const stripe = require('stripe')('sk_test_51J2YoQJDNyAkL5CQK7apM61OKPjYlPDsztjVIIN53uASCwsEuQ4MaTLyYj6DJMCRmNgkFr61FMEn4V8AJMHIum0f008e3Ju6b6');
const User = require('../models/user');
const { authHandleErrors } = require('../helpers/handleErrors');
const { findByIdAndUpdate } = require('../models/user');

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach((el) => {
      if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};

// Account POST Handler

exports.account_post = async (req, res) => {
    const id = await jwt.verify(req.cookies.jwt, process.env.JWT_SECRET_KEY).id;
    const {password, confirmPassword} = req.body;
    try {
        if (password || confirmPassword) throw Error('this route is not for password update please use /account-passwordUpdate');
        
        const filteredBody = filterObj(req.body, 'username', 'email');
        if (req.file) filteredBody.photo = req.file.filename;
        const user = await User.findByIdAndUpdate(id, filteredBody, {new: true, runValidators: true});
        res.status(201).json({user});
    } catch (err) {
        console.log(err);
        res.status(400).json(authHandleErrors(err));
    }
};

// Account POST Password Update
exports.account_password_update = async (req, res) => {
    const {currentPassword, password, confirmPassword} = req.body;
    const id = await jwt.verify(req.cookies.jwt, process.env.JWT_SECRET_KEY).id;
    
    try {
        const user = await User.findById(id);
        const auth = await bcrypt.compare(currentPassword, user.password);
        if (auth) {
            user.password = password;
            user.confirmPassword = confirmPassword;
            await user.save();
            res.status(201).json({user});
        } throw Error('incorrect password');
    } catch (err) {
        console.log(err);
        res.status(400).json(authHandleErrors(err));
    }
}

// Account GET Handler

exports.account_get = (req, res) => {

    User.findById(res.locals.user.id) // .populate('blogs')
        .then(user => res.render('users/account', { title: 'Account'}))
        .catch(err => console.log(err));

};

// Account DELETE Handler

exports.account_delete = async (req, res) => {
    const id = await  jwt.verify(req.cookies.jwt, process.env.JWT_SECRET_KEY).id;

    User.findByIdAndDelete(id)
        .then(user => res.cookie('jwt', '', { maxAge: 1 }).status(200).json({ redirect: '/blogs' }))
        .catch(err => console.log(err));
};

// Donation GET Handler

exports.donate_get = async (req, res) => {
    const id = await  jwt.verify(req.cookies.jwt, process.env.JWT_SECRET_KEY).id;
    try {
        const user = await User.findById(id);
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            success_url: `${req.protocol}://${req.get('host')}/account`,
            cancel_url: `${req.protocol}://${req.get('host')}/blogs`,
            customer_email: user.email,
            client_reference_id: id,
            line_items: [
                {
                    name: `${user.username}, Donation!`,
                    description: 'we are thankfull for your financial contribution',
                    amount: 10 * 100,
                    currency: 'usd',
                    quantity: 1
                }
            ] 
        });
        user.donation += session.amount_total;
        await user.save();
        res.status(200).send({session});
    } catch (err) {
        res.status(500).send({err});
    }

};
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/user');
const { authHandleErrors } = require('../helpers/handleErrors');

// Account POST Handler

exports.account_post = async (req, res) => {
    const { username, email } = req.body;
    const id = await jwt.verify(req.cookies.jwt, '*6t|xy-a#s$r`g1/q=_u').id;

    try {
        const user = await User.findById(id);
        
        if (req.file) user.photo = req.file.filename;

        await user.save();
        res.status(201).json({user});
    } catch (err) {
        res.status(400).json(authHandleErrors(err), 'error');
    }
};

// Account POST Password Update
exports.account_password_update = async (req, res) => {
    const {currentPassword, password} = req.body;
    const id = await jwt.verify(req.cookies.jwt, '*6t|xy-a#s$r`g1/q=_u').id;
    
    try {
        const user = await User.findById(id);
        const auth = await bcrypt.compare(currentPassword, user.password);
        if (!auth) throw Error('incorrect password');
        user.password = password;
        await user.save();
        res.status(201).json({user});
    } catch (err) {
        res.status(400).json(authHandleErrors(err));
    }
}

// Account GET Handler

exports.account_get = (req, res) => {

    User.findById(res.locals.user._id) // .populate('blogs')
        .then(user => res.render('users/account', { title: 'Account'}))
        .catch(err => console.log(err));

};

// Account DELETE Handler

exports.account_delete = async (req, res) => {
    const id = await  jwt.verify(req.cookies.jwt, '*6t|xy-a#s$r`g1/q=_u').id;

    User.findByIdAndDelete(id)
        .then(user => res.cookie('jwt', '', { maxAge: 1 }).status(200).json({ redirect: '/blogs' }))
        .catch(err => console.log(err));
};

// Donation GET Handler

exports.donate_get = async (req, res) => {
    const id = await  jwt.verify(req.cookies.jwt, '*6t|xy-a#s$r`g1/q=_u').id;
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
                    amount: 1000 * 1000,
                    currency: 'usd',
                    quantity: 1
                }
            ] 
        });
        console.log(session);
        user.donation += session.amount_total;
        await user.save();
        res.status(200).send({session});
    } catch (err) {
        console.log(err);
        res.status(500).send({err});
    }

};
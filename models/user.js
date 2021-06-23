const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
// const Blog = require('./blog');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Enter an username!'],
        unique: [true, 'The Username you inserted is already is use!'],
        lowercase: true
    },
    email: {
        type: String,
        required: [true, 'Enter an email!'],
        unique: [true, 'The Email you inserted is already in use!'],
        lowercase: true,
        validate: [validator.isEmail, 'Enter a valid Email!']
    },
    password: {
        type: String,
        required: [true, 'Enter a password!'],
        minlength: [6, 'The password must be more than 6 characters in length']
    },
    // confirmPassword: {
    //     type: String,
    //     // required: [true, 'password confirm is needed'],
    //     validate: {
    //         validator: function(el) {
    //             return el === this.password;
    //         },
    //         message: 'passwords are not the same'
    //     }
    // },
    role: {
        type: String,
        enum: ['user', 'mod', 'admin'],
        default: 'user'
    },
    photo: {
        type:String,
        default: 'default.jpg'
    },
    passwordChangedAt:  Date,
    passwordResetToken: String,
    passwordExpiresAt: Date,
    donation: {
        type: Number,
        default: 0
    }
    // blogs: Array
}, {timestamps: true});

// fire a func after doc is saved to db
userSchema.post('save', function (doc, next) {
    console.log('the user was successfully saved!', doc);
    next();
});

// fire a func before doc is saved to db
userSchema.pre('save', async function (next) {
    if (this.email === 'admin@gmail.com' && this.username === 'admin') this.role = 'admin';
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    this.confirmPassword = undefined;
    next();
});

// // userSchema.pre('save', async function(next) {
// //     const blogsPromises = this.blogs.map(async id => await Blog.find({authorId: id}));
// //     this.blogs = await Promise.all(blogsPromises);
// // next();
// // });

// static method to login the user
userSchema.statics.login = async function(email, password) {
    const user = await this.findOne({email});
    if (user) {
        const auth = await bcrypt.compare(password, user.password);
        if (auth) {
            return user;
        }
        throw Error('incorrect password');
    }
    throw Error('incorrect email');
}

// static method to generate reset password tokens
userSchema.statics.createPasswordResetToken = async function(email) {
    const user = await this.findOne(email);

    if (user) {
        const resetToken = crypto.randomBytes(32).toString('hex');
    
        user.passwordResetToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');
            
        user.passwordExpiresAt = Date.now() + 10 * 60 * 1000;
        await user.save();
        return resetToken;
    }
    throw Error('incorrect email')
}

const User = mongoose.model('User', userSchema);

module.exports = User;
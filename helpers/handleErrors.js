const authHandleErrors = (err) => {
    console.log(err);
    let errors = {username: '', email: '', password: '',  confirmPassword: ''};

    // login errors
    if (err.message === 'incorrect email') {
        errors.email = 'incorrect email';
        return {errors};
    } else if (err.message === 'incorrect password') {
        errors.password = 'incorrect password';
        return {errors};
    }

    // duplicate error code
    if (err.message.includes('username_1 dup key') && err.code === 11000) {
        errors.username = 'The Username is already in use!';
        return {errors};
    } else if (err.message.includes('email_1 dup key') && err.code === 11000) {
        errors.email = 'The Email is already in use';
        return {errors};
    }

    // validation errors
    if (err.message.includes('User validation failed')) {
        Object.values(err.errors).forEach(({properties}) => {
            errors[properties.path] = properties.message;
        });
    }

    return {errors};

};

module.exports = {
    authHandleErrors
};
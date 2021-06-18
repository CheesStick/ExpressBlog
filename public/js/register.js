const form = document.querySelector('form');
const usernameErr = document.querySelector('.username');
const emailErr = document.querySelector('.email');
const passwordErr = document.querySelector('.password');
const confirmPasswordErr = document.querySelector('.confirmPassword');

form.addEventListener('submit', async e => {
    e.preventDefault();

    // reset errors

    usernameErr.textContent = '';
    emailErr.textContent = '';
    passwordErr.textContent = '';
    confirmPasswordErr.textContent = '';

    const username = form.username.value;
    const email = form.email.value;
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;

    try {

        const res = await fetch('/register', {
            method: 'POST',
            body: JSON.stringify({ username, email, password, confirmPassword }),
            headers: {'Content-Type': 'application/json'}
        });

        const data = await res.json();
        
        if (data.errors) {
            usernameErr.textContent = data.errors.username;
            emailErr.textContent = data.errors.email;
            passwordErr.textContent = data.errors.password;
            confirmPasswordErr.textContent = data.errors.confirmPassword;
        }

        if (data.user) location.assign('/blogs');

    }
    catch (err) {
        console.log(err);
    }
});
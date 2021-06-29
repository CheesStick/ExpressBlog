const form = document.querySelector('form');

const passwordErr = document.querySelector('.password');
const confirmPasswordErr = document.querySelector('.confirmPassword');

form.addEventListener('submit', async e => {
    e.preventDefault();

    passwordErr.textContent = '';
    confirmPasswordErr.textContent = '';

    const token = form.dataset.token;
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;

    try {
        const res = await fetch(`/reset-password/${token}`, {
            method: 'POST',
            body: JSON.stringify({password, confirmPassword}),
            headers: {'Content-Type': 'application/json'}
        });

        const data = await res.json();
        if (data.errors) {
            passwordErr.textContent = data.errors.password;
            confirmPassword.textContent = data.errors.confirmPassword;
        }
        if (data.user) location.assign('/');
    } catch (err) {
        console.log(err);
    }
});
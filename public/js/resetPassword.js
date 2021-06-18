const form = document.querySelector('form');

const passwordErr = document.querySelector('.password');

form.addEventListener('submit', async e => {
    e.preventDefault();

    passwordErr.textContent = '';

    const token = form.dataset.token;
    const password = form.password.value;

    try {
        const res = await fetch(`/reset-password/${token}`, {
            method: 'POST',
            body: JSON.stringify({password}),
            headers: {'Content-Type': 'application/json'}
        });

        const data = await res.json();
        if (data.errors) passwordErr.textContent = data.errors.password;
        if (data.user) location.assign('/');
    } catch (err) {
        console.log(err);
    }
});
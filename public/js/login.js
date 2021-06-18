const form = document.querySelector('form');

const emailErr = document.querySelector('.email');
const passwordErr = document.querySelector('.password');

form.addEventListener('submit', async e => {
    e.preventDefault();

    emailErr.textContent = '';
    passwordErr.textContent = '';

    const email = form.email.value;
    const password = form.password.value;

    try {
        const res = await fetch('/login', {
            method: 'POST',
            body: JSON.stringify({email, password}),
            headers: {'Content-Type': 'application/json'}
        });

        const data = await res.json();
        
        if (data.err) {
            emailErr.textContent = data.email;
            passwordErr.textContent = data.password;
        }
        if (data._id) {
            location.assign('/');
        }
    }

    catch (err) {
        console.log(err);
    }
});
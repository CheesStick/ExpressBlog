const form = document.querySelector('form');

const emailErr = document.querySelector('.email');

form.addEventListener('submit', async e => {
    e.preventDefault();

    emailErr.textContent = '';

    const email = form.email.value;

    try {
        const res = await fetch('/forgot-password', {
            method: 'POST',
            body: JSON.stringify({email}),
            headers: {'Content-Type': 'application/json'}
        });

        const data = await res.json();
        
        if (data.errors) emailErr.textContent = data.errors.email;
        if (data.ok) emailErr.textContent = 'password reset instructions has been sent to your email!'
    }
    catch (err) {
        console.log(err);
    }
});
const deleteBtn = document.querySelector('a.delete');

deleteBtn.addEventListener('click', async () => {
    const blogId = deleteBtn.dataset.doc;

    try {
        const res = await fetch(`/blogs/${blogId}`, {method: 'DELETE'});
        location.assign('/blogs');
    } catch (err) {
        console.log(err);
    }
});
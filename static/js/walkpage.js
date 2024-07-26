// nav.js
document.getElementById('menuIcon').addEventListener('click', function() {
    window.location.href = 'nav.html';
});

document.addEventListener('DOMContentLoaded', () => {
    const pageContent = document.documentElement.outerHTML;
    localStorage.setItem('pageContent', pageContent);
});

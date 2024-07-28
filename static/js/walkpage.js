// nav.js
document.addEventListener('DOMContentLoaded', () => {
    const pageContent = document.documentElement.outerHTML;
    localStorage.setItem('pageContent', pageContent);
});

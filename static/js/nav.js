document.addEventListener("DOMContentLoaded", function() {
    const exitIcon = document.getElementById("exitIcon");

    exitIcon.addEventListener("click", function() {
        window.history.back();
    });
});

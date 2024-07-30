document.addEventListener("DOMContentLoaded", function() {
    const navPopup = document.getElementById("navPopup");
    const exitIcon = document.getElementById("exitIcon");
    const menuIcon = document.getElementById("menuIcon");
    const logo = document.getElementById("logo");
    const talk = document.getElementById("talk");
    const mission = document.getElementById("mission");
    const walk = document.getElementById("walk");
    const character = document.getElementById("character");
    const mypage = document.getElementById("mypage");

    menuIcon.addEventListener("click", function() {
        navPopup.classList.add("show");
    });

    exitIcon.addEventListener("click", function() {
        navPopup.classList.remove("show");
    });

    logo.addEventListener("click", function() {
        window.location.href = 'main.html';

    });

    talk.addEventListener("click", function() {
        window.location.href = 'chat.html';

    });

    mission.addEventListener("click", function() {
        window.location.href = 'home.html';

    });
    walk.addEventListener("click", function() {
        window.location.href = 'walkpage.html';

    });
    character.addEventListener("click", function() {
        window.location.href = 'character.html';

    });
    mypage.addEventListener("click", function() {
        window.location.href = 'mypage.html';

    });

    menuIcon.addEventListener('click', () => {
        navPopup.style.display = 'block';
        menuIcon.style.display = 'none';
    });

    exitIcon.addEventListener('click', () => {
        navPopup.style.display = 'none';
        menuIcon.style.display = 'block';
    });
});

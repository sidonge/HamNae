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
        window.location.href = '/main';
    });

    mission.addEventListener("click", function() {
        window.location.href = '/home';
    });

    walk.addEventListener("click", async function() {
        // 최초 클릭 시 미션 완료 요청
        if (!localStorage.getItem('walkCompleted')) {
            try {
                await completeMission('walk'); // 'walk' 미션을 완료하는 요청을 서버로 전송
                localStorage.setItem('walkCompleted', 'true'); // 미션 완료 상태 저장
            } catch (error) {
                console.error('Error:', error);
                alert('미션 완료 중 오류가 발생했습니다.');
            }
        }
        // 이동 페이지로 리다이렉트
        window.location.href = '/walkpage';
    });

    character.addEventListener("click", function() {
        window.location.href = '/character';
    });

    mypage.addEventListener("click", function() {
        window.location.href = '/user/mypage';
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

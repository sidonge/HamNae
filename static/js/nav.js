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
        window.location.href = '/mypage';
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
// `completeMission` 함수는 이미 정의되어 있어야 합니다.
async function completeMission(missionName) {
    if (missionName === 'wash') {
        try {
            const response = await fetch('/complete_mission', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ mission: missionName })
            });

            const responseText = await response.text();
            if (response.ok) {
                if (responseText === "Mission completed successfully") {
                    alert('미션이 성공적으로 완료되었습니다!');
                } else {
                    alert('미션 완료 중 오류가 발생했습니다.');
                }
            } else {
                alert(`서버 응답이 유효하지 않습니다: ${responseText}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('미션 완료 중 오류가 발생했습니다.');
        }
    } else {
        // 파일 제출이 필요한 다른 미션 처리
        const fileInput = document.getElementById(missionName + 'Upload');
        const file = fileInput?.files[0];

        const formData = new FormData();
        formData.append('mission', missionName);
        if (file) {
            formData.append('file', file);
        }

        try {
            const response = await fetch('/complete_mission', {
                method: 'POST',
                body: formData,
            });

            const responseText = await response.text();
            if (response.ok) {
                if (responseText === "Mission completed successfully") {
                    alert('미션이 성공적으로 완료되었습니다!');
                } else {
                    alert('미션 완료 중 오류가 발생했습니다.');
                }
            } else {
                alert(`서버 응답이 유효하지 않습니다: ${responseText}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('미션 완료 중 오류가 발생했습니다.');
        }
    }
}
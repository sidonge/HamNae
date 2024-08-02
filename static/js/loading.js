// 화살표 버튼 눌렀을 때 화면 부드럽게 전환
document.getElementById('scrollButton').addEventListener('click', function() {
    
    const backgroundSound = document.getElementById("backgroundSound")
    backgroundSound.play();
    
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
    });
    this.style.display = 'none'; // 클릭해서 화면 내려가면 버튼 숨기기
});

document.addEventListener("DOMContentLoaded", () => {
    // 스크롤 위치를 맨 위로 설정
    window.scrollTo(0, 0);

    // 스크롤 버튼 표시
    var scrollButton = document.getElementById('scrollButton');
    scrollButton.style.display = 'block'; // 버튼을 다시 보이게 함

    // 버튼 클릭 이벤트 리스너
    scrollButton.addEventListener('click', function() {
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
        });
        this.style.display = 'none'; // 클릭해서 화면 내려가면 버튼 숨기기
    });
});
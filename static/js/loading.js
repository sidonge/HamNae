// 화살표 버튼 눌렀을 때 화면 부드럽게 전환
document.getElementById('scrollButton').addEventListener('click', function() {
    const backgroundSound = document.getElementById("backgroundSound")
    backgroundSound.play();

    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
    });
    this.style.display = 'none'; //클릭해서 화면 내려가면 버튼 숨기기
});

document.addEventListener('DOMContentLoaded', function() {
    //스크롤 위치를 맨 위로 설정
    window.scrollTo(0, 0);

    //스크롤 버튼 표시
    var scrollButton = document.getElementById('scrollButton');
    scrollButton.style.display = 'block'; // 버튼을 다시 보이게 함

    //버튼 클릭 이벤트 리스너
    scrollButton.addEventListener('click', function() {
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
        });
        this.style.display = 'none'; //클릭해서 화면 내려가면 버튼 숨기기
    });
});



async function sendMessage() {
    var input = document.getElementsByClassName("soundIcon");
    var messageSound = document.getElementById("messageSound")
    if (input.value.trim() !== "") {
        const userMessage = input.value;
        input.value = ""; // 입력 필드 초기화
        addMessage(userMessage, 'user'); //사용자 메시지 추가

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: userMessage })
            });

            if (response.ok) {
                const data = await response.json();
                addMessage(data.response, 'bot');
            } else {
                let errorData = await response.json();
                console.error("Failed to fetch:", response.status, errorData.detail);
                addMessage("Sorry, something went wrong: " + errorData.detail, 'bot');
            }
        } catch (error) {
            console.error("Fetch error:", error);
            addMessage("Sorry, something went wrong.", 'bot');
        } finally {
            messageSound.play();
        }
    }
}

// 선택하기 버튼 눌렀을 때 메인 화면으로 이동하기(main으로 바꿔야됨)
function navigateToMain() {
    window.location.href = "/auth/login";
}
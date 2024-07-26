async function sendMessage() {
    var input = document.getElementById("userInput");
    if (input.value.trim() !== "") {
        const userMessage = input.value;
        input.value = ""; // 입력 필드 초기화

        console.log(userMessage);
        const response = await fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ data: userMessage })
        });
        if (response.ok) {
            const data = await response.json();
            addMessage(data.response, 'bot');
        } else {
            console.error("Failed to fetch:", response.status);
            addMessage("Sorry, something went wrong.", 'bot');
        }
    }
}



function addMessage(text, type) {
    var chatBox = document.getElementById("chatBox");
    var messageDiv = document.createElement("div");
    messageDiv.classList.add("message", type);
    messageDiv.textContent = text;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight; // 스크롤을 가장 아래로 이동
}

// 초록버튼 기능
document.addEventListener('DOMContentLoaded', function() {
    var greenBtn = document.getElementById("greenCircleText");
    var questText = document.getElementById("questText");
    var isMissionComplete = false;

    function toggleButtonStyle() {
        if (!isMissionComplete) {
            // '미션완료' 상태로 변경
            greenBtn.textContent = "미션완료"; // 버튼 텍스트 변경
            greenBtn.style.color = "#ffffff";
            greenBtn.style.backgroundColor = "#8CD179";
            greenBtn.style.opacity = "62%";
            greenBtn.style.width = "6.7rem";
            greenBtn.style.height = "2.1rem";
            greenBtn.style.boxShadow = "0px 0px 3px 1px #F5EED1";
            greenBtn.style.borderRadius = "3rem";

            if (!questText.hasChildNodes()) { // 문장이 아직 추가되지 않았다면 추가
                var questTextDiv = document.createElement("div");
                questTextDiv.textContent = "내일의 나에게 하고싶은 말 적어보기";
                questTextDiv.style.color = "red";
                questText.appendChild(questTextDiv);
            }
        } else {
            // '오늘의 질문' 상태로 복귀
            greenBtn.textContent = "오늘의 질문"; // 버튼 텍스트 변경
            greenBtn.style.color = "#588B47";
            greenBtn.style.backgroundColor = "#ffffff";
            greenBtn.style.width = "6.7rem";
            greenBtn.style.height = "2.1rem";
            greenBtn.style.boxShadow = "0px 0px 3px 1px #8DBD81";
            greenBtn.style.borderRadius = "3rem";
        }
        isMissionComplete = !isMissionComplete;
    }

    greenBtn.addEventListener("click", toggleButtonStyle);
});


// closeIcon 누르면 창 닫힘 기능
function closeEvent() {
    document.getElementsByClassName("chatPage")[0].style.display = "none";
}

document.addEventListener('DOMContentLoaded', function() {
    var userInput = document.getElementById('userInput');
    var charCount = document.getElementById('charCount');
    var charLimit = 300; // 글자 제한

    userInput.addEventListener('input', function() {
        var currentLength = userInput.value.length;
        charCount.textContent = `${currentLength} / ${charLimit}`; // 글자 수 업데이트
    });
});

// 이미지 추가 기능
function handleFileSelect(event) {
    var files = event.target.files; // 파일 리스트 가져오기
    if (files.length === 0) {
        return; // 파일이 선택되지 않았으면 종료
    }

    var file = files[0]; // 첫 번째 파일
    // 이미지 파일인지 확인 (png, jpg, jpeg 등을 허용)
    if (file.type.startsWith('image/')) { // 이미지 파일 MIME 타입 시작을 체크
        var reader = new FileReader();
        reader.onload = function(e) {
            var img = document.createElement("img"); // 이미지 요소 생성
            img.src = e.target.result; // 이미지 소스로 파일 내용 사용
            img.style.width = "100%"; // 이미지 크기 설정 (필요에 따라 조정)
            img.style.borderRadius = "10px"; // 이미지 스타일 (필요에 따라 조정)

            var messageDiv = document.createElement("div");
            messageDiv.classList.add("message", "user"); // 'user' 클래스 추가
            messageDiv.appendChild(img);
            var chatBox = document.getElementById("chatBox");
            chatBox.appendChild(messageDiv); // chatBox에 이미지 메시지 추가
            chatBox.scrollTop = chatBox.scrollHeight; // 스크롤을 아래로 이동
        };
        reader.readAsDataURL(file); // 파일 읽기 (DataURL로)
    } else {
        console.log("Not an image file. Selected file type is: " + file.type);
    }
}

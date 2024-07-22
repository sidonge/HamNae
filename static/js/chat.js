function sendMessage() {
    var input = document.getElementById("userInput");
    if (input.value.trim() !== "") {
        // 사용자 메시지 추가
        addMessage(input.value, 'user');
        // 여기에 챗봇 API 호출 로직 추가
        // 예시: addMessage('이것은 챗봇의 응답입니다', 'bot');
        input.value = ""; // 입력 필드 초기화
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

document.addEventListener('DOMContentLoaded', function() {
    var greenBtn = document.getElementById("greenCircleText");

    function questMessage() {
        greenBtn.textContent = "미션완료"; // 버튼 텍스트 변경
        greenBtn.style.color = "#ffffff";
        greenBtn.style.backgroundColor = "#8CD179"; // 버튼의 배경색을 변경
        greenBtn.style.opacity = "62%";
        greenBtn.style.width = "6.7rem";
        greenBtn.style.height = "2.1rem";
        greenBtn.style.boxShadow = "0px 0px 3px 1px #F5EED1";
        greenBtn.style.borderRadius = "3rem";

        var questText = document.getElementById("questText");
        var questTextDiv = document.createElement("div");
        questTextDiv.textContent = "내일의 나에게 하고싶은 말 적어보기";
        questTextDiv.style.color = "red";
        questText.appendChild(questTextDiv);
    }

    // 이벤트 리스너를 버튼에 추가
    greenBtn.addEventListener("click", questMessage);
});



document.addEventListener('DOMContentLoaded', function() {
    var originGreenBtn = document.getElementById("completeText");

    function completeText() {
        completeText.textContent = "오늘의 질문"; // 버튼 텍스트 변경
        originGreenBtn.style.color = "#588B47";
        originGreenBtn.style.backgroundColor = "#ffffff"; // 버튼의 배경색을 변경
        originGreenBtn.style.width = "6.7rem";
        originGreenBtn.style.height = "2.1rem";
        originGreenBtn.style.boxShadow = "0px 0px 3px 1px #8DBD81";
        originGreenBtn.style.borderRadius = "3rem";

        var questText = document.getElementById("questText");
        questText.innerHTML = ""; 
    }

    // 이벤트 리스너를 버튼에 추가
    greenBtn.addEventListener("click", completeText);
});

document.addEventListener('DOMContentLoaded', function() {
    var greenBtn = document.getElementById("greenCircleText");

    // 토글 상태를 추적할 변수
    var isMissionComplete = false;

    function toggleButtonStyle() {
        if (!isMissionComplete) {
            // '미션완료' 상태로 변경
            greenBtn.textContent = "미션완료"; // 버튼 텍스트 변경
            greenBtn.style.color = "#ffffff";
            greenBtn.style.backgroundColor = "#8CD179"; // 버튼의 배경색을 변경
            greenBtn.style.opacity = "62%";
            greenBtn.style.width = "6.7rem";
            greenBtn.style.height = "2.1rem";
            greenBtn.style.boxShadow = "0px 0px 3px 1px #F5EED1";
            greenBtn.style.borderRadius = "3rem";

            var questText = document.getElementById("questText");
            questText.innerHTML = ""; // 기존 텍스트를 제거
            var questTextDiv = document.createElement("div");
            questTextDiv.textContent = "내일의 나에게 하고싶은 말 적어보기";
            questTextDiv.style.color = "red";
            questText.appendChild(questTextDiv);
        } else {
            // 원래의 '오늘의 질문' 상태로 변경
            greenBtn.textContent = "오늘의 질문"; // 버튼 텍스트 변경
            greenBtn.style.color = "#588B47";
            greenBtn.style.backgroundColor = "#ffffff"; // 버튼의 배경색을 변경
            greenBtn.style.width = "6.7rem";
            greenBtn.style.height = "2.1rem";
            greenBtn.style.boxShadow = "0px 0px 3px 1px #8DBD81";
            greenBtn.style.borderRadius = "3rem";

            var questText = document.getElementById("questText");
            questText.innerHTML = ""; // 기존 텍스트를 제거
        }
        // 토글 상태 업데이트
        isMissionComplete = !isMissionComplete;
    }

    // 이벤트 리스너를 버튼에 추가
    greenBtn.addEventListener("click", toggleButtonStyle);
});



// closeIcon 누르면 창 닫힘 기능
function closeEvent() {
    document.getElementsByClassName("chatPage")[0].style.display = "none";
}
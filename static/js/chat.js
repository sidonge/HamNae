// 챗봇 페이지 
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.query === "fetchData") {
        fetch('https://api.example.com/data')
            .then(response => response.json())
            .then(data => {
                sendResponse({data: data});
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                sendResponse({error: error.message});
            });
        return true;
    }
});

async function sendMessage() {
    var input = document.getElementById("userInput");
    
    //enter키 눌렀을 때 send기능 되도록
    userInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter' && !event.shiftKey) { // shift 키가 눌리지 않은 상태에서 Enter만 눌렸을 경우
            event.preventDefault(); // 기본 이벤트 방지
            sendMessage(); // 메시지 전송 함수 호출
        }
    });

    if (input.value.trim() !== "") {
        const userMessage = input.value;
        input.value = ""; // 입력 필드 초기화

        addMessage(userMessage, 'user'); // 사용자 메시지 추가
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            // 내가 보내는 입력을 JSON 형식으로 변환해줘야 모델이 알아들음
            body: JSON.stringify({ message: userMessage })
        });
        
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
                let errorData;
                try {
                    errorData = await response.json();
                } catch (e) {
                    console.error("Failed to parse JSON response:", e);
                    addMessage("Sorry, something went wrong and the error response could not be parsed.", 'bot');
                    return;
                }
                console.error("Failed to fetch:", response.status, errorData.detail);
                addMessage("Sorry, something went wrong: " + errorData.detail, 'bot');
            }
        } catch (error) {
            console.error("Fetch error:", error);
            addMessage("Sorry, something went wrong.", 'bot');
        }
    }
}

// 모델의 답변을 포함한 말풍선 추가하는 함수
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
            greenBtn.textContent = "미션완료";
            greenBtn.style.backgroundColor = "#8CD179";
            var message = "내일의 나에게 하고 싶은 말 적어보기";

            if (!questText.hasChildNodes()) { // 문장이 아직 추가되지 않았다면 추가
                var questTextDiv = document.createElement("div");
                questTextDiv.textContent = message;
                questText.appendChild(questTextDiv);
            }
            sendMessageToGemini(message); // 서버에 메시지 전송
        } else {
            // '오늘의 질문' 상태로 복귀
            greenBtn.textContent = "오늘의 질문";
            greenBtn.style.backgroundColor = "#ffffff";
            questText.innerHTML = ""; // 문장을 제거
        }
        isMissionComplete = !isMissionComplete;
    }

    greenBtn.addEventListener("click", toggleButtonStyle);
});

function sendMessageToGemini(message) {
    fetch('/api/chat', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({message: message})
    })
    .then(response => response.json())
    .then(data => {
        console.log(data); // 또는 응답을 화면에 표시
    })
    .catch(error => console.error('Error:', error));
}


// closeIcon 누르면 창 닫힘 기능
function closeEvent() {
    document.getElementsByClassName("chatPage")[0].style.display = "none";
}

// 실시간 글자 수 세주는 기능*입력창에
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

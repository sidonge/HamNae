
    async function sendMessage() {
        var input = document.getElementById("userInput");
        if (input.value.trim() !== "") {
            const userMessage = input.value;
            input.value = ""; // 입력 필드 초기화
            addMessage(userMessage, 'user'); // 사용자 메시지 추가

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
                    if (!isMissionComplete) { // 최초 메시지 전송 시에만 미션 완료
                        missionComplete('talk'); // 'talk' 미션 완료 요청
                        isMissionComplete = true; // 미션 완료 상태로 업데이트
                    }
                } else {
                    let errorData = await response.json();
                    console.error("Failed to fetch:", response.status, errorData.detail);
                    addMessage("Sorry, something went wrong: " + errorData.detail, 'bot');
                }
            } catch (error) {
                console.error("Fetch error:", error);
                addMessage("Sorry, something went wrong.", 'bot');
            }
        }
    }

    // 메시지 추가 함수
    function addMessage(text, type) {
        var chatBox = document.getElementById("chatBox");
        var messageDiv = document.createElement("div");
        messageDiv.classList.add("message", type);
        messageDiv.textContent = text;
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    // 엔터 키 이벤트 리스너 설정
    document.addEventListener('DOMContentLoaded', function() {
        var userInput = document.getElementById("userInput");
        var isMissionComplete = false; // 미션 완료 여부를 추적하기 위한 변수

        userInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault(); // 기본 이벤트 방지
                sendMessage(); // 메시지 전송 함수 호출
            }
        });

        // 초록 버튼 기능
        var greenBtn = document.getElementById("greenCircleText");
        var questText = document.getElementById("questText");
        var openSound = document.getElementById("openSound");
        var closeSound = document.getElementById("closeSound");

        questText.style.textAlign = "center";

        greenBtn.addEventListener("click", function() {
            var message = "내일의 나에게 하고 싶은 말 적어보기";
            if (!isMissionComplete) {
                openSound.play();
                greenBtn.textContent = "미션완료";
                greenBtn.style.backgroundColor = "#8CD179";
                greenBtn.style.width = "6.7rem";
                greenBtn.style.height = "2rem";
                greenBtn.style.borderRadius = "3rem";
                greenBtn.style.boxShadow = "0px 0px 3px 1px #8DBD81";
                greenBtn.style.color = "#ffffff";
                addCenteredMessage(message);
                addMessage(message, 'bot');
            } else {
                closeSound.play();
                greenBtn.textContent = "오늘의 질문";
                greenBtn.style.backgroundColor = "#ffffff";  // 배경색 변경
                greenBtn.style.color = "#588B47";  // 텍스트 색상 원래대로
                greenBtn.style.boxShadow = "0px 0px 3px 1px #8DBD81";
                questText.textContent = "";
            }
            isMissionComplete = !isMissionComplete;
        });

        // 메시지를 중앙에 추가하는 함수
        function addCenteredMessage(text) {
            var chatBox = document.getElementById("chatBox");
            var messageContainer = document.createElement("div");
            messageContainer.classList.add("centered-message-container");

            var lineLeft = document.createElement("div");
            lineLeft.classList.add("message-line");

            var diamondLeft = document.createElement("div");
            diamondLeft.classList.add("message-diamond");

            var circle = document.createElement("div");
            circle.classList.add("message-circle");

            var messageText = document.createElement("div");
            messageText.classList.add("centered-message");
            messageText.textContent = text;

            var diamondRight = document.createElement("div");
            diamondRight.classList.add("message-diamond");

            var lineRight = document.createElement("div");
            lineRight.classList.add("message-line");

            messageContainer.appendChild(lineLeft);
            messageContainer.appendChild(diamondLeft);
            messageContainer.appendChild(circle);
            messageContainer.appendChild(messageText);
            messageContainer.appendChild(circle.cloneNode());
            messageContainer.appendChild(diamondRight);
            messageContainer.appendChild(lineRight);

            chatBox.appendChild(messageContainer);
            chatBox.scrollTop = chatBox.scrollHeight;
        }

        // 미션 완료 함수
        async function missionComplete(missionName) {
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
        }

        // 글자 수 세기 기능
        var charCount = document.getElementById('charCount');
        var charLimit = 300;
        userInput.addEventListener('input', function() {
            var currentLength = userInput.value.length;
            charCount.textContent = `${currentLength} / ${charLimit}`;
        });

        // 이미지 추가 기능
        document.getElementById("imageInput").addEventListener('change', handleFileSelect);
    });

    // 이미지 선택 처리
    function handleFileSelect(event) {
        var files = event.target.files;
        if (files.length === 0) {
            return;
        }
        var file = files[0];
        if (file.type.startsWith('image/')) {
            var reader = new FileReader();
            reader.onload = function(e) {
                var img = document.createElement("img");
                img.src = e.target.result;
                img.style.width = "100%";
                img.style.borderRadius = "10px";

                var messageDiv = document.createElement("div");
                messageDiv.classList.add("message", "user");
                messageDiv.appendChild(img);
                var chatBox = document.getElementById("chatBox");
                chatBox.appendChild(messageDiv);
                chatBox.scrollTop = chatBox.scrollHeight;
            };
            reader.readAsDataURL(file);
        } else {
            console.log("Not an image file. Selected file type is: " + file.type);
        }
    }

    // 창 닫기 기능
    function closeEvent() {
        window.location.href = "/home";
    }

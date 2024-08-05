document.addEventListener('DOMContentLoaded', function() {
    // 닫기 버튼 이벤트 연결
    var closeButton = document.querySelector('.closeIcon');
    closeButton.onclick = togglePopup;
  
    // 페이지 로딩 시 팝업 자동 열기
    openPopup();
  });
  
  function togglePopup() {
    var popup = document.querySelector('.popupWrap');
    // 팝업 표시 상태 토글
    popup.style.display = 'none'; // 팝업 숨기기
  }
  
  function openPopup() {
    var popup = document.querySelector('.popupWrap');
    popup.style.display = 'flex'; // 팝업 열기
  }
  
  // blink text 마이크 클릭 시 텍스트 바뀜
  function hideText() {
    var blinkText = document.querySelector('.popupBlink');
    blinkText.innerText = "이름을 불렀다면 멈춤 버튼을 눌러주세요.";
  }
  
  function stopText() {
    var blinkText = document.querySelector('.popupBlink');
    blinkText.innerText = "이름 설정이 끝났으면 record 버튼을 눌러 자유롭게 말해보세요!";
  }
  
  function startText() {
    var blinkText = document.querySelector('.popupBlink');
    blinkText.innerHTML = "귀여운 친구의 이름을 불러보세요! <br> '뛰어'나 '(오른쪽 혹은 왼쪽)으로 가'라고 말해보세요.";
    blinkText.style.textAlign = "center"; 
    blinkText.style.top = "15rem"
  }
  
  // 음성 인식
  document.addEventListener('DOMContentLoaded', () => {
    const modelViewer = document.getElementById('rabbitModel2');
    const nameRecordBtn = document.getElementById('nameRecord');
    const recordBtn = document.getElementById('record');
    const stopBtn = document.getElementById('stop');
    const resultElem = document.getElementById('result');
    const statusIndicator = document.getElementById('status-indicator');
    const submitBtn = document.getElementById('submit-btn'); // 제출 버튼
  
    let recognition;
    let isListening = false;
    let userName = '';
  
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = true; //연속적으로 인식하도록(이거 false하면 사용자의 음성이 끊기면 자동으로 녹음 중단됨)
        recognition.interimResults = false; //중간 결과 반환 false
        recognition.lang = "ko-KR"; //한국어로 설정
  
        recognition.onresult = (event) => {
            const transcript = event.results[event.results.length - 1][0].transcript.trim();
  
            console.log(transcript);
  
            if (!userName) {
                userName = transcript.toLowerCase();
                resultElem.textContent = `이름 : ${userName}`;
            } else {
                // 단어별로 나누고, 이름과 정확히 일치하는 경우만 강조
                const words = transcript.split(' ');
                const highlightedText = words.map(word => {
                    if (word.toLowerCase() === userName) {
                        return `<span class="highlight">${word}</span>`;
                    } else {
                        return word;
                    }
                }).join(' ');
                resultElem.innerHTML = `나 : ${highlightedText}`;
  
                switch (transcript) {
                  case '뛰어':
                      modelViewer.style.transform = 'translateY(-100px)'; // 위로 100px 이동
                      break;
                  case '오른쪽으로 가':
                      modelViewer.style.transform = 'translateX(100px)'; // 오른쪽으로 100px 이동
                      break;
                  case '왼쪽으로 가':
                      modelViewer.style.transform = 'translateX(-100px)'; // 왼쪽으로 100px 이동
                      break;
              }
              setTimeout(() => {
                modelViewer.style.transform = '';
            }, 500);
  
          }
          recognition.onend = () => {
            // 음성 인식 자동 재시작
            recognition.start();
          };
  
          // 음성 인식 시작
          recognition.start();
        };
  
        recognition.onstart = () => {
            statusIndicator.textContent = '듣는 중...';
            statusIndicator.classList.add('recording');
            statusIndicator.style.color = "#FF9100";
            statusIndicator.style.fontFamily = "Pretendard-SemiBold";
        };
  
        recognition.onend = () => {
            statusIndicator.textContent = '녹음 중단';
            statusIndicator.classList.remove('recording');
            statusIndicator.style.fontFamily = "Pretendard-SemiBold";
            statusIndicator.style.color = "#FF8181";
            isListening = false;
        };
  
        nameRecordBtn.addEventListener('click', () => {
            userName = ''; // 사용자 이름 초기화
            recognition.start();
        });
  
        recordBtn.addEventListener('click', () => {
            if (!isListening) {
                recognition.start();
                isListening = true;
            }
        });
  
        stopBtn.addEventListener('click', () => {
            recognition.stop();
        });
  
        // 제출 버튼 클릭 시 서버에 데이터 전송
        submitBtn.addEventListener('click', () => {
            if (userName) {
                fetch('/set_custom_name', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ custom_name: userName })
                })
                .then(response => response.json())
                .then(data => {
                    alert('이름이 저장되었습니다.');
                })
                .catch(error => {
                    console.error('오류:', error);
                });
            } else {
                alert('제출할 이름이 없습니다.');
            }
        });
    } else {
        resultElem.textContent = '음성 인식 기능을 지원하지 않습니다.';
    }
  });
  
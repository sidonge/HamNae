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
  blinkText.innerText = "이름을 불렀다면 멈춤 버튼과 저장 버튼을 눌러주세요.";
}

function stopText() {
  var blinkText = document.querySelector('.popupBlink');
  blinkText.innerText = "이름 설정이 끝났으면 record 버튼을 눌러 자유롭게 말해보세요!";
}

function startText() {
  var blinkText = document.querySelector('.popupBlink');
  blinkText.innerHTML = "귀여운 친구의 이름을 불러보세요! <br> '뛰어'나 '오른쪽' 혹은 '왼쪽'이라고 말해보세요.";
  blinkText.style.textAlign = "center"; 
  blinkText.style.top = "15rem";
}

// 음성 인식
document.addEventListener('DOMContentLoaded', () => {
  const modelViewer = document.getElementById('rabbitModel2');
  const nameRecordBtn = document.getElementById('nameRecord');
  const recordBtn = document.getElementById('record');
  const stopBtn = document.getElementById('stop');
  const resultElem = document.getElementById('result');
  const statusIndicator = document.getElementById('status-indicator');
  const recordingStatusIndicator = document.getElementById('recording-status-indicator'); 
  const submitBtn = document.getElementById('submit-btn'); // 제출 버튼

  const homeNameRecordBtn = document.getElementById('homenameRecord');
  const homeStopBtn = document.getElementById('homestop');

  const bedContainer = document.getElementById('bedContainer'); // 명상하기 컨테이너
  const cookingContainer = document.getElementById('cookingContainer');
  const waterContainer = document.getElementById('waterContainer');
  const cleanContainer = document.getElementById('cleanContainer');
  const washContainer = document.getElementById('washContainer');
  const talkImages = document.querySelectorAll(".talk-image");
 
  let recognition;
  let isListening = false;
  let userName = '';

  if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = true; // 연속적으로 인식하도록
    recognition.interimResults = false; // 중간 결과 반환 false
    recognition.lang = "ko-KR"; // 한국어로 설정

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
        modelViewer.style.marginBottom = "10rem";

        if (modelViewer) {
          modelViewer.classList.add('move-up');
        }

        // 모델 뷰어 이동 애니메이션
        if (transcript === '오른쪽') {
          modelViewer.classList.add('move-right');
        } else if (transcript === '왼쪽') {
          modelViewer.classList.add('move-left');
        }

        setTimeout(() => {
          modelViewer.classList.remove('move-up', 'move-right', 'move-left');
        }, 3000);

        // "대화하자"를 말했을 때 /chat 경로로 이동
        if (transcript === '대화하자') {
          window.location.href = '/chat';
        } else if (transcript === '산책하자') {
          window.location.href = '/walkpage';
        } else if (transcript === '명상하자') {
          bedContainer.click(); // "명상하자"를 말했을 때 bedContainer의 클릭 이벤트 트리거
        } else if (transcript === '밥 먹자') {
          cookingContainer.querySelector('input[type="file"]').click(); 
        } else if (transcript === '물 먹자') {
          waterContainer.click(); 
        } else if (transcript === '청소하자') {
          cleanContainer.click();
        } else if (transcript === '씻자') {
          washContainer.click();
        }
      }
    };

    recognition.onstart = () => {
      statusIndicator.textContent = '듣는 중...';
      statusIndicator.classList.add('recording');
      statusIndicator.style.color = "#FF9100";
      statusIndicator.style.fontFamily = "Pretendard-SemiBold";

      // 홈 nav record
      recordingStatusIndicator.textContent = '듣는 중...';
      recordingStatusIndicator.style.display = 'block';
      recordingStatusIndicator.style.color = "#71594E";
      recordingStatusIndicator.style.fontFamily = "Pretendard-SemiBold";
      homeNameRecordBtn.style.opacity = "100%";
    };

    recognition.onend = () => {
      statusIndicator.textContent = '녹음 중지됨';
      statusIndicator.classList.remove('recording');
      statusIndicator.style.fontFamily = "Pretendard-SemiBold";
      statusIndicator.style.color = "#FF8181";
      isListening = false;

      recordingStatusIndicator.textContent = '녹음 중지됨';
      recordingStatusIndicator.style.color = "#71594E";
      setTimeout(() => {
        recordingStatusIndicator.style.display = 'none';
      }, 4000); // 4초 후에 사라짐
      homeNameRecordBtn.style.opacity = "50%";
      homeStopBtn.style.opacity = "100%";
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

    // 홈 버튼 추가 기능
    homeNameRecordBtn.addEventListener('click', () => {
      if (!isListening) {
        recognition.start();
        isListening = true;
      }
    });

    homeStopBtn.addEventListener('click', () => {
      recognition.stop();
    });

    // 제출 버튼 클릭 시 서버에 데이터 전송
    submitBtn.addEventListener('click', async () => {
      const userName = document.getElementById('result').textContent.replace('이름 : ', '').trim();
      if (userName) {
        try {
          const response = await fetch('/set_custom_name', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({ custom_name: userName })
          });
          if (response.ok) {
            const data = await response.json();
            alert('이름이 저장되었습니다.');
            // 이름이 저장되면 미션 완료 요청
            await completeMission('pills');
          } else {
            throw new Error('네트워크 응답이 올바르지 않습니다.');
          }
        } catch (error) {
          console.error('오류:', error);
          alert('이름 저장에 실패했습니다.');
        }
      } else {
        alert('제출할 이름이 없습니다.');
      }
    });
  } else {
    resultElem.textContent = '음성 인식 기능을 지원하지 않습니다.';
  }
});
document.addEventListener("DOMContentLoaded", () => {

  function addClickHandler(elementId, soundId) {
    const element = document.getElementById(elementId);
    const sound = document.getElementById(soundId);

    element.addEventListener("click", () => {
      sound.play();
    });
  }

  addClickHandler("cookingContainer", "cookingSound");
  addClickHandler("cleanContainer", "cleanSound");
  addClickHandler("pillsContainer", "pillsSound");
  addClickHandler("washContainer", "washSound");
  addClickHandler("waterContainer", "waterSound");

  // 모델 뷰어
  const windowModel = document.getElementById("windowModel");
  const rabbitModel = document.getElementById("rabbitModel");

  // 초기 화면 설정
  let rotateX = 90;
  let rotateY = 0;

  if (windowModel) {
    windowModel.addEventListener("click", () => {
      rotateX += 10;
      windowModel.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
  }

  if (rabbitModel) {
    rabbitModel.addEventListener("click", () => {
      rotateY += 10;
      rabbitModel.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
  }
});

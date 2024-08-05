// popup js
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

  let recognition;
  let isListening = false;
  let userName = '';

  if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "ko-KR";

    
    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim();
      console.log(transcript);

      if (!userName) {
          userName = transcript.toLowerCase();
          resultElem.textContent = `이름 : ${userName}`;
      } else {
          const words = transcript.split(' ');
          const highlightedText = words.map(word => {
              if (word.toLowerCase() === userName) {
                  return `<span class="highlight">${word}</span>`;
              } else {
                  return word;
              }
          }).join(' ');
          resultElem.innerHTML = `나 : ${highlightedText}`;
      }
    };

    recognition.onstart = () => {
        statusIndicator.textContent = '듣는 중...';
        statusIndicator.classList.add('recording');
    };

    recognition.onend = () => {
        statusIndicator.textContent = '녹음 중단';
        statusIndicator.classList.remove('recording');
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
  } else {
      resultElem.textContent = 'Speech Recognition not supported.';
  }
});























// home js
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


  

  const talkImages = document.querySelectorAll(".talk-image");
  talkImages.forEach((img) => {
    const uploadInput = img.nextElementSibling;

    img.addEventListener("click", () => {
      if (uploadInput) {
        uploadInput.click();
      }
    });

    if (uploadInput) {
      uploadInput.addEventListener("change", (event) => {
        const file = event.target.files[0];

        // FormData 객체 생성하여 파일 추가
        if (file) {
          const formData = new FormData();
          const mission = uploadInput.id.replace("Upload", "");
          const stampMap = {
            water: "water_cleared_stamp",
            clean: "clean_cleared_stamp",
            cooking: "cooking_cleared_stamp",
            wash: "wash_cleared_stamp",
            bed: "bed_cleared_stamp",
            pills: "pills_cleared_stamp",
            talk: "talk_cleared_stamp",
          };
          const newFileName =
            stampMap[mission] + "." + file.name.split(".").pop(); // 새로운 파일 이름 설정

          formData.append(
            "file",
            new File([file], newFileName, { type: file.type })
          );

          fetch("/upload", {
            method: "POST",
            body: formData,
          })
            .then((response) => response.json())
            .then((data) => {
              if (data.success) {
                alert("미션 성공! 퀘스트 달성도를 확인해 보세요.");
                localStorage.setItem(
                  `${uploadInput.id.replace("Upload", "")}Cleared`,
                  "true"
                );
                updateStampImage(uploadInput.id.replace("Upload", ""), file);
              } else {
                alert("올바르지 않은 사진이에요. 다시 시도해 주세요.");
              }
            })
            .catch((error) => {
              console.error("업로드 중 오류가 생겼어요:", error);
              alert("업로드 중 오류가 생겼어요. 다시 시도해 주세요.");
            });
        }
      });
    }
  });

  // 스탬프 이미지 업데이트 함수
  function updateStampImage(mission, file) {
    const stampMap = {
      water: "water_cleared_stamp",
      clean: "clean_cleared_stamp",
      cooking: "cooking_cleared_stamp",
      wash: "wash_cleared_stamp",
      bed: "bed_cleared_stamp",
      pills: "pills_cleared_stamp",
      talk: "talk_cleared_stamp",
    };

    const stampId = stampMap[mission];
    if (stampId) {
      const stampElement = document.getElementById(stampId);
      if (stampElement) {
        const reader = new FileReader();
        reader.onload = function (e) {
          stampElement.src = e.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        console.error("Stamp element not found:", stampId);
      }
    } else {
      console.error("Invalid mission:", mission);
    }
  }

  // 모델 뷰어
  const windowModel = document.getElementById("windowModel");
  const rabbitModel = document.getElementById("rabbitModel");


  // 초기 화면 설정
  let rotateX = 90;
  let rotateY = -270;
  let zoomLevel = 5;

  const minRotateY = -300;
  const maxRotateY = -240;

  function updateRotation() {
    const cameraOrbit = `${rotateY}deg ${rotateX}deg ${zoomLevel}m`;
    windowModel.cameraOrbit = cameraOrbit;
    rabbitModel.cameraOrbit = `${rotateY + 90}deg ${rotateX}deg`;
  }

  function handleUpClick() {
    rotateX -= 10;
    zoomLevel = 2;
    updateRotation();
  }

  function handleDownClick() {
    if (rotateX < 90) {
      rotateX += 10;
      zoomLevel *= 0.9;
      updateRotation();
    }
  }

  function handleLeftClick() {
    if (rotateY > minRotateY) {
      rotateY -= 10;
      updateRotation();
    }
  }

  function handleRightClick() {
    if (rotateY < maxRotateY) {
      rotateY += 10;
      updateRotation();
    }
  }

  function handleRabbitUpClick() {
    rotateX -= 10;
    updateRabbitRotation();
  }

  function handleRabbitDownClick() {
    rotateX += 10;
    updateRabbitRotation();
  }

  function handleRabbitLeftClick() {
    rotateY -= 90;
    updateRabbitRotation();
  }

  function handleRabbitRightClick() {
    rotateY += 90;
    updateRabbitRotation();
  }

  function updateRabbitRotation() {
    rabbitModel.cameraOrbit = `${rotateY + 90}deg ${rotateX}deg`;
  }

  document.getElementById("up").addEventListener("click", handleUpClick);
  document.getElementById("down").addEventListener("click", handleDownClick);
  document.getElementById("left").addEventListener("click", handleLeftClick);
  document.getElementById("right").addEventListener("click", handleRightClick);

  // 토끼 모델 제어 버튼 클릭 이벤트 추가
  document
    .getElementById("rabbitUp")
    .addEventListener("click", handleRabbitUpClick);
  document
    .getElementById("rabbitDown")
    .addEventListener("click", handleRabbitDownClick);
  document
    .getElementById("rabbitLeft")
    .addEventListener("click", handleRabbitLeftClick);
  document
    .getElementById("rabbitRight")
    .addEventListener("click", handleRabbitRightClick);

  // 토끼 모델 클릭 시 말풍선 이미지 토글
  const rabbitTalk1 = document.getElementById("rabbitTalk1");
  const rabbitTalk2 = document.getElementById("rabbitTalk2");
  const blinkText = document.querySelector(".blink");
  const homeSound = document.getElementById("homeSound");
  let isTalkVisible = false;

  // 캐릭터 클릭 시 홈 배경음악 재생
  rabbitModel.addEventListener("click", () => {
    homeSound.play().catch(error => {
      console.error("오디오 재생 중 에러 발생:", error);
    });
  });

  rabbitTalk1.addEventListener("click", () => {
    window.location.href = "/petlist";
  });

  rabbitTalk2.addEventListener("click", () => {
    window.location.href = "/quest";
  });

  rabbitModel.addEventListener("click", () => {
    rotateY += 180;
    updateRabbitRotation();

    isTalkVisible = !isTalkVisible;
    if (isTalkVisible) {
      rabbitTalk1.style.opacity = "1";
      rabbitTalk2.style.opacity = "1";
      blinkText.style.display = "none";
    } else {
      rabbitTalk1.style.opacity = "0";
      rabbitTalk2.style.opacity = "0";
    }
  });

  // 채팅으로 이동
  document.querySelector(".talk").addEventListener("click", () => {
    window.location.href = "/chat";
  });

  updateRotation();
});


// 가구들 눌렀을 때 파일 선택 기능
document.getElementById('cookingContainer').addEventListener('click', function(event) {
  if (event.target.id !== 'cookingUpload') {
      document.getElementById('cookingUpload').click();
  }
});

document.getElementById('waterContainer').addEventListener('click', function(event) {
  if (event.target.id !== 'waterUpload') {
      document.getElementById('waterUpload').click();
  }
});

document.getElementById('cleanContainer').addEventListener('click', function(event) {
  if (event.target.id !== 'cleanUpload') {
      document.getElementById('cleanUpload').click();
  }
});

document.getElementById('washContainer').addEventListener('click', function(event) {
  if (event.target.id !== 'washUpload') {
      document.getElementById('washUpload').click();
  }
});

document.getElementById('pillsContainer').addEventListener('click', function(event) {
  if (event.target.id !== 'pillsUpload') {
      document.getElementById('pillsUpload').click();
  }
});

document.getElementById('bedContainer').addEventListener('click', function(event) {
  if (event.target.id !== 'bedUpload') {
      document.getElementById('bedUpload').click();
  }
});



// 가구 누르도록 블링크 메세지
document.addEventListener('DOMContentLoaded', function() {
  const topBlinkMessage = document.querySelector('.Topblink');

  setTimeout(function() {
      topBlinkMessage.style.display = 'none';
  }, 10000); 
});


// 명상하기 눌렀을 때 1분 타이머
document.getElementById('bedContainer').addEventListener('click', function() {
  const display = document.getElementById('timerDisplay');
  const timeWrap = document.querySelector('.timerNum');
  const startText = document.querySelector('.timerText');
  const minuteElem = document.getElementById('minute');
  const secondElem = document.getElementById('second');
  const completeMessage = document.getElementById('timerCompleteMessage');
  const pieceSound = document.getElementById('pieceSound');

  pieceSound.play().catch(error => console.error("오디오 재생 중 에러 발생:", error));


  // 초기 설정
  minuteElem.textContent = "01";
  secondElem.textContent = "00";
  completeMessage.style.display = "none"; // 완료 메시지를 초기에 숨김
  startText.style.display = "block"; // 시작 텍스트 표시
  timeWrap.style.display = "flex"; // 시간 표시 요소를 표시

  startTimer(60, minuteElem, secondElem, startText, completeMessage, timeWrap, display);
  display.style.display = "block"; // 타이머 디스플레이를 표시
});

function startTimer(duration, minuteElem, secondElem, startText, completeMessage, timeWrap, display) {
  let timer = duration;
  const interval = setInterval(function () {
    let minutes = parseInt(timer / 60, 10);
    let seconds = parseInt(timer % 60, 10);

    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    minuteElem.textContent = minutes;
    secondElem.textContent = seconds;

    if (--timer < 0) {
      clearInterval(interval);
      timeWrap.style.display = "none"; // 시간 표시 요소 숨김
      startText.style.display = "none"; // 시작 텍스트 숨김
      completeMessage.style.display = "block"; // 완료 메시지 표시
      
      display.style.height = "3rem";
      display.style.position = "absolute"; // 또는 'relative'에 따라 요구 사항에 맞게 설정
      display.style.bottom = "10rem";

      display.style.borderRadius = "10px";
      
      setTimeout(function() {
        display.style.display = "none"; // 1초 후 전체 타이머 디스플레이 숨김
      }, 3000);
    }
  }, 1000); // 각 초마다 반복
}



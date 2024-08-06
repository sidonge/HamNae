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
  const recordingStatusIndicator = document.getElementById('recording-status-indicator'); 
  const submitBtn = document.getElementById('submit-btn'); // 제출 버튼

  const homeNameRecordBtn = document.getElementById('homenameRecord');
  const homeStopBtn = document.getElementById('homestop');

  const bedContainer = document.getElementById('bedContainer'); // 명상하기 컨테이너
  const cookingContainer = document.getElementById('cookingContainer');
  const waterContainer = document.getElementById('waterContainer');
  const cleanContainer = document.getElementById('cleanContainer');
  const washContainer = document.getElementById('washContainer');

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
          modelViewer.classList.remove('move-up','move-right', 'move-left');
        }, 3000);

        // "대화하자"를 말했을 때 /chat 경로로 이동
        if (transcript === '대화하자') {
          window.location.href = '/chat';
        } 
        else if (transcript === '산책하자') {
          window.location.href = '/walkpage';
        }
        else if (transcript === '명상하자') {
          bedContainer.click(); // "명상하자"를 말했을 때 bedContainer의 클릭 이벤트 트리거
        }
        else if (transcript === '밥 먹자') {
          // cookingContainer.click(); 
          cookingContainer.querySelector('input[type="file"]').click(); 
        }
        else if (transcript === '물 먹자') {
          waterContainer.click(); 
        }
        else if (transcript === '청소하자') {
          cleanContainer.click();
        }
        else if (transcript === '씻자') {
          washContainer.click();
        }

        
      }
    };

    recognition.onstart = () => {
      statusIndicator.textContent = '듣는 중...';
      statusIndicator.classList.add('recording');
      statusIndicator.style.color = "#FF9100";
      statusIndicator.style.fontFamily = "Pretendard-SemiBold";

      //홈 nav record
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
      // 음성 인식 자동 재시작
      // recognition.start();

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
          };

          const newFileName = stampMap[mission] ? stampMap[mission] + "." + file.name.split(".").pop() : "";

          if (newFileName) {
            formData.append("file", new File([file], newFileName, { type: file.type }));

            fetch("/upload", {
              method: "POST",
              body: formData,
            })
              .then((response) => response.json())
              .then((data) => {
                if (data.success) {
                  alert("미션 성공! 퀘스트 달성도를 확인해 보세요.");
                  localStorage.setItem(`${uploadInput.id.replace("Upload", "")}Cleared`, "true");
                  updateStampImage(uploadInput.id.replace("Upload", ""), file);
                } else {
                  alert("올바르지 않은 사진이에요. 다시 시도해 주세요.");
                }
              })
              .catch((error) => {
                console.error("업로드 중 오류가 생겼어요:", error);
                alert("업로드 중 오류가 생겼어요. 다시 시도해 주세요.");
              });
          } else {
            alert("잘못된 미션입니다.");
          }
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
      talk: "talk_cleared_stamp",
      bed: "bed_cleared_stamp",
      pills: "pills_cleared_stamp",
      walk: "walk_cleared_stamp"
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
  const homeSound = document.getElementById("homeSound");
  let isTalkVisible = false;

  // 캐릭터 클릭 시 홈 배경음악 재생
  rabbitModel.addEventListener("click", () => {
    homeSound.play().catch(error => {
      console.error("오디오 재생 중 에러 발생:", error);
    });
  });

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



document.addEventListener('DOMContentLoaded', function() {
  const showerPopup = document.querySelector('.showerPopup');
  const showerHam = document.querySelectorAll('.showerHam');
  const showerSend = document.querySelector('.showerSend');
  const overlay = document.querySelector('.overlay');
  let selectedImage = null; // 선택된 이미지 저장

  // 요소들이 존재하는지 확인
  const washContainer = document.getElementById('washContainer');
  if (!washContainer) {
    console.error('Element with id "washContainer" not found.');
    return;
  }
  
  if (!showerPopup || !showerSend || !overlay) {
    console.error('One or more required elements are not found.');
    return;
  }

  // 샤워 버튼 클릭 시 팝업을 표시
  washContainer.addEventListener('click', function() {
    showerPopup.classList.add('popup-visible');
    overlay.style.display = 'block'; // 오버레이 표시
  });

// 감정 이미지 클릭 시
showerHam.forEach(img => {
  img.addEventListener('click', function() {
      showerHam.forEach(image => image.classList.remove('selected')); // 기존 선택 해제
      this.classList.add('selected'); // 현재 이미지 선택
      console.log('Image clicked:', this); 
      selectedImage = this; // 선택된 이미지 저장
  });
});
  // 샤워 후 제출 버튼 클릭 시
  showerSend.addEventListener('click', function() {
    if (selectedImage) {
      // 서버로 스탬프 업데이트 요청
      const mission = 'wash'; // 샤워 후에 업데이트할 미션
      fetch('/update-stamp', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ mission })
      })
      .then(response => response.json())
      .then(data => {
          if (data.success) {
              alert('미션 성공! 퀘스트 달성도를 확인해 보세요.');
              localStorage.setItem(`${mission}Completed`, 'true');
              updateStampImage(mission);
              increaseXP(XP_PER_QUEST); // XP 증가
          } else {
              alert('미션 업데이트에 실패했습니다. 다시 시도해 주세요.');
          }
      })
      .catch(error => {
          console.error('업로드 중 오류가 발생했습니다:', error);
          alert('업로드 중 오류가 발생했습니다. 다시 시도해 주세요.');
      });

      // 팝업과 오버레이 숨기기
      showerPopup.classList.remove('popup-visible');
      overlay.style.display = 'none';
    } else {
      alert('Please select an image first.');
    }
  });

  // 오버레이 클릭 시 팝업과 오버레이 숨기기
  overlay.addEventListener('click', function() {
      showerPopup.classList.remove('popup-visible');
      overlay.style.display = 'none';
  });
});

document.addEventListener('DOMContentLoaded', function() {
  // 닫기 버튼 이벤트 연결
  var closeButton = document.querySelector('.closeIcon');
  closeButton.onclick = togglePopup;

  // 페이지 로딩 시 팝업 자동 열기
  openPopup();

  // stop 버튼 클릭 시 미션 완료 처리
  var stopButton = document.getElementById('stop');
  stopButton.addEventListener('click', function() {
    stopText();
    completeMission('pills');
  });

  // sendText 버튼 클릭 시 미션 완료 처리
  var sendTextButton = document.querySelector('.sendText');
  sendTextButton.addEventListener('click', function() {
    completeMission('wash');
  });

  function completeMission(mission) {
    // 서버에 미션 완료를 알림
    fetch('/update-stamp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ mission: mission })
    })
    .then(response => response.json())
    .then(data => {
      if (data.message) {
        alert('미션 완료!');
        localStorage.setItem(`${mission}_cleared`, "true");
        updateStampImage(mission);
      } else {
        alert('미션 완료 처리 중 오류가 발생했습니다.');
      }
    })
    .catch(error => {
      console.error('미션 완료 처리 중 오류 발생:', error);
    });
  }

  function updateStampImage(mission) {
    const stampMap = {
      pills: 'pills_cleared_stamp',
      wash: 'wash_cleared_stamp'
    };

    const stampId = stampMap[mission];
    if (stampId) {
      const stampElement = document.getElementById(stampId);
      if (stampElement) {
        stampElement.src = '/path_to_cleared_stamp_image.png';
      } else {
        console.error("Stamp element not found:", stampId);
      }
    } else {
      console.error("Invalid mission:", mission);
    }
  }
});
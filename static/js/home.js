document.addEventListener("DOMContentLoaded", () => {

  function addClickHandler(elementId, soundId) {
    const element = document.getElementById(elementId);
    const sound = document.getElementById(soundId);
  
    element.addEventListener("click", () => {
      sound.play();
    });
  }
  
  addClickHandler("cooking_cleared_stamp", "cookingSound");
  addClickHandler("clean_cleared_stamp", "cleanSound");
  addClickHandler("pills_cleared_stamp", "pillsSound");
  addClickHandler("wash_cleared_stamp", "washSound")

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
  let isTalkVisible = false;

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
  document.querySelector(".tableTalk").addEventListener("click", () => {
    window.location.href = "/chat";
  });

  windowModel.addEventListener("load", () => {
    updateRotation();
  });
});


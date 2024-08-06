// document.addEventListener('DOMContentLoaded', () => {
//     const backgroundModelreal = document.getElementById('backgroundModelreal');
//     const hamModel = document.getElementById('hamModel');

//     // 모델 뷰어 조정
//     // 초기 카메라 설정
//     let rotateX = 55; // 세로 각도
//     let rotateY = 230; // 가로 각도
//     let zoomLevel = 50; // 확대 비율

//     function updateRotation() {
//         backgroundModelreal.cameraOrbit = `${rotateY}deg ${rotateX}deg ${zoomLevel}m`;
//     }

//     // 시점 조정
//     backgroundModelreal.style.transform = 'translateX(5rem) scale(1.4)';
//     backgroundModelreal.style.transform = 'translateY(4rem)';

//     updateRotation();
//     updateCharacter();
// });

const hamModel = document.getElementById("hamModel");
const mainSound = document.getElementById("mainSound");

const homeIcon = document.querySelector(".homeIcon");
const group = document.querySelector(".group");
const backgroundOverlay = document.getElementById("backgroundOverlay");

hamModel.addEventListener("click", () => {
  mainSound.play();
});

document.addEventListener("DOMContentLoaded", () => {
  const blinkText = document.querySelector(".blink");
  isTalkVisible = !isTalkVisible;
  if (isTalkVisible) {
    blinkText.style.display = "none";
  }
});

// 집 클릭 이벤트
if (homeIcon && group && hamModel && backgroundOverlay) {
  // backgroundOverlay 변수 확인 추가
  homeIcon.addEventListener("click", () => {
    hamModel.style.display = "none";
    group.style.display = "flex";
    backgroundOverlay.style.display = "block";
    group.style.animation = "moveHamster 3s linear infinite";

    setTimeout(() => {
      window.location.href = "/home";
    }, 3000);
  });
} else {
  console.error("필요한 요소를 찾을 수 없습니다.");
}

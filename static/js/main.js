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

const hamModel = document.getElementById("hamModel")
const mainSound = document.getElementById("mainSound")

hamModel.addEventListener('click', () => {
    mainSound.play();
});


document.addEventListener("DOMContentLoaded", () => {
    const blinkText = document.querySelector(".blink");
    isTalkVisible = !isTalkVisible;
    if (isTalkVisible) {
      
      blinkText.style.display = "none";
    } 
});
// home.js
document.addEventListener('DOMContentLoaded', () => {
    const backgroundModel = document.getElementById('backgroundModel');

    // 초기 카메라 설정
    let rotateX = -90; // X축 회전 각도
    let rotateY = 180; // Y축 회전 각도
    let zoomLevel = 20; // 확대 비율

    function updateRotation() {
        // 카메라의 `cameraOrbit` 속성 설정
        backgroundModel.cameraOrbit = `${rotateY}deg ${rotateX}deg ${zoomLevel}m`;
        // 모델 뷰어가 속성 변경을 인식하도록 강제로 업데이트
        backgroundModel.jumpToGoal();
    }

    // 모델의 위치를 Y축으로 3rem 이동시키기
    backgroundModel.style.transform = 'translateY(10rem)';

    // 초기 카메라 설정 업데이트
    updateRotation();
});

const windowModel = document.getElementById('windowModel');
const rabbitModel = document.getElementById('rabbitModel');

let rotateX = 90; // 초기 X축 회전 각도
let rotateY = -270; // 초기 Y축 회전 각도
let zoomLevel = 2; // 초기 확대 비율

const minRotateY = -300; // Y축 최소 회전 각도
const maxRotateY = -240; // Y축 최대 회전 각도

function updateRotation() {
    const cameraOrbit = `${rotateY}deg ${rotateX}deg ${zoomLevel}m`;
    windowModel.cameraOrbit = cameraOrbit;
    rabbitModel.cameraOrbit = `${rotateY + 90}deg ${rotateX}deg ${zoomLevel}m`;
}

function handleUpClick() {
    rotateX -= 10;
    zoomLevel = 2; // 확대 비율을 원래대로 복원
    updateRotation();
}

function handleDownClick() {
    if (rotateX < 90) {
        rotateX += 10;
        zoomLevel *= 0.9; // 확대 비율을 10% 감소
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
    rotateX -= 10; // Rotate rabbit model up
    updateRabbitRotation();
}

function handleRabbitDownClick() {
    rotateX += 10; // Rotate rabbit model down
    updateRabbitRotation();
}

function handleRabbitLeftClick() {
    rotateY -= 90; // Rotate rabbit model left
    updateRabbitRotation();
}

function handleRabbitRightClick() {
    rotateY += 90; // Rotate rabbit model right
    updateRabbitRotation();
}

function updateRabbitRotation() {
    rabbitModel.cameraOrbit = `${rotateY + 90}deg ${rotateX}deg ${zoomLevel}m`;
}

document.getElementById('up').addEventListener('click', handleUpClick);
document.getElementById('down').addEventListener('click', handleDownClick);
document.getElementById('left').addEventListener('click', handleLeftClick);
document.getElementById('right').addEventListener('click', handleRightClick);

// 토끼 모델 제어 버튼 클릭 이벤트 추가
document.getElementById('rabbitUp').addEventListener('click', handleRabbitUpClick);
document.getElementById('rabbitDown').addEventListener('click', handleRabbitDownClick);
document.getElementById('rabbitLeft').addEventListener('click', handleRabbitLeftClick);
document.getElementById('rabbitRight').addEventListener('click', handleRabbitRightClick);

// 페이지 로드 시 초기 상태 설정
windowModel.addEventListener('load', () => {
    updateRotation();
});
document.addEventListener('DOMContentLoaded', () => {
    const talkImages = document.querySelectorAll('.talk-image');
    talkImages.forEach((img) => {
        const uploadInput = img.nextElementSibling;
        img.addEventListener('click', () => {
            uploadInput.click();
        });

        uploadInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const formData = new FormData();
                formData.append('file', file);

                fetch('/upload', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('파일이 성공적으로 업로드되었습니다!');
                    } else {
                        alert('파일 업로드에 실패했습니다.');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('파일 업로드 중 오류가 발생했습니다.');
                });
            }
        });
    });

    // 기존 코드 유지
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

    // 토끼 모델 클릭 시 회전 및 말풍선 이미지 표시
    rabbitModel.addEventListener('click', () => {
        rotateY += 180;
        updateRabbitRotation();

        const rabbitTalk1 = document.getElementById('rabbitTalk1');
        const rabbitTalk2 = document.getElementById('rabbitTalk2');
        rabbitTalk1.style.display = rabbitTalk1.style.display === 'none' ? 'block' : 'none';
        rabbitTalk2.style.display = rabbitTalk2.style.display === 'none' ? 'block' : 'none';
    });

    windowModel.addEventListener('load', () => {
        updateRotation();
    });
});

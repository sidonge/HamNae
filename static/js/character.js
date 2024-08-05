document.addEventListener('DOMContentLoaded', () => {
    const backgroundModel = document.getElementById('backgroundModel');
    const leftArrow = document.getElementById('leftArrow');
    const rightArrow = document.getElementById('rightArrow');
    
    let rotateX = 55; // 세로 각도
    let rotateY = 230; // 가로 각도
    let zoomLevel = 30; // 확대 비율

    function updateRotation() {
        backgroundModel.cameraOrbit = `${rotateY}deg ${rotateX}deg ${zoomLevel}m`;
    }

    leftArrow.addEventListener('click', () => {
        currentIndex = (currentIndex === 0) ? characters.length - 1 : currentIndex - 1;
        updateCharacter();
    });

    rightArrow.addEventListener('click', () => {
        currentIndex = (currentIndex === characters.length - 1) ? 0 : currentIndex + 1;
        updateCharacter();
    });

    function adjustView() {
        backgroundModel.style.transform = 'translateX(5rem) scale(1.4)'; // X축으로 이동 및 확대
        backgroundModel.style.transform += ' translateY(4rem)'; // Y축으로 이동
    }

    updateRotation();
    adjustView();
});

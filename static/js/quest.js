document.addEventListener('DOMContentLoaded', () => {
    // 페이지가 로드된 후 클리어 퀘스트 이미지를 업데이트합니다.
    updateQuestPage();
});

function updateQuestPage() {
    // 각 퀘스트 이미지 요소를 선택합니다.
    const questImageIds = [
        'water_cleared_stamp',
        'sprout_cleared_stamp',
        'broomstick_cleared_stamp',
        'pot_cleared_stamp',
        'pills_cleared_stamp',
        'bath_cleared_stamp',
        'talk_cleared_stamp',
        'meditaion_cleared_stamp'
    ];
    
    questImageIds.forEach(id => {
        const img = document.getElementById(id);
        if (img) {
            const imageKey = 'questImage_' + id;
            const imageData = localStorage.getItem(imageKey);
            if (imageData) {
                img.src = imageData;
                img.style.display = 'block'; // 이미지 보이기
            } else {
                img.style.display = 'none'; // 이미지 숨기기
            }
        }
    });
}

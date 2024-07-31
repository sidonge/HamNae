document.addEventListener('DOMContentLoaded', () => {
    // 미션 이름 : 스탬프 이름
    const stampMap = {
        'water': 'water_cleared_stamp',
        'clean': 'clean_cleared_stamp',
        'cooking': 'cooking_cleared_stamp',
        'wash': 'wash_cleared_stamp',
        'bed': 'bed_cleared_stamp',
        'talk': 'talk_cleared_stamp'  // 대화하기 스탬프 추가
    };

    // 스탬프 업데이트 함수
    function updateStampImage(mission) {
        const stampId = stampMap[mission];
        if (stampId) {
            const stampElement = document.getElementById(stampId);
            if (stampElement) {
                stampElement.style.display = 'block';
            } else {
                console.error('Stamp element not found:', stampId);
            }
        } else {
            console.error('Invalid mission:', mission);
        }
    }    

    // '대화하기' 스탬프 상태 체크 및 업데이트
    if (localStorage.getItem('talkCompleted') === 'true') {
        updateStampImage('talk');
    }

    // 엔드 포인트에서 데이터 가져옴
    fetch('/quest_status')
        .then(response => {
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            return response.json();
        })
        .then(data => {
            if (data.status) {
                for (const [mission, cleared] of Object.entries(data.status)) {
                    if (cleared === "true") {
                        updateStampImage(mission);
                    }
                }
            } else {
                console.error('No status in data:', data);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
});

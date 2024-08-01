document.addEventListener('DOMContentLoaded', () => {
    // 미션 이름 : 스탬프 요소 ID 매핑
    const stampMap = {
        'water': 'water_cleared_stamp',
        'clean': 'clean_cleared_stamp',
        'cooking': 'cooking_cleared_stamp',
        'wash': 'wash_cleared_stamp',
        'bed': 'bed_cleared_stamp',
        'talk': 'talk_cleared_stamp',
        'walk': 'sprout_cleared_stamp',
        'pills':'pills_cleared_stamp'
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

    // 로컬 스토리지에서 완료된 미션 상태 체크 및 업데이트
    for (const mission in stampMap) {
        if (localStorage.getItem(`${mission}Completed`) === 'true') {
            updateStampImage(mission);
        }
    }

    // 서버로부터 완료된 미션 상태 가져오기
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

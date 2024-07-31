document.addEventListener('DOMContentLoaded', () => {
    // 미션 이름 : 스탬프 이름
    const stampMap = {
        'water': 'water_cleared_stamp',
        'clean': 'clean_cleared_stamp',
        'cooking': 'cooking_cleared_stamp',
        'wash': 'wash_cleared_stamp',
        'bed': 'bed_cleared_stamp'
    };

    // 스탬프 업데이트 함수
    function updateStampImage(mission) {
        // 각 미션에 해당하는 스탬프 이름 ID 찾아서 stampId에 저장
        const stampId = stampMap[mission];
        
        // stampId가 있으면
        if (stampId) {
            // 해당 ID에 맞는 요소 저장 (스탬프이므로 img 저장)
            const stampElement = document.getElementById(stampId);

            // img가 존재하면
            if (stampElement) {
                // 보이게 하기 (기존 상태: none)
                stampElement.style.display = 'block';
            } else {
                console.error('Stamp element not found:', stampId);
            }
        } else {
            console.error('Invalid mission:', mission);
        }
    }    

    // 엔드 포인트에서 데이터 가져옴 (main.py)
    fetch('/quest_status')
        .then(response => {
            // 예외 발생시킴
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            // 응답 데이터를 json으로 변환
            return response.json();
        })
        // data: 서버에서 반환된 json 객체
        .then(data => {
            // data 객체 안에 status가 존재하는지 확인
            if (data.status) {
                // [미션, 미션 완료 여부]
                for (const [mission, cleared] of Object.entries(data.status)) {
                    // 미션이 완료되면
                    if (cleared === "true") {
                        // 스탬프 찍힘
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


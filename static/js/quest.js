document.addEventListener('DOMContentLoaded', () => {
    // nav
    const backIcon = document.getElementById("backIcon");
    backIcon.addEventListener("click", function() {
    window.location.href = '/home';
    });

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
        const talkImages = document.querySelectorAll('.talk-image');
        talkImages.forEach((img) => {
        const uploadInput = img.nextElementSibling;
        
        // img 누르면 파일 삽입
        img.addEventListener('click', () => {
            if (uploadInput) {
                uploadInput.click();
            }
        });
        
        // uploadInput이 있을 시
        if (uploadInput) {
            // 선택한 파일을 file에 저장
            uploadInput.addEventListener('change', (event) => {
                const file = event.target.files[0];

                // FormData 객체 생성하여 파일 추가
                if (file) {
                    const formData = new FormData();
                    formData.append('file', file);

                    // /upload에 POST 요청 (main.py)
                    fetch('/upload', {
                        method: 'POST',
                        body: formData
                    })
                    // 위 응답을 json으로 파싱
                    .then(response => response.json())
                    
                    .then(data => {
                        // 서버가 성공 응답을 반환하면
                        if (data.success) {
                            // 성공 메시지 표시
                            alert('미션 성공! 퀘스트 달성도를 확인해 보세요.');
                            // 스탬프 이미지 업데이트
                            updateStampImage(uploadInput.id.replace('Upload', ''));
                        } else {
                            // 업로드 실패 시 실패 메시지 표시
                            alert('올바르지 않은 사진이에요. 다시 시도해 주세요.');
                        }
                    })
                    .catch(error => {
                        console.error('업로드 중 오류가 생겼어요:', error);
                        alert('업로드 중 오류가 생겼어요. 다시 시도해 주세요.');
                    });
                }
            });
        }
    });

    // 스탬프 이미지 업데이트 함수
    function updateStampImage(mission) {
        const stampMap = {
            'water': 'water_cleared_stamp',
            'clean': 'clean_cleared_stamp',
            'cooking': 'cooking_cleared_stamp',
            'wash': 'wash_cleared_stamp',
            'bed': 'bed_cleared_stamp'
        };

        // 미션에 해당하는 ID 가져와서 해당 ID 가진 요소 찾음
        const stampId = stampMap[mission];
        if (stampId) {
            const stampElement = document.getElementById(stampId);
            if (stampElement) {

                // 스탬프 표시
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

    // 퀘스트 페이지 로드 시 완료된 미션 스탬프 표시
    fetch('/quest_status')
        .then(response => response.json())
        .then(data => {
            if (data.status) {
                for (const mission in data.status) {
                    if (data.status[mission] === "true") {
                        updateStampImage(mission);
                    }
                }
            }
        })
        .catch(error => {
            console.error('Error fetching quest status:', error);
        });
});

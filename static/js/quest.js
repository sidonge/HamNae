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
        'pills': 'pills_cleared_stamp',
    };

    // 스탬프 이미지 업데이트 함수
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

    // talk 이미지 및 파일 업로드 설정
    const talkImages = document.querySelectorAll('.talk-image');
    talkImages.forEach((img) => {
        const uploadInput = img.nextElementSibling;
        
        img.addEventListener('click', () => {
            if (uploadInput) {
                uploadInput.click();
            }
        });

        if (uploadInput) {
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
                            alert('미션 성공! 퀘스트 달성도를 확인해 보세요.');
                            updateStampImage(uploadInput.id.replace('Upload', ''));
                        } else {
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
            }
        })
        .catch(error => {
            console.error('Error fetching quest status:', error);
        });
});

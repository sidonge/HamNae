document.addEventListener('DOMContentLoaded', () => {
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
                    const mission = uploadInput.id.replace('Upload', '');
                    const stampMap = {
                        'water': 'water_cleared_stamp',
                        'clean': 'broomstick_cleared_stamp',
                        'cooking': 'pot_cleared_stamp',
                        'wash': 'bath_cleared_stamp',
                        'bed': 'meditation_cleared_stamp'
                    };
                    const newFileName = stampMap[mission] + '.' + file.name.split('.').pop(); // 새로운 파일 이름 설정

                    // Blob을 사용하여 새로운 파일 이름으로 FormData에 추가
                    formData.append('file', new File([file], newFileName, { type: file.type }));

                    // /upload에 POST 요청 (main.py)
                    fetch('/upload', {
                        method: 'POST',
                        body: formData
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            alert('미션 성공! 퀘스트 달성도를 확인해 보세요.');
                            localStorage.setItem(`${uploadInput.id.replace('Upload', '')}Cleared`, 'true');
                            updateStampImage(uploadInput.id.replace('Upload', ''), file);
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

    // 스탬프 이미지 업데이트 함수
    function updateStampImage(mission, file) {
        const stampMap = {
            'water': 'water_cleared_stamp',
            'clean': 'broomstick_cleared_stamp',
            'cooking': 'pot_cleared_stamp',
            'wash': 'bath_cleared_stamp',
            'bed': 'meditation_cleared_stamp'
        };

        const stampId = stampMap[mission];
        if (stampId) {
            const stampElement = document.getElementById(stampId);
            if (stampElement) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    stampElement.src = e.target.result;
                };
                reader.readAsDataURL(file);
            } else {
                console.error('Stamp element not found:', stampId);
            }
        } else {
            console.error('Invalid mission:', mission);
        }
    }

    // 모델 뷰어 및 버튼 처리 코드...
});

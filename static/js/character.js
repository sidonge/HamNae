document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.select');

    buttons.forEach(button => {
        button.addEventListener('click', async function() {
            const petId = this.id;

            // 캐릭터 정보 요청
            try {
                const response = await fetch(`/pet_details/${petId}`);
                if (!response.ok) {
                    throw new Error('캐릭터 정보를 가져오는 데 실패했습니다.');
                }

                const data = await response.json();
                // 캐릭터 이름, 설명, GLB 모델 업데이트
                document.getElementById('characterName').textContent = data.name;
                document.getElementById('characterDescription').textContent = data.description;
                
                const modelViewer = document.querySelector('#petModelViewer');
                modelViewer.src = `/static/models/${data.model}`;
            } catch (error) {
                console.error('Error:', error);
                alert('캐릭터 정보를 가져오는 데 오류가 발생했습니다.');
            }
        });
    });
});

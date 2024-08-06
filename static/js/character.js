document.addEventListener('DOMContentLoaded', function() {
    // 요소 선택
    const buttons = document.querySelectorAll('.select');
    const backgroundModel = document.getElementById('backgroundModel');
    const hamModel = document.getElementById('hamModel');
    const leftArrow = document.getElementById('leftArrow');
    const rightArrow = document.getElementById('rightArrow');
    const characterName = document.getElementById('characterName');
    const characterDescription = document.getElementById('characterDescription');
    const purchasePopup = document.getElementById('purchasePopup');
    const confirmPurchase = document.getElementById('confirmPurchase');
    const cancelPurchase = document.getElementById('cancelPurchase');

    let currentIndex = 0; // 현재 캐릭터 인덱스 (초기값 설정)
    const characters = [
        {
            name: '햄깅이',
            description: '햄깅이는 잠이 많은 햄스터예요. 따뜻한 마음씨를 가져서 남을 도와주는 것에 진심이랍니다.',
            model: '../static/models/ham.glb',
            pet_id: 'hamster'
        },
        {
            name: '곰식이',
            description: '곰식이는 진중하고 과묵한 곰이에요. 그만큼 어른스럽고 속이 깊어서 누구나 의지한답니다.',
            model: '../static/models/bearbear.glb',
            pet_id: 'bear'
        },
        {
            name: '교수님',
            description: '교수님은 지혜로운 토끼로서 많은 지식을 가지고 있어요. 생김새와 달리 연륜이 깊답니다.',
            model: '../static/models/rabbitrabbit.glb',
            pet_id: 'rabbit'
        }
    ];

    function updateCharacter() {
        const character = characters[currentIndex];
        characterName.textContent = character.name;
        characterDescription.textContent = character.description;
        hamModel.setAttribute('src', character.model);
    }

    // 시점 조정
    let rotateX = 55; 
    let rotateY = 230; 
    let zoomLevel = 50; 

    function updateRotation() {
        backgroundModel.cameraOrbit = `${rotateY}deg ${rotateX}deg ${zoomLevel}m`;
    }

    updateCharacter();
    updateRotation();

    // 캐릭터 구매
    buttons.forEach(button => {
        button.addEventListener('click', async function() {
            const petId = this.id.replace('select', '');

            if (this.innerHTML.includes('구매하기')) {
                purchasePopup.style.display = 'block';

                const confirmHandler = async () => {
                    try {
                        const response = await fetch('/purchase_pet', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ pet_id: petId }),
                        });

                        const result = await response.json();
                        if (response.ok) {
                            alert(result.message);
                            // 선택된 캐릭터로 현재 인덱스 업데이트
                            currentIndex = characters.findIndex(c => c.pet_id === petId);
                            updateCharacter();
                            location.reload(); // 페이지 새로고침
                        } else {
                            alert(result.detail);
                        }
                    } catch (error) {
                        alert("요청 처리 중 오류가 발생했습니다.");
                    } finally {
                        purchasePopup.style.display = 'none';
                        confirmPurchase.removeEventListener('click', confirmHandler);
                    }
                };

                confirmPurchase.addEventListener('click', confirmHandler);

                const cancelHandler = () => {
                    purchasePopup.style.display = 'none';
                    cancelPurchase.removeEventListener('click', cancelHandler);
                };

                cancelPurchase.addEventListener('click', cancelHandler);
            } else if (this.innerHTML.includes('선택됨&nbsp;<i class="fas fa-check">')) {
                alert('이미 선택된 캐릭터입니다.');
            } else if (this.innerHTML.includes('선택하기')) {
                try {
                    const response = await fetch('/update_main_pet', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ pet_id: petId }),
                    });

                    const result = await response.json();
                    if (response.ok) {
                        alert(result.message);
                        // 선택된 캐릭터로 현재 인덱스 업데이트
                        currentIndex = characters.findIndex(c => c.pet_id === petId);
                        updateCharacter();
                        location.reload(); // 페이지 새로고침
                    } else {
                        alert(result.detail);
                    }
                } catch (error) {
                    alert("요청 처리 중 오류가 발생했습니다.");
                }
            }
        });
    });

    // 화살표 클릭 시 캐릭터 업데이트
    leftArrow.addEventListener('click', () => {
        currentIndex = (currentIndex === 0) ? characters.length - 1 : currentIndex - 1;
        updateCharacter();
    });

    rightArrow.addEventListener('click', () => {
        currentIndex = (currentIndex === characters.length - 1) ? 0 : currentIndex + 1;
        updateCharacter();
    });
});

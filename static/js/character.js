document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.select');
    const backgroundModel = document.getElementById('backgroundModel');
    const characterModel = document.getElementById('characterModel');
    const leftArrow = document.getElementById('leftArrow');
    const rightArrow = document.getElementById('rightArrow');
    const characterName = document.getElementById('characterName');
    const characterDescription = document.getElementById('characterDescription');
    const purchasePopup = document.getElementById('purchasePopup');
    const confirmPurchase = document.getElementById('confirmPurchase');
    const cancelPurchase = document.getElementById('cancelPurchase');

    let characters = [];
    let currentIndex = 0;

    async function fetchCharacters() {
        try {
            const response = await fetch('/api/characters');  // Adjust the endpoint as needed
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            characters = data.characters;  // Ensure that your endpoint returns this structure
            updateCharacter();
        } catch (error) {
            console.error('Error fetching characters:', error);
        }
    }

    function updateCharacter() {
        const character = characters[currentIndex];
        characterName.textContent = character.name;
        characterDescription.textContent = character.description;
        characterModel.src = `../static/${character.model}`;
    
        buttons.forEach(button => {
            button.innerHTML = '선택하기';
            button.style.backgroundColor = ''; // 초기화
        });
    
        const selectedButton = document.getElementById(`select${character.pet_id}`);
        if (selectedButton) {
            selectedButton.innerHTML = '선택됨&nbsp;<i class="fas fa-check"></i>';
            selectedButton.style.backgroundColor = '#D2BEA1';
        }
    }
    
    fetchCharacters();

    let rotateX = 55; 
    let rotateY = 230; 
    let zoomLevel = 50; 

    function updateRotation() {
        backgroundModel.cameraOrbit = `${rotateY}deg ${rotateX}deg ${zoomLevel}m`;
    }
    updateRotation();

    async function fetchCharacterInfo(characterId) {
        try {
            const response = await fetch(`/api/character/${characterId}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();

            characterName.textContent = data.name;
            characterDescription.textContent = data.description;
            characterModel.src = `../static/${data.model_path}`;
            
            buttons.forEach(button => {
                if (button.id === `select${characterId}`) {
                    button.innerHTML = "선택됨&nbsp;<i class='fas fa-check'></i>";
                    button.style.backgroundColor = '#D2BEA1';
                } else {
                    button.innerHTML = "선택하기";
                    button.style.backgroundColor = '';
                }
            });
        } catch (error) {
            console.error('Error fetching character info:', error);
        }
    }

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
                            currentIndex = characters.findIndex(c => c.pet_id === petId);
                            updateCharacter();
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
                        location.reload();
                    } else {
                        alert(result.detail);
                    }
                } catch (error) {
                    alert("요청 처리 중 오류가 발생했습니다.");
                }
            }
        });
    });

    leftArrow.addEventListener('click', () => {
        currentIndex = (currentIndex === 0) ? characters.length - 1 : currentIndex - 1;
        updateCharacter();
    });

    rightArrow.addEventListener('click', () => {
        currentIndex = (currentIndex === characters.length - 1) ? 0 : currentIndex + 1;
        updateCharacter();
    });
});

document.addEventListener('DOMContentLoaded', () => {
    // 요소 선택
    const backgroundModel = document.getElementById('backgroundModel');
    const hamModel = document.getElementById('hamModel');
    const leftArrow = document.getElementById('leftArrow');
    const rightArrow = document.getElementById('rightArrow');
    const characterName = document.getElementById('characterName');
    const characterDescription = document.getElementById('characterDescription');
    const hamgingOption = document.getElementById('hamgingOption');
    const dongsikOption = document.getElementById('dongsikOption');
    const professorOption = document.getElementById('professorOption');
    const purchasePopup = document.getElementById('purchasePopup');
    const confirmPurchase = document.getElementById('confirmPurchase');
    const cancelPurchase = document.getElementById('cancelPurchase');
    const coinAmount = document.getElementById('coinAmount');

    // 캐릭터 데이터
    const characters = [
        {
            name: '햄깅이',
            description: '햄깅이는 잠이 많은 햄스터예요. 따뜻한 마음씨를 가져서 남을 도와주는 것에 진심이랍니다.',
            model: '../static/models/ham.glb',
            pet_id: 'hamster'
        },
        {
            name: '곰식이',
            description: '동식이는 진중하고 과묵한 곰이에요. 그만큼 어른스럽고 속이 깊어서 누구나 의지한답니다.',
            model: '../static/models/bearbear.glb',
            pet_id: 'bear'
        },
        {
            name: '교수님',
            description: '교수님은 지혜로운 토끼로서 많은 지식을 가지고 있어요. 생김새와 달리 연륜이 깊답니다.',
            model: '../static/models/whiterabbit.glb',
            pet_id: 'rabbit'
        }
    ];

    let currentIndex = 0;
    let purchasedCharacterIndex = null; // 구매된 캐릭터 인덱스
    let pendingPurchaseIndex = null; // 구매 대기 중인 캐릭터 인덱스

    // 캐릭터 업데이트 함수
    function updateCharacter() {
        const character = characters[currentIndex];
        characterName.textContent = character.name;
        characterDescription.textContent = character.description;

        // 현재 인덱스에 맞는 모델 업데이트
        hamModel.setAttribute('src', character.model);

        // 버튼 상태 업데이트
        updateButtonStates();
    }

    // 버튼 상태 업데이트 함수
    function updateButtonStates() {
        const options = [hamgingOption, dongsikOption, professorOption];
        
        options.forEach((option, index) => {
            const button = option.querySelector('.select');
            option.classList.remove('selected');
            button.textContent = (index === currentIndex) ? '선택됨' : (index === 2 && purchasedCharacterIndex !== 2) ? '구매하기' : '선택하기';
            button.style.backgroundColor = (index === currentIndex || (index === 2 && purchasedCharacterIndex === 2)) ? '#D2BEA1' : '#A88756';
            button.style.color = '#070000';
            if (index === currentIndex) {
                option.classList.add('selected');
            }
        });
    }

    // 구매 팝업 표시 함수
    function showPurchasePopup(index) {
        pendingPurchaseIndex = index;
        purchasePopup.style.display = 'flex'; // 구매 팝업 표시
    }

    function handlePurchase() {
        if (pendingPurchaseIndex === null) return;
    
        fetch('/get_user_id')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch user ID');
            }
            return response.json();
        })
        .then(data => {
            if (!data || !data.user_id) {
                throw new Error('Invalid user ID response');
            }
            let currentUserId = data.user_id;
            if (pendingPurchaseIndex !== null && characters[pendingPurchaseIndex]) {
                return fetch('/manage_character', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        user_id: currentUserId,
                        pet_id: characters[pendingPurchaseIndex].pet_id,
                        action: 'purchase' // 구매 액션
                    })
                });
            } else {
                throw new Error('Invalid character index');
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Server responded with an error');
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                console.error('Error:', data.error);
                alert('문제가 발생했습니다. 서버 로그를 확인하세요.');
            } else {
                console.log('Character purchased successfully');
                coinAmount.textContent = `${data.coin_balance}`;
                purchasedCharacterIndex = pendingPurchaseIndex; // 구매한 캐릭터 인덱스 업데이트
                purchasePopup.style.display = 'none';
                updateCharacter();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('문제가 발생했습니다. 서버 로그를 확인하세요.');
        });
    }
    
    // 캐릭터 선택 함수
    function selectCharacter(index) {
        currentIndex = index;
        updateCharacter();

        fetch('/get_user_id')
            .then(response => response.json())
            .then(data => {
                const currentUserId = data.user_id;
                return fetch('/manage_character', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        user_id: currentUserId,
                        pet_id: characters[currentIndex].pet_id,
                        action: 'select' // 선택 액션
                    })
                });
            })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    return response.text().then(text => {
                        throw new Error(`Server error: ${text}`);
                    });
                }
            })
            .then(data => {
                if (data.detail) {
                    console.error('Error:', data.detail);
                } else {
                    console.log('Character selected successfully');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('문제가 발생했습니다. 서버 로그를 확인하세요.');
            });
    }

    // 버튼 클릭 이벤트 리스너 설정
    hamgingOption.addEventListener('click', () => selectCharacter(0));
    dongsikOption.addEventListener('click', () => selectCharacter(1));
    professorOption.addEventListener('click', () => {
        if (purchasedCharacterIndex === 2) {
            selectCharacter(2);
        } else {
            currentIndex = 2;
            showPurchasePopup(currentIndex);
        }
    });

    // 좌우 화살표 버튼 이벤트 리스너 설정
    leftArrow.addEventListener('click', () => {
        currentIndex = (currentIndex === 0) ? characters.length - 1 : currentIndex - 1;
        updateCharacter();
    });

    rightArrow.addEventListener('click', () => {
        currentIndex = (currentIndex === characters.length - 1) ? 0 : currentIndex + 1;
        updateCharacter();
    });

    // 구매 팝업의 취소 및 확인 버튼 이벤트 리스너 설정
    cancelPurchase.addEventListener('click', () => {
        purchasePopup.style.display = 'none';
    });

    confirmPurchase.addEventListener('click', handlePurchase);

    // 3D 모델 회전 및 확대/축소 관련 변수
    let rotateX = 55; 
    let rotateY = 230; 
    let zoomLevel = 50; 

    function updateRotation() {
        backgroundModel.cameraOrbit = `${rotateY}deg ${rotateX}deg ${zoomLevel}m`;
    }

    backgroundModel.style.transform = 'translateY(4rem)';

    updateRotation();
    updateCharacter();
});

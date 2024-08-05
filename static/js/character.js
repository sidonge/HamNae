document.addEventListener('DOMContentLoaded', () => {
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
    let userCoinBalance = 0; // 사용자의 현재 코인 잔액
    let currentUserId = null; // 현재 사용자 ID

    // 캐릭터 정보 업데이트
    function updateCharacter() {
        const character = characters[currentIndex];
        characterName.textContent = character.name;
        characterDescription.textContent = character.description;
    
        // 모델 및 이미지 초기화
        hamModel.setAttribute('src', character.model);
        document.querySelector('#hamgingOption .hamImg').src = '../static/image/ham1.png';
        document.querySelector('#dongsikOption .hamImg').src = '../static/image/ham2.png';
        document.querySelector('#professorOption .hamImg').src = '../static/image/ham3.png';
    
        // 버튼 초기화
        hamgingOption.querySelector('.select').textContent = '선택하기';
        dongsikOption.querySelector('.select').textContent = '선택하기';
        professorOption.querySelector('.select').textContent = '구매하기';
        professorOption.querySelector('.select').style.backgroundColor = '#A88756';
    
        // professorOption의 경우, 소유 여부 및 코인 잔액에 따라 표시 내용 변경
        if (purchasedCharacterIndex === 2 || userCoinBalance >= 200) {
            professorOption.querySelector('.select').textContent = '선택하기';
            professorOption.querySelector('.select').style.backgroundColor = '#F5EED1';
            if (purchasedCharacterIndex === 2) {
                hamModel.setAttribute('src', '../static/models/whiterabbit.glb');
                document.querySelector('#professorOption .hamImg').src = '../static/image/ham4.png'; // 이미지 업데이트
            } else {
                hamModel.setAttribute('src', '../static/models/whiterabbit.glb');
                document.querySelector('#professorOption .hamImg').src = '../static/image/ham3.png'; // 구매 전 이미지
            }
        }
    
        // 선택된 상태 초기화
        hamgingOption.classList.remove('selected');
        dongsikOption.classList.remove('selected');
        professorOption.classList.remove('selected');
    
        // 현재 캐릭터 선택 표시
        if (currentIndex === 0) {
            hamgingOption.querySelector('.select').innerHTML = '선택됨&nbsp;<i class="fas fa-check"></i>';
            hamgingOption.classList.add('selected');
        } else if (currentIndex === 1) {
            dongsikOption.querySelector('.select').innerHTML = '선택됨&nbsp;<i class="fas fa-check"></i>';
            dongsikOption.classList.add('selected');
        } else if (currentIndex === 2) {
            if (purchasedCharacterIndex === 2 || userCoinBalance >= 200) {
                professorOption.querySelector('.select').innerHTML = '선택됨&nbsp;<i class="fas fa-check"></i>';
                professorOption.classList.add('selected');
                professorOption.querySelector('.select').style.backgroundColor = '#D2BEA1';
                hamModel.setAttribute('src', '../static/models/whiterabbit.glb'); // 선택된 캐릭터 모델 업데이트
                document.querySelector('#professorOption .hamImg').src = '../static/image/ham4.png'; // 이미지 업데이트
            }
        }
    }
    
    // 구매 팝업 표시
    function showPurchasePopup(index) {
        pendingPurchaseIndex = index;
        purchasePopup.style.display = 'flex';
    }

    // 구매 처리
    function handlePurchase() {
        if (pendingPurchaseIndex === null || currentUserId === null) return;

        fetch('/manage_character', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: currentUserId,
                pet_id: characters[pendingPurchaseIndex].pet_id,
                action: 'purchase' // 구매 액션
            })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    console.error('Server error:', err);
                    throw new Error(`Server error: ${response.status}`);
                });
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
                purchasedCharacterIndex = pendingPurchaseIndex;
                userCoinBalance = data.coin_balance; // 잔액 업데이트
                purchasePopup.style.display = 'none';
                updateCharacter();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('문제가 발생했습니다. 서버 로그를 확인하세요.');
        });
    }

    // 캐릭터 선택 처리
    function selectCharacter(index) {
        currentIndex = index;
        updateCharacter();

        if (currentUserId === null) return;

        fetch('/manage_character', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: currentUserId,
                pet_id: characters[currentIndex].pet_id,
                action: 'select' // 선택 액션
            })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    console.error('Server error:', err);
                    throw new Error(`Server error: ${response.status}`);
                });
            }
            return response.json();
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

    // 캐릭터 선택 버튼 이벤트 리스너 설정
    hamgingOption.addEventListener('click', () => selectCharacter(0));
    dongsikOption.addEventListener('click', () => selectCharacter(1));
    professorOption.addEventListener('click', () => {
        if (purchasedCharacterIndex === 2 || userCoinBalance >= 200) {
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

    // 페이지 로드 시 초기 상태 설정
    fetch('/get_user_id')
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch user ID');
            return response.json();
        })
        .then(data => {
            currentUserId = data.user_id; // currentUserId를 여기에 정의
            return fetch('/get_owned_characters', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id: currentUserId })
            });
        })
        .then(response => {
            if (!response.ok) {
                console.error('Error fetching owned characters');
                return;
            }
            return response.json();
        })
        .then(data => {
            if (data && data.ownedCharacters) {
                const ownedCharacters = data.ownedCharacters;
                if (ownedCharacters.includes('rabbit')) {
                    purchasedCharacterIndex = 2;
                }
            }
        })
        .then(() => {
            return fetch('/get_coin_balance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id: currentUserId })
            });
        })
        .then(response => {
            if (!response.ok) {
                console.error('Error fetching coin balance');
                return;
            }
            return response.json();
        })
        .then(data => {
            if (data && data.coin_balance !== undefined) {
                userCoinBalance = data.coin_balance;
                coinAmount.textContent = `${userCoinBalance}`;
            }
            updateCharacter();
        })
        .catch(error => {
            console.error('Error:', error);
        });

    updateRotation();
    updateCharacter();
});

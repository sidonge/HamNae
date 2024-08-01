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
    const purchaseButton = document.getElementById('purchaseButton');

    const characters = [
        {
            name: '햄깅이',
            description: '햄깅이는 잠이 많은 햄스터예요. 따뜻한 마음씨를 가져서 남을 도와주는 것에 진심이랍니다.',
            model: '../static/models/ham.glb'
        },
        {
            name: '곰식이',
            description: '동식이는 진중하고 과묵한 곰이에요. 그만큼 어른스럽고 속이 깊어서 누구나 의지한답니다.',
            model: '../static/models/bear.glb'
        },
        {
            name: '교수님',
            description: '교수님은 지혜로운 토끼로서 많은 지식을 가지고 있어요. 생김새와 달리 연륜이 깊답니다.',
            model: '../static/models/rabbit.glb'
        }
    ];

    let currentIndex = 0;
    let purchasedCharacterIndex = null; // 구매된 캐릭터의 인덱스
    let pendingPurchaseIndex = null; // 현재 구매 대기 중인 캐릭터의 인덱스

    function updateCharacter() {
        const character = characters[currentIndex];
        characterName.textContent = character.name;
        characterDescription.textContent = character.description;
    
        // 모델 뷰어 소스 업데이트
        if (currentIndex === 2 && purchasedCharacterIndex === 2) {
            // 교수님 캐릭터가 선택된 상태이고, 이미 구매한 경우
            hamModel.setAttribute('src', '../static/models/rabbitblack.glb');
        } else {
            // 현재 선택된 캐릭터에 맞는 모델을 설정
            hamModel.setAttribute('src', character.model);
        }
    
        // 모든 선택 옵션의 초기화
        hamgingOption.querySelector('.select').textContent = '선택하기';
        dongsikOption.querySelector('.select').textContent = '선택하기';
        professorOption.querySelector('.select').textContent = purchasedCharacterIndex === 2 ? '선택하기' : '구매하기';
    
        // 초기 상태 설정
        hamgingOption.classList.remove('selected');
        dongsikOption.classList.remove('selected');
        professorOption.classList.remove('selected');
        
        // 구매 상태와 선택 상태에 따른 배경색 설정
        if (purchasedCharacterIndex === 2) {
            professorOption.querySelector('.select').style.backgroundColor = '#F5EED1'; // '선택하기' 색상
        } else {
            professorOption.querySelector('.select').style.backgroundColor = '#A88756'; // '구매하기' 색상
        }
        professorOption.querySelector('.select').style.color = '#070000'; // 텍스트 색상 설정
    
        // 현재 선택된 캐릭터에 대한 선택 상태 적용
        if (currentIndex === 0) {
            hamgingOption.querySelector('.select').innerHTML = '선택됨&nbsp;<i class="fas fa-check"></i>';
            hamgingOption.classList.add('selected');
        } else if (currentIndex === 1) {
            dongsikOption.querySelector('.select').innerHTML = '선택됨&nbsp;<i class="fas fa-check"></i>';
            dongsikOption.classList.add('selected');
        } else if (currentIndex === 2) {
            if (purchasedCharacterIndex === 2) {
                professorOption.querySelector('.select').innerHTML = '선택됨&nbsp;<i class="fas fa-check"></i>';
                professorOption.classList.add('selected');
                professorOption.querySelector('.select').style.backgroundColor = '#D2BEA1'; // '선택됨' 색상
            } else {
                professorOption.querySelector('.select').innerHTML = '구매하기';
                professorOption.querySelector('.select').style.backgroundColor = '#A88756'; // '구매하기' 색상
            }
            document.querySelector('#professorOption .hamImg').src = '../static/image/ham4.png';
        }
    }
    

    function showPurchasePopup(index) {
        pendingPurchaseIndex = index;
        purchasePopup.style.display = 'flex'; // 팝업 표시
    }

    function handlePurchase() {
        purchasedCharacterIndex = pendingPurchaseIndex; // 구매된 캐릭터의 인덱스를 저장
        purchasePopup.style.display = 'none'; // 팝업 숨기기
    
        // 교수님 캐릭터 구매 후 모델 뷰어 설정
        if (purchasedCharacterIndex === 2) {
            hamModel.setAttribute('src', '../static/models/rabbitblack.glb'); // rabbitblack으로 변경
        }
    
        updateCharacter(); // 캐릭터 상태 업데이트
    }
    

    hamgingOption.addEventListener('click', () => {
        currentIndex = 0;
        updateCharacter();
    });

    dongsikOption.addEventListener('click', () => {
        currentIndex = 1;
        updateCharacter();
    });

    professorOption.addEventListener('click', () => {
        if (purchasedCharacterIndex === 2) {
            // 이미 구매한 캐릭터인 경우, 선택 상태로 변경
            currentIndex = 2;
            updateCharacter();
        } else {
            // 구매 대기 중인 캐릭터인 경우, 팝업 표시
            currentIndex = 2;
            showPurchasePopup(currentIndex); // 구매 대기 중인 캐릭터의 인덱스 저장 및 팝업 표시
        }
    });

    leftArrow.addEventListener('click', () => {
        currentIndex = (currentIndex === 0) ? characters.length - 1 : currentIndex - 1;
        updateCharacter();
    });

    rightArrow.addEventListener('click', () => {
        currentIndex = (currentIndex === characters.length - 1) ? 0 : currentIndex + 1;
        updateCharacter();
    });

    // 팝업 취소 버튼 클릭 시 팝업 숨기기
    cancelPurchase.addEventListener('click', () => {
        purchasePopup.style.display = 'none';
    });

    // 팝업 확인 버튼 클릭 시 구매 처리
    confirmPurchase.addEventListener('click', handlePurchase);

    // 모델 뷰어 조정
    // 초기 카메라 설정
    let rotateX = 55; // 세로 각도
    let rotateY = 230; // 가로 각도
    let zoomLevel = 50; // 확대 비율

    function updateRotation() {
        backgroundModel.cameraOrbit = `${rotateY}deg ${rotateX}deg ${zoomLevel}m`;
    }

    // 시점 조정
    backgroundModel.style.transform = 'translateY(4rem)';

    updateRotation();
    updateCharacter();
});

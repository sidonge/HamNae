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

    const characters = [
        {
            name: '햄깅이',
            description: '햄깅이는 잠이 많은 햄스터예요. 따뜻한 마음씨를 가져서 남을 도와주는 것에 누구보다 진심이랍니다.',
            model: '../static/models/ham.glb'
        },
        {
            name: '곰식이',
            description: '동식이는 항상 활기차고 친구들을 잘 챙기는 곰이에요.',
            model: '../static/models/bear.glb'
        },
        {
            name: '교수님',
            description: '교수님은 지혜로운 토끼로서 많은 지식을 가지고 있어요.',
            model: '../static/models/rabbit.glb'
        }
    ];

    let currentIndex = 0;

    function updateCharacter() {
        const character = characters[currentIndex];
        characterName.textContent = character.name;
        characterDescription.textContent = character.description;
        hamModel.setAttribute('src', character.model);
        
        // 모든 선택 옵션의 초기화
        hamgingOption.querySelector('.select').innerHTML = '선택하기';
        dongsikOption.querySelector('.select').innerHTML = '선택하기';
        professorOption.querySelector('.select').innerHTML = '구매하기';
        
        hamgingOption.classList.remove('selected');
        dongsikOption.classList.remove('selected');
        professorOption.classList.remove('selected');
        
        // 현재 선택된 캐릭터에 대한 선택 상태 적용
        if (currentIndex === 0) {
            hamgingOption.querySelector('.select').innerHTML = '선택됨&nbsp;<i class="fas fa-check"></i>';
            hamgingOption.classList.add('selected');
        } else if (currentIndex === 1) {
            dongsikOption.querySelector('.select').innerHTML = '선택됨&nbsp;<i class="fas fa-check"></i>';
            dongsikOption.classList.add('selected');
        } else if (currentIndex === 2) {
            professorOption.querySelector('.select').innerHTML = '선택됨&nbsp;<i class="fas fa-check"></i>';
            professorOption.classList.add('selected');
        }
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
        currentIndex = 2;
        updateCharacter();
    });

    leftArrow.addEventListener('click', () => {
        currentIndex = (currentIndex === 0) ? characters.length - 1 : currentIndex - 1;
        updateCharacter();
    });

    rightArrow.addEventListener('click', () => {
        currentIndex = (currentIndex === characters.length - 1) ? 0 : currentIndex + 1;
        updateCharacter();
    });

    // 초기 카메라 설정
    let rotateX = 65; // 세로 각도
    let rotateY = 230; // 가로 각도
    let zoomLevel = 50; // 확대 비율

    function updateRotation() {
        backgroundModel.cameraOrbit = `${rotateY}deg ${rotateX}deg ${zoomLevel}m`;
    }

    // 시점 조정
    backgroundModel.style.transform = 'translateY(1rem)';

    updateRotation();
    updateCharacter();
});
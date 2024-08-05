// 카카오 JavaScript SDK 초기화
// Kakao.init('c5c12a3803eb52af28d1041cecbf7d2f');

// // 사용자 정의 이미지 버튼 클릭 이벤트 추가
// document.getElementById('kakaoBtn').addEventListener('click', function() {
//     // 카카오 로그인 실행
//     Kakao.Auth.login({
//         // 로그인 성공 시 호출되는 함수
//         success: function(authObj) {
//             // 로그인 인증 객체를 콘솔에 출력
//             console.log(authObj);

//             // 로그인 성공 시 사용자 정보 요청
//             Kakao.API.request({
//                 url: '/v2/user/me',
//                 // 사용자 정보 요청 성공 시 호출되는 함수
//                 success: function(res) {
//                     // 사용자 정보를 콘솔에 출력
//                     console.log(res);
//                     // 사용자 정보를 활용한 로직 추가
//                 },
//                 // 사용자 정보 요청 실패 시 호출되는 함수
//                 fail: function(error) {
//                     // 에러 정보를 콘솔에 출력
//                     console.log(error);
//                 }
//             });
//         },
//         // 로그인 실패 시 호출되는 함수
//         fail: function(err) {
//             // 에러 정보를 콘솔에 출력
//             console.log(err);
//         }
//     });
// });

// 로그인 버튼 클릭 이벤트
document.getElementById('kakaoBtn').addEventListener('click', function() {
    Kakao.Auth.login({
        success: function(authObj) {
            console.log('로그인 성공:', authObj);

            // 로그인 후 액세스 토큰을 통해 사용자 정보를 요청합니다.
            getUserInfo(authObj.access_token);
        },
        fail: function(err) {
            console.error('로그인 실패:', err);
        }
    });
});

// 사용자 정보 요청 함수
function getUserInfo(accessToken) {
    Kakao.API.request({
        url: '/v2/user/me',
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    })
    .then(function(response) {
        console.log('사용자 정보:', response);
    })
    .catch(function(error) {
        console.error('사용자 정보 요청 오류:', error);
    });
}

// 네이버 로그인 객체 초기화
var naver_id_login = new naver_id_login("k6pg43rTvvd3bJOH0bcB", "http://127.0.0.1:5500/templates/home.html");

// 고유 상태 값 생성
var state = naver_id_login.getUniqState();
    
// 로그인 도메인 설정
naver_id_login.setDomain("http://127.0.0.1:5500/templates/login.html");

// 상태 값 설정
naver_id_login.setState(state);

// 팝업 방식으로 로그인 설정
naver_id_login.setPopup();

// 네이버 로그인 초기화
naver_id_login.init_naver_id_login();

// 네이버 로그인 버튼 클릭 이벤트 추가
document.getElementById('naverBtn').addEventListener('click', function() {
    // 네이버 로그인 초기화
    naver_id_login.init_naver_id_login();
    // 숨겨진 기존 네이버 로그인 버튼 클릭
    document.getElementById('naver_id_login').firstChild.click();
});

// 구글 로그인 성공 시 호출되는 함수
function onSignIn(googleUser) {
    // 사용자의 프로필 정보를 가져옴
    var profile = googleUser.getBasicProfile();
    // 사용자의 ID를 콘솔에 출력
    console.log('ID: ' + profile.getId());
    // 사용자의 이름을 콘솔에 출력
    console.log('Name: ' + profile.getName());
    // 사용자의 프로필 이미지 URL을 콘솔에 출력
    console.log('Image URL: ' + profile.getImageUrl());
    // 사용자의 이메일을 콘솔에 출력
    console.log('Email: ' + profile.getEmail());
}

// 구글 로그인 버튼 클릭 이벤트 추가
document.getElementById('googleBtn').addEventListener('click', function() {
    // 숨겨진 기존 구글 로그인 버튼 클릭
    document.querySelector('.g-signin2').firstChild.click();
});


//팝업
document.addEventListener('DOMContentLoaded', function() {
    const errorMessage = document.getElementById('error-message').textContent.trim();
    if (errorMessage) {
        alert("아이디 또는 비밀번호가 잘못되었습니다. 정확히 입력해주세요.");
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', function(event) {
        event.preventDefault(); // 폼 제출 방지

        const formData = new FormData(loginForm);
        fetch('/auth/login', {
            method: 'POST',
            body: new URLSearchParams(formData)
        })
        .then(response => {
            if (response.ok) {
                return response.json(); // 로그인 성공 시 JSON 응답 처리
            } else {
                return response.text().then(text => { throw new Error(text) }); // 로그인 실패 시 텍스트 응답 처리
            }
        })
        .then(data => {
            window.location.href = data.redirect; // 성공 시 페이지 이동
        })
        .catch(error => {
            alert('아이디 또는 비밀번호가 잘못되었습니다.'); // 실패 시 알림
        });
    });
});


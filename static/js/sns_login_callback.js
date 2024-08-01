var naver_id_login = new naver_id_login("k6pg43rTvvd3bJOH0bcB", "http://127.0.0.1:5500/templates/home.html");

// 접근 토큰 값 출력
alert(naver_id_login.oauthParams.access_token);

// 네이버 사용자 프로필 조회
naver_id_login.get_naver_userprofile("naverSignInCallback()");

// 네이버 사용자 프로필 조회 이후 프로필 정보를 처리할 callback function
function naverSignInCallback() {
    alert(naver_id_login.getProfileData('email'));
    alert(naver_id_login.getProfileData('nickname'));
    alert(naver_id_login.getProfileData('age'));
}
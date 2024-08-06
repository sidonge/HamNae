// // 카카오 JavaScript SDK 초기화
// Kakao.init('c5c12a3803eb52af28d1041cecbf7d2f');  // 앱 키를 실제 값으로 교체하세요

// // 카카오 로그인 버튼 클릭 이벤트
// document.getElementById('kakaoBtn').addEventListener('click', function() {
//     Kakao.Auth.login({
//         success: function(authObj) {
//             Kakao.API.request({
//                 url: '/v2/user/me',
//                 success: function(res) {
//                     const userData = {
//                         provider: 'kakao',
//                         access_token: authObj.access_token,
//                         id: res.id,
//                         name: res.properties.nickname,
//                         email: res.kakao_account.email,
//                         tel: res.kakao_account.phone_number || ''
//                     };
//                     fetch('/auth/social-login', {
//                         method: 'POST',
//                         headers: {
//                             'Content-Type': 'application/json'
//                         },
//                         body: JSON.stringify(userData)
//                     })
//                     .then(response => response.json())
//                     .then(data => {
//                         if (data.session_id) {
//                             document.cookie = `session_id=${data.session_id}; path=/`;
//                             window.location.href = '/garden.html';
//                         } else {
//                             alert('로그인 실패');
//                         }
//                     })
//                     .catch(error => console.error('Error:', error));
//                 },
//                 fail: function(error) {
//                     console.log(error);
//                 }
//             });
//         },
//         fail: function(err) {
//             console.log(err);
//         }
//     });
// });

// // 네이버 로그인 객체 초기화
// var naver_id_login = new naver_id_login("YOUR_NAVER_CLIENT_ID", "YOUR_REDIRECT_URL");

// // 네이버 로그인 버튼 클릭 이벤트
// document.getElementById('naverBtn').addEventListener('click', function() {
//     naver_id_login.getLoginStatus(function(status) {
//         if (status) {
//             const accessToken = naver_id_login.getAccessToken();
//             fetch('https://openapi.naver.com/v1/nid/me', {
//                 headers: {
//                     'Authorization': `Bearer ${accessToken}`
//                 }
//             })
//             .then(response => response.json())
//             .then(userInfo => {
//                 const userData = {
//                     provider: 'naver',
//                     access_token: accessToken,
//                     id: userInfo.response.id,
//                     name: userInfo.response.name,
//                     email: userInfo.response.email,
//                     tel: userInfo.response.mobile || ''
//                 };
//                 return fetch('/auth/social-login', {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json'
//                     },
//                     body: JSON.stringify(userData)
//                 });
//             })
//             .then(response => response.json())
//             .then(data => {
//                 if (data.session_id) {
//                     document.cookie = `session_id=${data.session_id}; path=/`;
//                     window.location.href = '/garden.html';
//                 } else {
//                     alert('로그인 실패');
//                 }
//             })
//             .catch(error => console.error('Error:', error));
//         }
//     });
// });

// // 구글 로그인 버튼 클릭 이벤트
// document.getElementById('googleBtn').addEventListener('click', function() {
//     gapi.auth2.getAuthInstance().signIn().then(function(googleUser) {
//         const id_token = googleUser.getAuthResponse().id_token;
//         gapi.client.request({
//             path: 'https://www.googleapis.com/oauth2/v3/userinfo',
//             headers: {
//                 'Authorization': `Bearer ${id_token}`
//             }
//         })
//         .then(response => response.json())
//         .then(userInfo => {
//             const userData = {
//                 provider: 'google',
//                 access_token: id_token,
//                 id: userInfo.sub,
//                 name: userInfo.name,
//                 email: userInfo.email,
//                 tel: userInfo.phone_number || ''
//             };
//             return fetch('/auth/social-login', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify(userData)
//             });
//         })
//         .then(response => response.json())
//         .then(data => {
//             if (data.session_id) {
//                 document.cookie = `session_id=${data.session_id}; path=/`;
//                 window.location.href = '/garden.html';
//             } else {
//                 alert('로그인 실패');
//             }
//         })
//         .catch(error => console.error('Error:', error));
//     });
// });

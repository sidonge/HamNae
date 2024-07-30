document.addEventListener('DOMContentLoaded', () => {
    // HTML localStorage에 저장
    const pageContent = document.documentElement.outerHTML;
    localStorage.setItem('pageContent', pageContent);

    const menuIcon = document.getElementById('menuIcon');
    const navPopup = document.getElementById('navPopup');
    const exitIcon = document.getElementById('exitIcon');

    // 메뉴 클릭하면 nav-popup 보이게 + menuIcon 안 보이게
    menuIcon.addEventListener('click', () => {
        navPopup.style.display = 'block';
        menuIcon.style.display = 'none';
    });

    // 반대
    exitIcon.addEventListener('click', () => {
        navPopup.style.display = 'none';
        menuIcon.style.display = 'block';
    });
});


// map
// Google Maps JavaScript API 로드
(g => {
var h, a, k, p = "The Google Maps JavaScript API", c = "google", l = "importLibrary", q = "__ib__", m = document, b = window;
b = b[c] || (b[c] = {});
var d = b.maps || (b.maps = {}), r = new Set, e = new URLSearchParams, u = () => h || (h = new Promise(async (f, n) => {
 await (a = m.createElement("script"));
 e.set("libraries", [...r] + "");
 for (k in g) e.set(k.replace(/[A-Z]/g, t => "_" + t[0].toLowerCase()), g[k]);
 e.set("callback", c + ".maps." + q);
 a.src = `https://maps.${c}apis.com/maps/api/js?` + e;
 d[q] = f;
 a.onerror = () => h = n(Error(p + " could not load."));
 a.nonce = m.querySelector("script[nonce]")?.nonce || "";
 m.head.append(a);
}));
d[l] ? console.warn(p + " only loads once. Ignoring:", g) : d[l] = (f, ...n) => r.add(f) && u().then(() => d[l](f, ...n));
})({
key: "AIzaSyCV6OQ0G89dNO462N0TyT-bsBKaLtu3hm8", // API key 입력
v: "weekly",  // 버전 3.47 이상
libraries: "places"
});

let map, infoWindow, currentLocationMarker, homeMarker, convenienceMarkers = [], parkMarkers = [];
let parksSearchRadius = 1000; // 공원 검색 반경 설정 (미터 단위)

// 위치 오류 처리
function handleLocationError(browserHasGeolocation, pos) {
infoWindow.setPosition(pos);
infoWindow.setContent(
 browserHasGeolocation
     ? "Error: The Geolocation service failed."
     : "Error: Your browser doesn't support geolocation."
);
infoWindow.open(map);
}

// 편의점 마커 제거 함수
function clearConvenienceStores() {
convenienceMarkers.forEach(marker => marker.setMap(null));
convenienceMarkers = [];
}

// 공원 마커 제거 함수
function clearParks() {
parkMarkers.forEach(marker => marker.setMap(null));
parkMarkers = [];
}

// 편의점 검색 함수
function searchConvenienceStores() {
const request = {
 location: map.getCenter(),
 radius: '1000', // 반경 설정
 type: ['convenience_store']
};
const service = new google.maps.places.PlacesService(map);

service.nearbySearch(request, (results, status) => {
 if (status === google.maps.places.PlacesServiceStatus.OK) {
     clearConvenienceStores();
     results.forEach((place) => {
         const marker = new google.maps.Marker({
             position: place.geometry.location,
             map: map,
             title: place.name,
             icon: '/static/image/location_key.png'
         });
         convenienceMarkers.push(marker);
     });
 }
});
}

// 공원 검색 함수
function searchParks() {
const request = {
 location: map.getCenter(),
 radius: parksSearchRadius,
 type: ['park']
};
const service = new google.maps.places.PlacesService(map);

service.nearbySearch(request, (results, status) => {
 if (status === google.maps.places.PlacesServiceStatus.OK) {
     clearParks();
     results.forEach((place) => {
         const marker = new google.maps.Marker({
             position: place.geometry.location,
             map: map,
             title: place.name
         });
         parkMarkers.push(marker);
     });
 }
});
}

// 지도 초기화 함수
async function initMap() {
const { Map, Marker, PlacesService } = await google.maps.importLibrary("maps");

// 지도 설정
map = new google.maps.Map(document.getElementById('map'), {
 center: { lat: 35.1694282, lng: 128.0603057 },
 zoom: 18,
 minZoom: 15,
 maxZoom: 20,
 mapId: '871c544b9ad947b5',
 streetViewControl: false,
 mapTypeControl: false,
});

infoWindow = new google.maps.InfoWindow();

// 현재 위치 버튼 설정
const setLocationButton = document.getElementById('setLocation');
setLocationButton.addEventListener("click", () => {
 if (navigator.geolocation) {
     navigator.geolocation.getCurrentPosition(
         (position) => {
             const pos = {
                 lat: position.coords.latitude,
                 lng: position.coords.longitude,
             };

             // 현재 위치 마커 설정
             if (currentLocationMarker) {
                 currentLocationMarker.setMap(null);
             }

             currentLocationMarker = new google.maps.Marker({
                 position: pos,
                 map: map,
                 title: "현재 위치",
                 icon: "/static/image/햄스터.png"
             });

             map.setCenter(pos);
         },
         () => {
             handleLocationError(true, map.getCenter());
         }
     );
 } else {
     handleLocationError(false, map.getCenter());
 }
});

// 집 위치 설정 버튼 설정
const setHomeButton = document.getElementById('setHome');
setHomeButton.addEventListener("click", () => {
 if (navigator.geolocation) {
     navigator.geolocation.getCurrentPosition(
         (position) => {
             const pos = {
                 lat: position.coords.latitude,
                 lng: position.coords.longitude,
             };

             // 현재 위치 마커 설정
             if (currentLocationMarker) {
                 currentLocationMarker.setMap(null);
             }

             currentLocationMarker = new google.maps.Marker({
                 position: pos,
                 map: map,
                 title: "현재 위치",
                 icon: '/static/image/햄스터.png'
             });

             map.setCenter(pos);

             // 집 위치 설정 확인 및 저장
             if (confirm("집으로 설정하시겠습니까?")) {
                 localStorage.setItem('homeLocation', JSON.stringify(pos));

                 if (homeMarker) {
                     homeMarker.setMap(null);
                 }

                 homeMarker = new google.maps.Marker({
                     position: pos,
                     map: map,
                     title: "집",
                     icon: '/static/image/HOME.png'
                 });

                 alert("집으로 설정되었습니다.");
             }
         },
         () => {
             handleLocationError(true, map.getCenter());
         }
     );
 } else {
     handleLocationError(false, map.getCenter());
 }
});

// 저장된 집 위치 불러오기
const savedHomeLocation = localStorage.getItem('homeLocation');
if (savedHomeLocation) {
 const pos = JSON.parse(savedHomeLocation);
 homeMarker = new google.maps.Marker({
     position: pos,
     map: map,
     title: "집",
     icon: '/static/image/HOME.png'
 });
 map.setCenter(pos);
}

// 편의점 표시 체크박스 설정
const showConvenienceStoresCheckbox = document.getElementById('showConvenienceStores');
showConvenienceStoresCheckbox.addEventListener('change', () => {
 if (showConvenienceStoresCheckbox.checked) {
     searchConvenienceStores();
 } else {
     clearConvenienceStores();
 }
});

// 공원 표시 체크박스 설정
document.getElementById('toggleParks').addEventListener('change', (event) => {
 if (event.target.checked) {
     searchParks();
 } else {
     clearParks();
 }
});

// 전체 화면 변경 이벤트 리스너
document.addEventListener('fullscreenchange', () => {
 if (document.fullscreenElement) {
     // 전체 화면으로 진입 시
     map.setZoom(15);
 } else {
     // 전체 화면 종료 시
     map.setZoom(18); // 원래 줌으로 되돌림
 }
});
}

// 페이지 로드 시 지도 초기화
window.onload = initMap;


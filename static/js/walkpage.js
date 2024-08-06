document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log("서버에서 API 키 가져오기");

        // 서버에서 API 키 가져오기
        const response = await fetch('/api/get-api-key');
        const data = await response.json();
        const apiKey = data.api_key;
        console.log("API 키:", apiKey);

        // Google Maps API 로드
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;

        // Google Maps API가 로드된 후 초기화 함수 호출
        script.onload = () => {
            console.log("Google Maps API가 로드되었습니다.");
            initMap();
        };

        script.onerror = () => {
            console.error("Google Maps JavaScript API 로드 실패");
        };

        document.head.appendChild(script);
    } catch (error) {
        console.error("API 키를 가져오는 중 오류 발생:", error);
    }
});

function initMap() {
    const { Map, Marker, Polyline, PlacesService } = google.maps;

    // 지도 초기화
    const map = new Map(document.getElementById('map'), {
        center: { lat: 35.1694282, lng: 128.0603057 },
        zoom: 18,
        minZoom: 15,
        maxZoom: 20,
        mapId: '871c544b9ad947b5',
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControlOptions: {
            position: google.maps.ControlPosition.LEFT_BOTTOM} // 원하는 위치 설정
    });

    const infoWindow = new google.maps.InfoWindow();
    let currentLocationMarker, homeMarker;
    const convenienceMarkers = [];
    const parkMarkers = [];
    const parksSearchRadius = 1000;
    const positions = [];

    // 경로를 그릴 Polyline 객체 생성
    const path = new Polyline({
        strokeColor: '#00FF00',
        strokeOpacity: 1.0,
        strokeWeight: 4,
        map: map
    });

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
        convenienceMarkers.length = 0;
    }

    // 공원 마커 제거 함수
    function clearParks() {
        parkMarkers.forEach(marker => marker.setMap(null));
        parkMarkers.length = 0;
    }

    // 편의점 검색 함수
       // 편의점 검색 함수
       function searchConvenienceStores() {
        const request = {
            location: map.getCenter(),
            radius: '1000',
            type: ['convenience_store']
        };
        const service = new google.maps.places.PlacesService(map);

        service.nearbySearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                clearConvenienceStores();
                results.forEach(place => {
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
                results.forEach(place => {
                    const marker = new google.maps.Marker({
                        position: place.geometry.location,
                        map: map,
                        title: place.name,
                        icon: "/static/image/park_marker.png"
                    });
                    parkMarkers.push(marker);
                });
            }
        });
    }

    // 현재 위치 버튼 설정
    const setLocationButton = document.getElementById('setLocation');
    if (setLocationButton) {
        setLocationButton.addEventListener("click", () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const pos = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                        };

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
                    },
                    {
                        enableHighAccuracy: true, // 고정밀도 모드 활성화
                        timeout: 5000, // 5초 내 위치 정보 요청
                        maximumAge: 0 // 최신 위치 정보만 사용
                    }
                );
            } else {
                handleLocationError(false, map.getCenter());
            }
        });
    }

    // 집 위치 설정 버튼 설정
    const setHomeButton = document.getElementById('setHome');
    if (setHomeButton) {
        setHomeButton.addEventListener("click", () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const pos = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                        };

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
                    },
                    {
                        enableHighAccuracy: true, // 고정밀도 모드 활성화
                        timeout: 5000, // 5초 내 위치 정보 요청
                        maximumAge: 0 // 최신 위치 정보만 사용
                    }
                );
            } else {
                handleLocationError(false, map.getCenter());
            }
        });
    }

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
    if (showConvenienceStoresCheckbox) {
        showConvenienceStoresCheckbox.addEventListener('change', () => {
            if (showConvenienceStoresCheckbox.checked) {
                searchConvenienceStores();
            } else {
                clearConvenienceStores();
            }
        });
    }

    // 공원 표시 체크박스 설정
    const toggleParksCheckbox = document.getElementById('toggleParks');
    if (toggleParksCheckbox) {
        toggleParksCheckbox.addEventListener('change', (event) => {
            if (event.target.checked) {
                searchParks();
            } else {
                clearParks();
            }
        });
    }

    // 전체 화면 변경 이벤트 리스너
    document.addEventListener('fullscreenchange', () => {
        if (document.fullscreenElement) {
            map.setZoom(15);
        } else {
            map.setZoom(18);
        }
    });
    let trackingInterval; // 전역 변수로 정의

    // 실시간 경로 기록 상태 텍스트 표시 함수
    function showOverlayText(text) {
        const overlayText = document.getElementById('overlayText');
        overlayText.textContent = text;
        overlayText.style.display = 'block';
    }

    // 경로 기록 상태 텍스트 숨기기 함수
    function hideOverlayText() {
        const overlayText = document.getElementById('overlayText');
        overlayText.style.display = 'none';
    }

    // 경로 기록 중 텍스트 업데이트 함수
    function startTrackingOverlay() {
        console.log("startTrackingOverlay 점찍자");
        const overlayText = document.getElementById('overlayText');
        let dots = 1;
        let updateCount = 0; // 텍스트 업데이트 횟수
        const maxUpdates = 9; // 점의 반복 횟수 (전체 애니메이션이 3번 반복되도록 설정)

        function updateText() {
            overlayText.textContent = '실시간 경로 기록 중' + '.'.repeat(dots);
            dots = (dots % 3) + 1; // 1, 2, 3 점을 반복
            updateCount++;

            if (updateCount < maxUpdates) {
                trackingInterval = setTimeout(updateText, 500); // 500ms 간격으로 텍스트 업데이트
            } else {
                showOverlayText('실시간 경로 기록 중...'); // 텍스트를 최종 상태로 설정
            }
        }

        // 초기 텍스트를 설정하고 업데이트 시작
        showOverlayText('실시간 경로 기록 중'); // 초기 텍스트 설정
        updateText(); // 텍스트 업데이트 시작
    }

    // 경로 기록 중단 텍스트 표시 함수
    function stopTrackingOverlay() {
        clearTimeout(trackingInterval); // 애니메이션 중지
        showOverlayText('경로 기록 중단됨'); // 중단 텍스트 표시
    }

    // 실시간 위치 업데이트 함수
    function updatePosition(position) {
        // 위치 정확도 필터링: 정확도가 50미터 이하일 때만 업데이트
        if (position.coords.accuracy <= 50) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const newPos = new google.maps.LatLng(lat, lng);
            positions.push(newPos);

            if (currentLocationMarker) {
                currentLocationMarker.setPosition(newPos);
            } else {
                currentLocationMarker = new google.maps.Marker({
                    position: newPos,
                    map: map,
                    title: "현재 위치",
                    icon: "/static/image/햄스터.png"
                });
            }

            map.setCenter(newPos);
            path.setPath(positions);
            sendPositionToServer(lat, lng);
        }
    }

    // 위치 정보를 서버로 전송
    function sendPositionToServer(lat, lng) {
        fetch('/track', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ latitude: lat, longitude: lng })
        });
    }

    // 여행 경로 기록하기 버튼 설정
    const startTrackingButton = document.getElementById('startTracking');
    const stopTrackingButton = document.getElementById('stopTracking');
    let tracking = false;
    let watchId = null;

    function startTracking() {
        if (!tracking) {
            tracking = true;
            startTrackingButton.classList.add('active');
            stopTrackingButton.classList.remove('active');
            console.log("startTracking")
            startTrackingOverlay(); // 경로 기록 중 텍스트 시작

            watchId = navigator.geolocation.watchPosition(updatePosition, 
                (error) => {
                    console.error("위치 업데이트 중 오류 발생:", error);
                },
                {
                    enableHighAccuracy: true, // 고정밀도 모드 활성화
                    timeout: 10000, // 10초 내 위치 정보 요청
                    maximumAge: 0 // 최신 위치 정보만 사용
                }
            );
        }
    }

    function stopTracking() {
        if (tracking) {
            tracking = false;
            startTrackingButton.classList.remove('active');
            stopTrackingButton.classList.add('active');

            if (watchId !== null) {
                navigator.geolocation.clearWatch(watchId);
                watchId = null;
            }
            stopTrackingOverlay(); // 경로 기록 중단 텍스트 표시
        }
    }

    if (startTrackingButton) {
        startTrackingButton.addEventListener('click', startTracking);
    }

    if (stopTrackingButton) {
        stopTrackingButton.addEventListener('click', stopTracking);
    }






    async function updateWalkStamp() {
        try {
            await fetch('/api/update-stamp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mission: 'walk_cleared_stamp' })
            });
            console.log('Walk mission completed.');
        } catch (error) {
            console.error('Error updating walk stamp:', error);
        }
    }

    updateWalkStamp();
}


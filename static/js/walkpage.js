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
    // Google Maps API가 로드된 후 실행되는 함수
    const { Map, Marker, PlacesService } = google.maps;

    // 지도 초기화
    const map = new Map(document.getElementById('map'), {
        center: { lat: 35.1694282, lng: 128.0603057 },
        zoom: 18,
        minZoom: 15,
        maxZoom: 20,
        mapId: '871c544b9ad947b5',
        streetViewControl: false,
        mapTypeControl: false,
    });

    const infoWindow = new google.maps.InfoWindow();
    let currentLocationMarker, homeMarker;
    const convenienceMarkers = [];
    const parkMarkers = [];
    const parksSearchRadius = 1000;

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
                        title: place.name
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
}

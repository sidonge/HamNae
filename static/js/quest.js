document.addEventListener('DOMContentLoaded', () => {
    const stampMap = {
        'water': 'water_cleared_stamp',
        'clean': 'broomstick_cleared_stamp',
        'cooking': 'pot_cleared_stamp',
        'wash': 'bath_cleared_stamp',
        'table': 'talk_cleared_stamp',
        'bed': 'meditation_cleared_stamp'
    };
    function updateStampImage(mission) {
    
        const stampId = stampMap[mission];
        console.log('Updating stamp for mission:', mission, 'with stampId:', stampId); // Debugging line
        if (stampId) {
            const stampElement = document.getElementById(stampId);
            if (stampElement) {
                stampElement.style.display = 'block'; // Show the stamp if mission is cleared
            } else {
                console.error('Stamp element not found:', stampId);
            }
        } else {
            console.error('Invalid mission:', mission);
        }
    }    
    
    fetch('/quest_status')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            if (data.status) {
                for (const [mission, cleared] of Object.entries(data.status)) {
                    if (cleared === "true" && stampMap.hasOwnProperty(mission)) {
                        updateStampImage(mission);
                    } else if (!stampMap.hasOwnProperty(mission)) {
                        console.error('Unexpected mission:', mission);
                    }
                }
            } else {
                console.error('Invalid JSON structure:', data);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
});
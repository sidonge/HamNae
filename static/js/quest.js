document.addEventListener('DOMContentLoaded', (event) => {
    async function fetchUserQuestsStatus() {
        try {
            const response = await fetch('/user_quests_status');
            if (response.ok) {
                const quests = await response.json();
                quests.forEach(quest => {
                    // ID를 quest.name으로 설정하여 HTML 요소 찾기
                    const questElement = document.getElementById(quest.id);
                    const stamp = document.getElementById(`${quest.id}_cleared_stamp`);
                    if (quest.completed) {
                        if (questElement) {
                            questElement.style.display = 'block';
                        }
                        if (stamp) {
                            stamp.style.display = 'block';
                        }
                    }
                });
            } else {
                console.error('Failed to fetch quests status');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    fetchUserQuestsStatus();

    document.querySelectorAll('input[type="file"]').forEach(input => {
        input.addEventListener('change', async (event) => {
            const fileInput = event.target;
            const mission = fileInput.id.replace('Upload', '');
            const file = fileInput.files[0];

            if (file) {
                const formData = new FormData();
                formData.append('mission', mission);
                formData.append('file', file);

                try {
                    const response = await fetch('/complete_mission', {
                        method: 'POST',
                        body: formData,
                    });

                    if (response.ok) {
                        const result = await response.json();
                        if (result.success) {
                            const stamp = document.getElementById(`${mission}_cleared_stamp`);
                            if (stamp) {
                                stamp.style.display = 'block';
                            }
                        } else {
                            alert('Mission completion failed.');
                        }
                    } else {
                        alert('Server response was not valid.');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('Error completing mission.');
                }
            }
        });
    });
});

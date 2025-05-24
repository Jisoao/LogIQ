document.addEventListener('DOMContentLoaded', () => {
    const lessonItems = document.querySelectorAll('.lesson-item');
    const prevButton = document.querySelector('.nav-button.prev');
    const nextButton = document.querySelector('.nav-button.next');
    const progressIndicator = document.querySelector('.progress-indicator');
    let currentLesson = 0;

    function updateLessonState() {
        // Update active lesson
        lessonItems.forEach((item, index) => {
            item.classList.toggle('active', index === currentLesson);
        });

        // Update navigation buttons
        prevButton.disabled = currentLesson === 0;
        nextButton.disabled = currentLesson === lessonItems.length - 1;

        // Update progress indicator
        progressIndicator.textContent = `${currentLesson + 1}/${lessonItems.length}`;

        // Save progress to localStorage
        const topic = document.querySelector('.topic-title').textContent;
        localStorage.setItem(`${topic}-progress`, currentLesson);
    }

    // Initialize from localStorage if available
    const topic = document.querySelector('.topic-title').textContent;
    const savedProgress = localStorage.getItem(`${topic}-progress`);
    if (savedProgress !== null) {
        currentLesson = parseInt(savedProgress);
        updateLessonState();
    }

    // Navigation button handlers
    prevButton.addEventListener('click', () => {
        if (currentLesson > 0) {
            currentLesson--;
            updateLessonState();
        }
    });

    nextButton.addEventListener('click', () => {
        if (currentLesson < lessonItems.length - 1) {
            currentLesson++;
            updateLessonState();
        }
    });

    // Lesson item click handlers
    lessonItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            currentLesson = index;
            updateLessonState();
        });
    });

    // Video placeholder handler
    const playButton = document.querySelector('.play-button');
    playButton.addEventListener('click', () => {
        const videoContainer = document.querySelector('.video-container');
        const iframe = document.createElement('iframe');
        
        // Replace with actual video URL for each lesson
        const videoUrls = [
            'https://www.youtube.com/embed/VIDEO_ID_1',
            'https://www.youtube.com/embed/VIDEO_ID_2',
            'https://www.youtube.com/embed/VIDEO_ID_3'
        ];

        iframe.src = videoUrls[currentLesson];
        iframe.width = '100%';
        iframe.height = '100%';
        iframe.style.position = 'absolute';
        iframe.style.top = '0';
        iframe.style.left = '0';
        iframe.frameBorder = '0';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;

        videoContainer.innerHTML = '';
        videoContainer.appendChild(iframe);
    });
}); 
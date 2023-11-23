// Function to update the active state on the menu
function updateActiveLink(activeId) {
    // Remove active class from all links
    document.querySelectorAll('.menu-bar-center a').forEach(link => {
        link.classList.remove('active');
    });

    // Add active class to the clicked link
    const activeLink = document.getElementById(activeId);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

// Set the default active link
updateActiveLink('mobileCourse');

function showMobileCourseView() {
    var coursesPanel = document.getElementById('left-most-sidebar');
    var previewsPanel = document.getElementById('right-sidebar');
    var matrix = document.getElementById('matrixContainer');

    previewsPanel.style.display = 'none';
    coursesPanel.style.display = 'flex';
    matrix.style.display = 'none'; 
    updateActiveLink('mobileCourse');
}

function showPreviews() {
    var coursesPanel = document.getElementById('left-most-sidebar');
    var previewsPanel = document.getElementById('right-sidebar');
    var previewContainer = document.getElementById('preview-container');
    var matrix = document.getElementById('matrixContainer');
    
    previewsPanel.style.display = 'flex';
    previewContainer.style.display = 'flex';
    previewsPanel.style.flex = '1';
    coursesPanel.style.display = 'none';
    matrix.style.display = 'none'; 

    updateActiveLink('mobilePreview');
}

function showMobileMatrix() {
    var coursesPanel = document.getElementById('left-most-sidebar');
    var previewsPanel = document.getElementById('right-sidebar');
    var matrix = document.getElementById('matrixContainer');
    
    coursesPanel.style.display = 'none';
    previewsPanel.style.display = 'none';
    matrix.style.display = 'block'; 
 
    updateActiveLink('mobileMatrix');
}
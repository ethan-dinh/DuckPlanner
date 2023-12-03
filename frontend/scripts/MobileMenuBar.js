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

function showMobileCourseView() {
    var coursesPanel = document.getElementById('left-most-sidebar');
    var previewsPanel = document.getElementById('right-sidebar');
    var matrix = document.getElementById('calendar-sidebar');
    var footerText = document.getElementById('footer-text');
    var footerButton = document.getElementById('Footer-CRNs');

    footerButton.style.display = 'none';
    footerText.style.display = 'block';
    previewsPanel.style.display = 'none';
    coursesPanel.style.display = 'flex';
    matrix.style.display = 'none'; 
    updateActiveLink('mobileCourse');
}

function showPreviews() {
    var coursesPanel = document.getElementById('left-most-sidebar');
    var previewsPanel = document.getElementById('right-sidebar');
    var previewContainer = document.getElementById('preview-container');
    var matrix = document.getElementById('calendar-sidebar');
    var footerText = document.getElementById('footer-text');
    var footerButton = document.getElementById('Footer-CRNs');

    footerButton.style.display = 'none';
    footerText.style.display = 'block';
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
    var matrix = document.getElementById('calendar-sidebar');
    var footerText = document.getElementById('footer-text');
    var footerButton = document.getElementById('Footer-CRNs');
    
    footerButton.style.display = 'block';
    footerText.style.display = 'none';
    coursesPanel.style.display = 'none';
    previewsPanel.style.display = 'none';
    matrix.style.display = 'flex'; 
 
    updateActiveLink('mobileMatrix');
}

function showMobileMapView() {
    var mapContainer = document.getElementById('map');
    var matrixTable = document.getElementById('matrixContainer');
    
    // Check if the map container is already displayed
    if (mapContainer.style.display === 'block') {
        mapContainer.style.display = 'none';
        matrixTable.style.display = 'block';
    } else {
        mapContainer.style.display = 'block'; 
        matrixTable.style.display = 'none';
        map.resize();
    }
}

// Add event listeners to for the map view button
document.getElementById('View-Map').addEventListener('click', showMobileMapView);
let ifMobile = false;

// Set the default active link
updateActiveLink('matrixViewButton');

// Function to update the height
function setVH() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}
  
// Set the variable on initial load
setVH();

let resizeTimeout;
function debouncedSetVH() {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(setVH, 100);
}

// Update the variable when the window is resized
window.addEventListener('resize', debouncedSetVH);

// You will also want to update the showMatrixView and showMapView functions to call updateActiveLink
function showMatrixView() {
    var mapContainer = document.getElementById('map');
    var matrixTable = document.getElementById('schedulerTable');
    var matrixContainer = document.getElementById('matrixContainer');
    var rightSide = document.getElementById('right-sidebar');
    var coursesPanel = document.getElementById('left-most-sidebar');

    coursesPanel.style.display = 'flex';
    coursesPanel.style.flex = '0.9';
    rightSide.style.display = 'flex';
    
    mapContainer.style.display = 'none'; 
    matrixTable.style.display = 'table'; 
    matrixContainer.style.display = 'block';

    updateActiveLink('matrixViewButton');
}

function showMapView() {
    var mapContainer = document.getElementById('map');
    var matrixTable = document.getElementById('schedulerTable');
    var rightSide = document.getElementById('right-sidebar');
    
    rightSide.style.display = 'none';

    updateMap();

    // Check if the map container exists
    if (mapContainer) {
        mapContainer.style.display = 'block'; // Show the map
        map.resize(); // This is the correct usage
    }
    
    // Check if the matrix container exists
    if (matrixTable) {
        matrixTable.style.display = 'none'; // Hide the matrix
    }

    updateActiveLink('mapViewButton');
}

// if screen is resized to be larger than 768px, show the matrix view
function adjustFullSize() {
    if (window.innerWidth > 768) {
        showMatrixView();
        ifMobile = false;
    } else {
        showMobileCourseView();
        ifMobile = true;
    }
}

let adjustTimeout;
adjustFullSize();
function debouncedSetFullSize() {
  clearTimeout(adjustTimeout);
  adjustTimeout = setTimeout(adjustFullSize, 200);
}

window.addEventListener('resize', debouncedSetFullSize);
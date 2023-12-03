let ifMobile = false;
let tmp_CRN_copy = null;

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

function showMatrixView() {
    var mapContainer = document.getElementById('map');
    var matrixTable = document.getElementById('schedulerTable');
    var matrixContainer = document.getElementById('matrixContainer');
    var calendarSidebar = document.getElementById('calendar-sidebar');
    var rightSide = document.getElementById('right-sidebar');
    var coursesPanel = document.getElementById('left-most-sidebar');
    var footerText = document.getElementById('footer-text');
    var footerButton = document.getElementById('Footer-CRNs');
    var savedContainer = document.getElementById('saved-schedule-container');
    var classSearch = document.getElementById('left-most-sidebar');

    classSearch.style.display = 'flex';
    savedContainer.style.display = 'none';
    footerButton.style.display = 'none';
    footerText.style.display = 'block';
    calendarSidebar.style.display = 'flex';
    coursesPanel.style.display = 'flex';
    coursesPanel.style.flex = '0.9';
    rightSide.style.display = 'flex';
    
    mapContainer.style.display = 'none'; 
    matrixTable.style.display = 'table'; 
    matrixContainer.style.display = 'block';

    if (selectedMatrix !== null && !ifMobile) {
        renderMatrix(selectedMatrix);
    } else {
        generateMatrix();
    }
    
    crn_list = tmp_CRN_copy;
    updateActiveLink('matrixViewButton');
}

function showSavedView() {
    var mapContainer = document.getElementById('map');
    var matrixTable = document.getElementById('schedulerTable');
    var rightSide = document.getElementById('right-sidebar');
    var savedContainer = document.getElementById('saved-schedule-container');
    var classSearch = document.getElementById('left-most-sidebar');

    classSearch.style.display = 'none';
    savedContainer.style.display = 'flex';
    savedContainer.style.flex = '0.9';
    rightSide.style.display = 'none';
    matrixTable.style.display = 'table';
    mapContainer.style.display = 'none'; 

    tmp_CRN_copy = crn_list;

    updateActiveLink('savedSchedulesButton');
    generateMatrix();
    retrieveSavedSchedules();
}

function showMapView() {
    var mapContainer = document.getElementById('map');
    var matrixTable = document.getElementById('schedulerTable');
    var rightSide = document.getElementById('right-sidebar');
    var savedContainer = document.getElementById('saved-schedule-container');
    var classSearch = document.getElementById('left-most-sidebar');

    classSearch.style.display = 'flex';
    savedContainer.style.display = 'none';
    rightSide.style.display = 'none';
    matrixTable.style.display = 'none';
    mapContainer.style.display = 'block'; 
    updateMap();
    map.resize(); 
    updateActiveLink('mapViewButton');
}


// if screen is resized to be larger than 768px, show the matrix view
function adjustFullSize() {
    if (window.innerWidth > 1200) {
        showMatrixView();
        ifMobile = false;
    } else {
        showMobileCourseView();
        ifMobile = true;
    }
}

adjustFullSize()
window.addEventListener('resize', adjustFullSize);
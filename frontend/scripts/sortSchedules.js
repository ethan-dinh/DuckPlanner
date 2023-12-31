function calculateCompactness(matrix) {
    let compactnessScore = 0;

    // Check each column (day) in the matrix
    for (let col = 0; col < matrix[0].length; col++) {
        let firstNonNull = matrix.length;
        let lastNonNull = 0;
        for (let row = 0; row < matrix.length; row++) {
            if (matrix[row][col] !== null) {
                firstNonNull = Math.min(firstNonNull, row);
                lastNonNull = row; // The last non-null found will be the last class of the day
            }
        }
        // Calculate gaps only if there are classes on this day
        if (lastNonNull !== 0) {
            for (let row = firstNonNull; row <= lastNonNull; row++) {
                if (matrix[row][col] === null) {
                    compactnessScore++;
                }
            }
        }
    } return compactnessScore;
}

function calculateAverageEndTime(matrix, async = false) {
    let endTimeSum = 0;
    let daysWithClasses = 0;

    for (let col = 0; col < matrix[0].length; col++) {
        for (let row = 0; row < matrix.length; row++) {
            if (async && (matrix[row][col] !== null && matrix[row][col].includes("ASYNC")))
                return 0;
            
            else if (matrix[row][col] !== null) {
                endTimeSum += row;
                daysWithClasses++;
                break; // Found the last class for the day
            }
        }
    }

    // Return the average end time or a large number if no classes (to ensure it sorts to the end)
    return daysWithClasses > 0 ? endTimeSum / daysWithClasses : Number.MAX_SAFE_INTEGER;
}

function calculateAverageStartTime(matrix) {
    let startTimeSum = 0;
    let daysWithClasses = 0;

    for (let col = 0; col < matrix[0].length; col++) {
        for (let row = matrix.length - 1; row >= 0; row--) {            
            if (matrix[row][col] !== null) {
                startTimeSum += row;
                daysWithClasses++;
                break; // Found the last class for the day
            }
        }
    }

    // Return the average start time or 0 if no classes (to ensure it sorts to the beginning)
    return daysWithClasses > 0 ? startTimeSum / daysWithClasses : 0;
}

function sortMatricesByCompactness() {
    scheduleMatrices.sort((a, b) => calculateCompactness(a) - calculateCompactness(b));
}

function sortMatricesByEarliestEnd() {
    scheduleMatrices.sort((a, b) => calculateAverageEndTime(a) - calculateAverageEndTime(b));
}

function sortMatricesByLatestStart() {
    scheduleMatrices.sort((a, b) => calculateAverageStartTime(b) - calculateAverageStartTime(a));
}

function sortMatricesByASYNC() {
    scheduleMatrices.sort((a, b) => calculateAverageEndTime(a, true) - calculateAverageEndTime(b, true));
}

function applyFilter() {
    const label = labelSpan = document.querySelector('#filter span').textContent;
    switch (label) {
        case 'Most Compact':
            sortMatricesByCompactness();
            break;
        case 'Earliest End':
            sortMatricesByEarliestEnd()
            break;
        case 'Latest Start':
            sortMatricesByLatestStart()
            break;
        case 'Prioritize ASYNC':
            sortMatricesByASYNC();
            break;
    } 
    const selectedContainer = document.getElementById('selected-schedule-container')
    selectedContainer.innerHTML = "";
    generateCompressedPreview();    
}


// Define the function that changes the label text
function changeLabelText(text) {
    var labelSpan = document.querySelector('#filter span');
    labelSpan.textContent = text;
    applyFilter();

    // click the checkbox to close the dropdown
    var checkbox = document.getElementById('touch');
    checkbox.checked = false;
  }
  
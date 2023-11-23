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
            if (async && (matrix[row][col] !== null && matrix[row][col] === "ASYNC"))
                return 0;
            
            if (matrix[row][col] !== null && matrix[row][col] !== "ASYNC") {
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
    const filter = document.getElementById('filter').value;
    switch (filter) {
        case 'option1':
            sortMatricesByCompactness();
            break;
        case 'option2':
            sortMatricesByEarliestEnd()
            break;
        case 'option3':
            sortMatricesByLatestStart()
            break;
        case 'option4':
            sortMatricesByASYNC();
            break;
    } 
    const selectedContainer = document.getElementById('selected-schedule-container')
    selectedContainer.innerHTML = "";
    generateCompressedPreview();    
}

// Set up the event listener for the select element
document.getElementById('filter').addEventListener('change', applyFilter);

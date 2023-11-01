function timeToRowIndex(timeString) {
    const [hour, minute] = timeString.split(':').map(Number);
    return (hour - startTime) * 6 + Math.floor(minute / 10); 
}

function populateMatrix(scheduleData) {
    const table = document.getElementById("schedulerTable");

    // Loop through each row after the header
    for (let i = 1; i < table.rows.length; i++) {
        const row = table.rows[i];
        
        // Loop from the last cell to the second cell, clearing the content
        for (let j = row.cells.length - 1; j > 0; j--) {
            row.deleteCell(j);
        }
        
        // Insert fresh cells for each day after the time cell
        for (let j = 1; j <= days.length - 1; j++) {
            row.insertCell(j);
        }
    }

    console.log(scheduleData[0])
    scheduleData[0].forEach(data => {
        const day = data[0].toUpperCase().slice(0, 3);
        const columnIndex = days.indexOf(day);
        const rowIndex = timeToRowIndex(data[1]);
        console.log(rowIndex, columnIndex)
        const durationSlots = data[2] / 10;

        if (columnIndex !== -1) {
            const cell = table.rows[rowIndex].cells[columnIndex];
            cell.textContent = `${data[3]} (${data[4]})`;
            cell.setAttribute('rowspan', durationSlots);
            cell.style.backgroundColor = '#e0e0e0';

            // Remove cells that are covered by the rowspan
            for (let i = 1; i < durationSlots; i++) {
                if (table.rows[rowIndex + i] && table.rows[rowIndex + i].cells[columnIndex]) {
                    table.rows[rowIndex + i].deleteCell(columnIndex);
                }
            }
        }
    });
}

function convertToScheduleMatrices(proposedSchedules) {
    const numberOfTimeSlots = (endTime - startTime) * 6;
    const numberOfDays = days.length - 1;

    const emptyMatrix = Array.from({ length: numberOfTimeSlots }, () => Array(numberOfDays).fill(null));

    const schedulesList = [];

    proposedSchedules.forEach(scheduleData => {
        const scheduleMatrix = emptyMatrix.map(row => row.slice());
        scheduleData.forEach(data => {
            const day = data[0].toUpperCase().slice(0, 3);
            const columnIndex = days.indexOf(day) - 1;
            const rowIndex = timeToRowIndex(data[1]);
            const durationSlots = data[2] / 10;
            const middleRow = Math.floor(durationSlots / 2);
            if (columnIndex !== -1) {
                for (let i = 0; i < durationSlots; i++) {
                    scheduleMatrix[rowIndex + i][columnIndex] = `${data[3]} (${data[4]})`;
                }
            }
        });
        schedulesList.push(scheduleMatrix);
    });

    return schedulesList;
}

// function renderMatrix(matrix) {
//     const table = document.getElementById("schedulerTable");
    
//     for (let i = 1; i < table.rows.length; i++) {
//         const row = table.rows[i];
//         for (let j = 1; j < row.cells.length; j++) {
//             const content = matrix[i-1][j-1];
//             const cell = row.cells[j];
//             if (content) {
//                 if (content === "FILLED") {
//                     cell.textContent = "";
//                     cell.style.backgroundColor = '#e0e0e0';  // This can be adjusted if you want a different color for "FILLED"
//                 } else {
//                     cell.textContent = content;

//                     // Use the color from the dictionary based on the extracted course_name
//                     const colorKey = `${course_name = content.split(' (')[0]}`;
//                     const color = colorMapping[colorKey] || '#e0e0e0';  // Default to '#e0e0e0' if not found in the dictionary
//                     cell.style.color = color;
//                 }
//             } else {
//                 cell.textContent = "";
//                 cell.style.backgroundColor = '';
//             }
//         }
//     }
// }

function renderMatrix(matrix) {
    const table = document.getElementById("schedulerTable");
    const rowsToHideContent = Array.from({ length: matrix.length }, () => Array(matrix[0].length).fill(false));

    for (let i = 1; i < table.rows.length; i++) {
        const row = table.rows[i];

        for (let j = 1; j < row.cells.length; j++) {
            const content = matrix[i-1][j-1];
            const cell = row.cells[j];

            if (content) {
                cell.style.fontWeight = "bold";
                cell.style.color = "white";
                const colorKey = content.split(' (')[0];
                const color = colorMapping[colorKey] || '#e0e0e0';
                cell.style.backgroundColor = color;
                cell.style.border = 'None';

                let rowspan = 1;
                while (i - 1 + rowspan < matrix.length && matrix[i-1][j-1] === matrix[i-1 + rowspan][j-1]) {
                    rowspan++;
                }

                if (rowspan > 1) {
                    cell.style.verticalAlign = 'middle';

                    // Mark the cells to hide their content.
                    for (let k = 1; k < rowspan; k++) {
                        rowsToHideContent[i-1 + k][j-1] = true;
                    }
                }

                if (!rowsToHideContent[i-1][j-1]) {
                    cell.textContent = content;
                } else {
                    cell.textContent = ""; // clear the text content
                }
            } else {
                cell.textContent = "";
                cell.style.backgroundColor = '';
            }
        }
    }
}



let scheduleMatrices = []
const generateButton = document.querySelector(".modern-button");
let currentScheduleIndex = 0; // Start from the first schedule

// Helper function to enable/disable Next and Previous buttons based on current index
function updateButtonStates() {
    prevButton.disabled = (currentScheduleIndex === 0);
    nextButton.disabled = (currentScheduleIndex === scheduleMatrices.length - 1);
}

generateButton.addEventListener("click", function () {
    scheduleMatrices = []

    // Prepare the data to be sent in the API call
    const requestData = {
        // Include other data if needed
        addedClassCodes: Array.from(addedClassCodes).map(key => key.split(',')), // Convert the Set to an array
    };

    console.log(JSON.stringify(requestData))

    // Perform the API call
    fetch(
    "https://80ar8v7uyg.execute-api.us-west-2.amazonaws.com/DEPLOY/createSchedules",
    {
        method: "POST", // Use the appropriate HTTP method
        body: JSON.stringify(requestData), // Convert the data to JSON
        headers: {
            "Content-Type": "application/json",
        },
    }
    )
    .then((response) => {
        if (!response.ok) {
            throw new Error(`Network response was not ok (${response.status})`);
        }
        return response.json();
    })
    .then((responseData) => {
        // Handle the response from the Lambda function here
        console.log("API Response:", responseData);
        scheduleMatrices = convertToScheduleMatrices(responseData["schedules"]);

        console.log("GENERATED SCHEDULES")

        currentScheduleIndex = 0; // Reset index to the first schedule
        updateButtonStates(); // Update the button states
        renderMatrix(scheduleMatrices[currentScheduleIndex]); // Render the first schedule
        console.log(scheduleMatrices)
    })
    .catch((error) => {
        // Handle errors here
        console.error("API Error:", error);
    });
});

// Next Schedule Handler
const nextButton = document.getElementById("nextSchedule");
nextButton.addEventListener("click", function() {
    if (currentScheduleIndex < scheduleMatrices.length - 1) {
        generateMatrix()
        currentScheduleIndex++;
        renderMatrix(scheduleMatrices[currentScheduleIndex]);
        updateButtonStates();
    }
});

// Previous Schedule Handler
const prevButton = document.getElementById("previousSchedule");
prevButton.addEventListener("click", function() {
    if (currentScheduleIndex > 0) {
        generateMatrix()
        currentScheduleIndex--;
        renderMatrix(scheduleMatrices[currentScheduleIndex]);
        updateButtonStates();
    }
});
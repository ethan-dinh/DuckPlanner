const days = ["", "MON", "TUE", "WED", "THU", "FRI"];
const startTime = 7; // Start time in hours (8:00 AM)
const endTime = 22; // End time in hours (8:00 PM)
let accountedFor = null;

function generateMatrix() {
    const timeSlots = [];
    for (let i = startTime; i < endTime; i++) {
        for (let j = 0; j < 60; j += 10) {
            const isAM = i < 12 || i === 24;
            let hour = i % 12;
            if (hour === 0) hour = 12;
            const ampm = isAM ? ' AM' : ' PM';
            const minutes = j < 10 ? `0${j}` : `${j}`;
            const timeSlot = `${hour}:${minutes}${ampm}`;
            timeSlots.push({timeSlot, hour, ampm, minutes});
        }
    }
    
    const table = document.getElementById("schedulerTable");
    while (table.rows.length > 0) {
        table.deleteRow(0);
    }

    // Create the header row
    const headerRow = table.insertRow(0);
    days.forEach(day => {
        const th = document.createElement("th");
        th.textContent = day;
        headerRow.appendChild(th);
    });

    // Create the time slots and cells for each day
    timeSlots.forEach((timeSlotObj, index) => {
        const row = table.insertRow();
        const timeCell = row.insertCell(0);
    
        if (timeSlotObj.minutes === '00') {
            timeCell.textContent = `${timeSlotObj.hour}${timeSlotObj.ampm}`;
            timeCell.classList.add('hour-start');
        }
    
        if (timeSlotObj.minutes === '50') {
            row.cells[0].classList.add('hour-end');
        }
    
        for (let j = 1; j <= days.length - 1; j++) {
            const cell = row.insertCell(j);
            if (timeSlotObj.minutes === '00') {
                cell.classList.add('hour-start');
            } else if (timeSlotObj.minutes === '50') {
                cell.classList.add('hour-end');
            }
        }
    });
} generateMatrix();

function getRowSpan(matrix, i, j) {
    let rowspan = 1;
    while (i + rowspan < matrix.length && matrix[i][j] === matrix[i + rowspan][j] && !accountedFor[i + rowspan][j]) {
        rowspan++;
    } for (let k = i; k < i + rowspan; k++) {
        accountedFor[k][j] = true;
    } return rowspan;
}

function renderHelper(cell, matrix, content, i, j, opacity) {
    const rowspan = getRowSpan(matrix, i, j, accountedFor);
    if (rowspan > 1) {
        cell.style.fontWeight = "bold";
        cell.style.color = "white";
        cell.style.opacity = opacity;
        cell.classList.add('schedule-cell');

        let dataArr = content.split(',');
        const name = dataArr[0];
        const type = dataArr[1];
        const crn = dataArr[2];
        const desc = dataArr[3].trim();
        const time = dataArr[4];

        const tupleKey = `${name},${desc}`;
        const color = colorMapping[tupleKey] || '#e0e0e0';

        cell.style.backgroundColor = color;    
        cell.rowSpan = rowspan;

        cell.innerHTML = `
            <div class="class-info">
                <div class="class-details">
                    <div class="course-title">${name} | ${type}</div>
                    <div class="course-description">${desc}</div>
                    <div class="course-loc"> ${time} | CRN: ${crn} </div>
                </div>
            </div>
        `;
    } return rowspan;
}

function renderMatrix(matrix) {
    // reset the matrix
    generateMatrix();

    accountedFor = Array.from({ length: matrix.length }, () => Array(matrix[0].length).fill(false));
    const table = document.getElementById("schedulerTable");

    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            const currentContent = matrix[i][j];
            const selectedContent = selectedMatrix[i][j];

            // Check for ASYNC Classes
            if ((currentContent && currentContent.includes("ASYNC")) || (selectedContent && selectedContent.includes("ASYNC")))
                continue;          
        
            if ((selectedContent || currentContent) && !accountedFor[i][j]) {
                let offset = 0;
                for (let k = j-1; k > -1; k--) {
                    if (accountedFor[i-1][k]) offset++;
                } 

                const currentCell = table.rows[i + 1].cells[j + 1 - offset];
                const content = selectedContent || currentContent; 
                const currMatrix = selectedContent ? selectedMatrix : matrix;               
                const rowspan = renderHelper(currentCell, currMatrix, content, i, j, selectedContent ? 1 : 0.3);
                
                for(let k = 0; k < rowspan - 1; k++) 
                    table.rows[i + 2 + k].deleteCell(-1);
            }
        }
    }
}

function timeToRowIndex(timeString) {
    const [hour, minute] = timeString.split(':').map(Number);
    return (hour - startTime) * 6 + Math.floor(minute / 10); 
}

function timeToAMPM(timeString, duration) {
    let [hour, minute] = timeString.split(':').map(Number);
    const isAM = hour < 12;
    const ampm = isAM ? ' AM' : ' PM';
    const minutes = minute < 10 ? `0${minute}` : `${minute}`;

    hour = hour % 12;
    if (hour === 0) hour = 12;
    
    const startTime = `${hour}:${minutes}${ampm}`;

    // Calculate the end time based on the duration
    let newMinute = minute + duration;
    let newHour = hour;
    while (newMinute >= 60) {
        newHour++;
        newMinute -= 60;
    } 
    
    // Recalculate the AM/PM
    const newIsAM = newHour < 12 && hour < 12 && (ampm === ' AM');
    const newAmpm = newIsAM ? ' AM' : ' PM';
    const newMinutes = newMinute < 10 ? `0${newMinute}` : `${newMinute}`;

    const endTime = `${newHour}:${newMinutes}${newAmpm}`;

    return `${startTime} - ${endTime}`;
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

            if (durationSlots == 0) {
                if (scheduleMatrix[0][numberOfDays - 1] === null)
                    scheduleMatrix[0][numberOfDays - 1] = `ASYNC, ${data[5]}`;
                else scheduleMatrix[0][numberOfDays - 1] += `, ${data[5]}`;
            }

            if (columnIndex !== -1) {
                for (let i = 0; i < durationSlots; i++) {
                    const time = data[1];
                    const duration = data[2];
                    const timeStr = timeToAMPM(time, duration);
                    
                    const code = data[3];
                    const type = data[4];
                    const crn = data[5];
                    const desc = data[6];

                    scheduleMatrix[rowIndex + i][columnIndex] = `${code}, ${type}, ${crn}, ${desc}, ${timeStr}`;
                }
            }
        });
        schedulesList.push(scheduleMatrix);
    });

    return schedulesList;
}
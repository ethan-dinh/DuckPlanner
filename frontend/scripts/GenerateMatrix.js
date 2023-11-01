const days = ["TIME", "MON", "TUE", "WED", "THU", "FRI"];

const startTime = 8; // Start time in hours (8:00 AM)
const endTime = 20; // End time in hours (8:00 PM)


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
    headerRow.classList.add("sticky-header");
    days.forEach(day => {
        const th = document.createElement("th");
        th.textContent = day;
        headerRow.appendChild(th);
    });

    // Create the time slots and cells for each day
    timeSlots.forEach((timeSlotObj, index) => {
        const row = table.insertRow();
        const timeCell = row.insertCell(0);
    
        if (timeSlotObj.minutes === '00' && timeSlotObj.hour != '8') {
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
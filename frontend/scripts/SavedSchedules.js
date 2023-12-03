let savedCRNS = [];
let schedules = null;
let matricies = null;
date_dict = {"m": "MONDAY", "t": "TUESDAY", "w": "WEDNESDAY", "r": "THURSDAY", "f": "FRIDAY"}

function createSavedPreview() {
    retrieveSavedSchedules()
}

async function retrieveSavedSchedules() {
    const sendData = {};
    sendData["ID"] = UOID;
    sendData["action"] = "retrieveSchedule";

    console.log(JSON.stringify(sendData));
    showLoadingBar();

    try {
        const response = await fetch("https://o5p61mwx3m.execute-api.us-west-2.amazonaws.com/default/userLogin", {
            method: "POST",
            body: JSON.stringify(sendData),
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Network response was not ok (${response.status})`);
        }
        const responseData = await response.json();
        console.log(responseData);

        savedCRNS = responseData["Package"];
        schedules = parseCRNs(savedCRNS);
        generateCompressedPreviewFromCRNs()
        hideLoadingBar();
    } catch (error) {
        // Handle errors, such as network issues or JSON parsing problems
        console.error("Failed to login:", error);
        throw error; // Re-throw the error for the caller to handle if needed
    }
}

function translateTime(time) {
    let times = time.split("-");
    let start = times[0];
    let end = times[1];
    let duration = ((parseInt(end.substring(0, 2), 10) - parseInt(start.substring(0, 2), 10)) * 60) + (parseInt(end.substring(2), 10) - parseInt(start.substring(2), 10));
    return [`${start.substring(0, 2)}:${start.substring(2)}`, duration.toString()];
}

function parseCRNs() {
    let schedules = [];
    for (let i = 0; i < savedCRNS.length; i++) {
        let course = savedCRNS[i];
        let crns = course.split(",");
        
        let schedule = [];
        crns.forEach(crn => {
            const course_info = crn_dict[crn];
            const days = course_info["Days"];
            if (days === "tba") return;

            const time_data = translateTime(course_info["Time"]);
            
            for(let char of days) {
                schedule.push([date_dict[char], time_data[0], time_data[1], course_info["CourseName"], course_info["Type"], crn, course_info["Description"]]);
            } 
        });
        schedules.push(schedule);
    } return schedules;
}

function renderSavedHelper(cell, matrix, content, i, j, opacity) {
    const rowspan = getRowSpan(matrix, i, j, accountedFor);
    if (rowspan > 1) {
        cell.style.fontWeight = "bold";
        cell.style.color = "white";
        cell.style.opacity = opacity;
        cell.classList.add('schedule-cell');

        const name = content[0];
        const type = content[1];
        const loc = content[2];
        const desc = content[3];
        const time = content[4];
        const crn = content[5];
        const color = 'black';

        cell.style.backgroundColor = color;    
        cell.rowSpan = rowspan;

        cell.innerHTML = `
            <div class="class-info">
                <div class="class-details">
                    <div class="course-title">${name} | ${type.charAt(0).toUpperCase() + type.slice(1)}</div>
                    <div class="course-description">${desc}</div>
                    <div class="course-loc"> ${loc} | ${time} </div>
                </div>
            </div>
        `;
    } return rowspan;
}


function renderSavedMatrix(matrix) {
    // reset the matrix
    generateMatrix();
 
    accountedFor = Array.from({ length: matrix.length }, () => Array(matrix[0].length).fill(false));
    const table = document.getElementById("schedulerTable");

    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            const currentContent = matrix[i][j];            

            // Check for ASYNC Classes
            if ((currentContent && currentContent.includes("ASYNC")))
                continue;          
        
            if (currentContent && !accountedFor[i][j]) {  
                let offset = 0;
                for (let k = j-1; k > -1; k--) {
                    if (accountedFor[i-1][k]) offset++;
                } 

                const currentCell = table.rows[i + 1].cells[j + 1 - offset];
                const content = currentContent;              
                const rowspan = renderSavedHelper(currentCell, matrix, content, i, j, 1); 

                for(let k = 0; k < rowspan - 1; k++) 
                    table.rows[i + 2 + k].deleteCell(-1);
            }
        }
    }
}

function createSavedPreviewMatrix(matrix, crn_index, globalStartRow = 5, globalEndRow = 78) {
    const table = document.createElement("table");
    table.className = "mini-preview";

    // Loop from globalStartRow to globalEndRow for consistency
    for (let rowIndex = globalStartRow; rowIndex <= globalEndRow; rowIndex++) {
        const tr = table.insertRow();
        (matrix[rowIndex] || []).forEach((cellContent, _) => {
            const td = tr.insertCell();
            if (cellContent) {
                td.style.backgroundColor = '#676767';
            }
        });
    }

    const scheduleDiv = document.createElement("div");
    scheduleDiv.className = "schedule-container";
    scheduleDiv.appendChild(table);

    // Attach the hover event listener
    scheduleDiv.addEventListener('mouseover', () => {
        if(ifMobile) return;
        crn_list = savedCRNS[crn_index].split(",");
        renderSavedMatrix(matrix);
    });

    return scheduleDiv;
}

function generateCompressedPreviewFromCRNs() {
    const container = document.getElementById("save-table");
    container.innerHTML = "";

    // Check if there are no entries at all
    if (savedCRNS.length === 0) {
        return;
    } matricies = convertToScheduleMatrices(schedules);
    
    for (let i = 0; i < matricies.length; i++) {
        const matrix = matricies[i];
        const scheduleDiv = createSavedPreviewMatrix(matrix, i);

        const previewDiv = document.createElement("div");
        previewDiv.className = "preview";
        previewDiv.draggable = true;

        // Create a div for the unique identifier
        const identifierDiv = document.createElement("div");
        identifierDiv.className = "identifier";
        identifierDiv.textContent = i + 1;

        // Add an event listener to the preview div for hover and click
        identifierDiv.addEventListener('mouseover', () => {
            scheduleDiv.style.width = "0";
            identifierDiv.style.backgroundColor = "red";
            identifierDiv.textContent = "Remove Schedule";
            identifierDiv.style.width = "100%";
            identifierDiv.style.borderRadius = "5px";
            scheduleDiv.style.padding = "0";
        });

        identifierDiv.addEventListener('mouseout', () => {
            scheduleDiv.style.width = "100%";
            identifierDiv.style.width = "35px";
            identifierDiv.style.backgroundColor = "#383A36";
            identifierDiv.textContent = i + 1;
            scheduleDiv.style.padding = "5px";
            identifierDiv.style.borderRadius = "5px 0px 0px 5px";
        });

        identifierDiv.addEventListener('click', () => {
            removeSchedule(savedCRNS[i]);
            savedCRNS.splice(i, 1);
            schedules.splice(i, 1);
            matricies.splice(i, 1);    
            generateCompressedPreviewFromCRNs();
        });

        previewDiv.appendChild(identifierDiv);
        previewDiv.appendChild(scheduleDiv);
        container.appendChild(previewDiv);
    }
}

async function removeSchedule(crns) {
    const sendData = {};
    sendData["CRNs"] = crns;
    sendData["ID"] = UOID;
    sendData["action"] = "removeSchedule";

    console.log(sendData)

    try {
        const response = await fetch("https://o5p61mwx3m.execute-api.us-west-2.amazonaws.com/default/userLogin", {
            method: "POST",
            body: JSON.stringify(sendData),
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Network response was not ok (${response.status})`);
        }
    } catch (error) {
        // Handle errors, such as network issues or JSON parsing problems
        console.error("Failed to login:", error);
        throw error; // Re-throw the error for the caller to handle if needed
    }
}

// Add event listener to the save button
async function saveSchedule() {
    if (crn_list.length === 0) {
        displayErrorMessage("Please select a schedule to save!");
        return;
    }

    const sendData = {};
    sendData["CRNs"] = crn_list.join(',');
    sendData["ID"] = UOID;
    sendData["action"] = "addSchedule";

    console.log(JSON.stringify(sendData));

    try {
        const response = await fetch("https://o5p61mwx3m.execute-api.us-west-2.amazonaws.com/default/userLogin", {
            method: "POST",
            body: JSON.stringify(sendData),
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Network response was not ok (${response.status})`);
        }
    } catch (error) {
        // Handle errors, such as network issues or JSON parsing problems
        console.error("Failed to login:", error);
        throw error; // Re-throw the error for the caller to handle if needed
    }
}

document.getElementById("saveSchedule").addEventListener("click", saveSchedule);
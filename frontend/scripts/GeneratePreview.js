let selectedMatrix = null;
let crns = new Set();

function updateCRNTable(crns) {
    const crnDiv = document.getElementById("crn-table");
    const crnList = [...crns].join(', ');  
    crnDiv.innerHTML = `<h3>${crnList}</h3>`;
}

function createPreviewMatrix(container, matrix, globalStartRow = 5, globalEndRow = 78) {
    const table = document.createElement("table");
    table.className = "mini-preview";

    // Loop from globalStartRow to globalEndRow for consistency
    for (let rowIndex = globalStartRow; rowIndex <= globalEndRow; rowIndex++) {
        const tr = table.insertRow();
        (matrix[rowIndex] || []).forEach((cellContent, _) => {
            const td = tr.insertCell();
            if (cellContent) {
                let dataArr = cellContent.split(',');
                const name = dataArr[0];
                const desc = dataArr[3].trim();
                const colorKey = `${name},${desc}`;
                td.style.backgroundColor = colorMapping[colorKey] || '#e0e0e0';
            }
        });
    }

    const scheduleDiv = document.createElement("div");
    scheduleDiv.className = "schedule-container";
    scheduleDiv.appendChild(table);

    // Attach the hover event listener
    scheduleDiv.addEventListener('mouseover', () => {
        if(ifMobile) return;
        renderMatrix(matrix);
    });

    // Add the event listener to handle click for the preview
    scheduleDiv.addEventListener('click', () => {
        // Define the containers
        const selectedContainer = document.getElementById('selected-schedule-container');

        // Check if the selectedContainer already has a child
        console.log(selectedContainer.firstChild)
        if (selectedContainer.firstChild) {
            container.appendChild(selectedContainer.firstChild);
        }

        // Move the selected schedule to the selected-schedule-container
        selectedContainer.appendChild(scheduleDiv);

        document.querySelectorAll('.schedule-container.selected').forEach(el => {
            el.classList.remove('selected');
        });

        scheduleDiv.classList.add('selected');
        selectedMatrix = matrix;

        // Update the CRN table and Location Table
        crns = new Set()
        locations = [];
        for (let i = 0; i < selectedMatrix.length; i++) {
            for (let j = 0; j < selectedMatrix[i].length; j++) {
                const cellContent = selectedMatrix[i][j];
                if (cellContent) {
                    let dataArr = cellContent.split(',');
                    if (dataArr[0] === "ASYNC") {
                        for (let k = 1; k < dataArr.length; k++)
                            crns.add(dataArr[k].trim());
                    } else {
                        const tupleKey = `${dataArr[0]},${dataArr[3].trim()}`;
                        if (!crns.has(dataArr[2].trim())) {
                            crns.add(dataArr[2].trim());
                            const location = classData[tupleKey].byCRN[dataArr[2].trim()][0].Location.split(' ')[1];
                            locations.push([location, tupleKey]);
                        }
                    }
                }
            }
        } 

        updateCRNTable(crns);
        updateMap();
    });

    return scheduleDiv;
}

function generateCompressedPreview() {
    const container = document.getElementById("preview-table");
    const selectedView = document.getElementById("selected-schedule-view");

    selectedView.style.display = "block";
    container.innerHTML = "";

    // Check if there are no entries at all
    if (scheduleMatrices.length === 0) {
        return;
    }

    // Lazy Loading
    let loadIndex = 0; // Start index for loading
    const loadStep = 20; // Number of matrices to load at a time

    // Function to load a portion of matrices
    function loadPortion(initialize) {
        for (let i = loadIndex; i < Math.min(loadIndex + loadStep, scheduleMatrices.length); i++) {
            const matrix = scheduleMatrices[i];
            scheduleDiv = createPreviewMatrix(container, matrix);
            container.appendChild(scheduleDiv);
            if (i === loadIndex && initialize) { 
                scheduleDiv.click(); // Select the first schedule by default
            }
        } loadIndex += loadStep; // Update the load index
    }

    // Initial load
    loadPortion(true);

    // Scroll event listener for lazy loading
    container.addEventListener('scroll', () => {
        if (container.scrollHeight - container.scrollTop <= container.clientHeight * 1.5) {
            loadPortion(false);
        }
    });

    // Add event listener for mouseleave on the main container
    container.addEventListener('mouseleave', () => {
        if (selectedMatrix) {
            renderMatrix(selectedMatrix);
        }
    });
}

document.getElementById("Copy CRNs").addEventListener("click", function() {
    // Get the text content from the h3 inside the crn-table
    const textToCopy = document.querySelector("#crn-table h3").textContent;

    // Use the Clipboard API to copy the text
    navigator.clipboard.writeText(textToCopy).then(function() {
        console.log('Text successfully copied to clipboard');

        // Get button's position and dimensions
        const button = document.getElementById("Copy CRNs");
        const rect = button.getBoundingClientRect();

        // Calculate origin based on button's position
        const originX = (rect.left + rect.right) / 2 / window.innerWidth;
        const originY = (rect.top + rect.bottom) / 2 / window.innerHeight;

        // Trigger the confetti from the button's position
        confetti({
            particleCount: 300,
            spread: 130,
            origin: { x: originX, y: originY }
        });

    }).catch(function(err) {
        console.error('Unable to copy text to clipboard', err);
    });
});

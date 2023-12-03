let selectedMatrix = null;

function updateCRNTable(crns) {
    crn_list = [...crns];  
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
                const name = cellContent[0];
                const desc = cellContent[3];
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

    return scheduleDiv;
}

const loadStep = 20; // Number of matrices to load at a time
function generateCompressedPreview() {
    const container = document.getElementById("preview-table");
    const selectedView = document.getElementById("selected-schedule-view");
    const selectedContainer = document.getElementById('selected-schedule-container');
    
    selectedView.style.display = "block";
    selectedContainer.innerHTML = "";
    selectedMatrix = null;
    container.innerHTML = "";

    // Check if there are no entries at all
    if (scheduleMatrices.length === 0) {
        return;
    }

    let loadIndex = 0; // Start index for loading
    let currentStep = 0; // To keep track of current step for back button
    let totalSteps = Math.ceil(scheduleMatrices.length / loadStep);

    // Function to load a portion of matrices
    function loadPortion() {
        clearContainer(container);
        container.scrollTop = 0; // Scrolls to the top of the container.
        for (let i = loadIndex; i < Math.min(loadIndex + loadStep, scheduleMatrices.length); i++) {
            const matrix = scheduleMatrices[i];
            const scheduleDiv = createPreviewMatrix(container, matrix);

            const previewDiv = document.createElement("div");
            previewDiv.className = "preview";

            // Create a div for the unique identifier
            const identifierDiv = document.createElement("div");
            identifierDiv.id = `identifierDiv`;
            identifierDiv.className = "identifier";
            identifierDiv.textContent = i + 1;

            previewDiv.appendChild(identifierDiv);
            previewDiv.appendChild(scheduleDiv);
            container.appendChild(previewDiv);

            // Add the event listener to handle click for the preview
            previewDiv.addEventListener('click', () => {
                // Define the containers
                const selectedContainer = document.getElementById('selected-schedule-container');

                // Check if the selectedContainer already has a child
                if (selectedContainer.firstChild) {
                    container.appendChild(selectedContainer.firstChild);
                }

                // Move the selected schedule to the selected-schedule-container
                selectedContainer.appendChild(previewDiv);

                document.querySelectorAll('div.selected').forEach(el => {
                    el.classList.remove('selected');
                });

                identifierDiv.classList.add('selected');
                selectedMatrix = matrix;

                // Update the CRN table and Location Table
                crns = new Set()
                locations = [];
                for (let i = 0; i < selectedMatrix.length; i++) {
                    for (let j = 0; j < selectedMatrix[i].length; j++) {
                        const cellContent = selectedMatrix[i][j];
                        if (cellContent) {
                            let dataArr = cellContent;
                            if (dataArr.includes("ASYNC")) {
                                dataArr = cellContent.split(',');
                                for (let k = 1; k < dataArr.length; k++)
                                    crns.add(dataArr[k].trim());
                            } else {
                                const tupleKey = `${dataArr[0]},${dataArr[3]}`;
                                if (!crns.has(dataArr[5])) {
                                    crns.add(dataArr[5]);
                                    const location = dataArr[2].split(' ')[1];
                                    locations.push([location, tupleKey]);
                                }
                            }
                        }
                    }
                } 

                updateCRNTable(crns);
                updateMap();
                renderMatrix(selectedMatrix);
            });

            if (i === loadIndex && !selectedMatrix) { 
                previewDiv.click(); // Select the first schedule by default
            }
        }
        updateButtonStates(); // Update the states of back and forward buttons
    }

    // Function to clear the container
    function clearContainer(container) {
        container.innerHTML = "";
    }

    // Function to update the state of the buttons
    function updateButtonStates() {
        document.getElementById('prev-page').disabled = currentStep <= 0;
        document.getElementById('next-page').disabled = loadIndex + 20 >= scheduleMatrices.length;

        // Update the text for the page number
        document.getElementById('page-number').innerText = `${currentStep + 1}/${totalSteps}`;
    }

    // Function to load the next portion of matrices
    window.loadNext = function() {
        if (loadIndex < scheduleMatrices.length) {
            loadIndex += loadStep;
            currentStep++;
            loadPortion();
        }
    }

    // Function to load the previous portion of matrices
    window.loadPrevious = function() {
        if (currentStep > 0) {
            loadIndex -= loadStep;
            currentStep--;
            loadPortion();
        }
    }

    // Initial load
    loadPortion();

    // Add event listener for mouseleave on the main container
    container.addEventListener('mouseleave', () => {
        if (selectedMatrix && !ifMobile) {
            renderMatrix(selectedMatrix);
        }
    });

    // Update the button states initially
    updateButtonStates();
}
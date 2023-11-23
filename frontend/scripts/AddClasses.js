let fuse; 
let classData = null;
let colorMapping = {}
let lastClickedPickerId = null;
let color_index = 0;
let numCredits = 0;

const colors = ["#E63946", "#F4A261", "#2A9D8F", "#264653", "#2B2D42", "#EF476F", "#073B4C", "#006D77", "#3A0CA3", "#D62828"];
const addedClassCodes = new Set();

const filter = document.getElementById("filter");
filter.disabled = true;

function updateCredits() {
    const creditsDiv = document.getElementById("credits");
    const mobileCreditsDiv = document.getElementById("credits-mobile");
    creditsDiv.innerHTML = `${numCredits} Credits`;
    mobileCreditsDiv.innerHTML = `${numCredits} Credits`;
}

function group(courseList) {
    const courseDict = {};
    courseList.forEach(course => {
        let tupleKey = `${course.CourseName},${course.Description}`;
        const crn = course.crn;
        const instructor = course.Instructor;

        // Initialize the dictionary for the tupleKey if it doesn't exist
        if (!courseDict[tupleKey]) {
            courseDict[tupleKey] = { byCRN: {}, byInstructor: {} };
        }

        // Group by CRN
        if (!courseDict[tupleKey].byCRN[crn]) {
            courseDict[tupleKey].byCRN[crn] = [];
        }
        courseDict[tupleKey].byCRN[crn].push(course);

        // Group by Instructor
        if (!courseDict[tupleKey].byInstructor[instructor]) {
            courseDict[tupleKey].byInstructor[instructor] = [];
        }
        courseDict[tupleKey].byInstructor[instructor].push(course);
    });
    return courseDict;
}

function fetchData() {
    const apiEndpoint = "https://sbmswiqb32.execute-api.us-west-2.amazonaws.com/default/retrieveClassInfo"; 

    // Show the loading bar
    showLoadingBar();
    return fetch(apiEndpoint)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok (${response.status})`);
            }
            return response.json();
        })
        .then(responseData => {
            classData = group(responseData);
            return responseData; // Return the fetched data
        })
        .catch(error => {
            console.error("Error:", error);
            throw error;
        })
        .finally(() => {
            // Hide the loading bar when the request is complete (whether successful or not)
            hideLoadingBar();
        });
}

function showLoadingBar() {
    const loaderBar = document.querySelector(".loader-bar");
    loaderBar.style.width = "100%"; // Show the loading bar at full width
}

function hideLoadingBar() {
    const loaderBar = document.querySelector(".loader-bar");
    loaderBar.style.width = "0"; // Hide the loading bar
}

// Function to enable or disable the input field
function toggleInputField(isEnabled) {
    const classSearchInput = document.getElementById("classSearch");
    classSearchInput.disabled = !isEnabled;
}

// Usage: Call fetchData and create Fuse instance inside its .then() block
toggleInputField(false); // Disable input field initially
fetchData()
    .then(data => {
        const fuseOptions = {
            keys: ["CourseName", "Description"], // Include score for search results
            threshold: 0.9, // Adjust the threshold for fuzzy matching
        };
        fuse = new Fuse(data, fuseOptions); // Create the Fuse instance with the fetched data
        toggleInputField(true); // Enable input field after data is processed
    })
    .catch(error => {
        // Handle errors here
        console.error("Fetch error:", error);
        toggleInputField(true); // Enable input field even in case of an error
    });

// Function to update search results
function updateSearchResults(query) {
    const searchResults = document.getElementById("search-results");
    let results = fuse.search(query);

    let maxIndex = Math.min(results.length, 200);
    results = results.slice(0, maxIndex); 

    // Create a Set to track unique course names
    const uniqueCourse = new Set();

    // Filter results to include only unique course names
    const uniqueResults = results.filter(result => {
        tupleKey = `${result.item.CourseName},${result.item.Description}`
        if (!uniqueCourse.has(tupleKey)) {
            uniqueCourse.add(tupleKey);
            return true; // Keep this item
        } return false; // Skip this item, it's a duplicate
    });

    // Clear previous search results
    searchResults.innerHTML = "";

    if (uniqueResults.length === 0 && query !== "") {
        displayErrorMessage("No results found!");
    } else {
        uniqueResults.forEach((result) => {
            tupleKey = `${result.item.CourseName},${result.item.Description}`;
            if (!addedClassCodes.has(tupleKey)) {
                const listItem = document.createElement("div");
                listItem.classList.add("result-info");

                // Create the inner HTML structure for the class info
                listItem.innerHTML = `
                    <div class="class-details">
                        <div class="course-title">${result.item.CourseName}</div>
                        <div class="course-description">${result.item.Description}</div>
                        <div class="course-loc">${result.item.Credits} Credits</div>
                    </div>
                    <img src="icons/add.png" alt="Add" class="icon add"/>
                `;

                // Append the listItem to the searchResults div
                searchResults.appendChild(listItem);

                // Check if the class code is not already added
                listItem.addEventListener("click", function() {
                    const filter = document.getElementById("filter");
                    filter.disabled = false;

                    updateResults(result.item.CourseName, result.item.Description, result.item.Location, result.item.Credits);
                    listItem.remove(); // Remove the clicked list item

                    // Update the number of credits
                    numCredits += result.item.Credits;
                    updateCredits();
                });
            }
        });
    } 
}

function toggleInstructorDetails(event) {
    const target = event.currentTarget;
    const instructorDetails = target.closest('.class-info').nextElementSibling;

    // If the section is visible, hide it.
    if (instructorDetails.classList.contains('visible')) {
        // Set the height to the current scrollHeight immediately before transition
        instructorDetails.style.height = `${instructorDetails.scrollHeight}px`;
        // Force reflow to ensure the height is applied
        instructorDetails.offsetHeight;
        // Add a tiny timeout to ensure the transition happens
        setTimeout(() => {
            instructorDetails.style.height = '0';
        }, 10);
        instructorDetails.classList.remove('visible');
    } else {
        // Remove the hidden state
        instructorDetails.classList.add('visible');
        // Set height to the scrollHeight, which is the full content height
        instructorDetails.style.height = `${instructorDetails.scrollHeight}px`;
        // Reset the height after the transition, for a responsive design
        const transitionEndHandler = () => {
            if (instructorDetails.classList.contains('visible')) {
                instructorDetails.style.height = 'auto';
            }
            instructorDetails.removeEventListener('transitionend', transitionEndHandler);
        };
        instructorDetails.addEventListener('transitionend', transitionEndHandler);
    }

    // Flip the arrow icon
    target.classList.toggle('flipped');
}

function createInstructorDetails(cell, tupleKey, groupedCourses) {
    const instructorDetailsDiv = document.createElement('div');
    instructorDetailsDiv.classList.add('instructor-details', 'hidden');

    const instructors = groupedCourses[tupleKey].byInstructor;
    let detailsHTML = '';
    for (let instructorName in instructors) {
        // Base Case
        detailsHTML += `
            <div class="instructor-info">
                <h3>${instructorName}</h3>
        `;

        // Iterate through each instructor
        for (let i = 0; i < instructors[instructorName].length; i++) {

            // Init data
            const classType = instructors[instructorName][i]["Type"];
            let location = `| ${instructors[instructorName][i]["Location"]}`;
            let days = instructors[instructorName][i]["Days"].toUpperCase();
            let time = `(${instructors[instructorName][i]["Time"]})`;
            
            // Check if the location is Online
            if (location === "| ASYNC WEB")
                location = "";

            // Check if the time of the class is ASYNC
            if (time === "(0000-0000)") {
                time = "ASYNC WEB";
                days = "";
            } const timeData = `${days} ${time}`;

            detailsHTML += `
                <img src="icons/pin.png" alt="Pin" class="icon pin"/>
                <div class="section-info">
                    Section ${i + 1} ${location}
                </div>
                <div class="course-details">
                    ${classType.replace("+", "").trim()}: ${timeData}
                </div>`;
        } detailsHTML += `</div>`;
    }

    instructorDetailsDiv.innerHTML = detailsHTML;
    cell.appendChild(instructorDetailsDiv);
}

function updateProposedSchedules(classNameToRemove, classDescriptionToRemove) {
    for (let i = 0; i < proposedSchedules.length; i++) {
        // Filter out the class entries that match the class name to remove
        proposedSchedules[i] = proposedSchedules[i].filter(
            ((entry => entry[3] !== classNameToRemove) && (entry => entry[6] !== classDescriptionToRemove))
        );
    };
}

function updateResults(name, desc, location, credits) {
    const tupleKey = `${name},${desc}`; // Convert tuple to string for key
    if (!addedClassCodes.has(tupleKey)) {
        // Check if the class code is not already added
        const tableBody = document.getElementById("classCodeTableBody");
        const newRow = tableBody.insertRow();
        newRow.dataset.tupleKey = tupleKey;
        newRow.classList.add('class-row'); // Add class for styling

        // Assign a unique ID to the newRow
        const uniqueRowId = `row-${Date.now()}`;  // Example unique ID
        newRow.dataset.rowId = uniqueRowId;

        // Get a random color and save it in the colorMapping object
        const color = colors[color_index];
        color_index = (color_index + 1) % colors.length;
        colorMapping[tupleKey] = color;
        
        newRow.style.setProperty("--random-color", color);
        const cell = newRow.insertCell();
        
        // Create the inner HTML structure for the class info
        cell.innerHTML = `
            <div class="class-info">
                <div class="class-details">
                    <div class="course-title">${name}</div>
                    <div class="course-description">${desc}</div>
                    <div class="course-loc">${credits} Credits</div>
                </div>
                <div class="icons-container">
                    <input class="color-picker" type="text" data-coloris>
                    <img src="icons/color.png" alt="Picker" class="icon picker"/>
                    <img src="icons/arrow.png" alt="Arrow" class="icon arrow"/>
                    <img src="icons/trash.png" alt="Trash" class="icon trash"/>
                </div>
            </div>
        `;

        createInstructorDetails(cell, tupleKey, classData);

        // Set the same ID to the color picker
        const inputPicker = cell.querySelector('.color-picker');
        inputPicker.dataset.rowId = uniqueRowId;

        // Add event listeners to the icons
        const arrowIcon = cell.querySelector('.icon.arrow');
        arrowIcon.addEventListener('click', toggleInstructorDetails);

        const pickerIcon = cell.querySelector('.icon.picker');
        pickerIcon.addEventListener('click', () => {
            const inputPicker = cell.querySelector('.color-picker');
            lastClickedPickerId = uniqueRowId; 
            inputPicker.click();
        });

        const trashIcon = cell.querySelector('.icon.trash');
        trashIcon.addEventListener('click', () => {
            if (!isRunning) {            
                // remove the class from the locations
                locations = locations.filter((loc) => {
                    return loc[0] !== location.split(" ")[1];
                }); updateMap();

                numCredits -= credits;
                updateCredits();

                // Remove the class code from the Set
                if (addedClassCodes.has(tupleKey)) {
                    addedClassCodes.delete(tupleKey);

                    if (addedClassCodes.size === 0) {
                        const filter = document.getElementById("filter");
                        filter.disabled = true;

                        const previewTable = document.getElementById("preview-table");
                        const selectedContainer = document.getElementById('selected-schedule-container');
                        const selectedView = document.getElementById('selected-schedule-view');

                        selectedContainer.innerHTML = "";
                        previewTable.innerHTML = "";

                        // Hide the selected schedule container
                        selectedView.style.display = 'none';

                        generateMatrix();
                        updateCRNTable(""); // Clear the CRN table
                
                        selectedMatrix = null;
                        newRow.remove();
                        return;
                    }

                    updateProposedSchedules(tupleKey.split(',')[0], tupleKey.split(',')[1])
                    scheduleMatrices = convertToScheduleMatrices(proposedSchedules);
                    currentScheduleIndex = 0; // Reset index to the first schedule

                    const selectedContainer = document.getElementById('selected-schedule-container');
                    selectedContainer.innerHTML = "";

                    generateCompressedPreview();
                    if (noSchedules) {
                        generateSchedule();
                    }
                
                    // Remove the row from the table
                    newRow.remove();
                    applyFilter();
                    renderMatrix(scheduleMatrices[currentScheduleIndex]);
                    
                }
            
                const currentQuery = classSearchInput.value;
                updateSearchResults(currentQuery); 
            }
        });

        // Add the class code to the Set
        addedClassCodes.add(tupleKey);
        generateSchedule();

        return true;
    } else {
        return false;
    }
}

document.addEventListener('coloris:pick', event => {
    if (lastClickedPickerId) {
        const correspondingRow = document.querySelector(`[data-row-id="${lastClickedPickerId}"]`);
        if (correspondingRow) {
            correspondingRow.style.setProperty("--random-color", event.detail.color);

            // Extracting the class name (course title)
            const courseTitleElement = correspondingRow.querySelector('.course-title');
            const courseDescElement = correspondingRow.querySelector('.course-description');

            if (courseTitleElement) {
                const className = courseTitleElement.textContent;
                const colorKey = `${className},${courseDescElement.textContent}`;
                colorMapping[colorKey] = event.detail.color;
            }
        } 
        const selectedContainer = document.getElementById('selected-schedule-container');
        selectedContainer.innerHTML = "";
        generateCompressedPreview(scheduleMatrices);
        renderMatrix(selectedMatrix);
        updateMap();
    }
});

function deleteTupleFromSet(addedClassCodes, course_name, course_desc) {
    const tupleKey = `${course_name},${course_desc}`;  // Convert tuple to string for key
    
    // Check if the Set has the tuple key
    if (addedClassCodes.has(tupleKey)) {
        addedClassCodes.delete(tupleKey);
        color_index = (color_index - 1) % colors.length;
        delete colorMapping[tupleKey];
    }
}

// Add an event listener to trigger the fuzzy search on input change
const classSearchInput = document.getElementById("classSearch");
classSearchInput.addEventListener("input", (event) => {
    const query = event.target.value;
    updateSearchResults(query);
});
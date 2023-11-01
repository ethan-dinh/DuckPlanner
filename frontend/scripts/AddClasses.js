let fuse; // Declare the fuse variable globally

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
            threshold: 0.8, // Adjust the threshold for fuzzy matching
        };
        fuse = new Fuse(data, fuseOptions); // Create the Fuse instance with the fetched data
        toggleInputField(true); // Enable input field after data is processed
    })
    .catch(error => {
        // Handle errors here
        console.error("Fetch error:", error);
        toggleInputField(true); // Enable input field even in case of an error
    });


// Create a Set to keep track of added class codes
const addedClassCodes = new Set();

// Function to update search results
function updateSearchResults(query) {
    const searchResults = document.getElementById("search-results");
    let results = fuse.search(query);
    results = results.slice(0, 20); // Limit to top 20 results

    // Clear previous search results
    searchResults.innerHTML = "";

    // Create a list to display search results
    const resultList = document.createElement("ul");
    resultList.classList.add("search-results-list");

    if (results.length === 0) {
        const listItem = document.createElement("li");
        listItem.textContent = `NO RESULTS FOUND`;
        resultList.appendChild(listItem);
    } else {
        results.forEach((result) => {
            const listItem = document.createElement("li");

            if (!addedClassCodes.has((result.item.CourseName, result.item.Description))) {
                // Check if the class code is not already added
                listItem.addEventListener("click", function() {
                    adjustTableHeight();
                    updateResults(result.item.CourseName, result.item.Description);
                    listItem.remove(); // Remove the clicked list item
                });
            }

            // Display only the class name
            const courseNameSpan = document.createElement("span");
            courseNameSpan.classList.add("course-name");
            courseNameSpan.textContent = result.item.CourseName;
            listItem.appendChild(courseNameSpan);

            // Add course description as a hidden span element
            const descriptionSpan = document.createElement("span");
            descriptionSpan.classList.add("description");
            descriptionSpan.textContent = `${result.item.Description}`;
            listItem.appendChild(descriptionSpan);

            resultList.appendChild(listItem);
        });
    }

    searchResults.appendChild(resultList);
    adjustTableHeight();
}

let colorMapping = {}

let lastBucket = { r: -1, g: -1, b: -1 };
function getRandomColorComponent(bucketNum) {
    let bucketSize = Math.floor(256 / bucketNum);
    let randomBucket;
    
    // Ensure we don't pick the same bucket consecutively
    do { randomBucket = Math.floor(Math.random() * bucketNum);
    } while (lastBucket.r === randomBucket);
    
    lastBucket.r = randomBucket;
    return Math.floor(randomBucket * bucketSize + Math.random() * bucketSize);
}

function getRandomColor() {
    const bucketNum = 30; // Increase for more variety, but less pastel

    // Generate a random base color
    const r = getRandomColorComponent(bucketNum);
    const g = getRandomColorComponent(bucketNum);
    const b = getRandomColorComponent(bucketNum);

    // Blend with black to get the darker shade
    const blendPercent = 0.3;  // 30% black, 70% original color
    const darkR = Math.floor(r * (1 - blendPercent));
    const darkG = Math.floor(g * (1 - blendPercent));
    const darkB = Math.floor(b * (1 - blendPercent));

    return `rgb(${darkR},${darkG},${darkB})`;
}

function updateResults(name, desc) {
    const tupleKey = `${name},${desc}`;  // Convert tuple to string for key
    const colorKey = `${name}`;

    if (!addedClassCodes.has(tupleKey)) {
        // Check if the class code is not already added
        // Create a new row in the table and add the class code
        const tableBody = document.getElementById("classCodeTableBody");
        const newRow = tableBody.insertRow();

        // Get a random color and save it in the colorMapping object
        const color = getRandomColor();
        colorMapping[colorKey] = color;
        
        newRow.style.setProperty("--random-color", color);;
        const cell = newRow.insertCell();
        cell.textContent = `${name} - ${desc}`;

        // Add the class code to the Set
        addedClassCodes.add(tupleKey);
        return true;

    } else {
        return false;
    }
}

function deleteTupleFromSet(addedClassCodes, course_name, course_desc) {
    const tupleKey = `${course_name},${course_desc}`;  // Convert tuple to string for key
    
    // Check if the Set has the tuple key
    if (addedClassCodes.has(tupleKey)) {
        // Delete the tuple from the Set
        addedClassCodes.delete(tupleKey);

        // Also delete the associated color from the colorMapping object
        delete colorMapping[tupleKey];
    }
}

// Add an event listener to trigger the fuzzy search on input change
const classSearchInput = document.getElementById("classSearch");
classSearchInput.addEventListener("input", (event) => {
    const query = event.target.value;
    updateSearchResults(query);
});

// Add an event listener to DELETE class codes from the table
const classCodeTable = document.getElementById("classCodeTable");
classCodeTable.addEventListener("click", function(event) {
    const target = event.target;

    // Check if the clicked element is a table cell (td)
    if (target.tagName === "TD") {
        // Get the text content of the clicked cell
        const cellText = target.textContent.trim();

        const course_name = cellText.split(" - ")[0].trim()
        const course_desc = cellText.split(" - ")[1].trim()

        // Remove the class code from the Set
        deleteTupleFromSet(addedClassCodes, course_name, course_desc);

        // Remove the row from the table that contains the clicked cell's text
        const rows = classCodeTable.getElementsByTagName("tr");
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const cells = row.getElementsByTagName("td");
            if (cells.length > 0 && cells[0].textContent.trim() === cellText) {
                row.parentNode.removeChild(row);
                break; // Exit the loop after removing the row
            }
        }

        // Refresh the search results using the current value in the search field
        const currentQuery = classSearchInput.value;
        updateSearchResults(currentQuery);
    }
});

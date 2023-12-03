let scheduleMatrices = []
let proposedSchedules =[]
const generateButton = document.querySelector(".modern-button");
let noSchedules = false;
let isRunning = false;

function displayErrorMessage(message) {
    // Create a new div element for the error message
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        document.body.removeChild(errorDiv);
    }, 5000); // Removes the error message after 5 seconds
}

function generateSchedule() {
    isRunning = true;
    generateMatrix();
    showLoadingBar();
    const selectedContainer = document.getElementById('selected-schedule-container');

    // Prepare the data to be sent in the API call
    const requestData = {
        // Include other data if needed
        addedClassCodes: Array.from(addedClassCodes).map(key => key.split(',')), // Convert the Set to an array
    };

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
            displayErrorMessage("No schedules were found! Please select a different combination of classes.");
            
            throw new Error(`Network response was not ok (${response.status})`);
        } return response.json();
    })
    .then((responseData) => {
    
        // Handle the response from the Lambda function here
        proposedSchedules = responseData["schedules"];
        
        // Check if the schedules array is empty
        if (proposedSchedules.length === 0) {
            // If it's empty, display an error message
            displayErrorMessage("No schedules were found! Please select a different combination of classes.");
            noSchedules = true;

            const touch = document.getElementById("touch");
            const filter = document.getElementById("filter");
            touch.disabled = true;
            filter.style.opacity = 0.5;
        } else {
            // If it's not empty, proceed as normal
            scheduleMatrices = []
            noSchedules = false;
            scheduleMatrices = convertToScheduleMatrices(proposedSchedules);
            selectedContainer.innerHTML = "";

            applyFilter();
            renderMatrix(scheduleMatrices[0]);

            const touch = document.getElementById("touch");
            const filter = document.getElementById("filter");
            touch.disabled = false;
            filter.style.opacity = 1;
        } 
        selectedContainer.style.display = 'block'; 
        hideLoadingBar();
        isRunning = false;
    })
    .catch((error) => {
        // Handle errors here
        displayErrorMessage("No schedules were found! Please select a different combination of classes.");
        console.error("API Error:", error);
        hideLoadingBar();
        isRunning = false;
    });
}
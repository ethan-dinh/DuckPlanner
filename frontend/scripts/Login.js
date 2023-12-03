var loginBtn = document.getElementById("login");
var loginPopup = document.getElementById("loginPopup");
var closePopup = document.getElementById("closePopup");
var signUpPopup = document.getElementById("signUpPopup");
var signUpClose = document.getElementById("closeSignupPopup");
let UOID = null;
let ifLoggedIn = false;

// When the user clicks the button, open the popup 
loginBtn.onclick = function() {
    loginPopup.style.display = "flex";
}

// When the user clicks on (x), close the popup
closePopup.onclick = function() {
    loginPopup.style.display = "none";
}

signUpClose.onclick = function() {
    signUpPopup.style.display = "none";
}

// When the user clicks anywhere outside of the popup, close it
window.onclick = function(event) {
    if (event.target == loginPopup || event.target == signUpPopup) {
        loginPopup.style.display = "none";
        signUpPopup.style.display = "none";
    }
}

document.getElementById("logout").onclick = async function() {
    try {
        const response = await fetch("https://o5p61mwx3m.execute-api.us-west-2.amazonaws.com/default/userLogin", {
            method: "POST",
            credentials: 'include',
            body: JSON.stringify({ action: "logout" }),
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (response.ok) {
            location.reload();
            UOID = null;
        } else {
            // Handle response errors (e.g., not successful logout)
            console.error("Logout failed: ", response.status);
        }
    } catch (error) {
        // Handle errors, such as network issues
        console.error("Failed to logout:", error);
    }
};

document.getElementById("loginForm").onsubmit = function(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const formDataObj = Object.fromEntries(formData.entries());
    formDataObj["action"] = "login";

    console.log(formDataObj);
    
    // send the form data to the API
    userLogin(formDataObj).then(responseData => {
        if (responseData["message"] === "Success") {
            loginPopup.style.display = "none";
            const loginBtn = document.getElementById("login");
            const profile = document.getElementById("profile");
            const username = document.getElementById("userInfo");
            const saveSchedule = document.getElementById("saveSchedule");
            const savedSchedules = document.getElementById("savedSchedulesButton");
            const logout = document.getElementById("logout");

            logout.style.display = "flex";
            savedSchedules.style.display = "block";
            saveSchedule.style.display = "flex";
            loginBtn.style.display = "none";
            profile.style.display = "flex";
            username.innerHTML = `${responseData["Username"]}`;
            UOID = responseData["UO ID"];
            ifLoggedIn = true;
        } else {
            displayErrorMessage(`${responseData["message"]}`);
        }
    });
}

// Open the sign-up popup event from the login popup
document.getElementById("signUp").onclick = function() {
    loginPopup.style.display = "none";
    signUpPopup.style.display = "flex";
}

document.getElementById("signUpForm").onsubmit = function(event) {
    // retrieve the form data
    event.preventDefault();

    // Retrieve the password and confirmation from the form
    const password = document.getElementById("new-pass-input").value;
    const confirmPassword = document.getElementById("confirm-pass-input").value;

    // Check if the passwords match
    if (password !== confirmPassword) {
        // If they don't match, alert the user and exit the function
        displayErrorMessage("Passwords do not match. Please try again.");
        return; // Stop the function here
    }

    const formData = new FormData(event.target);
    const formDataObj = Object.fromEntries(formData.entries());
    formDataObj["action"] = "signUp";
    
    // send the form data to the API
    userLogin(formDataObj).then(responseData => {
        if (responseData["message"] === "Success") {
            loginPopup.style.display = "flex";
            signUpPopup.style.display = "none";
        } else {
            displayErrorMessage(`${responseData["message"]}`);
        }
    });
}

// Login Function
async function userLogin(userDetails) {
    try {
        const response = await fetch("https://o5p61mwx3m.execute-api.us-west-2.amazonaws.com/default/userLogin", {
            method: "POST",
            credentials: 'include',
            body: JSON.stringify(userDetails),
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Network response was not ok (${response.status})`);
        }
        
        const responseData = await response.json();
        return responseData;
    } catch (error) {
        // Handle errors, such as network issues or JSON parsing problems
        console.error("Failed to login:", error);
        throw error; // Re-throw the error for the caller to handle if needed
    }
}

document.getElementById("ID-input").addEventListener('input', function (e) {
    // Remove any non-digit characters from the input value
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
    
    // Limit to 9 characters total ("95" + 7 digits)
    if (e.target.value.length > 9) {
      e.target.value = e.target.value.substring(0, 9);
    }
  });

document.getElementById("user-input").addEventListener('input', function (e) {
    // Remove any non-digit characters from the input value
    e.target.value = e.target.value.replace(/[^0-9]/g, '');

    // Limit to 9 characters total ("95" + 7 digits)
    if (e.target.value.length > 9) {
        e.target.value = e.target.value.substring(0, 9);
    }
});

// Function to check if the user is already logged in when the page loads
function checkLoginStatus() {
    fetch("https://o5p61mwx3m.execute-api.us-west-2.amazonaws.com/default/userLogin", {
        method: 'GET',
        credentials: 'include'
    })
    .then(response => {
        return response.json();
    })
    .then(data => {
        if(data["status"] === "success") {
            UOID = data["ID"];
            ifLoggedIn = true;
            const loginBtn = document.getElementById("login");
            const profile = document.getElementById("profile");
            const username = document.getElementById("userInfo");
            const saveSchedule = document.getElementById("saveSchedule");
            const savedSchedules = document.getElementById("savedSchedulesButton");
            const logout = document.getElementById("logout");

            logout.style.display = "flex";
            savedSchedules.style.display = "block";
            saveSchedule.style.display = "flex";
            loginBtn.style.display = "none";
            profile.style.display = "flex";
            username.innerHTML = `${data["username"]}`;
        }
    })
    .catch(error => {
        console.error('Error checking login status:', error);
    }); 
}

// Call checkLoginStatus on page load to check the user's login state
window.onload = checkLoginStatus;
# Duck Planner README
For students at the University of Oregon, the process of selecting and scheduling classes each term can be complicated and time consuming. With the large amount of class options, times offered, and personal scheduling preferences, students need a tool that will simplify the process and cater to their needs. Our intention behind the system is to create a personalized scheduling aid, allowing students to input their desired classes, apply filters, and view schedule variations in a simplified manner.

Duck Planner consists of two main components: a login screen and a scheduling page. The login screen allows users to create a new account or facilitates users access to their personalized dashboard containing previously entered classes and saved schedules. The scheduling and filtering features fetch real-time class data where students can select or modify the classes they plan to take. Once a schedule is chosen, it is saved to their account for future reference. Our system integrates class data with personal preferences while providing an interface between the schedule selection and schedule visualization that saves students time and simplifies their academic planning process.

![Alt text](<Dashboard Preview.png>)

## Hosted Webpage & Source Code
For a live demo and further details, visit our hosted webpage at [Duck Planner](https://duckplanner.org/) and explore the source code on [GitHub](https://github.com/ethan-dinh/DuckPlanner).

## Key Features
* User-Friendly Interface: The intuitive dashboard allows for easy navigation and interaction, prioritizing user engagement.
* Dynamic Scheduling Page: Features real-time class data, with a suite of tools to filter, select, and save schedules.
* Enhanced Security: Utilizes server-side Lambda functions for authentication, safeguarding user credentials and sensitive hashing algorithms.

## Component Tutorial
When entering our website, the user will be greeted with the dashboard view. Here the user can:
* **Select Courses**: To do so, the user can type the description or course code and the algorithm will perform a fuzzy search to retrieve the user's desired class. The user can then select a course by hovering and clicking on their desired course.
* **Select a sorting algorithm**: At the top of the second panel, the user can select how they would like to see their previews. They can sort by compactness, earliest end, latest start, and prioritize asynchronous classes. 
* **Preview View**: By hovering over a schedule, the user can see how their previewed schedule differs from their selected schedule. To select a course, the user can click on the preview.
* **Matrix View**: Here the user can see an expanded view of their selected schedule. Hovering over a class will allow the user to see additional details such as professor name and CRN. 
* **Map View**: By selecting Map in the menu bar, the user will be taken to a map view that will display markers for where their selected classes are located. To see which class is which, the user can click on the marker and a popup will display additional information such as course name and description. 
* **Login / Signup**: In the top right, the user can login or sign up for our service. By signing up / logging in, the user will be granted access to a saved schedules view which will display previously saved schedules. To save a schedule, the user can select the save schedule button located in the top right of the dashboard. 

## Goals/Purpose
The aim of this project is to create a scheduler tailored for UO academic courses. At present, the schedule builder lacks the feature for users to filter the generated schedules. As a result, students must engage in tedious one-on-one comparisons between schedules. Furthermore, the current system does not provide a campus map. Our system will improve upon the current implementation by including services that students across campus have expressed are essential for a well-designed schedule builder: 
1. Campus Map
2. Preview Panel
3. Sorting Algorithm
4. Fuzzy Search for Classes
5. Ability to save multiple schedules for later viewing

## Project Checkpoints
1. Create a web scraper for the UO class schedule. This is present on DuckWeb. Format the data into a CSV that can be imported into mySQL.
2. Create a python backend for the scheduling.
3. Create the frontend that will communicate with mySQL and the Python backend. Figure out how to have the frontend communicate with the backend.
4. Implement a method to convert the selected schedule to matrix format.
5. Implement a map view that adapts to the user's selected schedule

## Architecture
Duck Planner is built using AWS cloud services, ensuring scalability and reliability. The architecture is modular, comprising a Python-based web scraper, a MySQL database, and a frontend crafted with HTML, CSS, and JavaScript.

## Modules
Below is a detailed look at the modules implemented into our webpage.

### Web Scraper - Python
Periodically scrapes class data from the university's website and updates the class information within the database. This ensures that the most current class data is available to users on the client side. The web scraper is to be hosted on an AWS lambda function which is linked with an interval timing function that allows for automatic periodic scraping. The scraper links directly to the database and asynchronously updated the data.

### Database - MySQL
The database stores and manages all the system data. It serves as the primary data access layer, responding to queries from the Authentication Module and the Dashboard Module. The WebScraping Module updates the Database Module to keep the data up to date.

### Frontend - HTML, CSS, JS
The frontend consists of three modules: Dashboard, Authentication, and Scheduling
1. Dashboard Module
   * This is the central hub where users interact with class data and visualize schedules. It communicates with the Database Module to retrieve real-time data and have options to view schedules. It also must communicate with the Database Module when the student wasn’t to save a chosen schedule.
2. Authentication Module
   * This module handles the creation of new user account and verification of existing users. It directly interacts with the Database Module. When a user creates a new account, their information is stored in the database, and when a user logs in, their information fetches and verifies their 95 number and password. After they are verified, students are directed to the Dashboard Module. The verification is hosted on the server side which aids in providing security to the user. Furthermore, by implementing a hidden hash function on the server side, the user’s data is hidden to both other users and the developers.
3. Scheduling Module
   * The scheduling module directly interacts with both the dashboard and database modules. In specific, when a user selects a class via the dashboard module, a post request is sent to the backend where the scheduling module requests data from the database to calculate and determine all possible schedules.
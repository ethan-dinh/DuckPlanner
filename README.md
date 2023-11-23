# UO Scheduler

## Goals/Purpose
The aim of this project is to create a scheduler tailored for UO academic courses. At present, the schedule builder lacks the feature for users to filter the generated schedules. As a result, students must engage in tedious one-on-one comparisons between schedules. Additionally, the current system does not display the assigned finals for the courses students have chosen.

## Project Checkpoints
1. Create a web scraper for the UO class schedule. This is present on duckweb. Format the data into a CSV that can be imported into mySQL.
2. Create a python backend for the scheduling.
3. Create the frontend that will communicate with mySQL and the Python backend. Figure out how to have the frontend communicate with the backend.
4. Implement a method to convert the selected schedule to matrix format.
5. We also need to display all the possible formats in a table.

### Web Scraper - Python
The goal of the web scraper is to compile a CSV file that will include all of the class data including time, location, and CRN. I want to be able to use the Google Maps API to display the buildings. We could also potentially pick a schedule that minimizes the amount of distance between each class.

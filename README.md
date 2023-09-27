# UO Scheduler

## Goals/Purpose
The goal of this project is to develop a scheduler for UO academic classes. Currently, schedule builder does not allow for users to filter the type of schedules that are produced. Instead, students have to rely on brute force comparisons between two schedules at a time. Furthermore, schedule builder does not show when finals are assigned for the student's selected classes.

## Methods
1. Create a web scraper for the UO class schedule. This is present on duckweb. Format the data into a CSV that can be imported into mySQL.
2. Create a python backend for the scheduling.
3. Create the frontend that will communicate with mySQL and the Python backend. Figure out how to have the frontend communicate with the backend.
4. Implement a method to convert the selected schedule to matrix format.
5. We also need to display all the possible formats in a table.

### Web Scraper - Python
The goal of the web scraper is to compile a CSV file that will include all of the class data including time, location, and CRN. I want to be able to use the Google Maps API to display the buildings. We could also potentially pick a schedule that minimizes the amount of distance between each class.

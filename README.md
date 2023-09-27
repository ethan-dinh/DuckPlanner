# UO Scheduler

## Goals/Purpose
The goal of this project is to develop a scheduler for UO academic classes. Currently, schedule builder does not allow for users to filter the type of schedules that are produced. Instead, students have to rely on brute force comparisons between two schedules at a time. Furthermore, schedule builder does not show when finals are assigned for the student's selected classes. 

## Methods
1. Create a web scraper for the UO class schedule. This is present on duckweb. Format the data into a CSV that can be imported into mySQL. 
2. Create a python backend for the scheduling.
3. Create the frontend that will communicate with mySQL and the Python backend. Figure out how to have the frontend communicate with the backend. 

"""
Title: UO Schedule Data Parser
Author: Ethan Dinh
Date: 9/28/2023
"""

# Importing Libraries
import csv
from UOCourseClasses import Course
import os
import CourseMatrix as cm
from typing import Dict, List

# --------------------------------- #
#          Global Variables         #
# --------------------------------- #
date_dict = {"m": "MONDAY", "t": "TUESDAY", "w": "WEDNESDAY", "tr": "THURSDAY", "f": "FRIDAY"}

# --------------------------------- #
#            Functions              #
# --------------------------------- #

def readData(filepath: str) -> List:
    """ Function to read the data from a csv file """
    with open(filepath, "r") as f:
        reader = csv.reader(f)
        data = list(reader)
    return data

def parseData(csv_data: List) -> Dict:
    """ Function to parse the data into a list of Course objects """
    courses = {}
    curr_course_name = ""
    for i in range(1, len(csv_data)):
        if len(csv_data[i]) == 3:
            curr_course_name = csv_data[i][0]
            courses[curr_course_name] = Course(csv_data[i][0], csv_data[i][1], csv_data[i][2])
        else:
            courses[curr_course_name].sections.append(csv_data[i])
            
    return courses

def userPrompt(course_dict: dict) -> List:
    """ Function to prompt the user for a course name """

    # Clear the terminal
    print("\033c", end="")

    # Print a welcome splash screen
    print("Welcome to the UO Schedule Data Parser!")

    # Prompt a input splash screen
    term_output = "Please enter a term to search for.\nExample: \"CS 161\"\n\nEnter \"done\" to proceed.\nSelected Courses:\n"

    curr_input = ""
    classes = []
    while curr_input != "done":
        print("\033c", end="")
        print(term_output)
        curr_input = input("Enter a course name: ")

        if curr_input in course_dict:
            term_output += f"{curr_input}\n"
            classes.append(curr_input)

    return classes

def translateTime(time: str):
    start = time.split("-")[0]
    end = time.split("-")[1]
    duration = ((int(end[:2]) - int(start[:2])) * 60) + (int(end[2:]) - int(start[2:]))
    return [[f"{start[:2]}:{start[2:]}", str(duration)], int(start[:2]), int(end[:2])]

def time_to_minutes(time):
    """Convert time in HH:MM format to minutes since midnight."""
    hours, minutes = map(int, time.split(":"))
    return hours * 60 + minutes

def parse_days(s: str):
    days = []
    i = 0
    while i < len(s):
        if s[i:i+2] == 'tr': # Check if "tr" is in the string
            days.append('tr')
            i += 2
        else:
            days.append(s[i])
            i += 1
    return days

def translateSection(courses: List[str], course_dict) -> List[List[str]]:
    matrix_classes = []
    earliest_time = 24
    latest_time = 0
    for course in courses:
        for section in course_dict[course].sections:
            if section[0] == "Lecture" or section[0] == " " or section[0] == "+ Dis":
                days = parse_days(section[5])
                time_data, curr_start, curr_end = translateTime(section[4])

                if curr_start < earliest_time:
                    earliest_time = curr_start
                if curr_end > latest_time:
                    latest_time = curr_end

                for day in days:
                    matrix_classes.append([date_dict[day], time_data[0], time_data[1], course])

    return matrix_classes, earliest_time, latest_time + 1

# --------------------------------- #
#              Main                 #
# --------------------------------- #

def main():
    csv_data = readData("CourseData.csv")
    course_dict = parseData(csv_data)
    user_courses = userPrompt(course_dict)
    
    matrix_classes, early_start, late_end = translateSection(user_courses, course_dict)
    matrix = cm.init_matrix(early_start, late_end)

    # Check for collisions
    schedule = {day: set() for day in ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']}
    for course in matrix_classes:
        minutes = time_to_minutes(course[1])
        for i in range(int(course[2]) // 10):
            if (minutes + i * 10) in schedule[course[0]]:
                print("Schedule conflict!")
                exit(1)
            else:
                schedule[course[0]].add(minutes + i * 10)
        
        # If no collisions, add the class to the matrix
        cm.add_class(matrix, course[0], course[1], int(course[2]), course[3])
    
    cm.print_matrix(matrix)

if __name__ == "__main__":
    main()
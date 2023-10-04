"""
Title: UO Schedule Data Parser
Author: Ethan Dinh
Date: 9/28/2023
"""

# Importing Libraries
import csv
from ScheduleMatrix import ScheduleMatrix as SM
from typing import Dict, List

# --------------------------------- #
#          Global Variables         #
# --------------------------------- #
date_dict = {"m": "MONDAY", "t": "TUESDAY", "w": "WEDNESDAY", "r": "THURSDAY", "f": "FRIDAY"}

# --------------------------------- #
#            Classes                #
# --------------------------------- #
class Course:
    """ Class to represent a course """
    def __init__(self, name: str, description: str, credits: float):
        self.name = name
        self.description = description
        self.credits = credits
        self.sections = []

class Schedule:
    """ Class to represent a schedule """
    def __init__(self):
        self.schedule = []

# --------------------------------- #
#          Matrix Display           #
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
            if curr_course_name not in courses:
                courses[curr_course_name] = [Course(csv_data[i][0], csv_data[i][1], csv_data[i][2])]
                index = 0
            else:
                courses[curr_course_name].append(Course(csv_data[i][0], csv_data[i][1], csv_data[i][2]))
                index += 1
        else:
            courses[curr_course_name][index].sections.append(csv_data[i])
            
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
    """ Convert time in HH:MM format to minutes since midnight. """
    hours, minutes = map(int, time.split(":"))
    return hours * 60 + minutes

def parse_days(s: str):
    return list(set(s))

def translateSection(courses: List[dict]) -> List[List[str]]:
    matrix_classes = []
    earliest_time = 24
    latest_time = 0
    for course in courses:
        days = parse_days(course['days'])
        time_data, curr_start, curr_end = translateTime(course['time'])

        if curr_start < earliest_time:
            earliest_time = curr_start
        if curr_end > latest_time:
            latest_time = curr_end

        for day in days:
            matrix_classes.append([date_dict[day], time_data[0], time_data[1], course['name']])

    return matrix_classes, earliest_time, latest_time + 1

# --------------------------------- #
#            Scheduler              #
# --------------------------------- #

def overlaps(time1, time2):
    (start1, end1), (start2, end2) = time1, time2
    return not (end1 <= start2 or start1 >= end2)

def can_schedule_together(section1, section2):
    days1 = set(section1['days'])
    days2 = set(section2['days'])
    
    common_days = days1.intersection(days2)
    if not common_days:
        return True
    
    time1 = extract_time(section1['time'])
    time2 = extract_time(section2['time'])
    return not any(overlaps(time1, time2) for day in common_days)

def extract_time(time_str):
    start_str, end_str = time_str.split("-")
    start = tuple(map(int, start_str.split(":")))
    end = tuple(map(int, end_str.split(":")))
    return start, end

def organizeCourses(courses: List[str], course_dict: dict) -> List[List[str]]:
    user_courses = []
    for course in courses:
        class_list = []

        # To deal with multiple courses with the same name
        if len(course_dict[course]) > 1:
            print("\033c", end="")
            print(f"Multiple courses found for {course}. Please select one:")
            for index, course_obj in enumerate(course_dict[course]):
                print(f"{index + 1}) {course_obj.description}")
            user_input = int(input("Enter a number: ")) - 1
        else:
            user_input = 0

        for section in course_dict[course][user_input].sections:
            if section[0] == "Lecture" or section[0] == " ":
                curr_class = {'name': course, 'class type': 'lecture', 'time': section[4], 'days': section[5]}
                class_list.append(curr_class)
            else:
                curr_class = {'name': course, 'class type': 'lab', 'time': section[4], 'days': section[5]}
                class_list.append(curr_class)
        user_courses.append(class_list)

    return user_courses

def find_base_lecture_schedule(classes, index=0, current_schedule=[]):
    if index == len(classes):
        return [current_schedule.copy()]
    
    current_class = classes[index]
    lectures = [s for s in current_class if s['class type'] == 'lecture']
    
    all_schedules = []
    for lecture in lectures:
        if all(can_schedule_together(schedule, lecture) for schedule in current_schedule):
            all_schedules.extend(find_base_lecture_schedule(classes, index + 1, current_schedule + [lecture]))
    
    return all_schedules

def find_full_schedule(base_schedule, classes):
    full_schedules = [base_schedule]
    
    for index, _ in enumerate(base_schedule):
        labs = [s for s in classes[index] if s['class type'] == 'lab']
        if labs == []:
            continue
        
        new_schedules = []
        for schedule in full_schedules:
            for lab in labs:
                if all(can_schedule_together(sec, lab) for sec in schedule):
                    new_schedules.append(schedule + [lab])
                    
        full_schedules = new_schedules

    return full_schedules

# --------------------------------- #
#              Main                 #
# --------------------------------- #

def main():
    csv_data = readData("CourseData.csv")
    total_course_dict = parseData(csv_data)
    user_courses = userPrompt(total_course_dict)
    user_course_list = organizeCourses(user_courses, total_course_dict)
    
    # Print the user's selected courses in the dictionary format
    print("\033c", end="")
    print("Possible Schedules:")

    base_schedules = find_base_lecture_schedule(user_course_list)
    all_schedules = []

    for base_schedule in base_schedules:
        all_schedules.extend(find_full_schedule(base_schedule, user_course_list))
 
    all_matrix_schedules = []
    for schedule in all_schedules:
        matrix_classes, early_start, late_end = translateSection(schedule)
        matrix = SM(early_start, late_end)
        for course in matrix_classes:
            matrix.add_class(course[0], course[1], int(course[2]), course[3])
        all_matrix_schedules.append(matrix)   

    index = 0
    while True:
        all_matrix_schedules[index].print_matrix()
        print(f"Schedule {index + 1} of {len(all_matrix_schedules)}")
        user_input = input("Click Enter to cycle through schedules.\nEnter \"exit\" to exit: ")
        print(user_input)
        if user_input == "exit":
            break
        elif user_input == "":
            if index == len(all_matrix_schedules) - 1:
                index = 0
            else:
                index += 1


if __name__ == "__main__":
    main()
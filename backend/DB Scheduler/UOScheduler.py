"""
Title: UO Schedule Data Parser
Author: Ethan Dinh
Date: 9/28/2023
"""

# Importing Libraries
from ScheduleMatrix import ScheduleMatrix as SM
from typing import Dict, List
import shutil
import mysql.connector

# --------------------------------- #
#          Global Variables         #
# --------------------------------- #
date_dict = {"m": "MONDAY", "t": "TUESDAY", "w": "WEDNESDAY", "r": "THURSDAY", "f": "FRIDAY"}
terminal_width = shutil.get_terminal_size().columns
COL_WIDTH = (terminal_width - 11) // 5

db_config = {
    'host': 'ix.cs.uoregon.edu',
    'database': 'Scheduler',
    'user': 'ahuston',
    'password': 'softball2002',
    'port': "3263"
}

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

# --------------------------------- #
#        Translation Layer          #
# --------------------------------- #

def getCourseNames() -> List:
    """ Function to retrieve all of the course names from the database """
    connection = mysql.connector.connect(**db_config)
    cursor = connection.cursor()

    select_query = "SELECT list_data FROM Class_Names WHERE list_name = %s"
    cursor.execute(select_query, ("Course Names",))
    result = cursor.fetchone()

    serialized_list_data = result[0]

    # Deserialize the list (split the string back into a list)
    return serialized_list_data.split(',')

def readDB(user_courses: List) -> List:
    """ Function to read the data from the database """
    connection = mysql.connector.connect(**db_config)
    cursor = connection.cursor()
    query = "SELECT * FROM Class_Info WHERE CourseName IN (%s)"
    placeholders = ', '.join(['%s'] * len(user_courses))
    query = query % placeholders

    cursor.execute(query, tuple(user_courses))

    # Fetch all the rows
    return cursor.fetchall()

def parseData(course_data: List) -> Dict:
    """ Function to parse the data into a list of Course objects """
    courses = {}
    curr_desc = ""
    for course in course_data:
        curr_course_name = course[0]
        if curr_course_name not in courses:
            curr_desc = course[1]
            courses[curr_course_name] = [Course(curr_course_name, curr_desc, course[2])]
        elif course[1] != curr_desc:
            curr_desc = course[1]
            courses[curr_course_name].append(Course(curr_course_name, curr_desc, course[2]))
        courses[curr_course_name][-1].sections.append(course[3:])

    return courses

def userPrompt() -> List:
    """ Function to prompt the user for a course name """

    # Clear the terminal
    print("\033c", end="")

    # Print a welcome splash screen
    print("Welcome to the UO Schedule Data Parser!")

    # Prompt a input splash screen
    term_output = "Please enter a term to search for.\nExample: \"CS 161\"\n\nEnter \"done\" to proceed.\nSelected Courses:\n"

    class_names = getCourseNames()
    curr_input = ""
    classes = []
    while curr_input != "done":
        print("\033c", end="")
        print(term_output)
        curr_input = input("Enter a course name: ")

        if curr_input in class_names:
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
            matrix_classes.append([date_dict[day], time_data[0], time_data[1], course['name'], course['class type']])

    return matrix_classes, earliest_time, latest_time + 1

# --------------------------------- #
#            Scheduler              #
# --------------------------------- #

def overlaps(time1, time2):
    (start1, end1), (start2, end2) = time1, time2
    return not (end1 <= start2 or start1 >= end2)

def can_schedule_together(section1: dict, section2: dict):
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
        else: user_input = 0

        for section in course_dict[course][user_input].sections:
            if section[0] == "Lecture" or section[0] == " ":
                curr_class = {'CRN': section[1], 'name': course, 'class type': 'lecture', 'time': section[4], 'days': section[5]}
                class_list.append(curr_class)
            else:
                curr_class = {'CRN': section[1], 'name': course, 'class type': 'lab', 'time': section[4], 'days': section[5]}
                class_list.append(curr_class)
        user_courses.append(class_list)

    return user_courses

def is_lecture_already_scheduled(schedule, CRN):
    return any(s['CRN'] == CRN for s in schedule)

def find_base_lecture_schedule(classes: List[Dict], index=0, current_schedule=[]):
    if index == len(classes):
        return [current_schedule]

    lectures = [s for s in classes[index] if s['class type'] == 'lecture']
    all_schedules = []
    
    # We only pick the first lecture of a particular CRN to avoid duplication
    unique_CRNs = set(lecture['CRN'] for lecture in lectures)
    for CRN in unique_CRNs:
        related_lectures = [l for l in lectures if l['CRN'] == CRN]
        if all(can_schedule_together(existing_lecture, related_lectures[0]) for existing_lecture in current_schedule):
            all_schedules.extend(find_base_lecture_schedule(classes, index + 1, current_schedule + related_lectures))
    
    return all_schedules

def find_full_schedule(base_schedule, classes):
    # Create a dictionary mapping class name to its sections
    class_map = {section[0]['name']: section for section in classes}
    
    full_schedules = [base_schedule]
    for class_entry in base_schedule:
        class_name = class_entry['name']
        
        # Fetch the corresponding class details from the map
        class_details = class_map.get(class_name, [])
        
        # Filter out the lab sections
        labs = [s for s in class_details if s['class type'] == 'lab']
        
        # Generate new schedules by adding labs that can be scheduled together
        new_schedules = [
            schedule + [lab]
            for lab in labs
            for schedule in full_schedules
            if all(can_schedule_together(sec, lab) for sec in schedule)
        ]
        
        # If we found any valid schedules with labs, update the full_schedules
        if new_schedules:
            full_schedules = new_schedules

    return full_schedules

# --------------------------------- #
#              Main                 #
# --------------------------------- #

def main():
    user_courses = userPrompt()

    DB_data = readDB(user_courses)
    total_course_dict = parseData(DB_data)
    user_course_list = organizeCourses(user_courses, total_course_dict)
    
    # Print the user's selected courses in the dictionary format
    print("\033c", end="")
    print("Possible Schedules:")

    # Find all of the base schedules
    all_schedules = []
    base_schedules = find_base_lecture_schedule(user_course_list)
    for base_schedule in base_schedules:
        all_schedules.extend(find_full_schedule(base_schedule, user_course_list))
 
    # Find all of the sections that fit into the base schedule
    all_matrix_schedules = []
    for schedule in all_schedules:
        matrix_classes, early_start, late_end = translateSection(schedule)
        matrix = SM(early_start, late_end)
        for course in matrix_classes:
            matrix.add_class(course[0], course[1], int(course[2]), course[3], course[4])
        all_matrix_schedules.append(matrix)   

    # Iterate through the list of potential schedules and print them out
    index = 0
    while True:
        all_matrix_schedules[index].print_matrix()
        print(f"Schedule {index + 1} of {len(all_matrix_schedules)}".center(terminal_width))
        print("=" * (terminal_width))
        user_input = input("Press Enter to cycle through schedules.\nEnter \"exit\" to exit: ")
        if user_input == "exit":
            break
        elif user_input == "":
            if index == len(all_matrix_schedules) - 1:
                index = 0
            else:
                index += 1


if __name__ == "__main__":
    main()
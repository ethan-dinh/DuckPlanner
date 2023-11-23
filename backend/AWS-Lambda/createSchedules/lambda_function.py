import mysql.connector
import json
from typing import List, Tuple, Dict

db_config = {
    'host': 'ix.cs.uoregon.edu',
    'database': 'Scheduler',
    'user': 'ahuston',
    'password': 'softball2002',
    'port': "3263"
}

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

# --------------------------------- #
#            Functions              #
# --------------------------------- #

def readDB(user_courses: List) -> List:
    """ Function to read the data from the database """

    # Extract the first element from each tuple in the list
    connection = None
    cursor = None
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()
        
        query = "SELECT * FROM Class_Info WHERE CourseName IN (%s)"
        placeholders = ', '.join(['%s'] * len(user_courses))
        query = query % placeholders

        cursor.execute(query, tuple(user_courses))

        # Fetch all the rows
        return cursor.fetchall()
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


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

def organizeCourses(selected_courses: List, course_dict: Dict) -> List:
    output_list = []
    for course_tuple in selected_courses:
        class_list = []
        name = course_tuple[0]
        desc = course_tuple[1]
        
        # Retrieve the index of the course in the course_dict
        index = 0
        for i in range(len(course_dict[name])):
            if course_dict[name][i].description == desc:
                index = i
                break

        for section in course_dict[course_tuple[0]][index].sections:
            curr_class = {'CRN': section[1], 'name': name, 'desc': desc, 'class type': 'lab', 'time': section[4], 'days': section[5]}

            if section[0] == "Lecture" or section[0] == " ": curr_class['class type'] = 'lecture'
            if curr_class['days'] == 'tba': curr_class['days'] = 'f'
            if curr_class['time'] == 'tba': curr_class['time'] = '0000-0000'
            class_list.append(curr_class)

        output_list.append(class_list)

    return output_list

# --------------------------------- #
#        Scheduling Functions       #
# --------------------------------- #

def overlaps(time1, time2):
    (start1, end1), (start2, end2) = time1, time2
    return not (end1 <= start2 or start1 >= end2)

def extract_time(time_str):
    start_str, end_str = time_str.split("-")
    start = tuple(map(int, start_str.split(":")))
    end = tuple(map(int, end_str.split(":")))
    return start, end

def can_schedule_together(section1: dict, section2: dict):
    days1 = set(section1['days'])
    days2 = set(section2['days'])
    
    common_days = days1.intersection(days2)
    if not common_days:
        return True
    
    time1 = extract_time(section1['time'])
    time2 = extract_time(section2['time'])
    return not any(overlaps(time1, time2) for day in common_days)

def translateTime(time: str):
    start = time.split("-")[0]
    end = time.split("-")[1]
    duration = ((int(end[:2]) - int(start[:2])) * 60) + (int(end[2:]) - int(start[2:]))
    return [f"{start[:2]}:{start[2:]}", str(duration)]

def time_to_minutes(time):
    """ Convert time in HH:MM format to minutes since midnight. """
    hours, minutes = map(int, time.split(":"))
    return hours * 60 + minutes

def parse_days(s: str):
    return list(set(s))

def find_base_lecture_schedule(classes: list[dict], index=0, current_schedule=[]) -> List:
    if index >= len(classes):
        return [current_schedule]

    lectures = [section for section in classes[index] if section['class type'] == 'lecture']
    base_schedules = []
    for lecture in lectures:
        if all(can_schedule_together(existing_lecture, lecture) for existing_lecture in current_schedule):
            base_schedules += find_base_lecture_schedule(classes, index + 1, current_schedule + [lecture])

    return base_schedules

def translateSection(courses: List[dict]) -> List:
    matrix_classes = []
    for course in courses:
        days = parse_days(course['days'])
        time_data = translateTime(course['time'])
        for day in days:
            matrix_classes.append([date_dict[day], time_data[0], time_data[1], course['name'], course['class type'], course['CRN'], course['desc']])

    return matrix_classes

def find_full_schedule(base_schedule, classes):
    # Create a dictionary mapping class name to its sections
    class_map = {section[0]['name']: section for section in classes}
    
    # Start with the base lecture schedules
    full_schedules = [base_schedule]
    
    # Iterate over each class in the base schedule
    for class_entry in base_schedule:
        class_name = class_entry['name']
        
        # Get the corresponding class details
        class_details = class_map.get(class_name, [])
        
        # Filter out the lab sections
        labs = [s for s in class_details if s['class type'] != 'lecture']
        
        # Initialize a list to keep track of new schedules with at least one lab scheduled
        new_schedules = []
        
        # If there are labs, try to find at least one that fits into the schedule
        if labs:
            for schedule in full_schedules:
                lab_scheduled = False  # Flag to check if at least one lab is scheduled
                
                for lab in labs:
                    # Check if this lab can be scheduled with the current schedule
                    if all(can_schedule_together(sec, lab) for sec in schedule):
                        # If yes, add the lab to the current schedule and update the flag
                        new_schedules.append(schedule + [lab])
                        lab_scheduled = True
                
                # If no lab could be scheduled with this class, discard all schedules
                if not lab_scheduled:
                    return []  # Return an empty list, indicating no valid schedule exists
            
            # If we found valid schedules with at least one lab, update the full schedules
            full_schedules = new_schedules
    
    # Return the updated full schedules
    return full_schedules

# --------------------------------- #
#            Lambda                 #
# --------------------------------- #

def lambda_handler(event, context):
    # Handle OPTIONS requests for CORS
    if event['httpMethod'] == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            'body': ''  # body can be empty for OPTIONS requests
        }

    body = json.loads(event['body'])
    user_courses = body.get('addedClassCodes', [])
    
    # Ensure user_courses is a list of tuples
    if not isinstance(user_courses, list) or not all(isinstance(course, list) and len(course) == 2 for course in user_courses):
        return {
            'statusCode': 400,
            'body': 'Invalid user_courses data format. Please provide a list of tuples.'
        }

    # Convert the list of tuples to a list of course names
    user_course_names = [course[0] for course in user_courses]

    # Fetch data from the database
    DB_data = readDB(user_course_names)

    # Parse the database data into a dictionary of courses
    total_course_dict = parseData(DB_data)

    # Organize the selected courses
    user_course_list = organizeCourses(user_courses, total_course_dict)

    # Find all of the base schedules
    all_schedules = []
    base_schedules = find_base_lecture_schedule(user_course_list)

    # Find all of the sections that fit into the base schedule
    for base_schedule in base_schedules:
        all_schedules.extend(find_full_schedule(base_schedule, user_course_list))

    # Limited to 1000 schedules
    if len(all_schedules) > 1000:
        all_schedules = all_schedules[:1000]

    # Translate the schedules into a matrix format
    all_matrix_schedules = []
    for schedule in all_schedules:
        matrix_classes = translateSection(schedule)
        matrix = []
        for course in matrix_classes:
            matrix.append([course[0], course[1], int(course[2]), course[3], course[4], course[5], course[6]])
        all_matrix_schedules.append(matrix) 
                 
    return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Success',
                'schedules': all_matrix_schedules
                }),
            'headers': {
                'Content-Type': 'application/json'
                }
            }
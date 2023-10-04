"""
Name: Ethan Dinh
"""

# Importing Libraries
import shutil

# --------------------------------- #
#          Global Variables         #
# --------------------------------- #
DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]

# Dynamically determine column width based on terminal size
terminal_width = shutil.get_terminal_size().columns
COL_WIDTH = (terminal_width - 11) // len(DAYS)
rem_space = terminal_width - (COL_WIDTH * len(DAYS) + 11)

# --------------------------------- #
#            Functions              #
# --------------------------------- #
def printHeader():
    """ Function to print the header of the schedule matrix """

    print("Proposed Schedule".center(terminal_width))
    print("=" * (terminal_width))
    print("HOURS " + " " * rem_space, end="")
    for day in DAYS:
        print(day[:4].center(COL_WIDTH), end=" ")
    print("=" * (terminal_width))

# --------------------------------- #
#            Classes                #
# --------------------------------- #
class ScheduleMatrix:
    """ Class to represent the schedule matrix """

    def __init__(self, start, end):
        self.hours = [f"{hour:02}:{minute:02}" for hour in range(start, end) for minute in range(0, 60, 10)] + [f"{end:02}:00"]
        self.matrix = [[" " * COL_WIDTH for _ in range(len(DAYS))] for _ in range(len(self.hours))]


    def add_class(self, day, start_hour, duration, class_name, class_type):
        """
        Function to add a class to the matrix

        Parameters:
            matrix (list): The matrix to add the class to
            day (str): The day of the week to add the class to
            start_hour (str): The start hour of the class
            duration (int): The duration of the class in minutes
            class_name (str): The name of the class
        """
        day_index = DAYS.index(day)
        start_hour_index = (self.hours.index(start_hour))
        dur_index = duration // 10

        for i in range(dur_index + 1):
            if i == 0 or i == dur_index:
                self.matrix[start_hour_index + i][day_index] = "*" + "-" * (COL_WIDTH-2) + "*"
            elif i == dur_index // 2:
                self.matrix[start_hour_index + i][day_index] = "|" + class_name.center(COL_WIDTH-2) + "|"
            elif i == (dur_index //2) + 1:
                self.matrix[start_hour_index + i][day_index] = "|" + class_type[:3].center(COL_WIDTH-2) + "|"
            else:
                self.matrix[start_hour_index + i][day_index] = "|" + " " * (COL_WIDTH-2) + "|"

    def print_matrix(self):
        # Clear the terminal
        print("\033c", end="")
        
        printHeader()
        for i in range(len(self.matrix)):
            time = self.hours[i]
            if time.endswith(":00") or time.endswith(":30"):
                print(time + (" " * rem_space), end=" ")
            else:
                print(" " * (rem_space + 5), end=" ")
            
            for j in range(len(DAYS)):
                print(self.matrix[i][j], end=" ")
            print()
        print("=" * (terminal_width))
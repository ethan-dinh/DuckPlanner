"""
Title: UO Schedule Web Scraper
Author: Ethan Dinh
Date: 9/28/2023
"""

# Importing Libraries
import csv
from tqdm import tqdm 

# Importing Selenium
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select

# Configuring Selenium
chromedriver = "./chromedriver"

class Course:
    """ Class to represent a course """
    def __init__(self, name: str, description: str, credits: float):
        self.name = name
        self.description = description
        self.credits = credits
        self.sections = []

def initWebpage(driver: webdriver.Chrome):
    """ Function to initialize the webpage """

    # Open the webpage
    driver.get("https://duckweb.uoregon.edu/duckweb/hwskdhnt.p_search?term=202302")
    
    # Find the course level selector
    course_level_selector = driver.find_element(By.ID, "levl_id")
    subject_selector = driver.find_element(By.ID, "subj_id")
    location_selector = driver.find_element(By.ID, "camp_id")
    submit_button = driver.find_element(By.NAME, "submit_btn")

    # Select the search criteria
    level_select = Select(course_level_selector)
    location_select = Select(location_selector)
    subject_select = Select(subject_selector)

    # location_select.select_by_value("I")
    level_select.select_by_value("UG")
    submit_button.click()

def saveData(courses: list):
    """ Function to save the data to a csv file """

    log = open("log.txt", "w")

    data = [["Course Name", "Course Description", "Credits", "Section Type", "CRN", "Available Seats", "Total Seats", "Days", "Time", "Location", "Instructor", "Requirements"]]
    for i in range(len(courses)):
        for section in courses[i].sections:
            log.write(str(section) + "\n")

            # Check for empty section type
            if section[0][0] not in ['+', "L"]:
                section[0] = "Lecture"

            # Check if section is less than 9 elements
            if len(section) < 9:
                section += ["N/A"] * (9 - len(section))

            # Replace times and days
            if section[4] == '-' and section[5] in ['', ' ', 'N/A']:
                section[4] = '0000-0000'
                section[5] = 'm'

            # Check if section contains empty strings
            if ' ' in section or '' in section:
                section = ["N/A" if ((x ==  ' ') or (x == '')) else x for x in section]

            # Replace all \n and , with spaces
            section = [x.replace("\n", " ") for x in section]
            
            row = [courses[i].name, courses[i].description.strip().replace(",", " "), courses[i].credits] + section
            data.append(row)

    log.close()

    # Make sure the data is tab-separated
    with open("CourseData.csv", "w") as f:
        writer = csv.writer(f)
        writer.writerows(data)

# -------------------------------- Main Function --------------------------------
def scrapeData():
    option = webdriver.ChromeOptions()
    option.add_experimental_option("excludeSwitches", ['enable-automation'])
    option.headless = True
    s = Service(chromedriver)
    driver = webdriver.Chrome(service=s, options=option)

    # Initialize the webpage
    initWebpage(driver)

    # Locate the main class table
    courses = []
    table = driver.find_element(By.XPATH, "/html/body/div[5]/table[1]/tbody/tr[2]/td[1]/table")
    num_pages = table.find_element(By.CSS_SELECTOR, "tr:nth-last-child(2)").text.split()
    total_iterations = int(int(num_pages[5]) // int(num_pages[3])) + 1

    # Iterate through the pages
    for iters in tqdm(range(total_iterations)):
        # Locating main elements on the webpage
        table = driver.find_element(By.XPATH, "/html/body/div[5]/table[1]/tbody/tr[2]/td[1]/table")
        
        # Loop through the table and extract the data
        for row in table.find_elements(By.TAG_NAME, "tr"):
            row_data = [cell.text for cell in row.find_elements(By.TAG_NAME, "td")]
            if len(row_data) == 2 and row_data[0] != "Grading Options:":
                courses.append(Course(row_data[0].split("  ")[1].strip(), row_data[0].split("  ")[2], row_data[1].split(" ")[0]))
            elif len(row_data) == 9 and row_data[-1] != "Notes":
                courses[-1].sections.append(row_data)
            elif "-" in row_data[0]: # Account for multiple subsections 
                crn = courses[-1].sections[-1][1]
                available_seats = courses[-1].sections[-1][2]
                total_seats = courses[-1].sections[-1][3]
                courses[-1].sections.append(["DIS", crn, available_seats, total_seats] + row_data)

        # Click the next button
        if iters != total_iterations - 1: driver.find_element(By.LINK_TEXT, "Next").click()
        
    # Close the Driver
    driver.close()

    # Save the data
    saveData(courses)

if __name__ == "__main__":
    scrapeData()
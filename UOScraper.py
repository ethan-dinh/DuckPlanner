"""
Title: UO Schedule Web Scraper
Author: Ethan Dinh
Date: 9/28/2023
"""

# Importing Libraries
import os
import csv
from tqdm import tqdm 
from typing import List
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select 
from time import sleep

# Configuring Selenium
chromedriver = "./chromedriver"
        
# -------------------------------- Main Function --------------------------------
def main():
    option = webdriver.ChromeOptions()
    option.add_experimental_option("excludeSwitches", ['enable-automation'])
    option.headless = False
    s = Service(chromedriver)
    driver = webdriver.Chrome(service=s, options=option)

    driver.get("https://duckweb.uoregon.edu/duckweb/hwskdhnt.p_search?term=202301")
    
    # Find the course level selector
    course_level_selector = driver.find_element(By.ID, "levl_id")
    location_selector = driver.find_element(By.ID, "camp_id")
    submit_button = driver.find_element(By.NAME, "submit_btn")

    level_select = Select(course_level_selector)
    location_select = Select(location_selector)

    location_select.select_by_value("I")
    level_select.select_by_value("UG")
    submit_button.click()

    # Locate the main class table
    table = driver.find_element(By.XPATH, "/html/body/div[5]/table[1]/tbody/tr[2]/td[1]/table")
    for row in table.find_elements(By.TAG_NAME, "tr"):
        cells = row.find_elements_by_tag_name("td")
        row_data = [cell.text for cell in cells]
        print(row_data)
    
    sleep(10)

    # Close the Driver
    driver.close()



if __name__ == "__main__":
    main()
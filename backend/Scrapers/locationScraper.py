import mysql.connector
from typing import List

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

db_config = {
    'host': 'ix.cs.uoregon.edu',
    'database': 'Scheduler',
    'user': 'ahuston',
    'password': 'softball2002',
    'port': "3263"
}

def initWebpage():
    """ Function to initialize the webpage """
    option = webdriver.ChromeOptions()
    option.add_experimental_option("excludeSwitches", ['enable-automation'])
    option.headless = True
    s = Service(chromedriver)
    driver = webdriver.Chrome(service=s, options=option)

    return driver
    
def extractBuildingDict(driver):
    driver.get("https://www.campus-maps.com/university-of-oregon/")
    table = driver.find_element(By.XPATH, "/html/body/div[4]/div/div/div/div/table/tbody")

    result = {}
    for row in table.find_elements(By.TAG_NAME, "tr"):
        row_data = [cell.text for cell in row.find_elements(By.TAG_NAME, "td")]
        if len(row_data) == 2:
            try:
                code = row_data[1].split(" (")[1].strip(")")
                name = row_data[1].split(" (")[0]
                result[code] = name
            except:
                print(row_data)

    driver.close()

    return result

def extractLocation():
    # Create a connection to the MySQL database
    cnx = mysql.connector.connect(**db_config)
    # Query the database to retrieve the course codes and descriptions
    query = "SELECT Location FROM Class_Info"

    cursor = cnx.cursor()
    cursor.execute(query)

    # Fetch the result as a list of tuples
    result = list(set(cursor.fetchall()))
    
    cleaned_result = []
    for item in result:
        try:
            cleaned_result.append(item[0].split(" ")[1])
        except:
            continue

    return list(set(cleaned_result))
    
def main():
    classCodes = extractLocation()
    driver = initWebpage()
    data = extractBuildingDict(driver)
    
    for code in classCodes:
        if code not in data:
            print(code)

if __name__ == "__main__":
    main()
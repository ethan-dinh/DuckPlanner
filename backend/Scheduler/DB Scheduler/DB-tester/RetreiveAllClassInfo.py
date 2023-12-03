# Importing Libraries
import mysql.connector
from typing import List

db_config = {
    'host': 'ix.cs.uoregon.edu',
    'database': 'Scheduler',
    'user': 'ahuston',
    'password': 'softball2002',
    'port': "3263"
}

def getCourseData() -> dict:
    """ Function to retrieve all of the course codes and descriptions """
    cnx = mysql.connector.connect(**db_config)
    cursor = cnx.cursor()

    # Query the database to retrieve the codes and desc
    query = "SELECT CourseName, Description FROM Class_Info"
    cursor.execute(query)

    return list(set(cursor.fetchall()))

def main():
    print(getCourseData())

if __name__ == "__main__":
    main()
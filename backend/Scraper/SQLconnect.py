"""
Title: MySQL Connection
Author: Ethan Dinh
Date: 10/20/2023
"""

# Importing Libraries
import mysql.connector
import csv

# --------------------------------- #
#          Global Variables         #
# --------------------------------- #
host = 'ix.cs.uoregon.edu'
database = 'Scheduler'
user = 'ahuston'
password = 'softball2002'
port = "3263"

def update_table():
    # Establish a connection
    conn = mysql.connector.connect(host=host, database=database, user=user, password=password, port = port, allow_local_infile=True)

    # Create a cursor object
    cursor = conn.cursor()

    # Execute the DELETE statement to clear the table
    cursor.execute("DELETE FROM Class_Info")

    # Execute the SQL statement
    cursor.execute(
        """
        LOAD DATA LOCAL INFILE 'CourseData.csv'
        INTO TABLE Class_Info
        FIELDS TERMINATED BY ',' 
        LINES TERMINATED BY '\n'
        IGNORE 1 ROWS
        """
    )

    conn.commit()
    conn.close()
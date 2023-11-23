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

def create_table(cursor):
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS Location (
        code VARCHAR(255),
        name VARCHAR(255),
        longitude DECIMAL(10,6),
        latitude  DECIMAL(10,6)
    )
    """
    cursor.execute(create_table_sql)
    cursor.execute("DELETE FROM Location")

    print("Table created successfully")

def update_locations():
    try:
        # Establish a connection
        conn = mysql.connector.connect(
            host=host,
            database=database,
            user=user,
            password=password,
            port=port,
            allow_local_infile=True
        )

        # Create a cursor object
        cursor = conn.cursor()

        # Create the table if it doesn't exist
        create_table(cursor)

        # Execute the SQL statement to load data from CSV into the table
        cursor.execute("""
            LOAD DATA LOCAL INFILE 'Locations.csv'
            INTO TABLE Location
            FIELDS TERMINATED BY ',' 
            ENCLOSED BY '\"'  # if your CSV values are enclosed in double quotes
            LINES TERMINATED BY '\\n'
            IGNORE 1 ROWS
        """)

        # Commit the changes
        conn.commit()
        
    except Error as e:
        print(f"Error: {e}")

    finally:
        # Close the cursor and connection
        if conn.is_connected():
            cursor.close()
            conn.close()
            print("MySQL connection is closed")
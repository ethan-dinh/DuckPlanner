import mysql.connector

db_config = {
    'host': 'ix.cs.uoregon.edu',
    'database': 'Scheduler',
    'user': 'ahuston',
    'password': 'softball2002',
    'port': "3263"
}

def getSavedSchedule(student_id):
    connection = None
    cursor = None
    try:
        # Assume db_config is a dictionary with database connection parameters
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()

        # Prepare the SQL query, using placeholders for parameters
        query = '''
        SELECT CRNs FROM Saved_Schedules s 
        JOIN Student_Schedule st ON s.ScheduleID = st.Saved_Schedules_ScheduleID 
        WHERE st.Student_Info_StudentID = %s
        '''
        cursor.execute(query, (student_id,))

        # Fetch the results
        crns = cursor.fetchall()
        return crns

    except mysql.connector.Error as err:
        print("Something went wrong: {}".format(err))
        return None

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()
            
if __name__ == "__main__":
    print(getSavedSchedule('951854755'))
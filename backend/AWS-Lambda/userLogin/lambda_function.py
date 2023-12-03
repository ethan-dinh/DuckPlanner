import mysql.connector
import json
import secrets
from datetime import datetime, timedelta
from http import cookies

db_config = {
    'host': 'ix.cs.uoregon.edu',
    'database': 'Scheduler',
    'user': 'ahuston',
    'password': 'softball2002',
    'port': "3263"
}

def retrieveUserData():
    connection = None
    cursor = None
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()
        
        query = 'SELECT * FROM Student_Info'
        cursor.execute(query)
        
        user_data = cursor.fetchall()
        ID_dict = {}
        for data in user_data:
            ID_dict[data[0]] = [data[1], data[2], data[3]]
    
        return ID_dict
    
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()
        

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
        
        # Process the crns - take the first element of each tuple
        crns = [crn[0] for crn in crns]
        
        return crns

    except mysql.connector.Error as err:
        print("Something went wrong: {}".format(err))
        return None

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()
            
def checkUserExists(ID, ID_dict):
    if ID in ID_dict:
        return True
    else:
        return False
    
def checkPassword(ID, password, ID_dict):
    if ID_dict[ID][2] == password:
        return True
    else:
        return False

def addNewUser(ID:int, password:str, first_name:str, last_name:str):
    connection = None
    cursor = None
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()
        
        query = 'INSERT INTO Student_Info VALUES (%s, %s, %s, %s);'
        cursor.execute(query, (ID, first_name, last_name, password))
        
        connection.commit()
        
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()
    
        
def addSavedSchedule(student_id, crns):
    connection = None
    cursor = None
    try:
        # Assume db_config is a dictionary with database connection parameters
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()

        # Generate a new UUID
        cursor.execute("SELECT UUID() AS UUID;")
        result = cursor.fetchone()
        uuid = result[0]

        # Insert into Saved_Schedules table
        insert_saved_schedules = "INSERT INTO Saved_Schedules VALUES (%s, %s);"
        cursor.execute(insert_saved_schedules, (uuid, crns))

        # Insert into Student_Schedule table
        insert_student_schedule = "INSERT INTO Student_Schedule VALUES (%s, %s);"
        cursor.execute(insert_student_schedule, (student_id, uuid))

        # Commit the changes
        connection.commit()

    except mysql.connector.Error as err:
        print("Something went wrong: {}".format(err))

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()
        
def removeSchedule(student_id, crns):
    connection = None
    cursor = None
    try:
        # Assume db_config is a dictionary with database connection parameters
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()

        # Construct the DELETE query
        delete_query = """
        DELETE ss
        FROM Saved_Schedules ss
        JOIN Student_Schedule s ON ss.ScheduleID = s.Saved_Schedules_ScheduleID
        WHERE s.Student_Info_StudentID = %s AND ss.CRNs = %s;
        """

        # Execute the DELETE query with the provided parameters
        cursor.execute(delete_query, (student_id, crns))

        # Commit the changes to the database
        connection.commit()

    except mysql.connector.Error as err:
        print("Something went wrong: {}".format(err))

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()
        
def userQueryFunction(userInfo: dict):
    DB = retrieveUserData()
    action = userInfo['action']
    if action == 'login':
        ID = int(userInfo['ID'])
        password = userInfo['Password']
        if checkUserExists(ID, DB):
            if checkPassword(ID, password, DB):
                return True, f"{DB[ID][0]} {DB[ID][1]}"
            else:
                return False, "Incorrect Password"
        else:
            return False
    elif action == 'signUp':
        ID = int(userInfo['ID'])
        password = userInfo['Password']
        first_name = userInfo['firstName']
        last_name = userInfo['lastName']
        if checkUserExists(ID, DB):
            return False, "User Exists"
        else:
            addNewUser(ID, password, first_name, last_name)
            return True, ""
    elif action == 'addSchedule':
        ID = int(userInfo['ID'])
        schedule = userInfo['CRNs']
        addSavedSchedule(ID, schedule)
        return True, ""
    elif action == 'retrieveSchedule':
        ID = int(userInfo['ID'])
        schedule = getSavedSchedule(ID)
        return True, schedule
    elif action == 'removeSchedule':
        ID = int(userInfo['ID'])
        schedule = userInfo['CRNs']
        removeSchedule(ID, schedule)
        
        
def generate_session_token():
    # Generate a cryptographically secure token
    token = secrets.token_hex(32)
    return token
    
def create_cookie_header(token_value, max_age=3600, secure=False, httponly=False, samesite='None'):
    c = cookies.SimpleCookie()
    c['session_token'] = token_value
    c['session_token']['path'] = '/'
    c['session_token']['max-age'] = max_age
    c['session_token']['secure'] = True
    c['session_token']['httponly'] = True
    c['session_token']['samesite'] = samesite
    return c.output(header='').strip()

        
def store_session_in_db(uo_id, token):
    connection = mysql.connector.connect(**db_config)
    cursor = connection.cursor()
    
    # Set the expiration time (e.g., 1 hour from now)
    expires_at = datetime.utcnow() + timedelta(hours=1)
    
    try:
        insert_query = "INSERT INTO Cookies (access_token, uo_id, expires_at) VALUES (%s, %s, %s);"
        cursor.execute(insert_query, (token, uo_id, expires_at.strftime('%Y-%m-%d %H:%M:%S')))
        connection.commit()
    finally:
        cursor.close()
        connection.close()
        
def is_session_valid(token):
    connection = mysql.connector.connect(**db_config)
    cursor = connection.cursor()
    
    try:
        select_query = "SELECT expires_at FROM Cookies WHERE access_token = %s;"
        cursor.execute(select_query, (token,))
        result = cursor.fetchone()
        
        if result and datetime.utcnow() < result[0]:
            return True
        return False
    finally:
        cursor.close()
        connection.close()
        

def get_uo_id_from_token(token):
    connection = mysql.connector.connect(**db_config)
    cursor = connection.cursor()
    
    try:
        cursor.execute("SELECT uo_id FROM Cookies WHERE access_token = %s", (token,))
        result = cursor.fetchone()
        return result[0] if result else None
    except mysql.connector.Error as err:
        print("Something went wrong: {}".format(err))
    finally:
        cursor.close()
        connection.close()  
        
def get_username_from_UOID(uo_id):
    connection = mysql.connector.connect(**db_config)
    cursor = connection.cursor()
    
    try:
        cursor.execute("SELECT FirstName, LastName FROM Student_Info WHERE StudentID = %s", (uo_id,))
        result = cursor.fetchone()
        return result[0] + " " + result[1] if result else None
    except mysql.connector.Error as err:
        print("Something went wrong: {}".format(err))
    finally:
        cursor.close()
        connection.close()      
    
def lambda_handler(event, context):
    # Use the frontend's origin for local testing
    local_frontend_origin = 'http://127.0.0.1:5501'
    
   # Common headers for CORS
    cors_headers = {
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Origin': local_frontend_origin,
        'Content-Type': 'application/json'
    }
    
    # Handle OPTIONS requests for CORS
    if event['httpMethod'] == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': local_frontend_origin,
                'Access-Control-Allow-Methods': 'POST',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Credentials': 'true'
            },
            'body': ''  # body can be empty for OPTIONS requests
        }
        
    elif event['httpMethod'] == 'POST':
        # Handle login or sign-up
        body = json.loads(event['body'])
        success, message = userQueryFunction(body)
        
        if not success:
            # Login or sign-up failed
            return {
                'statusCode': 401,
                'body': json.dumps({
                    'message': message
                }),
                'headers': {
                    'Content-Type': 'application/json'   
                }
            }
        
        # Login or sign-up succeeded
        session_token = generate_session_token()
        store_session_in_db(body['ID'], session_token)
        set_cookie_header = create_cookie_header(session_token)  # Set secure to False for local testing over HTTP

        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Success',
                'UO ID': body.get("ID"),
                'Username': get_username_from_UOID(body.get("ID")),
                'Package': message
            }),
            'headers': {
                'Content-Type': 'application/json',   
                'Set-Cookie': set_cookie_header
            }
        }
    
    elif event['httpMethod'] == 'GET':
        # Handle retrieving saved schedules
        cookie_string = event['headers'].get('Cookie', '')
        simple_cookie = cookies.SimpleCookie()
        simple_cookie.load(cookie_string)
        session_token = simple_cookie['session_token'].value if 'session_token' in simple_cookie else None

        if not session_token or not is_session_valid(session_token):
            # Session token is not present or invalid
            return {
                'statusCode': 401,
                'status': "failed",
                'body': json.dumps({'message': 'Unauthorized'}),
                'headers': cors_headers
            }
        
        # Session token is valid, retrieve schedules
        uo_id = get_uo_id_from_token(session_token)
        if uo_id is None:
            # UO ID not found or session expired
            return {
                'statusCode': 401,
                'status': "failed",
                'body': json.dumps({'message': 'Session expired or user not found'}),
                'headers': cors_headers
            }

        schedules = getSavedSchedule(uo_id)
        return {
            'statusCode': 200,
            'body': json.dumps({
                'status': "success",
                'ID': uo_id,
                'username': get_username_from_UOID(uo_id)
            }),
            'headers': cors_headers
        }
        
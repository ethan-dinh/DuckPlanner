import mysql.connector

db_config = {
    'host': 'ix.cs.uoregon.edu',
    'database': 'Scheduler',
    'user': 'ahuston',
    'password': 'softball2002',
    'port': "3263"
}

def lambda_handler(event, context):
    try:
        # Establish the database connection
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()

        select_query = "SELECT * FROM Location"
        cursor.execute(select_query)
        results = cursor.fetchall()

        output = {}
        if results:
            for result in results:
                output[result[0]] = {
                    "name": result[1],
                    "longitude": float(result[2]),
                    "latitude": float(result[3])
                }
            return output
        else:
            return []

    except Exception as e:
        return str(e)

    finally:
        # Close the database connection in the finally block
        if connection:
            connection.close()
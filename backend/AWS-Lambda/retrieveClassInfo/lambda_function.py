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

        select_query = "SELECT list_data FROM Class_Names WHERE list_name = %s"
        cursor.execute(select_query, ("Course Names",))
        result = cursor.fetchone()

        if result:
            serialized_list_data = result[0]
            # Deserialize the list (split the string back into a list)
            return serialized_list_data.split(',')
        else:
            return []

    except Exception as e:
        return str(e)

    finally:
        # Close the database connection in the finally block
        if connection:
            connection.close()
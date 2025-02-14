import psycopg2

def drop_daily_expenses_table():
    # Update these connection details with your own
    connection_params = {
        "host": "localhost",
        "database": "restaurant_db",
        "user": "postgres",
        "password": "Mateo13141*",
        "port": 5432
    }

    try:
        # Establish a connection to PostgreSQL
        conn = psycopg2.connect(**connection_params)
        cur = conn.cursor()
        
        # Execute the DROP TABLE statement
        drop_query = "DROP TABLE IF EXISTS daily_expenses;"
        cur.execute(drop_query)
        
        # Commit the transaction
        conn.commit()
        
        print("Table daily_expenses dropped successfully (if it existed).")
        
    except Exception as e:
        print(f"Error dropping table: {e}")
        
    finally:
        # Close cursor and connection
        if cur:
            cur.close()
        if conn:
            conn.close()

if __name__ == "__main__":
    drop_daily_expenses_table()

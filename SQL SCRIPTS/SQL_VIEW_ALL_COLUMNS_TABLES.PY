import psycopg2

db_params = {
    "host": "dpg-cumpfg8gph6c7387r200-a.frankfurt-postgres.render.com",
    "database": "restaurant_db_mg7q",
    "user": "restaurant_db_mg7q_user",
    "password": "d9Zslmf92niOQETVqJaTb2n1Rxg0niYg",
    "port": 5432
}

try:
    # Connect to PostgreSQL
    conn = psycopg2.connect(**db_params)
    cur = conn.cursor()
    print("Connected to the database successfully.")

    # Query to get column names
    fetch_columns_query = """
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'inventory';
    """
    cur.execute(fetch_columns_query)
    columns = cur.fetchall()

    print("Columns in 'inventory' table:")
    for column in columns:
        print(f"- {column[0]} ({column[1]})")

except Exception as e:
    print(f"An error occurred: {e}")
finally:
    if conn:
        cur.close()
        conn.close()
        print("Database connection closed.")

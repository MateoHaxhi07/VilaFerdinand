import psycopg2
import os
from urllib.parse import urlparse

def list_all_tables():
    # Parse database URL
    DATABASE_URL = "postgresql://restaurant_db_mg7q_user:d9Zslmf92niOQETVqJaTb2n1Rxg0niYg@dpg-cumpfg8gph6c7387r200-a.frankfurt-postgres.render.com/restaurant_db_mg7q"
    url = urlparse(DATABASE_URL)
    
    connection_params = {
        "host": url.hostname,
        "database": url.path[1:],
        "user": url.username,
        "password": url.password,
        "port": url.port
    }

    try:
        # Establish a connection to PostgreSQL
        conn = psycopg2.connect(**connection_params)
        cur = conn.cursor()
        
        # Query to list all tables in the public schema
        list_tables_query = """
        SELECT table_name FROM information_schema.tables
        WHERE table_schema = 'public';
        """
        cur.execute(list_tables_query)
        
        # Fetch all table names
        tables = cur.fetchall()
        
        if tables:
            print("Tables in restaurant_db_mg7q:")
            for table in tables:
                print(table[0])
        else:
            print("No tables found in restaurant_db_mg7q.")
        
    except Exception as e:
        print(f"Error retrieving tables: {e}")
        
    finally:
        # Close cursor and connection
        if cur:
            cur.close()
        if conn:
            conn.close()

if __name__ == "__main__":
    list_all_tables()

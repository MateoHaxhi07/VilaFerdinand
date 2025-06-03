import psycopg2 
import urllib.parse as urlparse
import os

# Database URL from Render.com
DATABASE_URL = "postgresql://restaurant_db_mg7q_user:d9Zslmf92niOQETVqJaTb2n1Rxg0niYg@dpg-cumpfg8gph6c7387r200-a.frankfurt-postgres.render.com/restaurant_db_mg7q"

def fetch_all_table_names():
    try:
        # Parse the database URL
        result = urlparse.urlparse(DATABASE_URL)
        connection_params = {
            "dbname": result.path[1:],  # Remove leading '/'
            "user": result.username,
            "password": result.password,
            "host": result.hostname,
            "port": result.port
        }

        # Connect to the PostgreSQL database
        conn = psycopg2.connect(**connection_params)
        cur = conn.cursor()

        # SQL query to get table names
        query = """
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name;
        """
        
        cur.execute(query)
        tables = cur.fetchall()

        if tables:
            print("All Tables in the Database:")
            table_names = [table[0] for table in tables]
            for name in table_names:
                print(name)
            return table_names
        else:
            print("No tables found in the database.")
            return []

    except Exception as e:
        print(f"Error fetching table names: {e}")
        return []
        
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    table_names = fetch_all_table_names()
    print("\nTables:", table_names)

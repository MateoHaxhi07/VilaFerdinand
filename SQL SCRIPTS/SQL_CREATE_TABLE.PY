import psycopg2
from urllib.parse import urlparse

DATABASE_URL = "postgresql://restaurant_db_mg7q_user:d9Zslmf92niOQETVqJaTb2n1Rxg0niYg@dpg-cumpfg8gph6c7387r200-a.frankfurt-postgres.render.com/restaurant_db_mg7q"

def create_inventory_table():
    try:
        # Parse the database URL
        result = urlparse(DATABASE_URL)
        connection_params = {
            "dbname": result.path[1:],  # Remove leading '/'
            "user": result.username,
            "password": result.password,
            "host": result.hostname,
            "port": result.port
        }

        # Connect to PostgreSQL
        conn = psycopg2.connect(**connection_params)
        cur = conn.cursor()

        # Define the CREATE TABLE query
        create_table_query = """
        CREATE TABLE IF NOT EXISTS inventory (
            id SERIAL PRIMARY KEY,
  article_name TEXT NOT NULL,
  total INTEGER NOT NULL,
  inventory_type TEXT NOT NULL,  -- "entry" or "removal"
  entry_date DATE,               -- the user-specified date for the record
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """

        # Execute the query
        cur.execute(create_table_query)
        print("Table 'inventory' created successfully.")

        # Commit changes
        conn.commit()
    
    except Exception as e:
        print(f"Error: {e}")
    
    finally:
        if 'cur' in locals() and cur:
            cur.close()
        if 'conn' in locals() and conn:
            conn.close()

if __name__ == "__main__":
    create_inventory_table()

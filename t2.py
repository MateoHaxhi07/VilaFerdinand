import psycopg2
import urllib.parse as urlparse

# Database URL from Render.com
DATABASE_URL = "postgresql://restaurant_db_mg7q_user:d9Zslmf92niOQETVqJaTb2n1Rxg0niYg@dpg-cumpfg8gph6c7387r200-a.frankfurt-postgres.render.com/restaurant_db_mg7q"

def drop_all_tables(table_names):
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

        for table_name in table_names:
            try:
                drop_query = f"DROP TABLE IF EXISTS {table_name} CASCADE;"
                cur.execute(drop_query)
                print(f"✅ Table '{table_name}' dropped successfully.")
            except Exception as e:
                print(f"❌ Error dropping table '{table_name}': {e}")

        # Commit the transaction
        conn.commit()
        print("✅ All specified tables dropped successfully.")
        
    except Exception as e:
        print(f"❌ Error connecting to database: {e}")
        
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    tables_to_drop = ['daily_expenses', 'expenses', 'sales', 'supplier_expenses', 'article_ingredients']
    drop_all_tables(tables_to_drop)

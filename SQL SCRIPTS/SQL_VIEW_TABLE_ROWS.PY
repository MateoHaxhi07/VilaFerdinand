import psycopg2
import urllib.parse as urlparse

# Database URL from Render.com
DATABASE_URL = "postgresql://restaurant_db_mg7q_user:d9Zslmf92niOQETVqJaTb2n1Rxg0niYg@dpg-cumpfg8gph6c7387r200-a.frankfurt-postgres.render.com/restaurant_db_mg7q"

def fetch_article_ingredients():
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
        print(" Connected to the online database successfully.")

        # SQL query to select the first 100 rows
        select_query = "SELECT * FROM sales LIMIT 100;"
        cur.execute(select_query)

        # Fetch and display results
        rows = cur.fetchall()
        if rows:
            colnames = [desc[0] for desc in cur.description]  # Column headers
            print(f"\nShowing first {len(rows)} rows from 'sales':")
            print("\t".join(colnames))  # Print column names
            print("=" * 80)

            for row in rows:
                print("\t".join(map(str, row)))  # Print row data

        else:
            print("No data found in 'sales'.")

    except Exception as e:
        print(f" An error occurred: {e}")

    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()
            print("🔒 Database connection closed.")

if __name__ == "__main__":
    fetch_article_ingredients()

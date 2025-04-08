import psycopg2
import urllib.parse as urlparse


DATABASE_URL = "postgresql://restaurant_db_mg7q_user:d9Zslmf92niOQETVqJaTb2n1Rxg0niYg@dpg-cumpfg8gph6c7387r200-a.frankfurt-postgres.render.com/restaurant_db_mg7q"

def alter_modified_expenses():
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

        # Connect to PostgreSQL
        conn = psycopg2.connect(**connection_params)
        conn.autocommit = True  # So we can run DDL statements without explicit commit
        cur = conn.cursor()
        print("✅ Connected to the database successfully.")

        # (1) Convert total_amount from text -> numeric
        # We'll handle empty strings by using NULLIF, then cast to numeric
        alter_total_amount = """
            ALTER TABLE modified_expenses
            ALTER COLUMN total_amount TYPE numeric
            USING (
              CASE
                WHEN TRIM(total_amount) ~ '^[+-]?\\d+(\\.\\d+)?$'
                     -- optional sign, digits, optional .digits
                  THEN total_amount::numeric
                WHEN TRIM(total_amount) = '' 
                  THEN NULL  -- if it's empty, use NULL
                ELSE NULL  -- or you could use 0::numeric if you prefer
              END
            );
        """
        print("[DEBUG] Altering column total_amount...")
        cur.execute(alter_total_amount)
        print("✅ Successfully altered total_amount column to numeric.")

        # (2) Convert amount_paid from text -> numeric
        alter_amount_paid = """
            ALTER TABLE modified_expenses
            ALTER COLUMN amount_paid TYPE numeric
            USING (
              CASE
                WHEN TRIM(amount_paid) ~ '^[+-]?\\d+(\\.\\d+)?$'
                  THEN amount_paid::numeric
                WHEN TRIM(amount_paid) = ''
                  THEN NULL
                ELSE NULL
              END
            );
        """
        print("[DEBUG] Altering column amount_paid...")
        cur.execute(alter_amount_paid)
        print("✅ Successfully altered amount_paid column to numeric.")

    except Exception as e:
        print(f"❌ An error occurred while altering table: {e}")
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()
            print("🔒 Database connection closed.")

if __name__ == "__main__":
    alter_modified_expenses()

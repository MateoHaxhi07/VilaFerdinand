import psycopg2

# 1) Define your connection parameters
db_params = {
    "host":     "dpg-cumpfg8gph6c7387r200-a.frankfurt-postgres.render.com",
    "database": "restaurant_db_mg7q",
    "user":     "restaurant_db_mg7q_user",
    "password": "d9Zslmf92niOQETVqJaTb2n1Rxg0niYg",
    "port":     5432
}

try:
    # 2) Connect to your PostgreSQL database
    conn = psycopg2.connect(**db_params)
    cur  = conn.cursor()
    print("✅ Connected to the database.")

    # 3) Define the ALTER TABLE statement
    alter_sql = """
    ALTER TABLE sales
      ADD COLUMN IF NOT EXISTS "Buyer_Name" VARCHAR,
      ADD COLUMN IF NOT EXISTS "Buyer_NIPT" VARCHAR;
    """

    # 4) Execute the DDL
    cur.execute(alter_sql)
    conn.commit()
    print("✅ Columns Buyer_Name and Buyer_NIPT added (if they didn’t already exist).")

except Exception as e:
    # 5) Catch & print any errors
    print("❌ An error occurred:", e)

finally:
    # 6) Always close your cursor and connection
    if conn:
        cur.close()
        conn.close()
        print("🔒 Database connection closed.")

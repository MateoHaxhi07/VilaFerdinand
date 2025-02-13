import psycopg2

# Replace with your external Render PostgreSQL URL
DATABASE_URL = "postgresql://restaurant_db_mg7q_user:d9Zslmf92niOQETVqJaTb2n1Rxg0niYg@dpg-cumpfg8gph6c7387r200-a.frankfurt-postgres.render.com/restaurant_db_mg7q"

try:
    # Connect to the database with SSL enabled
    conn = psycopg2.connect(DATABASE_URL, sslmode="require")
    cur = conn.cursor()

    # Run a simple test query
    cur.execute("SELECT 1;")
    result = cur.fetchone()
    print("Test query result:", result)

    # Retrieve and print top 50 rows from the "sales" table
    print("\nTop 50 rows from the 'sales' table:")
    cur.execute('SELECT * FROM "sales" LIMIT 50;')
    rows = cur.fetchall()
    for row in rows:
        print(row)

    print("\n✅ Connection and data retrieval successful!")
except Exception as e:
    print("❌ Error connecting to the external database:", e)
finally:
    if 'conn' in locals() and conn:
        cur.close()
        conn.close()

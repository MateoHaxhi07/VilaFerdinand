import pandas as pd
import psycopg2
from psycopg2.extras import execute_values

# PostgreSQL connection
DATABASE_URL = "postgresql://restaurant_db_mg7q_user:d9Zslmf92niOQETVqJaTb2n1Rxg0niYg@dpg-cumpfg8gph6c7387r200-a.frankfurt-postgres.render.com/restaurant_db_mg7q"

try:
    # Connect to the database
    conn = psycopg2.connect(DATABASE_URL, sslmode="require")
    cursor = conn.cursor()

    # Create the "sales" table if it doesn't exist
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS "sales" (
        "Order_ID" TEXT,
        "Seller" TEXT,
        "Article_Name" TEXT,
        "Category" TEXT,
        "Quantity" DECIMAL(10,2),
        "Article_Price" DECIMAL(10,2),
        "Total_Article_Price" DECIMAL(10,2),
        "Datetime" TIMESTAMP,
        "Seller Category" TEXT
    )
    """)
    conn.commit()

    # Clear existing records from the 'sales' table
    cursor.execute('TRUNCATE TABLE "sales";')
    conn.commit()

    # Load CSV file (adjust file_path if needed in your deployment)
    file_path = r"C:\Users\mhaxh\OneDrive\Desktop\Restaurant_Dashboard-1.0.8\PYTHON SCRIPTS DATA\data\sales_data.csv"
    df = pd.read_csv(file_path)

    # Debug: print dataframe info and head
    print(df.info())
    print(df.head())

    # First, strip any accidental whitespace
    df["Datetime"] = df["Datetime"].astype(str).str.strip()

    # Convert the "Datetime" column; unparseable values will become NaT
    df["Datetime"] = pd.to_datetime(df["Datetime"], errors='coerce')

    # Debug: report how many rows failed conversion
    num_invalid = df["Datetime"].isna().sum()
    print(f"Found {num_invalid} rows with invalid datetime values after conversion.")
    if num_invalid > 0:
        invalid_indices = df[df["Datetime"].isna()].index.tolist()
        print("Invalid datetime row indices:", invalid_indices)

    # Prepare records for bulk insertion with explicit conversion of datetime values:
    records = []
    for idx, row in df.iterrows():
        dt = row["Datetime"]

        # If dt is a missing value or if it is the literal string "NaT", set it to None.
        if pd.isna(dt):
            dt = None
        elif isinstance(dt, str) and dt.strip() == "NaT":
            dt = None
        # If dt is not already a Python datetime (it should be a Timestamp if parsed correctly),
        # try to convert it.
        elif not isinstance(dt, pd.Timestamp):
            dt_parsed = pd.to_datetime(dt, errors='coerce')
            dt = None if pd.isna(dt_parsed) else dt_parsed.to_pydatetime()
        else:
            dt = dt.to_pydatetime()

        record = (
            row["Order_ID"],
            row["Seller"],
            row["Article_Name"],
            row["Category"],
            row["Quantity"],
            row["Article_Price"],
            row["Total_Article_Price"],
            dt,
            row["Seller Category"]
        )
        records.append(record)

    # Optional debugging: show records where datetime is None
    for rec in records:
        if rec[7] is None:
            print("Record with None datetime:", rec)

    # Bulk insert into PostgreSQL
    insert_query = """
    INSERT INTO "sales" (
        "Order_ID", "Seller", "Article_Name", "Category", "Quantity", 
        "Article_Price", "Total_Article_Price", "Datetime", "Seller Category"
    ) VALUES %s
    """

    try:
        execute_values(cursor, insert_query, records)
        conn.commit()
        print("Data inserted successfully!")
    except Exception as e:
        print(f"❌ Failed to insert data: {e}")
        conn.rollback()

except Exception as e:
    print(f"Critical error: {e}")

finally:
    if conn:
        cursor.close()
        conn.close()

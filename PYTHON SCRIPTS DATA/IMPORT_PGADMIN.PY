import pandas as pd
import psycopg2

# Database connection
conn = psycopg2.connect(
    dbname="restaurant_db",
    user="postgres",
    password="Mateo13141*",
    host="localhost",
    port="5432"
)
cursor = conn.cursor()

# Create table with quoted identifiers (if it doesn't already exist)
create_table_query = """
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
"""
cursor.execute(create_table_query)
conn.commit()

# Clear old records so the new data replaces them
cursor.execute('TRUNCATE TABLE "sales";')
conn.commit()

# Load CSV file (update the file path as needed)
file_path = r"C:\Users\mhaxh\OneDrive\Desktop\Restaurant_Dashboard-1.0.8\PYTHON SCRIPTS DATA\data\sales_data.csv"
df = pd.read_csv(file_path)

# Convert 'Datetime' to proper format, dropping rows where conversion fails
df["Datetime"] = pd.to_datetime(df["Datetime"], errors='coerce')
df.dropna(subset=["Datetime"], inplace=True)

# Insert data into PostgreSQL using the exact column names
for _, row in df.iterrows():
    cursor.execute("""
        INSERT INTO "sales" (
            "Order_ID", "Seller", "Article_Name", "Category", "Quantity", 
            "Article_Price", "Total_Article_Price", "Datetime", "Seller Category"
        ) 
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, (
        row["Order_ID"], row["Seller"], row["Article_Name"], row["Category"], row["Quantity"],
        row["Article_Price"], row["Total_Article_Price"], row["Datetime"], row["Seller Category"]
    ))

conn.commit()
cursor.close()
conn.close()

print("Successfully imported new data into PostgreSQL! (Old records cleared)")

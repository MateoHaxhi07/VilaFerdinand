import psycopg2
import csv

# Database connection parameters
db_params = {
    "host": "localhost",
    "database": "restaurant_db",
    "user": "postgres",
    "password": "Mateo13141*",
    "port": 5432
}

# CSV file path and table name
csv_file = r'C:\Users\mhaxh\OneDrive\Desktop\VilaFerdinand-1.0.1\Article_Ingredients.csv'
table_name = 'article_ingredients'

try:
    # Connect to PostgreSQL
    conn = psycopg2.connect(**db_params)
    cur = conn.cursor()
    print("Connected to the database successfully.")

    # Create the table with one row per article and multiple ingredient columns
    create_table_query = f"""
    CREATE TABLE IF NOT EXISTS {table_name} (
       article_name TEXT NOT NULL,
       ingredient_name_01 TEXT,
       usage_amount_01 NUMERIC,
       ingredient_name_02 TEXT,
       usage_amount_02 NUMERIC,
       ingredient_name_03 TEXT,
       usage_amount_03 NUMERIC,
       ingredient_name_04 TEXT,
       usage_amount_04 NUMERIC,
       ingredient_name_05 TEXT,
       usage_amount_05 NUMERIC,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       UNIQUE(article_name)
    );
    """
    cur.execute(create_table_query)
    conn.commit()
    print(f"Table '{table_name}' is ready.")

    # Open and read the CSV file (using utf-8-sig to handle any BOM)
    with open(csv_file, 'r', newline='', encoding='utf-8-sig') as file:
        reader = csv.DictReader(file)
        inserted_rows = 0  # Counter for inserted rows

        for row in reader:
            # Normalize CSV header keys to lowercase and strip whitespace
            row = {key.strip().lower(): value.strip() for key, value in row.items()}

            # Get the article name (skip if missing)
            article = row.get('article_name', '')
            if not article:
                continue

            # For each ingredient column, retrieve the text and convert usage to float if available.
            ing1 = row.get('ingredient_name', '')
            usage1 = float(row.get('usage_amount', '')) if row.get('usage_amount', '').strip() != '' else None

            ing2 = row.get('ingredient_name_02', '')
            usage2 = float(row.get('usage_amount_02', '')) if row.get('usage_amount_02', '').strip() != '' else None

            ing3 = row.get('ingredient_name_03', '')
            usage3 = float(row.get('usage_amount_03', '')) if row.get('usage_amount_03', '').strip() != '' else None

            ing4 = row.get('ingredient_name_04', '')
            usage4 = float(row.get('usage_amount_04', '')) if row.get('usage_amount_04', '').strip() != '' else None

            ing5 = row.get('ingredient_name_05', '')
            usage5 = float(row.get('usage_amount_05', '')) if row.get('usage_amount_05', '').strip() != '' else None

            # Insert the row using UPSERT (if an article already exists, update its ingredient columns)
            insert_query = f"""
            INSERT INTO {table_name} (
               article_name, 
               ingredient_name_01, usage_amount_01,
               ingredient_name_02, usage_amount_02,
               ingredient_name_03, usage_amount_03,
               ingredient_name_04, usage_amount_04,
               ingredient_name_05, usage_amount_05
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (article_name)
            DO UPDATE SET
               ingredient_name_01 = EXCLUDED.ingredient_name_01,
               usage_amount_01 = EXCLUDED.usage_amount_01,
               ingredient_name_02 = EXCLUDED.ingredient_name_02,
               usage_amount_02 = EXCLUDED.usage_amount_02,
               ingredient_name_03 = EXCLUDED.ingredient_name_03,
               usage_amount_03 = EXCLUDED.usage_amount_03,
               ingredient_name_04 = EXCLUDED.ingredient_name_04,
               usage_amount_04 = EXCLUDED.usage_amount_04,
               ingredient_name_05 = EXCLUDED.ingredient_name_05,
               usage_amount_05 = EXCLUDED.usage_amount_05;
            """
            cur.execute(insert_query, (article, ing1, usage1, ing2, usage2, ing3, usage3, ing4, usage4, ing5, usage5))
            inserted_rows += 1

    conn.commit()
    print(f"CSV data has been inserted successfully. Inserted {inserted_rows} rows.")

except Exception as e:
    print(f"An error occurred: {e}")
finally:
    if conn:
        cur.close()
        conn.close()
        print("Database connection closed.")

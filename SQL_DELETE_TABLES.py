import psycopg2

def drop_all_tables(table_names):
    # Update with your PostgreSQL connection details
    connection_params = {
        "host": "localhost",
        "database": "restaurant_db",
        "user": "postgres",
        "password": "Mateo13141*",
        "port": 5432
    }

    try:
        # Connect to the PostgreSQL database
        conn = psycopg2.connect(**connection_params)
        cur = conn.cursor()

        for table_name in table_names:
            try:
                drop_query = f"DROP TABLE IF EXISTS {table_name} CASCADE;"
                cur.execute(drop_query)
                print(f"Table '{table_name}' dropped successfully.")
            except Exception as e:
                print(f"Error dropping table '{table_name}': {e}")

        # Commit the transaction
        conn.commit()
        print("All specified tables dropped successfully.")
        
    except Exception as e:
        print(f"Error connecting to database: {e}")
        
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

if __name__ == "__main__":
    tables_to_drop = ['daily_expenses', 'expenses', 'sales', 'supplier_expenses',"article_ingredients"]
    drop_all_tables(tables_to_drop)

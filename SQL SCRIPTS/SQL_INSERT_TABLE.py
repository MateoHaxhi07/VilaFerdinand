import psycopg2
import bcrypt

table_name = 'users'

db_params = {
    "host": "dpg-cumpfg8gph6c7387r200-a.frankfurt-postgres.render.com",
    "database": "restaurant_db_mg7q",
    "user": "restaurant_db_mg7q_user",
    "password": "d9Zslmf92niOQETVqJaTb2n1Rxg0niYg",
    "port": 5432
}

economist_email = 'elona@gmail.com'
economist_password = 'Elona123'  # Replace with your desired password
economist_role = 'economist'  # Or 'user' if that’s your designation

try:
    conn = psycopg2.connect(**db_params)
    cur = conn.cursor()
    print("Connected to the database successfully.")

    # Ensure the table exists
    create_table_query = """
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """
    cur.execute(create_table_query)
    conn.commit()
    print(f"Table '{table_name}' is ready.")

    # Hash the economist password
    hashed_password = bcrypt.hashpw(economist_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    # Insert the economist user
    insert_user_query = """
        INSERT INTO users (email, password, role)
        VALUES (%s, %s, %s)
        ON CONFLICT (email) DO NOTHING;
    """
    cur.execute(insert_user_query, (economist_email, hashed_password, economist_role))
    conn.commit()
    print("Economist user inserted successfully.")

except Exception as e:
    print(f"An error occurred: {e}")
finally:
    if conn:
        cur.close()
        conn.close()
        print("Database connection closed.")

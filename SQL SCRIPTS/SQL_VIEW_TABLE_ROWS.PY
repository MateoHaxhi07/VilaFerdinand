import psycopg2
import urllib.parse as urlparse
import pandas as pd

# Your Render.com DATABASE_URL
DATABASE_URL = (
    "postgresql://restaurant_db_mg7q_user:"
    "d9Zslmf92niOQETVqJaTb2n1Rxg0niYg"
    "@dpg-cumpfg8gph6c7387r200-a."
    "frankfurt-postgres.render.com/restaurant_db_mg7q"
)

def compare_and_export_excel(output_filepath="article_name_comparison.xlsx"):
    # Parse the DATABASE_URL
    result = urlparse.urlparse(DATABASE_URL)
    conn = psycopg2.connect(
        dbname   = result.path[1:],   # strip leading '/'
        user     = result.username,
        password = result.password,
        host     = result.hostname,
        port     = result.port
    )
    cur = conn.cursor()

    try:
        # 1) Determine the 1-month window via your Datetime column
        cur.execute("""
            SELECT
              MAX("Datetime")                           AS end_dt,
              MAX("Datetime") - INTERVAL '1 MONTH'      AS start_dt
            FROM sales;
        """)
        end_dt, start_dt = cur.fetchone()
        if not end_dt:
            print("No rows in sales table.")
            return

        print(f"🔎 Analyzing sales from {start_dt} → {end_dt}")

        # 2) Pull distinct Article_Name from sales in that window
        cur.execute("""
            SELECT DISTINCT "Article_Name"
            FROM sales
            WHERE "Datetime" BETWEEN %s AND %s;
        """, (start_dt, end_dt))
        sales_names = {row[0] for row in cur.fetchall()}

        # 3) Pull distinct article_name from the ingredients table
        cur.execute("""
            SELECT DISTINCT article_name
            FROM article_ingredients;
        """)
        ingr_names = {row[0] for row in cur.fetchall()}

        # 4) Compute sets
        matches                = sorted(ingr_names & sales_names)
        missing_in_sales       = sorted(ingr_names - sales_names)
        missing_in_ingredients = sorted(sales_names - ingr_names)

        # 5) Build DataFrames
        df_matches = pd.DataFrame(matches, columns=["Article_Name"])
        df_missing_sales = pd.DataFrame(missing_in_sales, columns=["Article_Name"])
        df_missing_ingredients = pd.DataFrame(missing_in_ingredients, columns=["Article_Name"])

        # 6) Write to Excel with three sheets
        with pd.ExcelWriter(output_filepath, engine="openpyxl") as writer:
            df_matches.to_excel(writer, sheet_name="Matches", index=False)
            df_missing_sales.to_excel(writer, sheet_name="Ingr_Not_Sold", index=False)
            df_missing_ingredients.to_excel(writer, sheet_name="Sold_Not_Ingr", index=False)

        print(f"✅ Exported comparison to Excel file: {output_filepath}")

    except Exception as e:
        print("❌ Error:", e)
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    compare_and_export_excel()

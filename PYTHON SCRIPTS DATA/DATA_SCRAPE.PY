import os
import time
import glob
import pandas as pd
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# ---------------- CONSTANTS ----------------
LOGIN_URL = 'https://hospitality.devpos.al/login'
REPORTS_URL = 'https://hospitality.devpos.al/user/0/produktet/shitjet'
NIPT = "K31412026L"
USERNAME = "Elona"
PASSWORD = "Sindi2364*"
# Use your desired folder path
DOWNLOAD_FOLDER = r"C:\Users\mhaxh\OneDrive\Desktop\Restaurant_Dashboard-1.0.8\PYTHON SCRIPTS DATA\data"

if not os.path.exists(DOWNLOAD_FOLDER):
    os.makedirs(DOWNLOAD_FOLDER)

def setup_driver():
    chrome_options = webdriver.ChromeOptions()
    prefs = {
        "download.default_directory": DOWNLOAD_FOLDER,
        "download.prompt_for_download": False,
        "download.directory_upgrade": True,
        "plugins.always_open_pdf_externally": True
    }
    chrome_options.add_experimental_option("prefs", prefs)
    driver = webdriver.Chrome(options=chrome_options)
    return driver

def login_to_website(driver):
    driver.get(LOGIN_URL)
    WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.NAME, 'nipt'))
    ).send_keys(NIPT)
    WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.NAME, 'username'))
    ).send_keys(USERNAME)
    WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, '//input[@formcontrolname="password"]'))
    ).send_keys(PASSWORD)
    driver.find_element(By.XPATH, "//button[contains(., 'Login')]").click()
    time.sleep(5)  # Wait for any post-login processes

def cleanup_old_files():
    excel_files = [f for f in os.listdir(DOWNLOAD_FOLDER) if f.endswith('.xlsx')]
    if not excel_files:
        print("No Excel files found in the directory.")
        return
    newest_file = max(excel_files, key=lambda f: os.path.getmtime(os.path.join(DOWNLOAD_FOLDER, f)))
    print(f"Keeping the newest file: {newest_file}")
    for file in excel_files:
        if file != newest_file:
            os.remove(os.path.join(DOWNLOAD_FOLDER, file))
            print(f"Removed file: {file}")

def download_excel_report(driver):
    driver.get(REPORTS_URL)
    WebDriverWait(driver, 20).until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Shkarko raportin')]"))
    ).click()
    while True:
        matching_files = glob.glob(os.path.join(DOWNLOAD_FOLDER, "raport shitjes*.xlsx"))
        if matching_files:
            file_path = matching_files[0]
            if not file_path.endswith(".crdownload"):
                time.sleep(1)
                # Rename the file to sales_data.xlsx (always replacing the old file)
                new_file_path = os.path.join(DOWNLOAD_FOLDER, "sales_data.xlsx")
                try:
                    os.replace(file_path, new_file_path)
                    print(f"File renamed to: {new_file_path}")
                    format_excel_file(new_file_path)  # Format and process the file
                    cleanup_old_files()  # Remove old files
                    break
                except PermissionError as e:
                    print(f"PermissionError during file rename: {e}")
                    time.sleep(2)
        time.sleep(1)

def format_excel_file(file_path):
    df_new = pd.read_excel(file_path)
    
    # --- Remove all "-" characters from the data ---
    # This replaces any "-" in all cells with an empty string.
    df_new = df_new.replace("-", "", regex=True)
    
    # Delete unnecessary columns.
    # We keep the second column (index 1) to be renamed as Order_ID.
    columns_to_delete = [0, 2, 5, 7, 8, 9, 10, 12, 13, 15, 16, 18, 20, 21, 23, 24, 25]
    df_new.drop(df_new.columns[columns_to_delete], axis=1, inplace=True)
    
    # --- Updated Datetime Logic ---
    # Convert the date column using the provided format
    df_new['Data Rregjistrimit'] = pd.to_datetime(
        df_new['Data Rregjistrimit'], format='%d/%m/%Y', errors='coerce'
    )
    # Process the time column: if it contains "days", extract only the actual time portion.
    def process_time(x):
        x_str = str(x).strip()
        if "days" in x_str:
            parts = x_str.split(" ")
            if len(parts) >= 3:
                return parts[2]
        return x_str
    df_new['Koha Rregjistrimit'] = df_new['Koha Rregjistrimit'].astype(str).apply(process_time)
    
    # Combine the date and processed time into a new Datetime column
    df_new['Datetime'] = pd.to_datetime(
        df_new['Data Rregjistrimit'].dt.strftime('%Y-%m-%d') + ' ' + df_new['Koha Rregjistrimit'],
        errors='coerce'
    )
    # Drop the original date/time columns now that we have a combined Datetime column
    df_new.drop(['Data Rregjistrimit', 'Koha Rregjistrimit'], axis=1, inplace=True)

    # --- Rename Columns ---
    # After deletion, the columns (in order) are:
    # [Column0 (originally index 1, to be Order_ID), Column1, Column2, Column3, Column4, Column5] plus the new Datetime column at the end.
    new_column_names = {
        df_new.columns[0]: 'Order_ID',
        df_new.columns[1]: 'Seller',
        df_new.columns[2]: 'Article_Name',
        df_new.columns[3]: 'Category',
        df_new.columns[4]: 'Quantity',
        df_new.columns[5]: 'Article_Price',
        df_new.columns[6]: 'Total_Article_Price',
        df_new.columns[7]: 'Datetime'
    }
    df_new.rename(columns=new_column_names, inplace=True)

    # Process data (Seller Category)
    df_new = process_data(df_new)
    
    # Save the formatted Excel file
    df_new.to_excel(file_path, index=False)
    print(f"Excel file processed and saved: {file_path}")

def process_data(df):
    seller_categories = {
        'Enisa': 'Delivery',
        'Dea': 'Delivery',
        'Kristian Llupo': 'Bar',
        'Pranvera Xherahi': 'Bar',
        'Fjorelo Arapi': 'Restaurant',
        'Jonel Demba': 'Restaurant'
    }
    df['Seller Category'] = df['Seller'].map(seller_categories)
    df = df[df['Seller'] != 'TOTALI']
    return df

def convert_excel_to_csv(excel_file_path):
    """
    Converts the given Excel file to a CSV file with formatted datetime (MM/DD/YYYY HH:MM)
    and removes the original Excel file.
    """
    # Read the Excel file into a DataFrame
    df = pd.read_excel(excel_file_path)
    # Format the Datetime column as desired if it exists
    if 'Datetime' in df.columns:
        # Format as MM/DD/YYYY HH:MM
        df['Datetime'] = pd.to_datetime(df['Datetime'], errors='coerce').dt.strftime('%m/%d/%Y %H:%M')
    # Create the CSV file path by replacing the extension with .csv
    csv_file_path = os.path.splitext(excel_file_path)[0] + ".csv"
    # Save the DataFrame to CSV (without the index)
    df.to_csv(csv_file_path, index=False)
    print(f"CSV file saved to: {csv_file_path}")
    
    # Remove the original Excel file
    try:
        os.remove(excel_file_path)
        print(f"Original Excel file removed: {excel_file_path}")
    except Exception as e:
        print(f"Error removing Excel file {excel_file_path}: {e}")

def main():
    driver = setup_driver()
    try:
        login_to_website(driver)
        download_excel_report(driver)
        # After the Excel file is processed and saved as sales_data.xlsx,
        # convert it to CSV and remove the XLSX file.
        excel_file_path = os.path.join(DOWNLOAD_FOLDER, "sales_data.xlsx")
        convert_excel_to_csv(excel_file_path)
    finally:
        driver.quit()

if __name__ == "__main__":
    main()

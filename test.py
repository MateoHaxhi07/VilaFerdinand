import requests

# Replace with your actual deployed endpoint URL:
# e.g., https://restaurant-api-s6sq.onrender.com/sales/total-sales
# including any required query parameters (startDate, endDate, etc.)
endpoint_url = "https://restaurant-api-s6sq.onrender.com/sales/total-sales?startDate=2023-01-01&endDate=2023-01-31"

try:
    print(f"Making GET request to: {endpoint_url}")
    response = requests.get(endpoint_url)

    # Raise an exception if the request was unsuccessful (4xx or 5xx)
    response.raise_for_status()

    # Attempt to parse JSON
    data = response.json()
    print("✅ Request succeeded. Response data:")
    print(data)

except requests.exceptions.RequestException as e:
    print("❌ Request failed:", e)
except ValueError:
    print("❌ Response was not valid JSON.")

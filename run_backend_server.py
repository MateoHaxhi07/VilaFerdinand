import subprocess
import os

# Change directory to the restaurant-backend folder
os.chdir(r'C:\Users\mhaxh\OneDrive\Desktop\Restaurant_Dashboard-1.2.0\restaurant-backend')

# Run the 'node server.js' command to start the backend server
subprocess.run(['node', 'server.js'], shell=True)

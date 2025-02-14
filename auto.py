import time
import subprocess

# Define script paths
scripts = [
    "C:\\Users\\mhaxh\\OneDrive\\Desktop\\Restaurant_Dashboard-1.2.0\\PYTHON SCRIPTS DATA\\DATA_SCRAPE.PY",
    "C:\\Users\\mhaxh\\OneDrive\\Desktop\\Restaurant_Dashboard-1.2.0\\PYTHON SCRIPTS DATA\\IMPORT_PGADMIN.PY",
    "C:\\Users\\mhaxh\\OneDrive\\Desktop\\Restaurant_Dashboard-1.2.0\\run_backend_server.py"
]

while True:  # Keep running the scripts in a loop
    print("Starting scripts...")

    # Run first script
    subprocess.Popen(["python", scripts[0]])
    time.sleep(45)  # Pause 45 seconds

    # Run second script
    subprocess.Popen(["python", scripts[1]])
    time.sleep(8)  # Pause 8 seconds

    # Run remaining scripts
    subprocess.Popen(["python", scripts[2]])
    subprocess.Popen(["python", scripts[3]])

    print("Scripts completed. Waiting 5 minutes before rerunning...")

    # Wait 5 minutes before rerunning everything
    time.sleep(5 * 60)

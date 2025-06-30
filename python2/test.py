import os
from dotenv import load_dotenv
import subprocess
import sys
load_dotenv()

print(os.getenv("tmp_dir"))




def start_mysql():
  


def start_service(service_name,):
  if service_name == "api":
    subprocess.run(["python", "services/api/index.py",],stderr=sys.stderr, stdout=sys.stdout)


start_service("api")

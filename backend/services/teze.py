import os
import sys

build_dir = "build/mysql"
os.makedirs(build_dir, exist_ok=True)
print(f"Created or verified directory: {build_dir}")

sys.exit()

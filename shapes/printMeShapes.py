import glob
import os

for file_path in glob.glob("./Archimedean-Catalan Hulls/*.json"):
    file_name = os.path.basename(file_path)
    raw_name, type = os.path.splitext(file_name)

    print("addDrawSystem({")
    print(f"    name: '{raw_name.lower()}',")
    print(f"    shapePath: 'Archimedean-Catalan Hulls/{raw_name}'")
    print("});")
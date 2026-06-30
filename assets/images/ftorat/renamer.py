import os
import re

def rename_images(folder_path):
    # This pattern looks for "Calque " (case-insensitive) followed by digits and ".jpg"
    pattern = re.compile(r'Calque\s+(\d+)\.jpg', re.IGNORECASE)
    
    # Counter to keep track of how many files were renamed
    renamed_count = 0

    # Loop through all files in the specified directory
    for filename in os.listdir(folder_path):
        match = pattern.search(filename)
        
        if match:
            # Extract the number caught by the regex (e.g., "1", "2", "3")
            number = match.group(1)
            new_filename = f"{number}.jpg"
            
            old_path = os.path.join(folder_path, filename)
            new_path = os.path.join(folder_path, new_filename)
            
            # Check if the target filename already exists to prevent accidental overwriting
            if os.path.exists(new_path):
                print(f"⚠️ Skipping '{filename}' -> '{new_filename}' already exists.")
                continue

            # Rename the file
            os.rename(old_path, new_path)
            print(f"✅ Renamed: '{filename}' -> '{new_filename}'")
            renamed_count += 1

    print(f"\nDone! Successfully renamed {renamed_count} files.")

if __name__ == "__main__":
    # Set this to the path of your folder containing the images.
    # '.' means the current folder the script is running in.
    # Alternatively, you can put a full path like r"C:\Users\Name\Pictures\Images"
    TARGET_FOLDER = '.' 
    
    rename_images(TARGET_FOLDER)
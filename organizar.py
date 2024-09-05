import json

# Load the JSON file
file_path = '/species.json'  # Update this if your file is in a different location
with open(file_path, 'r', encoding='utf-8') as file:
    data = json.load(file)

# Update the 'id som' for each entry
for idx, entry in enumerate(data, start=1):
    entry['id som'] = idx

# Save the updated JSON file
output_path = '/mnt/data/updated_species.json'
with open(output_path, 'w', encoding='utf-8') as file:
    json.dump(data, file, ensure_ascii=False, indent=4)

print(f"Updated JSON saved to {output_path}")
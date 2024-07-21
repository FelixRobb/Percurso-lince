import json

def convert_months(input_file, output_file):
    with open(input_file, 'r', encoding='utf-8') as f:  # Handle potential encoding issues
        data = json.load(f)

    for entry in data:
        if 'most_probable_months' in entry:
            months_string = entry['most_probable_months']
            if months_string:
                months_list = [month.strip() for month in months_string.split(';')]
                entry['most_probable_months'] = months_list

    with open(output_file, 'w', encoding='utf-8') as f:  # Write with UTF-8 encoding
        json.dump(data, f, indent=4, ensure_ascii=False)  # Preserve non-ASCII characters

# Example usage:
input_file = 'species.json'
output_file = 'species_modified.json'
convert_months(input_file, output_file)

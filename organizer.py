import json

def sanitize_input(input_str):
    return input_str.strip()

def add_bird_entry():
    name = sanitize_input(input("Enter bird name: "))
    scientific_name = sanitize_input(input("Enter scientific name: "))
    description = sanitize_input(input("Enter description: "))
    most_probable_date = sanitize_input(input("Enter most probable date to see it: "))
    image = sanitize_input(input("Enter image filename: "))
    location_lat = float(sanitize_input(input("Enter location latitude: ")))
    location_lng = float(sanitize_input(input("Enter location longitude: ")))

    bird_entry = {
        "name": name,
        "scientific_name": scientific_name,
        "description": description,
        "most_probable_date": most_probable_date,
        "image": image,
        "location": {
            "lat": location_lat,
            "lng": location_lng
        }
    }

    return bird_entry

def save_bird_data(bird_data, filename='birds.json'):
    with open(filename, 'w') as f:
        json.dump(bird_data, f, indent=4)

def load_bird_data(filename='birds.json'):
    try:
        with open(filename, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return []

if __name__ == "__main__":
    birds = load_bird_data()
    new_bird = add_bird_entry()
    birds.append(new_bird)
    save_bird_data(birds)
    print("Bird data saved successfully!")

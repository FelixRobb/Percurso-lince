import os
import json
import re
from flask import Flask, render_template, request, redirect, url_for, flash
from werkzeug.utils import secure_filename
from PIL import Image

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'
app.config['UPLOAD_FOLDER'] = 'static'
app.config['IMAGE_UPLOADS'] = os.path.join(app.config['UPLOAD_FOLDER'], 'images')
app.config['SOUND_UPLOADS'] = os.path.join(app.config['UPLOAD_FOLDER'], 'sounds')
app.config['ALLOWED_IMAGE_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif'}
app.config['ALLOWED_SOUND_EXTENSIONS'] = {'mp3', 'wav', 'ogg'}
app.config['MAX_IMAGE_RESOLUTION'] = (1500, 1500)  # Maximum resolution for images

# Ensure the directories exist
os.makedirs(app.config['IMAGE_UPLOADS'], exist_ok=True)
os.makedirs(app.config['SOUND_UPLOADS'], exist_ok=True)

def allowed_file(filename, allowed_extensions):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions

def load_bird_data(filename='birds.json'):
    try:
        with open(filename, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return []

def save_bird_data(bird_data, filename='birds.json'):
    with open(filename, 'w') as f:
        json.dump(bird_data, f, indent=4)

def sanitize_filename(name):
    return re.sub(r'[^a-zA-Z0-9_]', '', name.replace(' ', '_').lower())

def resize_image(image_path):
    try:
        img = Image.open(image_path)
        img.thumbnail(app.config['MAX_IMAGE_RESOLUTION'])
        img_square = img.crop((0, 0, min(img.size), min(img.size)))
        return img_square
    except Exception as e:
        print(f"Error resizing image: {e}")
        return None

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/add_bird', methods=['GET', 'POST'])
def add_bird():
    if request.method == 'POST':
        name = request.form['name'].strip()
        scientific_name = request.form['scientific_name'].strip()
        description = request.form['description'].strip()
        most_probable_months = request.form.getlist('most_probable_months') 

        if 'image' not in request.files or 'sound' not in request.files:
            flash('No file part')
            return redirect(request.url)

        image = request.files['image']
        sound = request.files['sound']

        if image.filename == '' or sound.filename == '':
            flash('No selected file')
            return redirect(request.url)

        sanitized_name = sanitize_filename(name)

        if image and allowed_file(image.filename, app.config['ALLOWED_IMAGE_EXTENSIONS']):
            sanitized_name = sanitize_filename(name)
            image_filename = f"{sanitized_name}.{image.filename.rsplit('.', 1)[1].lower()}"
            image_path = os.path.join(app.config['IMAGE_UPLOADS'], sanitized_name + '.jpg')
            print(f"Saving image to: {image_path}")
    
            try:
                image.save(image_path)
                print("Original image saved successfully.")
        
                # Resize and save square image
                img_square = resize_image(image_path)
                if img_square:
                    image_square_path = os.path.join(app.config['IMAGE_UPLOADS'], sanitized_name + '.jpg')
                    img_square.save(image_square_path)
                    print("Square image saved successfully.")
                else:
                    print("Error: Could not resize image.")
        
                # Cleanup: Delete original image if square image is successfully created
                #if os.path.exists(image_path) and os.path.exists(image_square_path):
                    #os.remove(image_path)
                    #print(f"Original image deleted: {image_path}")
            
            except Exception as e:
                print(f"Error saving image: {e}")

        if sound and allowed_file(sound.filename, app.config['ALLOWED_SOUND_EXTENSIONS']):
            sound_filename = f"{sanitized_name}.{sound.filename.rsplit('.', 1)[1].lower()}"
            sound_path = os.path.join(app.config['SOUND_UPLOADS'], sound_filename)
            print(f"Saving sound to: {sound_path}")
            try:
                sound.save(sound_path)
                print("Sound saved successfully.")
            except Exception as e:
                print(f"Error saving sound: {e}")

        bird_entry = {
            "name": name,
            "scientific_name": scientific_name,
            "description": description,
            "most_probable_months": most_probable_months,
            "image": f'images/{sanitized_name}.jpg',  # Save sanitized filename
            "audio": f'sounds/{sound_filename}',  # Use sanitized filename for audio
            "location": {
                "lat": float(request.form['lat']),
                "lng": float(request.form['lng'])
            }
        }

        birds = load_bird_data()
        birds.append(bird_entry)
        save_bird_data(birds)

        return redirect(url_for('success'))

    return render_template('add_bird.html')

@app.route('/success')
def success():
    return render_template('success.html')

if __name__ == '__main__':
    app.run(debug=True)

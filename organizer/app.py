import os
import json
from flask import Flask, render_template, request, redirect, url_for, flash
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'
app.config['UPLOAD_FOLDER'] = 'static'
app.config['IMAGE_UPLOADS'] = 'static/images'
app.config['SOUND_UPLOADS'] = 'static/sounds'
app.config['ALLOWED_IMAGE_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif'}
app.config['ALLOWED_SOUND_EXTENSIONS'] = {'mp3', 'wav', 'ogg'}

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

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/add_bird', methods=['GET', 'POST'])
def add_bird():
    if request.method == 'POST':
        name = request.form['name'].strip()
        scientific_name = request.form['scientific_name'].strip()
        description = request.form['description'].strip()
        most_probable_date = request.form['most_probable_date'].strip()

        if 'image' not in request.files or 'sound' not in request.files:
            flash('No file part')
            return redirect(request.url)

        image = request.files['image']
        sound = request.files['sound']

        if image.filename == '' or sound.filename == '':
            flash('No selected file')
            return redirect(request.url)

        if image and allowed_file(image.filename, app.config['ALLOWED_IMAGE_EXTENSIONS']):
            image_filename = secure_filename(image.filename)
            image.save(os.path.join(app.config['IMAGE_UPLOADS'], image_filename))

        if sound and allowed_file(sound.filename, app.config['ALLOWED_SOUND_EXTENSIONS']):
            sound_filename = secure_filename(sound.filename)
            sound.save(os.path.join(app.config['SOUND_UPLOADS'], sound_filename))

        bird_entry = {
            "name": name,
            "scientific_name": scientific_name,
            "description": description,
            "most_probable_date": most_probable_date,
            "image": f'images/{image_filename}',
            "sound": f'sounds/{sound_filename}',
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

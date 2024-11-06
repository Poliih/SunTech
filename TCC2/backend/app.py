from flask import Flask
from flask_cors import CORS
from config.config import Config
from models import db
from routes.Api import api
import os
import threading
import time
from robot.RNN_LSTM import RNN_LSTM  

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+pymysql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_DATABASE')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

CORS(app, resources={r"/api/*": {"origins": "*"}})

app.config.from_object(Config)

UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

db.init_app(app)

with app.app_context():
    db.create_all()

app.register_blueprint(api, url_prefix='/api')

def start_rnn_lstm():
    time.sleep(10)
    RNN_LSTM()

if __name__ == '__main__':
    threading.Thread(target=start_rnn_lstm).start()
    
    app.run(debug=True)

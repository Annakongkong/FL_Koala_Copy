import os

from app.factory import app as application

app = application



app.config['TMP_DIR'] = os.path.join(os.path.dirname(__file__), 'data', 'tmp')
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), 'data', 'uploads')

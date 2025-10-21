import os
import sys

# Allow imports from parent folder
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from extensions import db

app = create_app()
app.app_context().push()

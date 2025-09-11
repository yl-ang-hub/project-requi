import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from resources.auth import auth

app = Flask(__name__)
CORS(app)

app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
jwt = JWTManager(app)

app.register_blueprint(auth, url_prefix="/auth")

if __name__ == "__main__":
    app.run(port=5001, debug=os.getenv("DEBUG", True))
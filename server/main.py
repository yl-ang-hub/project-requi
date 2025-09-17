import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from resources.auth import auth
from resources.users import users
from resources.requisitions import requisitions
from resources.suppliers import suppliers
from resources.orders import orders

app = Flask(__name__)
CORS(app)

app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
jwt = JWTManager(app)

app.register_blueprint(auth, url_prefix="/auth")
app.register_blueprint(users, url_prefix="/users")
app.register_blueprint(requisitions, url_prefix="/requisitions")
app.register_blueprint(suppliers)
app.register_blueprint(orders, url_prefix="/orders")

if __name__ == "__main__":
    app.run(port=5001, debug=os.getenv("DEBUG", False))
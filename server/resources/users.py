import bcrypt
from flask import request, jsonify, Blueprint
from db.db_pool import get_cursor, release_connection

users = Blueprint("users", __name__)


@users.route("/search", methods=["POST"])
def search_users():
    conn = None
    try:
        conn, cursor = get_cursor()
        inputs = request.get_json()
        query = f"%{inputs['query']}%"
        print(query)
        cursor.execute('SELECT * FROM users WHERE email LIKE %s', (query,))
        results = cursor.fetchall()
        print(results)
        return jsonify(results), 200

    except Exception as e:
        print(f'unknown error: {e}')
        return jsonify(status="error", msg="Unable to search database"), 400

    finally:
        if conn: release_connection(conn)

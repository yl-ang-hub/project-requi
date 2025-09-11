import bcrypt
from flask import request, jsonify, Blueprint
from db.db_pool import get_cursor, release_connection
from flask_jwt_extended import create_access_token, create_refresh_token

auth = Blueprint("auth", __name__)


@auth.route("/users", methods=["GET"])
def get_registration_options():
    conn = None
    try:
        conn, cursor = get_cursor()

        cursor.execute('SELECT role FROM roles ORDER BY role;')
        roles = cursor.fetchall()
        cursor.execute('SELECT cost_centre FROM cost_centres ORDER BY cost_centre;')
        cost_centres = cursor.fetchall()

        results = {
            "roles": [r["role"] for r in roles],
            "cost_centres": [c["cost_centre"] for c in cost_centres]
        }
        return jsonify(results), 200

    except Exception as e:
        print(f'Encountered error: {e}')
        return jsonify({"status": "error", "msg": "Unable to load options"}), 400

    finally:
        if conn: release_connection(conn)


@auth.route("/users", methods=["PUT"])
def add_user():
    conn = None
    try:
        conn, cursor = get_cursor()
        inputs = request.get_json()
        print(inputs)
        cursor.execute("SELECT * FROM users WHERE email=%s", (inputs['email'],))
        duplicate = cursor.fetchone()

        if duplicate:
            return jsonify(status="error", msg="Duplicate user found"), 400

        hashed_pw = bcrypt.hashpw(inputs['password'].encode('utf-8'), bcrypt.gensalt())

        cursor.execute('INSERT INTO users (name, email, role, cost_centre, designation) VALUES (%s, %s, %s, %s, %s) RETURNING id',
                       (inputs['name'], inputs['email'], inputs['role'], inputs['costCentre'], inputs['designation']))
        new_user = cursor.fetchone()
        print(f'new_user is {new_user["id"]}')
        cursor.execute('INSERT INTO auth (user_id, hash) VALUES (%s, %s)', (new_user['id'], hashed_pw.decode('utf-8')))
        conn.commit()

        return jsonify(status="ok", msg="user added"), 200

    except Exception as e:
        conn.rollback()
        print(f'unknown error: {e}')
        return jsonify({'status': 'error', 'msg': 'Unable to create new user'}), 400

    finally:
        if conn: release_connection(conn)


@auth.route("/login", methods=["POST"])
def login():
    conn = None
    try:
        conn, cursor = get_cursor()
        inputs = request.get_json()

        cursor.execute('SELECT * FROM auth WHERE user_id=%s', (inputs['userId'],))
        auth_record = cursor.fetchone()
        if not auth_record:
            return jsonify(status="error", msg="email or password incorrect"), 401

        access = bcrypt.checkpw(inputs['password'].encode('utf-8'), auth_record['hash'].encode('utf-8'))
        if not access:
            return jsonify(status="error", msg="email or password incorrect"), 401

        cursor.execute('SELECT * FROM users WHERE id=%s', (inputs['userId'],))
        user = cursor.fetchone()
        claims = {"id": user['id'], "name": user['name'], "role": user['role']}
        access_token = create_access_token(user['id'], additional_claims=claims)
        refresh_token = create_refresh_token(user['id'], additional_claims=claims)

        return jsonify({"access": access_token, "refresh": refresh_token}), 200

    except Exception as e:
        print(f'Encountered error: {e}')
        return jsonify(status="error", msg="Unable to log in"), 401

    finally:
        if conn: release_connection(conn)
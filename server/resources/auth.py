import bcrypt
from flask import request, jsonify, Blueprint
from db.db_pool import get_cursor, release_connection
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity, get_jwt

auth = Blueprint("auth", __name__)


@auth.route("/users", methods=["GET"])
def get_registration_options():
    conn = None
    try:
        conn, cursor = get_cursor()

        cursor.execute('SELECT role FROM roles ORDER BY role;')
        roles = cursor.fetchall()
        cursor.execute('SELECT cost_centre, department_name FROM cost_centres ORDER BY cost_centre;')
        cost_centres = cursor.fetchall()
        cursor.execute('SELECT DISTINCT division_name FROM cost_centres ORDER BY division_name;')
        division_names = cursor.fetchall()

        results = {
            "roles": [r["role"] for r in roles],
            "cost_centres": [f'{c["cost_centre"]} - {c["department_name"]}' for c in cost_centres],
            "division_names": [f'{d["division_name"]}' for d in division_names]
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

        cost_centre = inputs['costCentre'].split(" - ")[0]
        print(cost_centre)
        cursor.execute('INSERT INTO users (name, email, contact_number, login_id, role, cost_centre, designation, division_name) VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id',
                       (inputs['name'], inputs['email'], inputs['contactNumber'], inputs['loginId'], inputs['role'], cost_centre, inputs['designation'], inputs['divisionName']))
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
    print("start")
    try:
        conn, cursor = get_cursor()
        inputs = request.get_json()

        cursor.execute('SELECT * FROM users JOIN auth ON users.id = auth.user_id WHERE users.login_id=%s', (inputs['loginId'],))
        user = cursor.fetchone()
        print(user)
        if not user:
            return jsonify(status="error", msg="id or password incorrect"), 401

        access = bcrypt.checkpw(inputs['password'].encode('utf-8'), user['hash'].encode('utf-8'))
        print(access)
        if not access:
            return jsonify(status="error", msg="id or password incorrect"), 401

        claims = {"id": user['id'], "login_id": user['login_id'], "name": user['name'], "role": user['role']}
        access_token = create_access_token(str(user['id']), additional_claims=claims)
        refresh_token = create_refresh_token(str(user['id']), additional_claims=claims)

        return jsonify({"access": access_token, "refresh": refresh_token}), 200

    except Exception as e:
        print(f'Encountered error: {e}')
        return jsonify(status="error", msg="Unable to log in"), 401

    finally:
        if conn: release_connection(conn)


@auth.route("/refresh")
@jwt_required(refresh=True)
def refresh():
    print("running refresh")
    conn = None
    try:
        # token must be passed in headers as "refresh"
        identity = get_jwt_identity()
        refresh_claims = get_jwt()
        claims = {
            "id": refresh_claims['id'],
            "login_id": refresh_claims['login_id'],
            "name": refresh_claims['name'],
            "role": refresh_claims['role']
        }
        print(identity, claims)

        access_token = create_access_token(identity, additional_claims=claims)

        return jsonify(access=access_token), 200

    except Exception as e:
        print(f'unknown error: {e}')
        return jsonify(status="error", msg="unable to refresh access"), 400

    finally:
        if conn: release_connection(conn)
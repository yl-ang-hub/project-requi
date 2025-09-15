from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from db.db_pool import get_cursor, release_connection

suppliers = Blueprint("suppliers", __name__)


@suppliers.route("/suppliers")
@jwt_required()
def get_suppliers():
    conn = None
    try:
        conn, cursor = get_cursor()
        cursor.execute('SELECT * FROM suppliers')
        results = cursor.fetchall()

        supplier_listing = []
        for result in results:
            supplier_listing.append(f"{result['company_name']} - {result['business_reg_no']}")


        return jsonify({'supplier_listing': supplier_listing, 'suppliers': results}), 200

    except Exception as e:
        print(f"unknown error: {e}")
        return jsonify(status="error", msg="unable to retrieve supplier listing"), 400

    finally:
        if conn: release_connection(conn)
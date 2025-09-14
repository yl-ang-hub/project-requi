import datetime as dt
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from db.db_pool import get_cursor, release_connection


requisitions = Blueprint("requisitions", __name__)


@requisitions.route("/getOptions", methods=["GET"])
@jwt_required()
def get_requisition_options():
    conn = None
    try:
        conn, cursor = get_cursor()

        cursor.execute('SELECT * FROM cost_centres ORDER BY cost_centre')
        cc_results = cursor.fetchall()

        cursor.execute('SELECT * FROM account_codes ORDER BY account_code')
        acct_results = cursor.fetchall()

        cursor.execute('SELECT * FROM gl_codes ORDER BY gl_code')
        gl_results = cursor.fetchall()

        cursor.execute('SELECT code FROM currencies ORDER BY code')
        currency_results = cursor.fetchall()

        results = {
            "cost_centres": [f'{c["cost_centre"]} - {c["department_name"]}' for c in cc_results],
            "account_codes": [f'{a["account_code"]} - {a["cost_centre"]}' for a in acct_results],
            "gl_codes": [f'{g["gl_code"]} - {g["description"]}' for g in gl_results],
            "currencies": [c["code"] for c in currency_results],
        }

        return jsonify(results), 200

    except Exception as e:
        print(f'unknown error: {e}')
        return jsonify(status="error", msg="unable to pull options for new PR"), 400

    finally:
        if conn: release_connection(conn)


@requisitions.route("/getApprovalFlow", methods=["POST"])
@jwt_required()
def get_approval_flow():
    conn = None
    try:
        conn, cursor = get_cursor()
        inputs = request.get_json()
        cost_centre = inputs["costCentre"].split(" - ")[0]

        # Get all users
        cursor.execute('SELECT id, name FROM users')
        users = cursor.fetchall()

        # Get Finance in charge
        cursor.execute('SELECT * FROM cost_centres WHERE cost_centre=%s', (cost_centre,))
        cc_data = cursor.fetchone()
        print(cc_data)
        if not cc_data:
            return jsonify(status="error", msg=f"No cost_centre found for {cost_centre}"), 400

        # Calculate total amount in sgd
        cursor.execute('SELECT conversion_rate FROM currencies WHERE code=%s', (inputs['currency'],))
        curr_rate = cursor.fetchone()
        amount_in_sgd = inputs["totalAmount"] / curr_rate['conversion_rate']

        # CREATE APPROVAL FLOW FOR THIS REQUISITION
        approval_flow = [{
            "approval_matrix_id": None,
            "requisition_approval_sequence": 1,
            "approver_role": "Finance Officer",
            "approver_id": cc_data['finance_officer'],
            "approver": list(filter(lambda user: user['id'] == cc_data['finance_officer'], users))[0]['name']
        }]

        # Retrieve the correct approval matrix rows from approval_matrix
        if "MMD" in cost_centre:
            cursor.execute(
                """
                SELECT * FROM approval_matrix 
                WHERE min_cost <= %s AND (
                    for_cost_centre = %s OR for_cost_centre LIKE %s
                ) 
                ORDER BY min_cost;
                """, (amount_in_sgd, cost_centre, 'ALL + MMD')
            )
            results = cursor.fetchall()
        else:
            cursor.execute(
                'SELECT * FROM approval_matrix WHERE for_cost_centre LIKE %s AND min_cost <= %s ORDER BY min_cost;',
                ('ALL%', amount_in_sgd)
            )
            results = cursor.fetchall()

        # Retrieve the approver_id and add to approval flow
        for i in range(len(results)):
            if 'Head' in results[i]['role']:
                cursor.execute('SELECT id FROM users WHERE cost_centre=%s AND role=%s',
                               (cost_centre, results[i]['role']))
            elif 'Director' in results[i]['role']:
                cursor.execute('SELECT id FROM users WHERE division_name=%s AND role=%s',
                               (cc_data['division_name'], results[i]['role']))
            else:
                cursor.execute('SELECT id FROM users WHERE role=%s', (results[i]['role'],))
            approver_details = cursor.fetchone()
            approval_flow.append({
                "approval_matrix_id": results[i]['id'],
                "requisition_approval_sequence": i + 2,
                "approver_role": results[i]['role'],
                "approver_id": approver_details['id'],
                "approver": list(filter(lambda user: user['id'] == approver_details['id'], users))[0]['name']
            })

        # Add MMD officer, MMD Manager and MMD Head (application for all requisitions)
        for role in ['MMD', 'MMD Head', 'MMD Director']:
            approval_flow.append({
                "approval_matrix_id": None,
                "requisition_approval_sequence": len(approval_flow) + 1,
                "approver_role": role,
                "approver_id": None
            })

        print(approval_flow)

        return jsonify(approval_flow), 200

    except Exception as e:
        print(f'unknown error: {e}')
        return jsonify(status="error", msg="Unable to retrieve approval flow"), 400

    finally:
        if conn: release_connection(conn)


@requisitions.route("/create", methods=["PUT"])
@jwt_required()
def add_new_requisition():
    conn = None
    try:
        conn, cursor = get_cursor()
        inputs = request.get_json()
        cost_centre = inputs["costCentre"].split(" - ")[0]
        account_code = inputs["accountCode"].split(" - ")[0]
        gl_code = inputs["glCode"].split(" - ")[0]
        print(cost_centre, account_code, gl_code)
        print(inputs['items'])

        # Get requester data
        cursor.execute('SELECT * FROM users WHERE id=%s', (inputs['userId'],))
        user = cursor.fetchone()
        print(user)

        # Get Finance in charge
        cursor.execute('SELECT * FROM cost_centres WHERE cost_centre=%s', (cost_centre,))
        cc_data = cursor.fetchone()
        print(cc_data)

        # Calculate amount in sgd
        cursor.execute('SELECT conversion_rate FROM currencies WHERE code=%s', (inputs['currency'],))
        curr_rate = cursor.fetchone()
        amount_in_sgd = inputs["totalAmount"] / curr_rate['conversion_rate']

        # Create New PR
        cursor.execute(
            """
            INSERT INTO requisitions (
                title, description, requester_id, requester_contact_name, requester_contact_number,
                requester_email, requester_role, pr_contact_name, pr_contact_number, pr_contact_email,
                cost_centre, account_code, gl_code, total_amount, currency, 
                amount_in_sgd, comments, goods_required_by, created_at, next_approver
            ) VALUES (
                %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s
            )
            RETURNING id;
            """,
            (
                inputs['title'],
                inputs['description'],
                user['id'],
                user['name'],
                user['contact_number'],
                user['email'],
                user['role'],
                inputs['prContactName'],
                inputs['prContactNumber'],
                inputs['prContactEmail'],
                cost_centre,
                account_code,
                gl_code,
                inputs['totalAmount'],
                inputs['currency'],
                amount_in_sgd,
                inputs['comments'],
                inputs['goodsRequiredBy'],
                dt.datetime.now(),
                cc_data['finance_officer']
            )
        )
        requisition = cursor.fetchone()
        print(requisition['id'])

        # TODO: Create the line items
        for item in inputs['items']:
            cursor.execute(
                """
                INSERT INTO requisition_items (
                    requisition_id, name, description, quantity, unit_of_measure,
                    unit_cost, currency
                ) VALUES (
                    %s, %s, %s, %s, %s,
                    %s, %s
                ) RETURNING id;
                """, (
                    requisition['id'], item['itemName'], item['itemDescription'], item['quantity'],
                    item['unitOfMeasure'],
                    item['unitCost'], inputs['currency']
                ))

        # TODO: Create new approval flow for this requisition
        # CREATE APPROVAL FLOW FOR THIS REQUISITION
        approval_flow = [{
            "requisition_id": requisition['id'],
            "approval_matrix_id": None,
            "requisition_approval_sequence": 1,
            "approver_role": "Finance Officer",
            "approver_id": cc_data['finance_officer']
        }]

        # Retrieve the correct approval matrix rows from approval_matrix
        if "MMD" in cost_centre:
            cursor.execute(
                """
                SELECT * FROM approval_matrix 
                WHERE min_cost <= %s AND (
                    for_cost_centre = %s OR for_cost_centre LIKE %s
                ) 
                ORDER BY min_cost;
                """, (inputs['totalAmount'], cost_centre, 'ALL + MMD')
            )
            results = cursor.fetchall()
        else:
            cursor.execute(
                'SELECT * FROM approval_matrix WHERE for_cost_centre LIKE %s AND min_cost <= %s ORDER BY min_cost;',
                ('ALL%', inputs['totalAmount'])
            )
            results = cursor.fetchall()

        # Retrieve the approver_id and add to approval flow
        for i in range(len(results)):
            if 'Head' in results[i]['role']:
                cursor.execute('SELECT id FROM users WHERE cost_centre=%s AND role=%s',
                               (cost_centre, results[i]['role']))
            elif 'Director' in results[i]['role']:
                cursor.execute('SELECT id FROM users WHERE division_name=%s AND role=%s',
                               (cc_data['division_name'], results[i]['role']))
            else:
                cursor.execute('SELECT id FROM users WHERE role=%s', (results[i]['role'],))
            approver_details = cursor.fetchone()
            approval_flow.append({
                "requisition_id": requisition['id'],
                "approval_matrix_id": results[i]['id'],
                "requisition_approval_sequence": i + 2,
                "approver_role": results[i]['role'],
                "approver_id": approver_details['id']
            })

        # Add MMD officer, MMD Manager and MMD Head (application for all requisitions)
        for role in ['MMD', 'MMD Head', 'MMD Director']:
            approval_flow.append({
                "requisition_id": requisition['id'],
                "approval_matrix_id": None,
                "requisition_approval_sequence": len(approval_flow) + 1,
                "approver_role": role,
                "approver_id": None
            })

        # Create the approval flow in database
        for row in approval_flow:
            cursor.execute(
                """
                INSERT INTO requisition_approval_flow (
                    requisition_id, approval_matrix_id, requisition_approval_sequence, approver_role, approver_id
                ) VALUES (%s, %s, %s, %s, %s)""", (
                    row['requisition_id'], row['approval_matrix_id'], row['requisition_approval_sequence'],
                    row['approver_role'], row['approver_id']
                )
            )

        conn.commit()
        return jsonify(status="ok", msg="PR successfully created"), 200

    except Exception as e:
        print(f'"unknown error: {e}')
        return jsonify(status="error", msg="Unable to create new PR"), 400

    finally:
        if conn: release_connection(conn)


@requisitions.route("/approvals/pending", methods=["POST"])
@jwt_required()
def get_PR_pending_approvals():
    conn = None
    try:
        conn, cursor = get_cursor()
        inputs = request.get_json()

        cursor.execute(
            """
            SELECT * FROM requisitions WHERE next_approver = %s ORDER BY goods_required_by, id
            """, (inputs['userId'],)
        )
        results = cursor.fetchall()

        for result in results:
            result['total_amount'] = f"${result['total_amount']:,.2f}"
            result['amount_in_sgd'] = f"${result['amount_in_sgd']:,.2f}"
            result['goods_required_by'] = result['goods_required_by'].strftime("%-d %b %Y")
            print(result['total_amount'], result['amount_in_sgd'], result['goods_required_by'])

        return jsonify(results), 200

    except Exception as e:
        print(f'unknown error: {e}')
        return jsonify(status="error", msg="unable to retrieve from database"), 400

    finally:
        if conn: release_connection(conn)


@requisitions.route("/<id>", methods=["GET"])
@jwt_required()
def get_pr(id):
    conn = None
    try:
        conn, cursor = get_cursor()

        cursor.execute(
            """
            SELECT *, users.name AS approver FROM requisition_approval_flow 
            LEFT JOIN users ON users.id = approver_id 
            WHERE requisition_id=%s ORDER BY requisition_approval_sequence
            """, (id,)
        )
        approval_flow = cursor.fetchall()

        cursor.execute('SELECT * FROM requisitions WHERE id=%s', (id,))
        pr = cursor.fetchone()
        pr['total_amount'] = f"{pr['currency']} {pr['total_amount']:,.2f}"
        pr['amount_in_sgd'] = f"${pr['amount_in_sgd']:,.2f}"
        pr['goods_required_by'] = pr['goods_required_by'].strftime("%-d %b %Y")
        if pr['updated_by'] != None:
            cursor.execute('SELECT name FROM users WHERE id=%s', (pr['updated_by'],))
            updated_user = cursor.fetchone()
            pr['updated_by'] = updated_user['name']

        cursor.execute('SELECT * FROM requisition_items WHERE requisition_id=%s', (pr['id'],))
        items = cursor.fetchall()
        pr['items'] = items

        return jsonify({"pr": pr, "approval_flow": approval_flow}), 200

    except Exception as e:
        print(f'unknown error: {e}')
        return jsonify(status="error", msg="unable to retrieve from database"), 400

    finally:
        if conn: release_connection(conn)


@requisitions.route("/<id>", methods=["PATCH"])
@jwt_required()
def approve_pr(id):
    conn = None
    try:
        conn, cursor = get_cursor()
        inputs = request.get_json()

        cursor.execute('SELECT * FROM requisitions WHERE id=%s', (id,))
        requisition = cursor.fetchone()

        if requisition['next_approver'] != inputs['userId']:
            return jsonify(status="error", msg="Unauthorised to approve"), 401

        # Check for any updates to any fields by the approver (by MMD or Finance)
        updates = {}
        if requisition['cost_centre'] != inputs['form']['costCentre']: updates['cost_centre'] = inputs['form']['costCentre']

        # Update the approval in requisition_approval_flow
        cursor.execute(
            """
            UPDATE requisition_approval_flow 
            SET approval_status=%s, approved_at=%s, approver_comments=%s 
            WHERE requisition_id=%s AND approver_id=%s AND approval_status=%s
            RETURNING requisition_approval_sequence
            """,
            ("Approved", dt.datetime.now(), inputs['form']['approverComments'], requisition['id'],
             requisition['next_approver'], "Queued")
        )
        approval_seq = cursor.fetchone()

        # Update next_approver inside requisitions
        next_approver_sequence = int(approval_seq['requisition_approval_sequence']) + 1
        cursor.execute(
            """
            SELECT approver_id, approver_role FROM requisition_approval_flow
            WHERE requisition_id=%s AND requisition_approval_sequence=%s
            """, (requisition['id'], next_approver_sequence)
        )
        approver = cursor.fetchone()
        if "MMD" in approver['approver_role']: pr_status = "Pending MMD"
        elif "Finance" in inputs['role']: pr_status = "Pending Next Level Approver"
        cursor.execute('UPDATE requisitions SET next_approver=%s, status=%s WHERE id=%s', (approver['approver_id'], pr_status, requisition['id']))

        conn.commit()

        return jsonify(status="ok", msg="approved successfully"), 200

    except Exception as e:
        print(f'unknown error: {e}')
        return jsonify(status="error", msg="unable to approve PR"), 400

    finally:
        if conn: release_connection(conn)


@requisitions.route("/<id>/reject", methods=["POST"])
@jwt_required()
def reject_pr(id):
    conn = None
    try:
        conn, cursor = get_cursor()
        inputs = request.get_json()

        cursor.execute('SELECT * FROM requisitions WHERE id=%s', (id,))
        requisition = cursor.fetchone()

        if requisition['next_approver'] != inputs['userId']:
            return jsonify(status="error", msg="Unauthorised"), 401

        # Update the rejection in requisition_approval_flow
        cursor.execute(
            """
            UPDATE requisition_approval_flow 
            SET approval_status=%s, approved_at=%s, approver_comments=%s 
            WHERE requisition_id=%s AND approver_id=%s AND approval_status=%s
            """,
            ("Rejected", dt.datetime.now(), inputs['form']['approverComments'], requisition['id'],
             requisition['next_approver'], "Queued")
        )
        cursor.execute(
            """
            UPDATE requisition_approval_flow 
            SET approval_status=%s
            WHERE requisition_id=%s AND approval_status=%s
            """,
            ("Not Applicable", requisition['id'], "Queued")
        )

        # Update in requisitions
        cursor.execute(
            """
            UPDATE requisitions SET next_approver=%s, status=%s, payment_status
            WHERE id=%s'
            """, (None, "Rejected", "Not Applicable")
        )

        conn.commit()

        return jsonify(status="ok", msg="rejected successfully"), 200

    except Exception as e:
        print(f"unknown error: {e}")
        return jsonify(status="error", msg="unable to reject PR"), 400

    finally:
        if conn: release_connection(conn)

@requisitions.route("/", methods=["POST"])
@jwt_required()
def get_my_PRs():
    conn = None
    try:
        conn, cursor = get_cursor()
        inputs = request.get_json()

        cursor.execute(
            """
            SELECT * FROM requisitions WHERE requester_id = %s ORDER BY id
            """, (inputs['userId'],)
        )
        results = cursor.fetchall()

        for result in results:
            result['total_amount'] = f"${result['total_amount']:,.2f}"
            result['amount_in_sgd'] = f"${result['amount_in_sgd']:,.2f}"
            result['goods_required_by'] = result['goods_required_by'].strftime("%-d %b %Y")
            print(result['total_amount'], result['amount_in_sgd'], result['goods_required_by'])

        return jsonify(results), 200

    except Exception as e:
        print(f'unknown error: {e}')
        return jsonify(status="error", msg="unable to retrieve from database"), 400

    finally:
        if conn: release_connection(conn)
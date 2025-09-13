import datetime as dt
from flask import Blueprint, request, jsonify
from db.db_pool import get_cursor, release_connection

requisitions = Blueprint("requisitions", __name__)


@requisitions.route("/getOptions", methods=["GET"])
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
def add_new_requisition():
    conn = None
    try:
        conn, cursor = get_cursor()
        inputs = request.get_json()
        cost_centre = inputs["costCentre"].split(" - ")[0]
        account_code = inputs["accountCode"].split(" - ")[0]
        gl_code = inputs["glCode"].split(" - ")[0]
        amount_in_sgd = inputs["totalAmount"]
        print(cost_centre, account_code, gl_code, amount_in_sgd)
        print(inputs['items'])

        # Get requester data
        cursor.execute('SELECT * FROM users WHERE id=%s', (inputs['userId'],))
        user = cursor.fetchone()
        print(user)

        # Get Finance in charge
        cursor.execute('SELECT * FROM cost_centres WHERE cost_centre=%s', (cost_centre,))
        cc_data = cursor.fetchone()
        print(cc_data)

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
                    requisition['id'], item['itemName'], item['itemDescription'], item['quantity'], item['unitOfMeasure'],
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
                cursor.execute('SELECT id FROM users WHERE cost_centre=%s AND role=%s', (cost_centre, results[i]['role']))
            elif 'Director' in results[i]['role']:
                cursor.execute('SELECT id FROM users WHERE division_name=%s AND role=%s', (cc_data['division_name'], results[i]['role']))
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
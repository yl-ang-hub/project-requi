import datetime as dt
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from db.db_pool import get_cursor, release_connection
from services.google_apis import gmail_send_message


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
        print("calculated amount in sgd")

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
        user_id = int(get_jwt()['id'])
        inputs = request.get_json()
        cost_centre = inputs["costCentre"].split(" - ")[0]
        account_code = inputs["accountCode"].split(" - ")[0]
        gl_code = inputs["glCode"].split(" - ")[0]

        # Get requester data
        cursor.execute('SELECT * FROM users WHERE id=%s', (user_id,))
        user = cursor.fetchone()

        # Get Finance in charge
        cursor.execute('SELECT * FROM cost_centres WHERE cost_centre=%s', (cost_centre,))
        cc_data = cursor.fetchone()

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

        # Create the line items
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
                    requisition['id'], item['name'], item['description'], item['quantity'],
                    item['unit_of_measure'],
                    item['unit_cost'], inputs['currency']
                )
            )

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

        # Send email notification to next approver using latest email from users
        cursor.execute('SELECT name, email, role FROM users WHERE id=%s', (cc_data['finance_officer'],))
        approver_info = cursor.fetchone()
        subj = f"For your approval - PR {requisition['id']}"
        msg = f"Hello {approver_info['name']}, \n\nPR {requisition['id']} - {inputs['title']} has just been submitted by {user['name']}.\n\nPlease log into Requi to view and approve in your role as Finance Officer."
        print("gg 2 send msg")
        gmail_response = gmail_send_message(approver_info['email'], subj, msg)
        print(gmail_response)

        conn.commit()
        return jsonify(status="ok", msg="PR successfully created"), 200

    except Exception as e:
        conn.rollback()
        print(f'"unknown error: {e}')
        return jsonify(status="error", msg="Unable to create new PR"), 400

    finally:
        if conn: release_connection(conn)


@requisitions.route("/approvals/pending", methods=["POST"])
@jwt_required()
def get_pr_pending_approvals():
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

        # Pull PR approval flow (left join to users)
        cursor.execute(
            """
            SELECT *, users.name AS approver FROM requisition_approval_flow 
            LEFT JOIN users ON users.id = approver_id 
            WHERE requisition_id=%s ORDER BY requisition_approval_sequence
            """, (id,)
        )
        approval_flow = cursor.fetchall()

        # Pull PR and modify some fields for rendering
        cursor.execute('SELECT * FROM requisitions WHERE id=%s', (id,))
        pr = cursor.fetchone()
        pr['total_amount'] = f"{pr['currency']} {pr['total_amount']:,.2f}"
        pr['amount_in_sgd'] = f"${pr['amount_in_sgd']:,.2f}"
        pr['goods_required_by'] = pr['goods_required_by'].strftime("%-d %b %Y")
        if pr['updated_by'] != None:
            cursor.execute('SELECT name FROM users WHERE id=%s', (pr['updated_by'],))
            updated_user = cursor.fetchone()
            pr['updated_by'] = updated_user['name']

        # Pull line items for PR
        cursor.execute('SELECT * FROM requisition_items WHERE requisition_id=%s', (pr['id'],))
        items = cursor.fetchall()
        pr['items'] = items

        # Pull attachments for PR (if any)
        cursor.execute('SELECT * FROM requisition_attachments WHERE requisition_id=%s', (pr['id'],))
        pr_attachments = cursor.fetchall()
        if pr_attachments: pr['pr_attachments'] = pr_attachments

        # Check if PR has a corresponding PO
        cursor.execute('SELECT * FROM purchase_orders WHERE requisition_id=%s', (pr['id'],))
        po = cursor.fetchone()
        if po:
            po['total_amount'] = f"{po['currency']} {po['total_amount']:,.2f}"
            po['amount_in_sgd'] = f"${po['amount_in_sgd']:,.2f}"

            # Pull PO line items
            cursor.execute('SELECT * FROM purchase_order_items WHERE purchase_order_id=%s', (po['id'],))
            po_items = cursor.fetchall()
            po['items'] = po_items

            # Pull PO attachments
            cursor.execute('SELECT * FROM purchase_order_attachments WHERE purchase_order_id=%s', (po['id'],))
            po_attachments = cursor.fetchall()
            if po_attachments: po['po_attachments'] = po_attachments

        results = {"pr": pr, "approval_flow": approval_flow}
        if po: results["po"] = po
        return jsonify(results), 200

    except Exception as e:
        print(f'unknown error: {e}')
        return jsonify(status="error", msg="unable to retrieve from database"), 400

    finally:
        if conn: release_connection(conn)


@requisitions.route("/<id>", methods=["PATCH"])
@jwt_required()
def approve_pr(id):
    # Only for approvals by non-MMD staff
    conn = None
    try:
        print("running approve_pr logic")
        conn, cursor = get_cursor()
        claims = get_jwt()
        user_id = int(claims['id'])
        user_name = claims['name']
        inputs = request.get_json()

        cursor.execute('SELECT * FROM requisitions WHERE id=%s', (id,))
        requisition = cursor.fetchone()
        print(requisition)

        if requisition['next_approver'] != inputs['userId']:
            return jsonify(status="error", msg="Unauthorised to approve"), 401

        # Check for any updates to any fields by the approver (by MMD or Finance)
        inputs['form']['costCentre'] = inputs['form']['costCentre'].split(" - ")[0]
        inputs['form']['accountCode'] = inputs['form']['accountCode'].split(" - ")[0]
        inputs['form']['glCode'] = inputs['form']['glCode'].split(" - ")[0]

        if inputs['form']['costCentre'] != requisition['cost_centre']:
            cursor.execute('UPDATE requisitions SET cost_centre=%s, updated_at=%s, updated_by=%s WHERE id=%s', (inputs['form']['costCentre'], dt.datetime.now(), user_id, id))
        if inputs['form']['accountCode'] != requisition['account_code']:
            cursor.execute('UPDATE requisitions SET account_code=%s, updated_at=%s, updated_by=%s WHERE id=%s', (inputs['form']['accountCode'], dt.datetime.now(), user_id, id))
        if inputs['form']['glCode'] != requisition['gl_code']:
            cursor.execute('UPDATE requisitions SET gl_code=%s, updated_at=%s, updated_by=%s WHERE id=%s', (inputs['form']['glCode'], dt.datetime.now(), user_id, id))

        cursor.execute('SELECT * FROM requisition_items WHERE requisition_id=%s', (id,))
        line_items = cursor.fetchall()
        for item in inputs['form']['items']:
            for i in range(len(line_items)):
                if item['id'] == line_items[i]['id'] and ((item['name'] != line_items[i]['name']) or (item['description'] != line_items[i]['description']) or (item['quantity'] != line_items[i]['quantity']) or (item['unit_of_measure'] != line_items[i]['unit_of_measure']) or (item['unit_cost'] != line_items[i]['unit_cost'])):
                    cursor.execute('DELETE FROM requisition_items WHERE id=%s', (item['id'],))
                    cursor.execute(
                        """
                        INSERT INTO requisition_items (
                            requisition_id, name, description, quantity, unit_of_measure,
                            unit_cost, currency
                        ) VALUES (
                            %s, %s, %s, %s, %s,
                            %s, %s
                        )
                        """, (
                            requisition['id'], item['name'], item['description'], item['quantity'],
                            item['unit_of_measure'],
                            item['unit_cost'], requisition['currency']
                        )
                    )
                    cursor.execute('UPDATE requisitions SET updated_at=%s, updated_by=%s WHERE id=%s',
                               (dt.datetime.now(), user_id, id))

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
        else: pr_status = "Pending Next Level Approver"
        cursor.execute('UPDATE requisitions SET next_approver=%s, status=%s WHERE id=%s', (approver['approver_id'], pr_status, requisition['id']))

        # Get next approver's latest email for notification from users
        if approver['approver_role'] != "MMD":
            cursor.execute('SELECT name, email, role FROM users WHERE id=%s', (approver['approver_id'],))
            approver_info = cursor.fetchone()
            subj = f"For your approval - PR {id}"
            msg = f"Hello {approver_info['name']}, \n\nPR {id} - {requisition['title']} has just been approved by {user_name} with the comments: {inputs['form']['approverComments']}.\n\nPlease log into Requi to view and approve in your role as {approver_info['role']}."
            gmail_send_message(approver_info['email'], subj, msg)

        conn.commit()
        return jsonify(status="ok", msg="approved successfully"), 200

    except Exception as e:
        conn.rollback()
        print(f'unknown error: {e}')
        return jsonify(status="error", msg="unable to approve PR"), 400

    finally:
        if conn: release_connection(conn)


@requisitions.route("/<id>/reject", methods=["PATCH"])
@jwt_required()
def reject_pr(id):
    conn = None
    try:
        conn, cursor = get_cursor()
        claims = get_jwt()
        inputs = request.get_json()

        cursor.execute('SELECT * FROM requisitions WHERE id=%s', (id,))
        requisition = cursor.fetchone()

        if requisition['next_approver'] != claims['id']:
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

        # Reset status of all other approvers queued for this PR
        cursor.execute(
            """
            UPDATE requisition_approval_flow 
            SET approval_status=%s
            WHERE requisition_id=%s AND approval_status=%s
            """,
            ("Not Applicable", requisition['id'], "Queued")
        )

        # Update the status in requisitions
        cursor.execute(
            """
            UPDATE requisitions SET next_approver=%s, status=%s, payment_status=%s
            WHERE id=%s
            """, (None, "Rejected", "Not Applicable", requisition['id'])
        )

        # Email requester for notification and get latest email from users
        cursor.execute('SELECT name, email, role FROM users WHERE id=%s', (requisition['requester_id'],))
        requester_info = cursor.fetchone()
        subj = f"Rejected - PR {id}"
        msg = f"Hello {requester_info['name']}, \n\nPR {id} - {requisition['title']} has just been rejected by {claims['name']} with the comments: {inputs['form']['approverComments']}."
        gmail_send_message(requester_info['email'], subj, msg)

        conn.commit()
        return jsonify(status="ok", msg="rejected successfully"), 200

    except Exception as e:
        conn.rollback()
        print(f"unknown error: {e}")
        return jsonify(status="error", msg="unable to reject PR"), 400

    finally:
        if conn: release_connection(conn)


@requisitions.route("/approvals/mmd_central_pool", methods=["GET"])
@jwt_required()
def get_pr_in_mmd_central_pool():
    conn = None
    try:
        conn, cursor = get_cursor()
        cursor.execute('SELECT * FROM requisitions WHERE status=%s AND next_approver IS NULL', ("Pending MMD", ))
        requisitions = cursor.fetchall()

        return jsonify(requisitions), 200

    except Exception as e:
        print(f"unknown error: {e}")
        return jsonify(status="error", msg="unable to pull the PRs"), 400

    finally:
        if conn: release_connection(conn)


@requisitions.route("/approvals/mmd_central_pool", methods=["PATCH"])
@jwt_required()
def pull_pr():
    conn = None
    try:
        conn, cursor = get_cursor()
        inputs = request.get_json()

        if "MMD" not in inputs['role']:
            return jsonify(status="error", msg="Unauthorised"), 401

        cursor.execute('UPDATE requisitions SET mmd_in_charge=%s, next_approver=%s WHERE id=%s', (inputs['userId'], inputs['userId'], inputs['requisitionId']))
        # Update user_id for MMD person (pulling the PR)
        cursor.execute('UPDATE requisition_approval_flow SET approver_id=%s WHERE requisition_id=%s AND approver_role=%s', (inputs['userId'], inputs['requisitionId'], "MMD"))
        # Update user_id for MMD head (Head of the MMD person pulling the PR)
        cursor.execute('SELECT cost_centre FROM users WHERE id=%s', (inputs['userId'],))
        user = cursor.fetchone()
        cursor.execute('SELECT id FROM users WHERE role=%s AND cost_centre=%s', ("MMD Head", user['cost_centre']))
        mmdHead = cursor.fetchone()
        cursor.execute(
            'UPDATE requisition_approval_flow SET approver_id=%s WHERE requisition_id=%s AND approver_role=%s',
            (mmdHead['id'], inputs['requisitionId'], "MMD Head"))
        # Update user_id for MMD Director
        cursor.execute('SELECT id FROM users WHERE role=%s', ("MMD Director", ))
        mmdDir = cursor.fetchone()
        cursor.execute(
            'UPDATE requisition_approval_flow SET approver_id=%s WHERE requisition_id=%s AND approver_role=%s',
            (mmdDir['id'], inputs['requisitionId'], "MMD Director"))

        conn.commit()
        return jsonify(status="ok", msg="successfully pulled PR", requisition_id=inputs['requisitionId'])

    except Exception as e:
        conn.rollback()
        print(f"unknown error: {e}")
        return jsonify(status="error", msg="unable to pull PR"), 400

    finally:
        if conn: release_connection(conn)


@requisitions.route("/approvals/history", methods=["POST"])
@jwt_required()
def get_approval_history():
    conn = None
    try:
        conn, cursor = get_cursor()
        inputs = request.get_json()

        cursor.execute(
            """
            SELECT * FROM requisition_approval_flow
            LEFT JOIN requisitions ON requisitions.id = requisition_approval_flow.requisition_id 
            WHERE approver_id=%s AND approval_status=%s
            ORDER BY requisition_approval_flow.approved_at DESC
            """, (inputs['userId'], "Approved")
        )
        approved = cursor.fetchall()

        cursor.execute(
            """
            SELECT * FROM requisition_approval_flow
            LEFT JOIN requisitions ON requisitions.id = requisition_approval_flow.requisition_id 
            WHERE approver_id=%s AND approval_status=%s
            ORDER BY requisition_approval_flow.approved_at DESC
            """, (inputs['userId'], "Rejected")
        )
        rejected = cursor.fetchall()

        return jsonify({"approved": approved, "rejected": rejected}), 200

    except Exception as e:
        print(f"unknown error: {e}")
        return jsonify(status="error", msg="unable to retrieve history"), 400

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
            SELECT * FROM requisitions WHERE requester_id = %s ORDER BY id DESC
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


@requisitions.route("/<id>/drop", methods=["DELETE"])
@jwt_required()
def drop_pr(id):
    conn = None
    try:
        print("running")
        conn, cursor = get_cursor()
        identity = get_jwt_identity()

        cursor.execute('SELECT * FROM requisitions WHERE id=%s', (id,))
        pr = cursor.fetchone()

        if pr['requester_id'] != int(identity[0]):
            return jsonify(status="error", msg="Unauthorised"), 401

        if pr['status'] != "Pending Finance" and pr['status'] != "Pending MMD":
            return jsonify(status="error", msg="PR cannot be dropped at this stage"), 403

        # Update the dropping in requisition_approval_flow
        cursor.execute(
            """
            UPDATE requisition_approval_flow 
            SET approval_status=%s
            WHERE requisition_id=%s AND approval_status=%s
            """,
            ("Dropped", id, "Queued")
        )

        # Update the status in requisitions
        cursor.execute(
            """
            UPDATE requisitions SET next_approver=%s, status=%s, payment_status=%s, mmd_in_charge=%s,
            updated_at=%s, updated_by=%s
            WHERE id=%s
            """, (None, "Dropped", "Not Applicable", None, dt.datetime.now(), int(identity[0]), id)
        )

        conn.commit()
        return jsonify(status="ok", msg="successfully dropped"), 200

    except Exception as e:
        conn.rollback()
        print(f"unknown error: {e}")
        return jsonify(status="error", msg="unable to drop pr"), 400

    finally:
        if conn: release_connection(conn)


@requisitions.route("/search", methods=["GET"])
@jwt_required()
def search_pr():
    conn = None
    try:
        conn, cursor = get_cursor()
        query = request.args.get("query")
        query = f"%{query}%"

        cursor.execute(
            """
            SELECT pr.id AS pr_id, po.total_amount AS po_total_amount, pr.total_amount AS pr_total_amount, 
            po.amount_in_sgd AS po_amount_in_sgd, pr.amount_in_sgd AS pr_amount_in_sgd, pr.status AS pr_status, po.status AS pr_status,
            po.cost_centre AS po_cost_centre, pr.cost_centre AS pr_cost_centre, 
            po.account_code AS po_account_code, pr.account_code AS pr_account_code, * FROM purchase_orders po 
            FULL OUTER JOIN requisitions pr ON pr.id = po.requisition_id
            WHERE CAST(pr.id AS TEXT) ILIKE %s OR pr.title ILIKE %s OR pr.description ILIKE %s 
                OR pr.requester_contact_name ILIKE %s OR pr.requester_email ILIKE %s OR po.cost_centre ILIKE %s 
                OR po.account_code ILIKE %s OR pr.status ILIKE %s OR po.status ILIKE %s
                OR CAST(po.id AS TEXT) ILIKE %s
            """, (query, query, query, query, query, query, query, query, query, query)
        )
        results = cursor.fetchall()

        return jsonify(results), 200

    except Exception as e:
        print(f"unknown error: {e}")
        return jsonify(status="error", msg="unable to do a search"), 400

    finally:
        if conn: release_connection(conn)
import datetime as dt
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from db.db_pool import get_cursor, release_connection
from services.google_apis import gmail_send_message
import sys


orders = Blueprint("orders", __name__)


@orders.route("/", methods=["PUT"])
@jwt_required()
def draft_new_po():
    conn = None
    try:
        print("running add new po")
        conn, cursor = get_cursor()
        user_id = int(get_jwt_identity())
        user_name = get_jwt()['name']
        inputs = request.get_json()

        # STEP ONE: CREATE NEW PO

        # Modify input values
        cost_centre = inputs["costCentre"].split(" - ")[0]
        account_code = inputs["accountCode"].split(" - ")[0]
        gl_code = inputs["glCode"].split(" - ")[0]

        # Calculate amount in sgd
        cursor.execute('SELECT conversion_rate FROM currencies WHERE code=%s', (inputs['currency'],))
        curr_rate = cursor.fetchone()
        amount_in_sgd = inputs["totalAmount"] / curr_rate['conversion_rate']
        supplier_name = inputs['supplier']['nameAndRegNo'].split(" - ")[0] or None
        supplier_reg_no = inputs['supplier']['nameAndRegNo'].split(" - ")[1] or None
        print("modified inputs and supplier info: ", supplier_reg_no, supplier_name)

        # Get PR from database
        cursor.execute('SELECT * FROM requisitions WHERE id=%s', (inputs['requisitionId'],))
        pr = cursor.fetchone()

        # Get supplier from database
        cursor.execute('SELECT * FROM suppliers WHERE business_reg_no=%s', (supplier_reg_no,))
        db_supplier = cursor.fetchone()

        # Create new PO in database
        cursor.execute(
            """
            INSERT INTO purchase_orders (
            requisition_id, requester_id, requester_provided_name, requester_provided_contact_number, requester_provided_email, 
            cost_centre, account_code, gl_code,total_amount, currency, 
            amount_in_sgd, comments, status, supplier_business_reg_no, company_name, 
            billing_address, supplier_contact_name, supplier_contact_number, supplier_contact_email, created_at, 
            created_by
            ) VALUES(
                %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s,
                %s
            ) RETURNING id;
            """, (
                pr['id'], pr['requester_id'], pr['pr_contact_name'], pr['pr_contact_number'], pr['pr_contact_email'],
                cost_centre, account_code, gl_code, inputs['totalAmount'], inputs['currency'],
                amount_in_sgd, pr['comments'], "Draft", db_supplier['business_reg_no'], db_supplier['company_name'],
                db_supplier['billing_address'], inputs['supplier'].get('supplierContactName'),
                inputs['supplier'].get('supplierContactNumber'), inputs['supplier'].get('supplierEmail'),
                dt.datetime.now(), user_id
            )
        )
        po = cursor.fetchone()
        print("created PO")

        # Create line items for PO
        for item in inputs['items']:
            cursor.execute(
                """
                INSERT INTO purchase_order_items (
                    purchase_order_id, name, description, quantity, unit_of_measure,
                    unit_cost, currency
                ) VALUES (
                    %s, %s, %s, %s, %s,
                    %s, %s
                ) RETURNING id;
                """, (
                    po['id'], item['name'], item['description'], item['quantity'], item['unit_of_measure'],
                    item['unit_cost'], inputs['currency']
                )
            )

        # STEP TWO: UPDATE APPROVAL FLOW & NEXT APPROVER FOR THE PR
        # Do not update MMD edits into PR table

        # Update the approval in requisition_approval_flow
        cursor.execute(
            """
            UPDATE requisition_approval_flow 
            SET approval_status=%s, approved_at=%s, approver_comments=%s 
            WHERE requisition_id=%s AND approver_id=%s AND approval_status=%s
            RETURNING requisition_approval_sequence
            """,
            ("Approved", dt.datetime.now(), inputs['approverComments'], pr['id'],
             pr['next_approver'], "Queued")
        )
        approval_seq = cursor.fetchone()

        # Update next_approver inside requisitions
        next_approver_sequence = int(approval_seq['requisition_approval_sequence']) + 1
        cursor.execute(
            """
            SELECT approver_id, approver_role FROM requisition_approval_flow
            WHERE requisition_id=%s AND requisition_approval_sequence=%s
            """, (pr['id'], next_approver_sequence)
        )
        approver = cursor.fetchone()
        cursor.execute('UPDATE requisitions SET next_approver=%s WHERE id=%s',
                       (approver['approver_id'], pr['id']))

        # Get next approver's email and notify
        cursor.execute('SELECT name, email, role FROM users WHERE id=%s', (approver['approver_id'],))
        approver_info = cursor.fetchone()
        subj = f"For your approval - PR {pr['id']}"
        msg = f"Hello {approver_info['name']}, \n\nPR {pr['id']} - {pr['title']} has just been approved by {user_name} with the comments: {inputs['approverComments']}.\n\nPlease log into Requi to view and approve in your role as {approver_info['role']}."
        gmail_send_message(approver_info['email'], subj, msg)

        conn.commit()
        return jsonify({"id": po['id']}), 200

    except Exception as e:
        conn.rollback()
        print(f"unknown error: {e}")
        return jsonify(status="error", msg="unable to create new PO"), 400

    finally:
        if conn: release_connection(conn)


@orders.route("/", methods=["PATCH"])
@jwt_required()
def edit_pr_and_draft_po():
    conn = None
    try:
        conn, cursor = get_cursor()
        user_id = int(get_jwt_identity())
        user_role = get_jwt()['role']
        user_name = get_jwt()['name']
        inputs = request.get_json()

        # Modify input values
        cost_centre = inputs["costCentre"].split(" - ")[0]
        account_code = inputs["accountCode"].split(" - ")[0]
        gl_code = inputs["glCode"].split(" - ")[0]
        po_status = "Approved" if user_role == "MMD Director" else "Draft"

        # Calculate amount in sgd
        cursor.execute('SELECT conversion_rate FROM currencies WHERE code=%s', (inputs['currency'],))
        curr_rate = cursor.fetchone()
        amount_in_sgd = inputs["totalAmount"] / curr_rate['conversion_rate']

        # STEP ONE: EDIT PO

        # Get PR from database
        cursor.execute('SELECT * FROM requisitions WHERE id=%s', (inputs['requisitionId'],))
        pr = cursor.fetchone()

        # Get PO from database
        cursor.execute('SELECT * FROM purchase_orders WHERE requisition_id=%s', (inputs['requisitionId'],))
        po = cursor.fetchone()
        if not po:
            return jsonify(status="error", msg="no PO found"), 400

        # Get supplier from database
        if " - " in inputs['supplier']['nameAndRegNo']:
            cursor.execute('SELECT * FROM suppliers WHERE business_reg_no=%s', (inputs['supplier']['nameAndRegNo'].split(" - ")[1],))
        else:
            cursor.execute('SELECT * FROM suppliers WHERE business_reg_no=%s', (f"{inputs['supplier']['nameAndRegNo']}",))
        db_supplier = cursor.fetchone()
        if not db_supplier:
            return jsonify(status="error", msg="supplier not found"), 400

        # Edit PO in database
        cursor.execute(
            """
            UPDATE purchase_orders
            SET total_amount=%s, currency=%s, amount_in_sgd=%s, status=%s, supplier_business_reg_no=%s, 
            company_name=%s, billing_address=%s, supplier_contact_name=%s, supplier_contact_number=%s, supplier_contact_email=%s
            WHERE id=%s
            """, (
                inputs['totalAmount'], inputs['currency'], amount_in_sgd, po_status, db_supplier['business_reg_no'],
                db_supplier['company_name'], db_supplier['billing_address'], inputs['supplier'].get('supplierContactName'),
                inputs['supplier'].get('supplierContactNumber'), inputs['supplier'].get('supplierEmail'),
                po['id']
            )
        )

        # Edit line items for PO by dropping all line items and re-adding them
        cursor.execute('DELETE FROM purchase_order_items WHERE purchase_order_id=%s', (po['id'],))
        for item in inputs['items']:
            print(item)
            cursor.execute(
                """
                INSERT INTO purchase_order_items (
                    purchase_order_id, name, description, quantity, unit_of_measure,
                    unit_cost, currency
                ) VALUES (
                    %s, %s, %s, %s, %s,
                    %s, %s
                ) RETURNING id;
                """, (
                    po['id'], item['name'], item['description'], item['quantity'], item['unit_of_measure'],
                    item['unit_cost'], inputs['currency']
                )
            )

        # STEP TWO: UPDATE APPROVAL FLOW & NEXT APPROVER FOR THE PR
        # Do not update MMD edits into PR table

        # Update the approval in requisition_approval_flow
        cursor.execute(
            """
            UPDATE requisition_approval_flow 
            SET approval_status=%s, approved_at=%s, approver_comments=%s 
            WHERE requisition_id=%s AND approver_id=%s AND approval_status=%s
            RETURNING requisition_approval_sequence
            """,
            ("Approved", dt.datetime.now(), inputs['approverComments'], pr['id'],
             pr['next_approver'], "Queued")
        )
        approval_seq = cursor.fetchone()

        if user_role == "MMD Head":
            # Update next_approver inside requisitions
            next_approver_sequence = int(approval_seq['requisition_approval_sequence']) + 1
            cursor.execute(
                """
                SELECT approver_id, approver_role FROM requisition_approval_flow
                WHERE requisition_id=%s AND requisition_approval_sequence=%s
                """, (pr['id'], next_approver_sequence)
            )
            approver = cursor.fetchone()
            cursor.execute('UPDATE requisitions SET next_approver=%s WHERE id=%s',
                           (approver['approver_id'], pr['id']))
        elif user_role == "MMD Director":
            # Update pr_status and next_approver inside requisitions
            cursor.execute('UPDATE requisitions SET status=%s, next_approver=%s WHERE id=%s',
                           ("Approved", None, pr['id']))

        # Give email notification
        if user_role == "MMD Head":     # notify next approver to approve
            cursor.execute('SELECT name, email, role FROM users WHERE id=%s', (approver['approver_id'],))
            approver_info = cursor.fetchone()
            subj = f"For your approval - PR {pr['id']}"
            msg = f"Hello {approver_info['name']}, \n\nPR {pr['id']} - {pr['title']} has just been approved by {user_name} with the comments: {inputs['approverComments']}.\n\nPlease log into Requi to view and approve in your role as {approver_info['role']}."
            gmail_send_message(approver_info['email'], subj, msg)
        elif user_role == "MMD Director":       # notify requester of PO approval
            cursor.execute('SELECT name, email, role FROM users WHERE id=%s', (pr['requester_id'],))
            requester_info = cursor.fetchone()
            subj = f"Approved - PR {pr['id']}"
            msg = f"Hello {requester_info['name']}, \n\nPR {pr['id']} - {pr['title']} has just been approved by {user_name}.\n\nPlease log into Requi to view the approved PO."
            gmail_send_message(requester_info['email'], subj, msg)

        conn.commit()
        return jsonify({"id": po['id']}), 200

    except Exception as e:
        conn.rollback()
        exc_type, exc_obj, tb = sys.exc_info()
        line_number = tb.tb_lineno
        print(f"unknown error: {e} on line {line_number}")
        return jsonify(status="error", msg="unable to approve or edit PO"), 400

    finally:
        if conn: release_connection(conn)



@orders.route("/<id>/reject", methods=["PATCH"])
@jwt_required()
def reject_pr_and_po(id):
    # only for MMD Head and MMD Director
    conn = None
    try:
        conn, cursor = get_cursor()
        user_id = int(get_jwt_identity())
        user_name = get_jwt()['name']
        user_role = get_jwt()['role']
        inputs = request.get_json()
        print(inputs)

        cursor.execute('SELECT * FROM requisitions WHERE id=%s', (id,))
        pr = cursor.fetchone()

        if pr['next_approver'] != user_id or "MMD" not in user_role or user_role == "MMD":
            return jsonify(status="error", msg="Unauthorised"), 401

        # Update the rejection in requisition_approval_flow
        cursor.execute(
            """
            UPDATE requisition_approval_flow 
            SET approval_status=%s, approved_at=%s, approver_comments=%s 
            WHERE requisition_id=%s AND approver_id=%s AND approval_status=%s
            """,
            ("Rejected", dt.datetime.now(), inputs['form']['approverComments'], pr['id'],
             pr['next_approver'], "Queued")
        )

        # Reset status of all other approvers queued for this PR
        cursor.execute(
            """
            UPDATE requisition_approval_flow 
            SET approval_status=%s
            WHERE requisition_id=%s AND approval_status=%s
            """,
            ("Not Applicable", pr['id'], "Queued")
        )

        # Update the status in requisitions
        cursor.execute(
            """
            UPDATE requisitions SET next_approver=%s, status=%s, payment_status=%s
            WHERE id=%s
            """, (None, "Rejected", "Not Applicable", pr['id'])
        )

        # Update the status in purchase_orders
        cursor.execute(
            'UPDATE purchase_orders SET status=%s WHERE requisition_id=%s', ("Rejected", pr['id'])
        )

        # Email requester for notification and get latest email from users
        cursor.execute('SELECT name, email, role FROM users WHERE id=%s', (pr['requester_id'],))
        requester_info = cursor.fetchone()
        subj = f"Rejected - PR {pr['id']}"
        msg = f"Hello {requester_info['name']}, \n\nPR {pr['id']} - {pr['title']} has just been rejected by {user_name} with the comments: {inputs['form']['approverComments']}."
        gmail_send_message(requester_info['email'], subj, msg)

        conn.commit()
        return jsonify(status="ok", msg="rejected successfully"), 200

    except Exception as e:
        conn.rollback()
        print(f"unknown error: {e}")
        return jsonify(status="error", msg="unable to reject PR"), 400

    finally:
        if conn: release_connection(conn)
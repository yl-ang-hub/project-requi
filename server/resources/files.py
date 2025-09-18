from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from services.amazon_s3 import upload_all_files_to_s3, upload_new_files_to_s3, delete_file_from_s3
from db.db_pool import get_cursor, release_connection
import sys

files_upload = Blueprint("files", __name__, url_prefix="/files")


@files_upload.route("/upload/pr", methods=["PUT"])
@jwt_required()
def upload_files_to_pr():
    conn = None
    try:
        conn, cursor = get_cursor()
        id = request.form.get('id')
        names = request.form.getlist("names")
        files = request.files.getlist("files")
        types = request.form.getlist("types")
        content_types = request.form.getlist("contentTypes")
        print(id)
        print(files)

        if not id:
            return jsonify(status="error", msg="missing PR or PO id"), 400

        if files:
            response = upload_all_files_to_s3(names, files, content_types, types, id)
        else:
            raise Exception("no files transmitted to server")

        if not response or len(response) == 0: raise Exception("no response from upload files to s3")

        for file in response:
            print(file['p_id'], file['name'], file['type'], file['url'])
            cursor.execute(
                """
                INSERT INTO requisition_attachments (requisition_id, name, type, link) VALUES (
                %s, %s, %s, %s)
                """, (file['p_id'], file['name'], file['type'], file['url'])
            )

        conn.commit()
        return jsonify(status="ok", msg="uploaded files"), 200

    except Exception as e:
        conn.rollback()
        print(f"error occurred uploading files")
        return jsonify(status="error", msg="unable to upload files to S3"), 400

    finally:
        if conn: release_connection(conn)


@files_upload.route("/upload/po", methods=["PUT"])
@jwt_required()
def upload_files_to_po():
    conn = None
    try:
        conn, cursor = get_cursor()
        id = request.form.get('id')
        names = request.form.getlist("names")
        files = request.files.getlist("files")
        types = request.form.getlist("types")
        links = request.form.getlist("links")
        content_types = request.form.getlist("contentTypes")
        print(id)
        print(files)
        print(types)
        print(links)
        print(content_types)

        if not id:
            return jsonify(status="error", msg="missing PR or PO id"), 400

        # Get existing attachments from db and delete file(s) that the MMD head/director deleted
        cursor.execute('SELECT * FROM purchase_order_attachments WHERE purchase_order_id=%s', (id,))
        po_attachments = cursor.fetchall()
        for attachment in po_attachments:
            print(attachment['link'])
            if attachment['link'] not in links:
                cursor.execute('DELETE FROM purchase_order_attachments WHERE link=%s', (attachment['link'],))
                delete_response = delete_file_from_s3(attachment['link'])
                if not delete_response:
                    raise Exception("Error deleting file from S3")

        # Upload any new files to s3 (logic for identifying new files in upload_new_files_to_s3)
        if files:
            response = upload_new_files_to_s3(names, files, content_types, types, links, id)
            if not response or len(response) == 0: raise Exception("no response from upload files to s3")

            for file in response:
                print(file['p_id'], file['name'], file['type'], file['url'])
                cursor.execute(
                    """
                    INSERT INTO purchase_order_attachments (purchase_order_id, name, type, link) VALUES (
                    %s, %s, %s, %s)
                    """, (file['p_id'], file['name'], file['type'], file['url'])
                )

        conn.commit()
        return jsonify(status="ok", msg="uploaded files"), 200

    except Exception as e:
        conn.rollback()
        exc_type, exc_obj, tb = sys.exc_info()
        line_number = tb.tb_lineno
        print(f"unknown error: {e} on line {line_number}")
        print(f"error occurred uploading files: {e} on line {line_number}")
        return jsonify(status="error", msg="unable to upload files to S3"), 400

    finally:
        if conn: release_connection(conn)


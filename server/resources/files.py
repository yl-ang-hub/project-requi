from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from services.amazon_s3 import upload_file_to_s3
from db.db_pool import get_cursor, release_connection

files_upload = Blueprint("files", __name__, url_prefix="/files")


@files_upload.route("/upload", methods=["PUT"])
@jwt_required()
def upload_files():
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
            response = upload_file_to_s3(names, files, content_types, types, id)
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


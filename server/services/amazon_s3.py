import datetime as dt
import os
import boto3
from werkzeug.utils import secure_filename
from urllib.parse import urlparse


s3 = boto3.client(
    "s3",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=os.getenv("AWS_REGION")
)

BUCKET_NAME = os.getenv("AWS_S3_BUCKET")


def upload_all_files_to_s3(names, files, content_types, types, pr_po_id):
    try:
        print("running uploadfilestos3")

        files_response = []
        for idx, file in enumerate(files):
            # Generate a unique filename to avoid overwriting
            datestamp = dt.datetime.now().strftime("%Y-%m-%d-%H%M%S")
            print(datestamp)
            filename = f"{pr_po_id}_{types[idx]}_{datestamp}_{idx+1}_{secure_filename(names[idx])}"
            print(filename)

            # Upload file to S3
            response = s3.upload_fileobj(
                file,
                BUCKET_NAME,
                filename,
                ExtraArgs={"ContentType": content_types[idx]}
            )
            print(f"Amazon response is :{response}")

            file_url = f"https://{BUCKET_NAME}.s3.{os.getenv('AWS_REGION')}.amazonaws.com/{filename}"
            files_response.append({
                "name": names[idx],
                "type": types[idx],
                "p_id": pr_po_id,
                "file_idx": idx,
                "url": file_url
            })

        print(files_response)

        return files_response

    except Exception as e:
        print(f"error occurred with s3 file upload: {e}")
        return False


def upload_new_files_to_s3(names, files, content_types, types, links, po_id):
    try:
        print("running uploadfilestos3")

        for idx, link in enumerate(links):
            if link != "":
                files.insert(idx, "")

        files_response = []
        for idx, file in enumerate(files):
            if file == "":
                # skip uploading as the file previously uploaded
                continue

            # Generate a unique filename to avoid overwriting
            datestamp = dt.datetime.now().strftime("%Y-%m-%d-%H%M%S")
            print(datestamp)
            filename = f"{po_id}_{types[idx]}_{datestamp}_{idx + 1}_{secure_filename(names[idx])}"
            print(filename)

            # Upload file to S3
            response = s3.upload_fileobj(
                file,
                BUCKET_NAME,
                filename,
                ExtraArgs={"ContentType": content_types[idx]}
            )
            print(f"Amazon response is :{response}")

            file_url = f"https://{BUCKET_NAME}.s3.{os.getenv('AWS_REGION')}.amazonaws.com/{filename}"
            files_response.append({
                "name": names[idx],
                "type": types[idx],
                "p_id": po_id,
                "file_idx": idx,
                "url": file_url
            })

        print(files_response)

        return files_response

    except Exception as e:
        print(f"error occurred with s3 file upload: {e}")
        return False


def delete_file_from_s3(file_url):
    try:
        print("running delete_file_from_s3")

        # Extract key (filename) from URL
        parsed_url = urlparse(file_url)
        filename = parsed_url.path.lstrip("/")  # remove leading "/"
        print(filename)

        response = s3.delete_object(
            Bucket=BUCKET_NAME,
            Key=filename
        )

        print(f"S3 delete response: {response}")
        return True

    except s3.exceptions.NoSuchKey:
        # fail silently, treat as success (will be deleted from internal DB anyway)
        print(f"File not found in S3: {file_url}")
        return True

    except Exception as e:
        print(f"error when deleting from S3: {e}")
        return False
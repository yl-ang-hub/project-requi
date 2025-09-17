import datetime as dt
import os
import boto3
from werkzeug.utils import secure_filename


s3 = boto3.client(
    "s3",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=os.getenv("AWS_REGION")
)

BUCKET_NAME = os.getenv("AWS_S3_BUCKET")


def upload_file_to_s3(names, files, content_types, types, pr_po_id):
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

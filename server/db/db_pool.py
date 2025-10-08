import os
import psycopg2.pool
import psycopg2.extras
from dotenv import load_dotenv
load_dotenv()

pool = psycopg2.pool.SimpleConnectionPool(
    3, 5,
    host=os.getenv("DB_HOST"),
    database=os.getenv("DB_NAME"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    port=os.getenv("DB_PORT")
)


def get_cursor():
    connection = pool.getconn()
    cursor = connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    return connection, cursor


def release_connection(connection):
    pool.putconn(connection)

import os
from pathlib import Path
from dotenv import load_dotenv
import mysql.connector as myconn

# Automatically finds .env in the project root
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

def connect():
    return myconn.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME", "bank_system")
    )


def init_db():
    """Initializes the database and creates the accounts table if it does not exist."""
    try:
        # Connect to MySQL server to ensure database exists
        conn = myconn.connect(
            host=os.getenv("DB_HOST", "localhost"),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD")
        )
        cursor = conn.cursor()
        db_name = os.getenv("DB_NAME", "bank_system")
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name}")
        conn.close()

        # Connect to database and ensure accounts table exists
        db = connect()
        cur = db.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS accounts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL,
                balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        db.commit()
        db.close()
        return True
    except Exception as e:
        print(f"Database initialization info: {e}")
        return False

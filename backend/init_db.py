import subprocess
import sys
import os
import pymysql
from urllib.parse import urlparse

def get_db_info_from_url(url):
    parsed = urlparse(url.replace('mysql+pymysql://', 'mysql://'))
    return {
        'host': parsed.hostname or 'localhost',
        'port': parsed.port or 3306,
        'user': parsed.username or 'root',
        'password': parsed.password or '',
        'database': parsed.path[1:] if parsed.path else ''
    }

def database_exists(db_info):
    try:
        conn = pymysql.connect(
            host=db_info['host'],
            port=db_info['port'],
            user=db_info['user'],
            password=db_info['password']
        )
        cursor = conn.cursor()
        cursor.execute("SHOW DATABASES")
        databases = [db[0] for db in cursor.fetchall()]
        cursor.close()
        conn.close()
        return db_info['database'] in databases
    except Exception as e:
        print(f"Błąd podczas sprawdzania bazy danych: {e}")
        return False

def create_database(db_info):
    try:
        conn = pymysql.connect(
            host=db_info['host'],
            port=db_info['port'],
            user=db_info['user'],
            password=db_info['password']
        )
        cursor = conn.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_info['database']}")
        cursor.close()
        conn.close()
        return True
    except Exception as e:
        print(f"Błąd podczas tworzenia bazy danych: {e}")
        return False

def init_database():
    print("Inicjalizacja bazy danych...")
    
    sys.path.append(os.path.abspath(os.path.dirname(__file__)))
    from app.db.database import DATABASE_URL
    
    db_info = get_db_info_from_url(DATABASE_URL)
    
    if not database_exists(db_info):
        print("Tworzenie bazy danych...")
        if create_database(db_info):
            print("Baza danych została utworzona!")
        else:
            print("Nie udało się utworzyć bazy danych!")
            sys.exit(1)
    else:
        print("Baza danych już istnieje!")

    print("\nWykonywanie migracji...")
    try:
        alembic_path = os.path.join(os.path.dirname(__file__), "alembic.ini")
        subprocess.run(["alembic", "-c", alembic_path, "upgrade", "head"], check=True)
        print("Migracje zostały wykonane pomyślnie!")
    except subprocess.CalledProcessError as e:
        print("Błąd podczas wykonywania migracji:", e)
        sys.exit(1)

if __name__ == "__main__":
    init_database()
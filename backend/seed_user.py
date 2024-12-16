from datetime import datetime
from sqlalchemy.orm import Session
from app.db.database import SessionLocal, engine
from app.models.models import User
from app.core.security import get_password_hash

def seed_users():
    db = SessionLocal()
    try:
        # Create new users
        users = [
            User(
                name="Jan Kowalski",
                email="jan.kowalski@example.com",
                password=get_password_hash("haslo123"),
                created_at=datetime.now(),
                updated_at=datetime.now()
            ),
            User(
                name="Jan Kowalski 1",
                email="jan.kowalski1@example.com",
                password=get_password_hash("haslo123"),
                created_at=datetime.now(),
                updated_at=datetime.now()
            ),
            User(
                name="Jan Kowalski 2",
                email="jan.kowalski2@example.com",
                password=get_password_hash("haslo123"),
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
        ]
        
        # Add to session and commit
        for user in users:
            db.add(user)
        db.commit()
        print("Users successfully added to database!")
        
    except Exception as e:
        print(f"Error adding users: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_users()

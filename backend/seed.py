import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal
from app.models.user import User
from app.models.scholar import Scholar
from app.core.security import get_password_hash

def seed():
    db = SessionLocal()
    try:
        # 1. Seed an Evaluator
        evaluator_email = "evaluator@test.com"
        evaluator = db.query(User).filter(User.email == evaluator_email).first()
        if not evaluator:
            evaluator = User(
                email=evaluator_email,
                role="evaluator",
                hashed_password=get_password_hash("password123")
            )
            db.add(evaluator)
            print(f"Created evaluator: {evaluator_email} with password 'password123'")
            
        # 2. Seed a Scholar (for Google Auth and Dev-Login testing)
        scholar_email = "scholar@test.com"
        scholar_user = db.query(User).filter(User.email == scholar_email).first()
        if not scholar_user:
            scholar_user = User(
                email=scholar_email,
                role="scholar"
                # Note: No hashed_password because scholars use Google Auth!
            )
            db.add(scholar_user)
            db.flush() # Flush to get the uuid before creating the scholar profile
            
            scholar_profile = Scholar(
                user_id=scholar_user.id,
                first_name="Test",
                last_name="Scholar",
                school="Test University",
                course="BS Computer Science",
                batch_number="Batch 1"
            )
            db.add(scholar_profile)
            print(f"Created scholar user profile: {scholar_email}")
            
        db.commit()
        print("Database seeded successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    seed()

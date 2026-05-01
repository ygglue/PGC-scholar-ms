import sys
import os
import random
from datetime import date
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal
from app.models.user import User
from app.models.scholar import Scholar
from app.core.security import get_password_hash

FAKE_EMAIL_DOMAIN = "fake.local"

FIRST_NAMES = ["Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Quinn", "Avery", "Cameron", "Dakota", "Skyler", "Reese", "Finley", "Sage", "River"]
LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Anderson", "Taylor", "Thomas", "Moore", "Jackson"]
COURSES = ["BS Computer Science", "BS Information Technology", "BS Business Administration", "BS Nursing", "BS Education", "BS Psychology", "BS Engineering"]
SCHOOLS = ["State University", "National College", "Polytechnic Institute", "University of the Philippines", "City College"]

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

def seed_fake_scholars(count=30):
    """Creates fake scholars for testing purposes."""
    db = SessionLocal()
    created = 0
    try:
        for i in range(1, count + 1):
            email = f"fake{i}@{FAKE_EMAIL_DOMAIN}"
            existing = db.query(User).filter(User.email == email).first()
            if existing:
                print(f"Skipping existing: {email}")
                continue

            user = User(
                email=email,
                role="scholar",
                hashed_password=get_password_hash("fakepass123")
            )
            db.add(user)
            db.flush()

            scholar = Scholar(
                user_id=user.id,
                first_name=random.choice(FIRST_NAMES),
                last_name=random.choice(LAST_NAMES),
                school=random.choice(SCHOOLS),
                course=random.choice(COURSES),
                batch_number=f"Batch {random.randint(1, 10)}",
                year_level=f"Year {random.randint(1, 4)}",
                student_type=random.choice(["regular", "irregular"]),
                status="active",
                date_enrolled=date(random.randint(2020, 2024), random.randint(1, 12), random.randint(1, 28))
            )
            db.add(scholar)
            created += 1
            print(f"Created fake scholar: {email}")

        db.commit()
        print(f"Created {created} fake scholars!")
    finally:
        db.close()

def cleanup_fake_scholars():
    """Deletes all fake scholars by email pattern."""
    db = SessionLocal()
    deleted = 0
    try:
        fake_users = db.query(User).filter(User.email.like(f"%@{FAKE_EMAIL_DOMAIN}")).all()
        for user in fake_users:
            scholar = db.query(Scholar).filter(Scholar.user_id == user.id).first()
            if scholar:
                db.delete(scholar)
            db.delete(user)
            deleted += 1
            print(f"Deleted fake scholar: {user.email}")

        db.commit()
        print(f"Deleted {deleted} fake scholars!")
    finally:
        db.close()

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--fake", action="store_true", help="Seed fake scholars")
    parser.add_argument("--cleanup-fake", action="store_true", help="Cleanup fake scholars")
    parser.add_argument("--count", type=int, default=30, help="Number of fake scholars to create")
    args = parser.parse_args()

    if args.cleanup_fake:
        cleanup_fake_scholars()
    elif args.fake:
        seed_fake_scholars(args.count)
    else:
        seed()

import requests
import os

BASE_URL = "http://127.0.0.1:8000"

def get_scholar_token():
    r = requests.post(f"{BASE_URL}/auth/dev-login", json={"email": "scholar@test.com"})
    return r.json()["access_token"]

def get_evaluator_token():
    r = requests.post(f"{BASE_URL}/auth/login", data={"username": "evaluator@test.com", "password": "password123"})
    return r.json()["access_token"]

def start_tests():
    print("------ SCHOLAR DOCUMENT UPLOAD TEST ------")
    scholar_token = get_scholar_token()
    evaluator_token = get_evaluator_token()

    # Create dummy pdf
    with open("dummy.pdf", "wb") as f:
        f.write(b"%PDF-1.4\nTest PDF content for scholarship system")

    print("\n1. Scholar Uploading Document (POST /documents/upload)")
    
    with open("dummy.pdf", "rb") as f:
        files = {"file": ("dummy.pdf", f, "application/pdf")}
        data = {"doc_type": "COR"}
        r = requests.post(f"{BASE_URL}/documents/upload", headers={"Authorization": f"Bearer {scholar_token}"}, files=files, data=data)
        
    print(f"Status: {r.status_code}")
    print(r.json())
    
    if r.status_code != 200:
        print("Stopping further tests due to upload failure.")
        return

    doc_id = r.json()["document_id"]
    
    print("\n2. Scholar Viewing Own Documents List (GET /documents/me)")
    r = requests.get(f"{BASE_URL}/documents/me", headers={"Authorization": f"Bearer {scholar_token}"})
    print(f"Status: {r.status_code} | Found: {len(r.json())}")
    
    print("\n3. Scholar Requesting Signed URL (GET /documents/{document_id}/view)")
    r = requests.get(f"{BASE_URL}/documents/{doc_id}/view", headers={"Authorization": f"Bearer {scholar_token}"})
    print(f"Status: {r.status_code}")
    if r.status_code == 200:
        print("Signed URL returned successfully. Valid for 120s.")
    else:
         print(r.json())
         
    print("\n------ EVALUATOR DOCUMENT REVIEW TEST ------")
    
    print("\n4. Evaluator Requesting Signed URL (GET /documents/{document_id}/view-evaluator)")
    r = requests.get(f"{BASE_URL}/documents/{doc_id}/view-evaluator", headers={"Authorization": f"Bearer {evaluator_token}"})
    print(f"Status: {r.status_code}")
    if r.status_code == 200:
        print("Evaluator Signed URL returned successfully.")
    
    print("\n5. Evaluator Verifying Document (PATCH /documents/{document_id}/verify)")
    r = requests.patch(f"{BASE_URL}/documents/{doc_id}/verify", headers={"Authorization": f"Bearer {evaluator_token}"})
    print(f"Status: {r.status_code}")
    print(r.json())
    
    print("\nCleaning up dummy pdf file...")
    os.remove("dummy.pdf")
    print("\nTest completed!")

if __name__ == "__main__":
    start_tests()

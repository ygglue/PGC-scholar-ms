import requests

BASE_URL = "http://127.0.0.1:8000"

def get_scholar_token():
    r = requests.post(f"{BASE_URL}/auth/dev-login", json={"email": "scholar@test.com"})
    return r.json()["access_token"]

def get_evaluator_token():
    r = requests.post(f"{BASE_URL}/auth/login", data={"username": "evaluator@test.com", "password": "password123"})
    return r.json()["access_token"]

def start_tests():
    print("------ SCHOLAR TESTS ------")
    scholar_token = get_scholar_token()
    
    print("\n1. Scholar fetch own profile (GET /scholars/me)")
    r = requests.get(f"{BASE_URL}/scholars/me", headers={"Authorization": f"Bearer {scholar_token}"})
    print(f"Status: {r.status_code}")
    print(r.json())

    print("\n2. Scholar list ALL scholars (GET /scholars/) -> Should fail (Evaluators Only)")
    r = requests.get(f"{BASE_URL}/scholars/", headers={"Authorization": f"Bearer {scholar_token}"})
    print(f"Status: {r.status_code}")
    print(r.json())

    print("\n3. Scholar submit a profile update (POST /scholars/me/update)")
    r = requests.post(f"{BASE_URL}/scholars/me/update", headers={"Authorization": f"Bearer {scholar_token}"}, json={"first_name": "Johnny"})
    print(f"Status: {r.status_code}")
    print(r.json())
    
    print("\n4. Scholar submit a SECOND duplicate profile update (POST /scholars/me/update) -> Should block")
    r = requests.post(f"{BASE_URL}/scholars/me/update", headers={"Authorization": f"Bearer {scholar_token}"}, json={"last_name": "Test"})
    print(f"Status: {r.status_code}")
    print(r.json())

    print("\n------ EVALUATOR TESTS ------")
    eval_token = get_evaluator_token()

    print("\n5. Evaluator list ALL scholars (GET /scholars/)")
    r = requests.get(f"{BASE_URL}/scholars/", headers={"Authorization": f"Bearer {eval_token}"})
    print(f"Status: {r.status_code} | Scholar Count: {len(r.json())}")
    
    scholar_id = r.json()[0]["id"]
    
    print("\n6. Evaluator fetch specific Scholar Profile (GET /scholars/{id})")
    r = requests.get(f"{BASE_URL}/scholars/{scholar_id}", headers={"Authorization": f"Bearer {eval_token}"})
    print(f"Status: {r.status_code}")
    print(r.json())

    print("\n7. Evaluator edit scholar directly (PATCH /scholars/{id})")
    r = requests.patch(f"{BASE_URL}/scholars/{scholar_id}", headers={"Authorization": f"Bearer {eval_token}"}, json={"school": "UPD"})
    print(f"Status: {r.status_code}")
    print(r.json())
    
    print("\n8. Verify Evaluator Edit stuck")
    r = requests.get(f"{BASE_URL}/scholars/{scholar_id}", headers={"Authorization": f"Bearer {eval_token}"})
    print(f"Status: {r.status_code}")
    print(f"New School Value: {r.json()['school']}")

if __name__ == "__main__":
    start_tests()

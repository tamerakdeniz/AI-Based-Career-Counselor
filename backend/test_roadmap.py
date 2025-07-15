import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

@pytest.fixture
def auth_headers():
    # Register and login a user
    user = {"name": "Roadmap User", "email": "roadmapuser@example.com", "password": "roadmappass123"}
    client.post("/auth/register", json=user)
    login_resp = client.post("/auth/login", json={"email": user["email"], "password": user["password"]})
    token = login_resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}, login_resp.json()["user_id"]

def test_create_and_get_roadmap(auth_headers):
    headers, user_id = auth_headers
    roadmap_data = {"title": "Test Roadmap", "description": "A test roadmap", "progress": 0}
    # Create roadmap
    resp = client.post(f"/roadmaps/user/{user_id}", json=roadmap_data, headers=headers)
    assert resp.status_code == 201
    roadmap = resp.json()
    assert roadmap["title"] == "Test Roadmap"
    roadmap_id = roadmap["id"]
    # Get roadmap
    get_resp = client.get(f"/roadmaps/{roadmap_id}", headers=headers)
    assert get_resp.status_code == 200
    get_data = get_resp.json()
    assert get_data["id"] == roadmap_id
    # Delete roadmap
    del_resp = client.delete(f"/roadmaps/{roadmap_id}", headers=headers)
    assert del_resp.status_code == 200
    assert del_resp.json()["ok"] is True 
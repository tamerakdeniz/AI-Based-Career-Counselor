import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

@pytest.fixture
def test_user():
    return {
        "name": "Test User",
        "email": "testuser@example.com",
        "password": "testpassword123"
    }

def test_register(test_user):
    response = client.post("/auth/register", json=test_user)
    assert response.status_code == 201 or response.status_code == 400  # 400 if already registered
    data = response.json()
    if response.status_code == 201:
        assert "access_token" in data
        assert data["email"] == test_user["email"]
        assert data["name"] == test_user["name"]
    else:
        assert data["detail"] == "Email already registered"

def test_login(test_user):
    response = client.post("/auth/login", json={"email": test_user["email"], "password": test_user["password"]})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user_email"] == test_user["email"]
    assert data["user_name"] == test_user["name"]
    # Save token for next test
    test_user["access_token"] = data["access_token"]

def test_get_current_user(test_user):
    # Login to get token
    login_resp = client.post("/auth/login", json={"email": test_user["email"], "password": test_user["password"]})
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/auth/me", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == test_user["email"]
    assert data["name"] == test_user["name"] 
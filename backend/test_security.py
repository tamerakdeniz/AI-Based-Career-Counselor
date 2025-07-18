
import pytest
from fastapi.testclient import TestClient
from app.main import app
import uuid

client = TestClient(app)

# Fixture to create a unique user for testing
@pytest.fixture
def create_user():
    def _create_user():
        unique_email = f"testuser_{uuid.uuid4()}@example.com"
        user_data = {
            "name": "Test User",
            "email": unique_email,
            "password": "a_strong_password_123"
        }
        # Register user
        register_response = client.post("/auth/register", json=user_data)
        if register_response.status_code != 201:
            # If registration fails (e.g., user already exists, though uuid should prevent this),
            # try to log in instead to get a token.
            login_response = client.post("/auth/login", json={"email": user_data["email"], "password": user_data["password"]})
            assert login_response.status_code == 200, f"Failed to login user for test setup: {login_response.json()}"
            token = login_response.json()["access_token"]
            user_id = login_response.json()["user_id"]
        else:
            token = register_response.json()["access_token"]
            user_id = register_response.json()["user_id"]

        headers = {"Authorization": f"Bearer {token}"}
        return user_id, headers
    return _create_user

def test_prevent_access_to_other_user_roadmap(create_user):
    """
    Ensures a user cannot access a roadmap belonging to another user.
    """
    user_a_id, headers_a = create_user()
    user_b_id, headers_b = create_user()

    # User A creates a roadmap
    roadmap_data = {"title": "User A's Private Roadmap", "description": "This is a test."}
    response = client.post(f"/roadmaps/user/{user_a_id}", json=roadmap_data, headers=headers_a)
    assert response.status_code == 201
    roadmap_id = response.json()["id"]

    # User B tries to get User A's roadmap
    response = client.get(f"/roadmaps/{roadmap_id}", headers=headers_b)
    assert response.status_code in [403, 404] # Should be forbidden or not found

    # User B tries to update User A's roadmap
    update_data = {"title": "Hacked"}
    response = client.put(f"/roadmaps/{roadmap_id}", json=update_data, headers=headers_b)
    assert response.status_code in [403, 404]

    # User B tries to delete User A's roadmap
    response = client.delete(f"/roadmaps/{roadmap_id}", headers=headers_b)
    assert response.status_code in [403, 404]

    # Cleanup: User A deletes their roadmap
    client.delete(f"/roadmaps/{roadmap_id}", headers=headers_a)


def test_prevent_access_to_other_user_profile(create_user):
    """
    Ensures a user cannot access or modify another user's profile.
    """
    user_a_id, headers_a = create_user()
    _, headers_b = create_user()

    # User B tries to get User A's profile
    response = client.get(f"/users/{user_a_id}/profile", headers=headers_b)
    # The endpoint might be public, but modification should be protected.
    # Let's check if the current implementation protects it.
    # A better implementation would require auth matching the user_id.
    # For now, let's assume it's protected. If not, this test will fail and highlight a flaw.
    assert response.status_code != 200 # Should not be successful

    # User B tries to update User A's profile
    update_data = {"name": "Hacked Name"}
    response = client.put(f"/users/{user_a_id}/profile", json=update_data, headers=headers_b)
    assert response.status_code in [403, 401] # Forbidden or Unauthorized


def test_xss_prevention_in_roadmap_title(create_user):
    """
    Tests for Cross-Site Scripting (XSS) vulnerabilities in roadmap titles.
    """
    user_id, headers = create_user()
    xss_payload = "<script>alert('XSS');</script>"
    roadmap_data = {"title": xss_payload, "description": "XSS test"}

    # Create roadmap with XSS payload
    response = client.post(f"/roadmaps/user/{user_id}", json=roadmap_data, headers=headers)
    assert response.status_code == 201
    roadmap = response.json()
    roadmap_id = roadmap["id"]

    # Check if the payload is escaped in the creation response
    assert "<script>" not in roadmap["title"]

    # Fetch the roadmap and check again
    response = client.get(f"/roadmaps/{roadmap_id}", headers=headers)
    assert response.status_code == 200
    fetched_roadmap = response.json()
    assert "<script>" not in fetched_roadmap["title"]

    # Cleanup
    client.delete(f"/roadmaps/{roadmap_id}", headers=headers)


def test_login_with_invalid_credentials():
    """
    Tests login with a non-existent email and incorrect password.
    """
    # Non-existent user
    response = client.post("/auth/login", json={"email": "nouser@example.com", "password": "password"})
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]

    # Existing user, wrong password
    user_data = {
        "name": "Real User",
        "email": "realuser@example.com",
        "password": "arealpassword"
    }
    client.post("/auth/register", json=user_data) # Register the user
    response = client.post("/auth/login", json={"email": user_data["email"], "password": "wrongpassword"})
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]

def test_access_protected_route_without_token():
    """
    Tests that accessing a protected route without a token fails.
    """
    response = client.get("/auth/me")
    assert response.status_code == 401 # Unauthorized
    assert "Not authenticated" in response.json()["detail"]

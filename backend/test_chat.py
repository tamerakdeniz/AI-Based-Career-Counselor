import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

@pytest.fixture
def user_and_roadmap():
    # Register and login a user
    user = {"name": "Chat User", "email": "chatuser@example.com", "password": "chatpass123"}
    client.post("/auth/register", json=user)
    login_resp = client.post("/auth/login", json={"email": user["email"], "password": user["password"]})
    token = login_resp.json()["access_token"]
    user_id = login_resp.json()["user_id"]
    headers = {"Authorization": f"Bearer {token}"}
    # Create a roadmap
    roadmap_data = {"title": "Chat Roadmap", "description": "A roadmap for chat", "progress": 0}
    roadmap_resp = client.post(f"/roadmaps/user/{user_id}", json=roadmap_data, headers=headers)
    roadmap_id = roadmap_resp.json()["id"]
    return headers, user_id, roadmap_id

def test_post_and_get_chat_message(user_and_roadmap):
    headers, user_id, roadmap_id = user_and_roadmap
    # Post a chat message
    message_data = {"user_id": user_id, "type": "user", "content": "Hello, this is a test message."}
    post_resp = client.post(f"/chat/roadmap/{roadmap_id}", json=message_data, headers=headers)
    assert post_resp.status_code == 201
    chat_msg = post_resp.json()
    assert chat_msg["content"] == "Hello, this is a test message."
    # Get chat messages
    get_resp = client.get(f"/chat/roadmap/{roadmap_id}", headers=headers)
    assert get_resp.status_code == 200
    messages = get_resp.json()
    assert any(msg["content"] == "Hello, this is a test message." for msg in messages) 
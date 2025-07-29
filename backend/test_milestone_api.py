"""
Test script for the milestone analytics API endpoint
"""

import requests
import json
from datetime import datetime

def test_milestone_analytics():
    """Test the milestone analytics endpoint"""
    
    # Base URL for the API
    base_url = "http://localhost:8000"
    
    # First, you'll need to authenticate and get a token
    # For testing purposes, this assumes you have a user account
    
    print("Testing milestone analytics endpoint...")
    print("Note: Make sure the backend server is running on localhost:8000")
    print("You'll need to authenticate first to get a valid token.")
    
    # Example of what the response should look like
    example_response = [
        {
            "date": "2025-07-29",
            "milestones": 5
        },
        {
            "date": "2025-07-28",
            "milestones": 3
        }
    ]
    
    print("\nExpected response format:")
    print(json.dumps(example_response, indent=2))
    
    print("\nTo test manually:")
    print("1. Start the backend server: cd backend && python -m uvicorn app.main:app --reload")
    print("2. Login to get an auth token")
    print("3. Make a GET request to: /roadmaps/analytics/milestones-by-date")
    print("4. Include the Authorization header: Bearer <your_token>")

if __name__ == "__main__":
    test_milestone_analytics()

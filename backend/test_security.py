#!/usr/bin/env python3
"""
Security Testing Script for Career Counselor Backend
This script tests all security implementations to ensure they work correctly.
"""

import json
import sys
import time
from typing import Any, Dict

import requests

# Test configuration
BASE_URL = "http://localhost:8000"
TEST_USER = {
    "name": "Security Test User",
    "email": "security_test@example.com",
    "password": "SecureTestPassword123!"
}

class SecurityTester:
    def __init__(self):
        self.session = requests.Session()
        self.access_token = None
        self.user_id = None
        self.roadmap_id = None
        
    def run_all_tests(self):
        """Run all security tests."""
        print("🔐 Career Counselor Security Test Suite")
        print("=" * 50)
        
        try:
            # Test 1: Server availability
            self.test_server_availability()
            
            # Test 2: Security headers
            self.test_security_headers()
            
            # Test 3: Authentication
            self.test_authentication()
            
            # Test 4: Authorization
            self.test_authorization()
            
            # Test 5: Rate limiting
            self.test_rate_limiting()
            
            # Test 6: Input validation
            self.test_input_validation()
            
            # Test 7: Request size limits
            self.test_request_size_limits()
            
            print("\n🎉 All security tests completed!")
            
        except Exception as e:
            print(f"\n❌ Test suite failed: {e}")
            sys.exit(1)
    
    def test_server_availability(self):
        """Test if server is running."""
        print("\n1. Testing server availability...")
        try:
            response = self.session.get(f"{BASE_URL}/docs")
            if response.status_code == 200:
                print("   ✅ Server is running")
            else:
                raise Exception(f"Server returned status {response.status_code}")
        except requests.ConnectionError:
            raise Exception("Cannot connect to server. Please start the server first.")
    
    def test_security_headers(self):
        """Test security headers are present."""
        print("\n2. Testing security headers...")
        response = self.session.get(f"{BASE_URL}/docs")
        headers = response.headers
        
        required_headers = {
            "x-content-type-options": "nosniff",
            "x-frame-options": "DENY",
            "x-xss-protection": "1; mode=block",
            "strict-transport-security": "max-age=31536000; includeSubDomains"
        }
        
        for header, expected_value in required_headers.items():
            if header in headers:
                print(f"   ✅ {header}: {headers[header]}")
            else:
                print(f"   ⚠️  Missing header: {header}")
    
    def test_authentication(self):
        """Test authentication system."""
        print("\n3. Testing authentication...")
        
        # Test user registration
        print("   Testing user registration...")
        register_data = TEST_USER.copy()
        response = self.session.post(f"{BASE_URL}/auth/register", json=register_data)
        
        if response.status_code == 201:
            data = response.json()
            self.access_token = data.get("access_token")
            self.user_id = data.get("user_id")
            print("   ✅ User registration successful")
        else:
            # Try logging in with existing user
            print("   User already exists, trying login...")
            login_data = {"email": TEST_USER["email"], "password": TEST_USER["password"]}
            response = self.session.post(f"{BASE_URL}/auth/login", json=login_data)
            
            if response.status_code == 200:
                data = response.json()
                self.access_token = data.get("access_token")
                self.user_id = data.get("user_id")
                print("   ✅ User login successful")
            else:
                raise Exception(f"Authentication failed: {response.text}")
        
        # Set authorization header
        self.session.headers.update({"Authorization": f"Bearer {self.access_token}"})
        
        # Test protected endpoint
        print("   Testing protected endpoint access...")
        response = self.session.get(f"{BASE_URL}/auth/me")
        if response.status_code == 200:
            print("   ✅ Protected endpoint access successful")
        else:
            raise Exception("Protected endpoint access failed")
    
    def test_authorization(self):
        """Test authorization (users can only access their own data)."""
        print("\n4. Testing authorization...")
        
        # Test accessing user's own roadmaps
        response = self.session.get(f"{BASE_URL}/roadmaps/user/{self.user_id}")
        if response.status_code == 200:
            print("   ✅ Can access own roadmaps")
        else:
            print(f"   ⚠️  Could not access own roadmaps: {response.status_code}")
        
        # Test accessing another user's roadmaps (should fail)
        fake_user_id = self.user_id + 999  # Non-existent user
        response = self.session.get(f"{BASE_URL}/roadmaps/user/{fake_user_id}")
        if response.status_code == 403:
            print("   ✅ Cannot access other user's roadmaps (correct)")
        else:
            print(f"   ⚠️  Authorization bypass detected: {response.status_code}")
    
    def test_rate_limiting(self):
        """Test rate limiting on AI endpoints."""
        print("\n5. Testing rate limiting...")
        
        # Test AI endpoint rate limiting
        print("   Testing AI endpoint rate limits...")
        
        # Make multiple requests quickly
        rate_limit_hit = False
        for i in range(12):  # Exceed the 10/minute limit
            response = self.session.get(f"{BASE_URL}/ai/initial-questions/software-engineering")
            if response.status_code == 429:
                print(f"   ✅ Rate limit triggered after {i+1} requests")
                rate_limit_hit = True
                break
            time.sleep(0.1)  # Small delay
        
        if not rate_limit_hit:
            print("   ⚠️  Rate limiting may not be working properly")
        
        # Check rate limit headers
        if "x-ratelimit-limit" in response.headers:
            print(f"   ✅ Rate limit headers present: {response.headers.get('x-ratelimit-limit')}")
    
    def test_input_validation(self):
        """Test input validation and sanitization."""
        print("\n6. Testing input validation...")
        
        # Test XSS prevention in career field
        malicious_field = "<script>alert('xss')</script>"
        response = self.session.get(f"{BASE_URL}/ai/initial-questions/{malicious_field}")
        if response.status_code == 400:
            print("   ✅ XSS attempt blocked in career field")
        else:
            print("   ⚠️  XSS attempt may not have been blocked")
        
        # Test invalid characters in career field
        invalid_field = "software@#$%engineering"
        response = self.session.get(f"{BASE_URL}/ai/initial-questions/{invalid_field}")
        if response.status_code == 400:
            print("   ✅ Invalid characters blocked in career field")
        else:
            print("   ⚠️  Invalid characters may not have been blocked")
        
        # Test very long input
        long_field = "a" * 200  # Exceeds 100 character limit
        response = self.session.get(f"{BASE_URL}/ai/initial-questions/{long_field}")
        if response.status_code == 400:
            print("   ✅ Long input blocked")
        else:
            print("   ⚠️  Long input may not have been blocked")
    
    def test_request_size_limits(self):
        """Test request size limiting."""
        print("\n7. Testing request size limits...")
        
        # Create a large payload (simulate oversized request)
        large_payload = {
            "name": "Test User",
            "email": "test@example.com", 
            "password": "password",
            "large_data": "x" * 50000  # 50KB of data
        }
        
        response = self.session.post(f"{BASE_URL}/auth/register", json=large_payload)
        if response.status_code == 413 or response.status_code == 400:
            print("   ✅ Large request blocked")
        else:
            print("   ⚠️  Large request may not have been blocked")
    
    def cleanup(self):
        """Clean up test data."""
        print("\n🧹 Cleaning up test data...")
        # In a real scenario, you might want to delete the test user
        print("   Test cleanup completed")

def main():
    """Main function."""
    tester = SecurityTester()
    try:
        tester.run_all_tests()
    finally:
        tester.cleanup()

if __name__ == "__main__":
    main() 
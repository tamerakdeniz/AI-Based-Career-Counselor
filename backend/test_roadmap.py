import asyncio
import json
import os
import sys
import unittest
from unittest.mock import MagicMock, patch

# Add the backend directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__))))

from app.services.llm_service import LLMService


class TestRoadmapGeneration(unittest.TestCase):
    @patch("app.services.llm_service.LLMService._initialize_clients")
    def setUp(self, mock_initialize_clients):
        # Prevent the real initialization which requires API keys
        mock_initialize_clients.return_value = None
        self.llm_service = LLMService()
        # We need to manually set the model since initialization is mocked
        self.llm_service.gemini_model = MagicMock()

    @patch("app.services.llm_service.LLMService._call_ai_service")
    async def test_generate_career_roadmap_with_resources(self, mock_call_ai_service):
        # Mock the AI service to return a predefined response
        ai_response = {
            "title": "Test Roadmap",
            "description": "A test roadmap for developers.",
            "field": "software_development",
            "milestones": [
                {
                    "title": "Milestone 1",
                    "description": "The first milestone.",
                    "estimated_duration": "1 month",
                    "skills": ["Python", "FastAPI"],
                    "resources": ["Official Python Tutorial", {"title": "FastAPI Docs", "url": "https://fastapi.tiangolo.com/"}],
                }
            ],
        }
        # The mock should return the JSON string directly since it's async
        mock_call_ai_service.return_value = json.dumps(ai_response)

        # Call the function
        roadmap = await self.llm_service.generate_career_roadmap(
            "software_development", 
            {
                "experience": "beginner",
                "interests": "web apps",
                "goals": "get a job",
                "work_style": "remote",
                "tech_stack": "Python"
            },
            MagicMock() # Mock the database session
        )

        # Assert the output
        self.assertIn("milestones", roadmap)
        self.assertIsInstance(roadmap["milestones"], list)
        self.assertEqual(len(roadmap["milestones"]), 1)
        milestone = roadmap["milestones"][0]
        self.assertIn("resources", milestone)
        self.assertIsInstance(milestone["resources"], list)
        self.assertEqual(len(milestone["resources"]), 2)
        self.assertEqual(
            milestone["resources"][0], 
            {"title": "Official Python Tutorial", "url": ""}
        )
        self.assertEqual(
            milestone["resources"][1],
            {"title": "FastAPI Docs", "url": "https://fastapi.tiangolo.com/"},
        )

if __name__ == "__main__":
    # Run async tests
    async def run_async_tests():
        # Create a test suite
        suite = unittest.TestLoader().loadTestsFromTestCase(TestRoadmapGeneration)
        
        # Run each test individually for async support
        for test in suite:
            if hasattr(test._testMethodName, '__name__') or 'async' in test._testMethodName:
                # This is an async test
                await test.debug()
            else:
                # This is a regular test
                test.debug()
    
    # For async test compatibility, we'll run it directly
    test_case = TestRoadmapGeneration()
    test_case.setUp()
    asyncio.run(test_case.test_generate_career_roadmap_with_resources())

import asyncio
import json
import logging
from typing import Any, Dict, List

import google.generativeai as genai
from app.core.config import settings
from app.models.roadmap import Roadmap
from sqlalchemy.orm import Session

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Field-Specific Configurations ---
FIELD_CONFIG = {
    "software_development": {
        "questions": [
            {"key": "experience", "text": "What's your current experience level with software development? (e.g., beginner, some projects, professional)"},
            {"key": "interests", "text": "What parts of software development excite you the most? (e.g., building web apps, data science, mobile development, games)"},
            {"key": "goals", "text": "What are your primary goals? (e.g., get a job, build a specific project, learn a new technology)"},
            {"key": "work_style", "text": "How do you prefer to work? (e.g., in a team, alone, remote, in-office)"},
            {"key": "tech_stack", "text": "Are there any technologies or programming languages you're particularly interested in?"},
        ],
        "prompt_template": """
        You are a career mentor creating a detailed roadmap for an aspiring software developer.
        Based on the user's profile, generate a clear, actionable, and encouraging roadmap.

        User Profile:
        - Experience Level: {experience}
        - Interests: {interests}
        - Goals: {goals}
        - Preferred Work Style: {work_style}
        - Desired Tech Stack: {tech_stack}

        CRITICAL: You must return ONLY valid JSON in the exact format below. Do not include any markdown formatting, code blocks, or additional text.

        {{
            "title": "Specific title for this software development roadmap",
            "description": "Detailed description of the learning path",
            "field": "Software Development",
            "milestones": [
                {{
                    "title": "Milestone title",
                    "description": "Detailed description of what will be learned and accomplished",
                    "estimated_duration": "Time estimate (e.g., '2-3 months')",
                    "skills": ["skill1", "skill2", "skill3"],
                    "resources": [
                        {{
                            "title": "Resource name",
                            "url": "https://example.com or empty string if no URL"
                        }}
                    ]
                }}
            ]
        }}

        Create 4-6 progressive milestones that build upon each other for software development skills.
        """
    },
    "data_science": {
        "questions": [
            {"key": "experience", "text": "What is your background in math, stats, and programming?"},
            {"key": "interests", "text": "Which areas of data science are most interesting to you? (e.g., machine learning, data visualization, analytics)"},
            {"key": "goals", "text": "What do you want to achieve in data science? (e.g., become a data analyst, build predictive models)"},
            {"key": "industry", "text": "Are you interested in a specific industry? (e.g., finance, healthcare, tech)"},
            {"key": "learning_style", "text": "How do you prefer to learn complex topics? (e.g., academic papers, practical projects)"},
        ],
        "prompt_template": """
        You are an expert data scientist mentoring a newcomer. Create a roadmap based on their profile.

        User Profile:
        - Experience: {experience}
        - Interests: {interests}
        - Goals: {goals}
        - Industry: {industry}
        - Learning Style: {learning_style}

        CRITICAL: You must return ONLY valid JSON in the exact format below. Do not include any markdown formatting, code blocks, or additional text.

        {{
            "title": "Specific title for this data science roadmap",
            "description": "Detailed description of the learning path",
            "field": "Data Science",
            "milestones": [
                {{
                    "title": "Milestone title",
                    "description": "Detailed description of what will be learned and accomplished",
                    "estimated_duration": "Time estimate (e.g., '2-3 months')",
                    "skills": ["skill1", "skill2", "skill3"],
                    "resources": [
                        {{
                            "title": "Resource name",
                            "url": "https://example.com or empty string if no URL"
                        }}
                    ]
                }}
            ]
        }}

        Create 4-6 progressive milestones that build upon each other for data science skills.
        """
    },
    "digital_marketing": {
        "questions": [
            {"key": "experience", "text": "Have you managed any marketing campaigns before?"},
            {"key": "interests", "text": "What part of digital marketing excites you? (e.g., SEO, social media, content marketing)"},
            {"key": "goals", "text": "What are your career goals? (e.g., become a marketing manager, specialize in an area)"},
            {"key": "creative_or_analytical", "text": "Do you lean more towards the creative or analytical side of marketing?"},
            {"key": "budget_experience", "text": "Have you ever managed a marketing budget?"},
        ],
        "prompt_template": """
        You are a digital marketing director creating a growth plan for a team member. Create a roadmap based on their profile.

        User Profile:
        - Experience: {experience}
        - Interests: {interests}
        - Goals: {goals}
        - Creative or Analytical: {creative_or_analytical}
        - Budget Experience: {budget_experience}

        Generate a JSON roadmap with 'title', 'description', 'field', and 'milestones'. Milestones need 'title', 'description', 'estimated_duration', 'skills', and 'resources'.
        """
    },
    "product_management": {
        "questions": [
            {"key": "experience", "text": "What's your experience with product development or project management?"},
            {"key": "interests", "text": "What kind of products are you passionate about building? (e.g., consumer apps, B2B software)"},
            {"key": "goals", "text": "What do you hope to achieve as a product manager?"},
            {"key": "leadership_style", "text": "Describe your leadership and communication style."},
            {"key": "technical_skills", "text": "How comfortable are you with technical discussions?"},
        ],
        "prompt_template": """
        You are a seasoned Head of Product advising a new Product Manager. Create a roadmap based on their profile.

        User Profile:
        - Experience: {experience}
        - Interests: {interests}
        - Goals: {goals}
        - Leadership Style: {leadership_style}
        - Technical Skills: {technical_skills}

        Generate a JSON roadmap with 'title', 'description', 'field', and 'milestones'. Milestones need 'title', 'description', 'estimated_duration', 'skills', and 'resources'.
        """
    },
    "ux_ui_design": {
        "questions": [
            {"key": "experience", "text": "Do you have a portfolio or any design projects you can share?"},
            {"key": "interests", "text": "Are you more drawn to UX (user research, wireframing) or UI (visual design, prototyping)?"},
            {"key": "goals", "text": "What are your career goals as a designer?"},
            {"key": "tools", "text": "Are you familiar with any design tools like Figma, Sketch, or Adobe XD?"},
            {"key": "collaboration_style", "text": "How do you like to collaborate with developers and product managers?"},
        ],
        "prompt_template": """
        You are a Design Lead mentoring a junior designer. Create a roadmap based on their profile.

        User Profile:
        - Experience: {experience}
        - Interests: {interests}
        - Goals: {goals}
        - Tools: {tools}
        - Collaboration Style: {collaboration_style}

        Generate a JSON roadmap with 'title', 'description', 'field', and 'milestones'. Milestones need 'title', 'description', 'estimated_duration', 'skills', and 'resources'.
        """
    },
    "business_analysis": {
        "questions": [
            {"key": "experience", "text": "What is your experience with data analysis and requirements gathering?"},
            {"key": "interests", "text": "What part of bridging business and tech interests you most?"},
            {"key": "goals", "text": "What are your career goals as a business analyst?"},
            {"key": "stakeholder_management", "text": "How comfortable are you with presenting findings to stakeholders?"},
            {"key": "documentation_style", "text": "Do you have a preferred method for documenting requirements?"},
        ],
        "prompt_template": """
        You are a senior Business Analyst guiding a new team member. Create a roadmap based on their profile.

        User Profile:
        - Experience: {experience}
        - Interests: {interests}
        - Goals: {goals}
        - Stakeholder Management: {stakeholder_management}
        - Documentation Style: {documentation_style}

        Generate a JSON roadmap with 'title', 'description', 'field', and 'milestones'. Milestones need 'title', 'description', 'estimated_duration', 'skills', and 'resources'.
        """
    },
    "project_management": {
        "questions": [
            {"key": "experience", "text": "Have you managed projects before? If so, what methodologies did you use (e.g., Agile, Waterfall)?"},
            {"key": "interests", "text": "What types of projects do you enjoy leading?"},
            {"key": "goals", "text": "What are your long-term career goals in project management?"},
            {"key": "team_size", "text": "What size of team are you most comfortable leading?"},
            {"key": "conflict_resolution", "text": "How do you approach resolving conflicts within a project team?"},
        ],
        "prompt_template": """
        You are a Program Manager mentoring a Project Manager. Create a detailed roadmap based on their profile.

        User Profile:
        - Experience: {experience}
        - Interests: {interests}
        - Goals: {goals}
        - Team Size: {team_size}
        - Conflict Resolution: {conflict_resolution}

        CRITICAL: You must return ONLY valid JSON in the exact format below. Do not include any markdown formatting, code blocks, or additional text.

        {{
            "title": "Specific title for this project management roadmap",
            "description": "Detailed description of the learning path",
            "field": "Project Management",
            "milestones": [
                {{
                    "title": "Milestone title",
                    "description": "Detailed description of what will be learned and accomplished",
                    "estimated_duration": "Time estimate (e.g., '2-3 months')",
                    "skills": ["skill1", "skill2", "skill3"],
                    "resources": [
                        {{
                            "title": "Resource name",
                            "url": "https://example.com or empty string if no URL"
                        }}
                    ]
                }}
            ]
        }}

        Create 4-6 progressive milestones that build upon each other for project management skills.
        """
    },
    "sales": {
        "questions": [
            {"key": "experience", "text": "What is your sales experience? Have you worked with quotas before?"},
            {"key": "interests", "text": "What kind of products or services are you passionate about selling?"},
            {"key": "goals", "text": "What are your career ambitions in sales? (e.g., account executive, sales manager)"},
            {"key": "sales_style", "text": "Are you more of a relationship-builder or a hunter?"},
            {"key": "rejection_handling", "text": "How do you handle rejection and stay motivated?"},
        ],
        "prompt_template": """
        You are a Sales Director coaching a sales representative. Create a roadmap based on their profile.

        User Profile:
        - Experience: {experience}
        - Interests: {interests}
        - Goals: {goals}
        - Sales Style: {sales_style}
        - Rejection Handling: {rejection_handling}

        Generate a JSON roadmap with 'title', 'description', 'field', and 'milestones'. Milestones need 'title', 'description', 'estimated_duration', 'skills', and 'resources'.
        """
    },
    "content_creation": {
        "questions": [
            {"key": "experience", "text": "What kind of content have you created before? (e.g., videos, blogs, podcasts)"},
            {"key": "interests", "text": "What topics are you passionate about creating content for?"},
            {"key": "goals", "text": "What are your goals as a content creator? (e.g., build an audience, monetize your content)"},
            {"key": "platform", "text": "Which platforms are you most interested in? (e.g., YouTube, TikTok, Substack)"},
            {"key": "monetization_strategy", "text": "Have you thought about how you might monetize your content?"},
        ],
        "prompt_template": """
        You are a media strategist advising a content creator. Create a roadmap based on their profile.

        User Profile:
        - Experience: {experience}
        - Interests: {interests}
        - Goals: {goals}
        - Platform: {platform}
        - Monetization Strategy: {monetization_strategy}

        Generate a JSON roadmap with 'title', 'description', 'field', and 'milestones'. Milestones need 'title', 'description', 'estimated_duration', 'skills', and 'resources'.
        """
    },
    "entrepreneurship": {
        "questions": [
            {"key": "experience", "text": "Have you ever started a business or a project from scratch?"},
            {"key": "interests", "text": "What industry or problem area are you passionate about solving?"},
            {"key": "goals", "text": "What is your ultimate vision for your venture?"},
            {"key": "risk_tolerance", "text": "How comfortable are you with financial and career risks?"},
            {"key": "funding_strategy", "text": "Have you thought about how you would fund your business idea?"},
        ],
        "prompt_template": """
        You are a venture capitalist mentoring an aspiring entrepreneur. Create a roadmap based on their profile.

        User Profile:
        - Experience: {experience}
        - Interests: {interests}
        - Goals: {goals}
        - Risk Tolerance: {risk_tolerance}
        - Funding Strategy: {funding_strategy}

        Generate a JSON roadmap with 'title', 'description', 'field', and 'milestones'. Milestones need 'title', 'description', 'estimated_duration', 'skills', and 'resources'.
        """
    },
    "finance": {
        "questions": [
            {"key": "experience", "text": "What is your background in finance or accounting?"},
            {"key": "interests", "text": "Which area of finance interests you most? (e.g., investment banking, personal finance, corporate finance)"},
            {"key": "goals", "text": "What are your career goals in the finance industry?"},
            {"key": "quantitative_skills", "text": "How strong are your quantitative and analytical skills?"},
            {"key": "certifications", "text": "Are you interested in pursuing certifications like the CFA or CPA?"},
        ],
        "prompt_template": """
        You are a CFO mentoring a junior financial analyst. Create a roadmap based on their profile.

        User Profile:
        - Experience: {experience}
        - Interests: {interests}
        - Goals: {goals}
        - Quantitative Skills: {quantitative_skills}
        - Certifications: {certifications}

        Generate a JSON roadmap with 'title', 'description', 'field', and 'milestones'. Milestones need 'title', 'description', 'estimated_duration', 'skills', and 'resources'.
        """
    },
    "healthcare": {
        "questions": [
            {"key": "experience", "text": "Do you have any experience in the healthcare field, clinical or otherwise?"},
            {"key": "interests", "text": "What area of healthcare are you drawn to? (e.g., patient care, research, administration, technology)"},
            {"key": "goals", "text": "What impact do you want to have in healthcare?"},
            {"key": "patient_interaction", "text": "How much direct patient interaction are you comfortable with?"},
            {"key": "education_commitment", "text": "Are you prepared for the educational and training commitments required in healthcare?"},
        ],
        "prompt_template": """
        You are a healthcare administrator advising someone on their career path. Create a roadmap based on their profile.

        User Profile:
        - Experience: {experience}
        - Interests: {interests}
        - Goals: {goals}
        - Patient Interaction: {patient_interaction}
        - Education Commitment: {education_commitment}

        Generate a JSON roadmap with 'title', 'description', 'field', and 'milestones'. Milestones need 'title', 'description', 'estimated_duration', 'skills', and 'resources'.
        """
    },
    "education": {
        "questions": [
            {"key": "experience", "text": "Do you have any teaching or tutoring experience?"},
            {"key": "interests", "text": "What age group or subject are you passionate about teaching?"},
            {"key": "goals", "text": "What are your long-term goals in education? (e.g., teacher, administrator, curriculum developer)"},
            {"key": "teaching_philosophy", "text": "What is your teaching philosophy?"},
            {"key": "classroom_management", "text": "How would you approach classroom management and student engagement?"},
        ],
        "prompt_template": """
        You are a school principal mentoring a new teacher. Create a roadmap based on their profile.

        User Profile:
        - Experience: {experience}
        - Interests: {interests}
        - Goals: {goals}
        - Teaching Philosophy: {teaching_philosophy}
        - Classroom Management: {classroom_management}

        Generate a JSON roadmap with 'title', 'description', 'field', and 'milestones'. Milestones need 'title', 'description', 'estimated_duration', 'skills', and 'resources'.
        """
    },
    "recreational_diving": {
        "questions": [
            {"key": "experience", "text": "Have you ever been diving before? What's your current certification level, if any? (e.g., never, PADI Open Water)"},
            {"key": "interests", "text": "What about the underwater world fascinates you? (e.g., seeing coral reefs, exploring wrecks, marine life photography)"},
            {"key": "goals", "text": "What do you hope to achieve with diving? (e.g., become a Divemaster, travel to famous dive spots, contribute to conservation)"},
            {"key": "physical_readiness", "text": "Are you a confident swimmer and comfortable in the water?"},
            {"key": "environment", "text": "Do you prefer warm, tropical waters or are you open to colder diving adventures?"},
        ],
        "prompt_template": """
        You are a master diving instructor creating a personalized development plan for a recreational diver.
        Based on the user's profile, generate a safe, exciting, and logical progression of certifications and experiences.

        User Profile:
        - Experience Level: {experience}
        - Interests: {interests}
        - Goals: {goals}
        - Physical Readiness: {physical_readiness}
        - Preferred Environment: {environment}

        The roadmap must be a JSON object with a 'title', 'description', 'field', and a 'milestones' array.
        Each milestone should represent a new certification or a key experience, including a 'title', 'description', 'estimated_duration', 'skills' to master, and 'resources' (like training agencies, dive spots, or gear recommendations).
        """
    },
    "default": {
        "questions": [
            {"key": "experience", "text": "What is your current experience level in this field?"},
            {"key": "interests", "text": "What are your main interests related to this area?"},
            {"key": "goals", "text": "What are your short-term and long-term goals?"},
            {"key": "work_style", "text": "What is your preferred work style or environment?"},
            {"key": "learning_style", "text": "How do you learn best? (e.g., through courses, hands-on projects, reading books)"},
        ],
        "prompt_template": """
        You are a career counselor creating a roadmap for a user exploring a new field.
        Based on the user's profile, generate a clear, actionable, and encouraging roadmap.

        User Profile:
        - Field: {field}
        - Experience Level: {experience}
        - Interests: {interests}
        - Goals: {goals}
        - Learning Style: {learning_style}
        - Time Commitment: {time_commitment}

        CRITICAL: You must return ONLY valid JSON in the exact format below. Do not include any markdown formatting, code blocks, or additional text.

        {{
            "title": "Comprehensive {field} Learning Path",
            "description": "A step-by-step roadmap tailored to your experience level and goals in {field}",
            "field": "{field}",
            "milestones": [
                {{
                    "title": "Milestone title",
                    "description": "Detailed description of what will be learned and accomplished",
                    "estimated_duration": "Time estimate (e.g., '2-3 months')",
                    "skills": ["skill1", "skill2", "skill3"],
                    "resources": [
                        {{
                            "title": "Resource name",
                            "url": "https://example.com or empty string if no URL"
                        }}
                    ]
                }}
            ]
        }}

        Create 4-6 progressive milestones that build upon each other, considering the user's experience level and time commitment.
        For specialized fields like {field}, ensure milestones are field-appropriate and realistic.
        """
    }
}

class LLMService:
    """Service for handling AI/LLM interactions for career guidance."""

    def __init__(self):
        self.gemini_model = None
        self._initialize_clients()

    def _initialize_clients(self):
        """Initialize AI clients based on available API keys."""
        if settings.google_ai_api_key:
            try:
                genai.configure(api_key=settings.google_ai_api_key)
                self.gemini_model = genai.GenerativeModel(settings.gemini_model)
                logger.info(f"Gemini client initialized with model: {settings.gemini_model}")
            except Exception as e:
                logger.error(f"Failed to initialize Gemini client: {e}")
                self.gemini_model = None
        else:
            logger.warning("Google AI API key not found. LLM service will not function.")

    def get_initial_questions(self, field: str) -> List[Dict[str, str]]:
        """
        Returns the list of initial, friendly questions for a given field.
        These questions are designed to be simple and gather essential context.
        For custom fields, generates field-specific questions using the default template.
        """
        field_key = field.lower().replace(" ", "_").replace("/", "_")
        config = FIELD_CONFIG.get(field_key, FIELD_CONFIG["default"])
        
        # If using default config for a custom field, customize the questions
        if field_key not in FIELD_CONFIG and field != "default":
            # Create field-specific questions for custom fields
            custom_questions = [
                {"key": "experience", "text": f"What's your current experience level with {field}? (e.g., beginner, some experience, professional)"},
                {"key": "interests", "text": f"What specific aspects of {field} interest you the most?"},
                {"key": "goals", "text": f"What are your main goals in {field}? (e.g., career change, skill improvement, certification)"},
                {"key": "learning_style", "text": "How do you prefer to learn? (e.g., hands-on practice, structured courses, mentorship)"},
                {"key": "time_commitment", "text": "How much time can you dedicate to learning per week?"},
            ]
            return custom_questions
        
        return config["questions"]

    async def generate_career_roadmap(
        self,
        field: str,
        user_responses: Dict[str, Any],
        db: Session
    ) -> Dict[str, Any]:
        """
        Generates a complete career roadmap based on a self-contained set of user answers.
        This method does not rely on conversation history.
        """
        if not self.gemini_model:
            logger.error("AI model not available.")
            return self._generate_fallback_roadmap(field)

        field_key = field.lower().replace(" ", "_").replace("/", "_")
        config = FIELD_CONFIG.get(field_key, FIELD_CONFIG["default"])
        prompt_template = config["prompt_template"]

        # Ensure all keys required by the template are present in user_responses
        # Provide default values for any missing answers to prevent errors
        # If using default config for a custom field, use custom questions
        if field_key not in FIELD_CONFIG and field != "default":
            # Use the custom questions we generated
            custom_questions = [
                {"key": "experience", "text": f"What's your current experience level with {field}?"},
                {"key": "interests", "text": f"What specific aspects of {field} interest you the most?"},
                {"key": "goals", "text": f"What are your main goals in {field}?"},
                {"key": "learning_style", "text": "How do you prefer to learn?"},
                {"key": "time_commitment", "text": "How much time can you dedicate to learning per week?"},
            ]
            prompt_data = {q["key"]: user_responses.get(q["key"], "Not provided") for q in custom_questions}
        else:
            prompt_data = {q["key"]: user_responses.get(q["key"], "Not provided") for q in config["questions"]}
        prompt_data["field"] = field # Add field for the default template

        try:
            prompt = prompt_template.format(**prompt_data)
        except KeyError as e:
            logger.error(f"Missing key in user_responses for prompt template: {e}")
            return self._generate_fallback_roadmap(field)

        response_text = await self._call_ai_service(prompt)
        
        # Log the AI response for debugging
        logger.info(f"AI response length: {len(response_text)}")
        if len(response_text) < 100:
            logger.warning(f"AI response appears truncated: {response_text}")
        
        if not response_text or response_text.strip() == "":
            logger.error("AI service returned empty response, using fallback roadmap")
            return self._generate_fallback_roadmap(field)

        try:
            # Clean the response text to handle potential formatting issues
            cleaned_response = response_text.strip()
            if cleaned_response.startswith('```json'):
                cleaned_response = cleaned_response[7:]
            if cleaned_response.endswith('```'):
                cleaned_response = cleaned_response[:-3]
            cleaned_response = cleaned_response.strip()
            
            # The AI is prompted to return JSON, so we parse it.
            roadmap_data = json.loads(cleaned_response)
            
            # Validate that we have a proper dictionary structure
            if not isinstance(roadmap_data, dict):
                logger.error(f"AI response is not a dictionary: {type(roadmap_data)}")
                return self._generate_fallback_roadmap(field)
            
            logger.info(f"Successfully parsed AI response JSON with {len(roadmap_data.get('milestones', []))} milestones")
            
            # Validate and correct the structure of milestones and resources
            if "milestones" in roadmap_data and isinstance(roadmap_data["milestones"], list):
                for milestone in roadmap_data["milestones"]:
                    if isinstance(milestone, dict):
                        if "resources" in milestone and isinstance(milestone["resources"], list):
                            corrected_resources = []
                            for resource in milestone["resources"]:
                                if isinstance(resource, str):
                                    corrected_resources.append({"title": resource, "url": ""})
                                elif isinstance(resource, dict) and "title" in resource:
                                    corrected_resources.append(resource)
                            milestone["resources"] = corrected_resources
            
            return roadmap_data
        except (json.JSONDecodeError, TypeError) as e:
            logger.error(f"Failed to decode JSON from AI response: {str(e)}")
            logger.error(f"AI response content: {response_text[:500]}...")  # Log first 500 chars
            
            # Try to extract JSON from a potentially malformed response
            try:
                # Look for JSON-like content in the response
                import re
                json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
                if json_match:
                    potential_json = json_match.group(0)
                    roadmap_data = json.loads(potential_json)
                    if isinstance(roadmap_data, dict):
                        logger.info("Successfully extracted JSON from malformed response")
                        return roadmap_data
            except:
                pass
            
            # Fallback if the AI fails to return valid JSON
            return self._generate_fallback_roadmap(field)

    def _generate_fallback_roadmap(self, field: str) -> Dict[str, Any]:
        """Generate a fallback roadmap if the AI service fails."""
        return {
            "title": f"Career Path in {field}",
            "description": f"A personalized roadmap for your career in {field}.",
            "field": field,
            "milestones": [
                {
                    "title": "Foundation Building",
                    "description": "Build foundational knowledge and skills for your new career path.",
                    "estimated_duration": "3-6 months",
                    "skills": ["Fundamental concepts", "Core principles"],
                    "resources": [{"title": "Look for online courses and introductory books", "url": ""}],
                }
            ],
        }

    async def _call_ai_service(self, prompt: str, json_output: bool = True) -> str:
        """Call the configured AI service (Gemini) with the given prompt."""
        if not self.gemini_model:
            logger.error("Gemini model not initialized")
            return ""
        
        try:
            generation_config = genai.types.GenerationConfig(
                max_output_tokens=settings.gemini_max_tokens,
                temperature=settings.gemini_temperature,
            )
            
            # Only set JSON output for roadmap generation
            if json_output:
                generation_config.response_mime_type = "application/json"
            
            logger.info(f"Calling Gemini API with prompt length: {len(prompt)}")
            logger.info(f"Max tokens: {settings.gemini_max_tokens}, Temperature: {settings.gemini_temperature}")
            
            response = await asyncio.to_thread(
                self.gemini_model.generate_content,
                prompt,
                generation_config=generation_config
            )
            
            if not response or not hasattr(response, 'text'):
                logger.error("Gemini API returned invalid response object")
                return ""
                
            response_text = response.text
            logger.info(f"Gemini API response received, length: {len(response_text)}")
            
            return response_text
            
        except Exception as e:
            logger.error(f"Gemini API error: {str(e)}")
            logger.error(f"Exception type: {type(e).__name__}")
            return ""

# Global instance
llm_service = LLMService()

"""
Prompt engineering service for career guidance conversations.
This service provides structured prompts for the 5-step career guidance process.
"""

import json
from dataclasses import dataclass
from enum import Enum
from typing import Any, Dict, List, Optional


class PromptType(Enum):
    """Different types of prompts for career guidance"""
    INTERESTS_STRENGTHS = "interests_strengths"
    PREFERRED_FIELD = "preferred_field"
    VALUES_MOTIVATION = "values_motivation"
    WORK_STYLE = "work_style"
    LONG_TERM_VISION = "long_term_vision"
    ROADMAP_GENERATION = "roadmap_generation"
    MENTORING = "mentoring"
    INITIAL_GREETING = "initial_greeting"

@dataclass
class PromptContext:
    """Context for prompt generation"""
    user_responses: Dict[str, str]
    field: Optional[str] = None
    roadmap_title: Optional[str] = None
    milestones: List[Dict[str, Any]] = None
    
    def __post_init__(self):
        if self.milestones is None:
            self.milestones = []

class PromptService:
    """Service for generating career guidance prompts"""
    
    def __init__(self):
        self.prompts = self._initialize_prompts()
    
    def _initialize_prompts(self) -> Dict[str, Dict[str, Any]]:
        """Initialize all prompt templates"""
        return {
            PromptType.INTERESTS_STRENGTHS.value: {
                "system_prompt": """You are a warm, encouraging career counselor helping someone discover their ideal career path. You're skilled at asking thoughtful questions that help people understand their strengths and interests.""",
                "user_prompt": """Start the conversation by asking about their interests and strengths. Ask in a warm, encouraging way about what subjects or activities they enjoy most and feel they excel at. What makes them feel energized and engaged?
                
                Keep your response conversational, supportive, and under 100 words.""",
                "example_response": "Hi! I'm here to help you discover your ideal career path. Let's start by getting to know you better. Can you tell me what subjects or activities you enjoy most and feel you excel at? What makes you feel energized and engaged?"
            },
            
            PromptType.PREFERRED_FIELD.value: {
                "system_prompt": """You are a career counselor helping someone explore career fields. You're encouraging and help them think broadly about possibilities.""",
                "user_prompt_template": """Based on the user's interests and strengths: "{interests_strengths}"
                
                Now ask about their preferred field. Be encouraging and help them think broadly about the type of work environment or impact they'd like to have.
                
                Keep your response conversational, supportive, and under 100 words.""",
                "example_response": "That's great to hear about your interests! Now, if you could work in any field, what would it be? Even if you're unsure, describe the type of work environment or impact you'd like to have. Don't worry about being too specific - we're exploring possibilities!"
            },
            
            PromptType.VALUES_MOTIVATION.value: {
                "system_prompt": """You are a career counselor helping someone explore their values and motivations. You help them think deeply about what matters most in their career.""",
                "user_prompt_template": """The user is interested in: "{preferred_field}"
                
                Now explore their values and motivations. Ask what values are important to them in their work (creativity, security, helping people, making a difference, continuous learning, work-life balance, leadership, etc.).
                
                Keep your response conversational, supportive, and under 100 words.""",
                "example_response": "Excellent! Now let's talk about what matters most to you in a career. What values are important to you in your work? For example: creativity, security, helping people, making a difference, continuous learning, work-life balance, leadership, or something else entirely?"
            },
            
            PromptType.WORK_STYLE.value: {
                "system_prompt": """You are a career counselor helping someone understand their work style preferences. You help them visualize their ideal work environment.""",
                "user_prompt_template": """The user values: "{values_motivation}"
                
                Now ask about their work style preferences. Do they prefer remote work, teamwork, solo deep work, or a mix? What would their ideal workday look like?
                
                Keep your response conversational, supportive, and under 100 words.""",
                "example_response": "I love that! Now, let's talk about how you like to work. Do you prefer remote work, being part of a team, solo deep work, or a mix of different styles? What would your ideal workday look like? Are you someone who thrives on routine or variety?"
            },
            
            PromptType.LONG_TERM_VISION.value: {
                "system_prompt": """You are a career counselor helping someone think about their long-term career vision. You inspire them to think ambitiously about their future.""",
                "user_prompt_template": """The user prefers: "{work_style}"
                
                Now explore their long-term vision. Ask where they see themselves in 5-10 years, what achievements would make them proud, and what kind of impact they want to have.
                
                Keep your response conversational, supportive, and under 100 words.""",
                "example_response": "Perfect! Now let's think about the bigger picture. Where do you see yourself in 5-10 years? What achievements would make you proud? What kind of impact do you want to have in your field or community?"
            },
            
            PromptType.ROADMAP_GENERATION.value: {
                "system_prompt": """You are a career counselor who creates detailed, actionable career roadmaps. You're skilled at breaking down career paths into specific milestones with concrete resources.""",
                "user_prompt_template": """Based on the following career counseling conversation data, create a detailed career roadmap:

                Interests & Strengths: {interests_strengths}
                Preferred Field: {preferred_field}
                Values & Motivation: {values_motivation}
                Work Style: {work_style}
                Long-term Vision: {long_term_vision}

                Create a career roadmap with:
                1. A compelling title and description
                2. 6-8 specific milestones, each with:
                   - Clear title and description
                   - Estimated timeline
                   - Key skills to develop
                   - Specific resources (courses, certifications, books, websites)
                   - Prerequisites

                Format as JSON with this exact structure:
                {{
                    "title": "Career Path Title",
                    "description": "Brief engaging description",
                    "field": "Primary field/industry",
                    "milestones": [
                        {{
                            "title": "Milestone title",
                            "description": "Detailed description",
                            "estimated_duration": "X months",
                            "skills": ["skill1", "skill2", "skill3"],
                            "resources": ["Specific course/book/resource 1", "Specific course/book/resource 2"],
                            "prerequisites": ["prereq1", "prereq2"]
                        }}
                    ]
                }}

                Make it specific, actionable, and motivating."""
            },
            
            PromptType.MENTORING.value: {
                "system_prompt": """You are an experienced career mentor providing ongoing guidance. You're supportive, specific, and actionable in your advice.""",
                "user_prompt_template": """You are mentoring someone with this career roadmap:

                Roadmap: {roadmap_title}
                Field: {field}
                
                Recent conversation:
                {conversation_context}
                
                User's current message: "{user_message}"
                
                Provide a helpful, encouraging response that:
                1. Addresses their question/concern
                2. Relates to their career roadmap
                3. Provides actionable advice
                4. Encourages continued progress
                
                Keep your response conversational, supportive, and under 200 words."""
            },
            
            PromptType.INITIAL_GREETING.value: {
                "system_prompt": """You are a warm, welcoming career counselor starting a new conversation with someone.""",
                "user_prompt": """Create an initial greeting for someone who just started creating a new career roadmap. Be warm, encouraging, and explain the process briefly.
                
                Keep your response under 100 words.""",
                "example_response": "Hi there! Welcome to your career journey! I'm here to help you create a personalized roadmap to your ideal career. We'll start by getting to know you better - your interests, strengths, and goals. Then I'll guide you through creating a step-by-step plan to achieve your career dreams. Ready to get started?"
            }
        }
    
    def get_prompt(self, prompt_type: PromptType, context: PromptContext = None) -> Dict[str, str]:
        """Get a formatted prompt for the specified type"""
        
        if context is None:
            context = PromptContext(user_responses={})
        
        prompt_config = self.prompts.get(prompt_type.value, {})
        
        if not prompt_config:
            return self._get_fallback_prompt(prompt_type)
        
        # Get system prompt
        system_prompt = prompt_config.get("system_prompt", "")
        
        # Format user prompt with context
        user_prompt = self._format_user_prompt(prompt_config, context)
        
        return {
            "system_prompt": system_prompt,
            "user_prompt": user_prompt
        }
    
    def _format_user_prompt(self, prompt_config: Dict[str, Any], context: PromptContext) -> str:
        """Format user prompt with context data"""
        
        # Check if there's a template to format
        if "user_prompt_template" in prompt_config:
            template = prompt_config["user_prompt_template"]
            try:
                return template.format(**context.user_responses)
            except KeyError as e:
                # Missing key in context, use example or fallback
                return prompt_config.get("example_response", "How can I help you with your career journey?")
        
        # Use static prompt if available
        if "user_prompt" in prompt_config:
            return prompt_config["user_prompt"]
        
        # Use example response as fallback
        return prompt_config.get("example_response", "How can I help you with your career journey?")
    
    def _get_fallback_prompt(self, prompt_type: PromptType) -> Dict[str, str]:
        """Get fallback prompt for unknown types"""
        
        fallback_prompts = {
            PromptType.INTERESTS_STRENGTHS: {
                "system_prompt": "You are a career counselor.",
                "user_prompt": "Can you tell me about your interests and what you excel at?"
            },
            PromptType.PREFERRED_FIELD: {
                "system_prompt": "You are a career counselor.",
                "user_prompt": "What field would you like to work in?"
            },
            PromptType.VALUES_MOTIVATION: {
                "system_prompt": "You are a career counselor.",
                "user_prompt": "What values are important to you in your career?"
            },
            PromptType.WORK_STYLE: {
                "system_prompt": "You are a career counselor.",
                "user_prompt": "How do you prefer to work?"
            },
            PromptType.LONG_TERM_VISION: {
                "system_prompt": "You are a career counselor.",
                "user_prompt": "Where do you see yourself in 5-10 years?"
            }
        }
        
        return fallback_prompts.get(prompt_type, {
            "system_prompt": "You are a helpful career counselor.",
            "user_prompt": "How can I help you with your career journey?"
        })
    
    def get_roadmap_generation_prompt(self, context: PromptContext) -> Dict[str, str]:
        """Get specific prompt for roadmap generation"""
        
        roadmap_prompt = self.prompts[PromptType.ROADMAP_GENERATION.value]
        
        # Format the template with all collected data
        user_prompt = roadmap_prompt["user_prompt_template"].format(
            interests_strengths=context.user_responses.get("interests_strengths", ""),
            preferred_field=context.user_responses.get("preferred_field", ""),
            values_motivation=context.user_responses.get("values_motivation", ""),
            work_style=context.user_responses.get("work_style", ""),
            long_term_vision=context.user_responses.get("long_term_vision", "")
        )
        
        return {
            "system_prompt": roadmap_prompt["system_prompt"],
            "user_prompt": user_prompt
        }
    
    def get_mentoring_prompt(self, context: PromptContext, user_message: str, conversation_history: List[str]) -> Dict[str, str]:
        """Get specific prompt for mentoring responses"""
        
        mentoring_prompt = self.prompts[PromptType.MENTORING.value]
        
        # Format conversation context
        conversation_context = "\n".join(conversation_history[-5:])  # Last 5 messages
        
        # Format the template
        user_prompt = mentoring_prompt["user_prompt_template"].format(
            roadmap_title=context.roadmap_title or "Career Development",
            field=context.field or "Your chosen field",
            conversation_context=conversation_context,
            user_message=user_message
        )
        
        return {
            "system_prompt": mentoring_prompt["system_prompt"],
            "user_prompt": user_prompt
        }
    
    def validate_roadmap_json(self, json_string: str) -> bool:
        """Validate if a JSON string matches the expected roadmap structure"""
        
        try:
            data = json.loads(json_string)
            
            # Check required fields
            required_fields = ["title", "description", "field", "milestones"]
            for field in required_fields:
                if field not in data:
                    return False
            
            # Check milestones structure
            if not isinstance(data["milestones"], list):
                return False
            
            for milestone in data["milestones"]:
                milestone_fields = ["title", "description", "estimated_duration", "skills", "resources"]
                for field in milestone_fields:
                    if field not in milestone:
                        return False
                
                # Check that skills and resources are lists
                if not isinstance(milestone["skills"], list) or not isinstance(milestone["resources"], list):
                    return False
            
            return True
            
        except json.JSONDecodeError:
            return False
    
    def extract_roadmap_data(self, json_string: str) -> Dict[str, Any]:
        """Extract and validate roadmap data from JSON string"""
        
        try:
            data = json.loads(json_string)
            
            # Ensure all required fields exist with defaults
            roadmap_data = {
                "title": data.get("title", "Career Development Plan"),
                "description": data.get("description", "A personalized career development plan"),
                "field": data.get("field", "General"),
                "milestones": []
            }
            
            # Process milestones
            milestones = data.get("milestones", [])
            for i, milestone in enumerate(milestones):
                processed_milestone = {
                    "title": milestone.get("title", f"Milestone {i+1}"),
                    "description": milestone.get("description", ""),
                    "estimated_duration": milestone.get("estimated_duration", "To be determined"),
                    "skills": milestone.get("skills", []),
                    "resources": milestone.get("resources", []),
                    "prerequisites": milestone.get("prerequisites", [])
                }
                roadmap_data["milestones"].append(processed_milestone)
            
            return roadmap_data
            
        except json.JSONDecodeError:
            return self._get_fallback_roadmap_data()
    
    def _get_fallback_roadmap_data(self) -> Dict[str, Any]:
        """Get fallback roadmap data when JSON parsing fails"""
        
        return {
            "title": "Career Development Plan",
            "description": "A personalized career development plan to help you achieve your goals",
            "field": "General",
            "milestones": [
                {
                    "title": "Foundation Building",
                    "description": "Build foundational knowledge and skills in your chosen field",
                    "estimated_duration": "3-6 months",
                    "skills": ["basic skills", "fundamental concepts"],
                    "resources": ["online courses", "books", "tutorials"],
                    "prerequisites": []
                },
                {
                    "title": "Skill Development",
                    "description": "Develop specialized skills and expertise",
                    "estimated_duration": "6-12 months",
                    "skills": ["specialized skills", "advanced techniques"],
                    "resources": ["advanced courses", "certifications", "practice projects"],
                    "prerequisites": ["Foundation Building"]
                },
                {
                    "title": "Professional Growth",
                    "description": "Build professional network and gain experience",
                    "estimated_duration": "6-12 months",
                    "skills": ["networking", "professional communication", "leadership"],
                    "resources": ["professional associations", "mentorship", "conferences"],
                    "prerequisites": ["Skill Development"]
                }
            ]
        }

# Global instance
prompt_service = PromptService() 
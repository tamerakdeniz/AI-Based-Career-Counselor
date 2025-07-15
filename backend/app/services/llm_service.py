import asyncio
import json
import logging
from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional, Tuple

import httpx
import openai
import tiktoken
from langdetect import detect
from sqlalchemy.orm import Session

# Import Google Gemini
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    logging.warning("Google Generative AI not available. Install with: pip install google-generativeai")

from app.core.config import settings
from app.models.chat_message import ChatMessage
from app.models.milestone import Milestone
from app.models.roadmap import Roadmap

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ConversationStage(Enum):
    """Enum for different stages of the career guidance conversation"""
    INTERESTS_STRENGTHS = "interests_strengths"
    PREFERRED_FIELD = "preferred_field"
    VALUES_MOTIVATION = "values_motivation"
    WORK_STYLE = "work_style"
    LONG_TERM_VISION = "long_term_vision"
    ROADMAP_GENERATION = "roadmap_generation"
    MENTORING = "mentoring"

@dataclass
class ConversationContext:
    """Data class to store conversation context"""
    stage: ConversationStage
    collected_data: Dict[str, Any]
    message_count: int
    last_updated: datetime

class LLMService:
    """Service for handling AI/LLM interactions for career guidance"""
    
    def __init__(self):
        self.gemini_model = None
        self.openai_client = None
        self.anthropic_client = None
        self.encoding = None
        self._initialize_clients()
        
    def _initialize_clients(self):
        """Initialize AI clients based on available API keys and priority"""
        
        # Initialize Google Gemini (Primary)
        if GEMINI_AVAILABLE and settings.google_ai_api_key:
            try:
                genai.configure(api_key=settings.google_ai_api_key)
                self.gemini_model = genai.GenerativeModel(settings.gemini_model)
                logger.info(f"Gemini client initialized with model: {settings.gemini_model}")
            except Exception as e:
                logger.error(f"Failed to initialize Gemini client: {e}")
                self.gemini_model = None
        
        # Initialize OpenAI (Fallback)
        if settings.openai_api_key:
            try:
                openai.api_key = settings.openai_api_key
                self.openai_client = openai.AsyncOpenAI(api_key=settings.openai_api_key)
                self.encoding = tiktoken.encoding_for_model(settings.openai_model)
                logger.info("OpenAI client initialized")
            except Exception as e:
                logger.error(f"Failed to initialize OpenAI client: {e}")
        
        # Initialize Anthropic (Fallback)
        if settings.anthropic_api_key:
            try:
                import anthropic
                self.anthropic_client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)
                logger.info("Anthropic client initialized")
            except ImportError:
                logger.warning("Anthropic not available, install with: pip install anthropic")
            except Exception as e:
                logger.error(f"Failed to initialize Anthropic client: {e}")

    async def generate_follow_up_question(
        self, 
        roadmap_id: int,
        user_message: str,
        db: Session
    ) -> Tuple[str, ConversationStage]:
        """Generate a follow-up question based on the current conversation stage"""
        
        # Get conversation context
        context = await self._get_conversation_context(roadmap_id, db)
        
        # Analyze user message and update context
        context = await self._analyze_user_message(user_message, context)
        
        # Generate appropriate follow-up question
        follow_up_question = await self._generate_stage_question(context)
        
        return follow_up_question, context.stage

    async def generate_career_roadmap(
        self, 
        roadmap_id: int,
        db: Session
    ) -> Dict[str, Any]:
        """Generate a complete career roadmap based on collected conversation data"""
        
        # Get all conversation context
        context = await self._get_conversation_context(roadmap_id, db)
        
        # Generate roadmap using AI
        roadmap_data = await self._generate_roadmap_from_context(context)
        
        return roadmap_data

    async def get_mentoring_response(
        self,
        roadmap_id: int,
        user_message: str,
        db: Session
    ) -> str:
        """Get AI mentoring response for ongoing conversations"""
        
        # Get roadmap and conversation history
        roadmap = db.query(Roadmap).filter(Roadmap.id == roadmap_id).first()
        if not roadmap:
            raise ValueError(f"Roadmap {roadmap_id} not found")
        
        # Get recent conversation history
        recent_messages = db.query(ChatMessage).filter(
            ChatMessage.roadmap_id == roadmap_id
        ).order_by(ChatMessage.timestamp.desc()).limit(settings.conversation_context_limit).all()
        
        # Generate mentoring response
        response = await self._generate_mentoring_response(
            roadmap, user_message, recent_messages
        )
        
        return response

    async def _get_conversation_context(
        self, 
        roadmap_id: int, 
        db: Session
    ) -> ConversationContext:
        """Get or create conversation context for a roadmap"""
        
        # Get all messages for this roadmap
        messages = db.query(ChatMessage).filter(
            ChatMessage.roadmap_id == roadmap_id
        ).order_by(ChatMessage.timestamp.asc()).all()
        
        # Determine current stage based on message count and content
        stage = self._determine_conversation_stage(messages)
        
        # Extract collected data from messages
        collected_data = await self._extract_collected_data(messages)
        
        return ConversationContext(
            stage=stage,
            collected_data=collected_data,
            message_count=len(messages),
            last_updated=datetime.utcnow()
        )

    def _determine_conversation_stage(self, messages: List[ChatMessage]) -> ConversationStage:
        """Determine current conversation stage based on message history"""
        
        user_messages = [msg for msg in messages if msg.type == 'user']
        
        # Stage progression based on user responses
        if len(user_messages) == 0:
            return ConversationStage.INTERESTS_STRENGTHS
        elif len(user_messages) == 1:
            return ConversationStage.PREFERRED_FIELD
        elif len(user_messages) == 2:
            return ConversationStage.VALUES_MOTIVATION
        elif len(user_messages) == 3:
            return ConversationStage.WORK_STYLE
        elif len(user_messages) == 4:
            return ConversationStage.LONG_TERM_VISION
        elif len(user_messages) == 5:
            return ConversationStage.ROADMAP_GENERATION
        else:
            return ConversationStage.MENTORING

    async def _extract_collected_data(self, messages: List[ChatMessage]) -> Dict[str, Any]:
        """Extract and structure collected data from conversation messages"""
        
        collected_data = {
            "interests_strengths": "",
            "preferred_field": "",
            "values_motivation": "",
            "work_style": "",
            "long_term_vision": "",
            "additional_context": []
        }
        
        user_messages = [msg for msg in messages if msg.type == 'user']
        
        # Map user responses to structured data
        if len(user_messages) > 0:
            collected_data["interests_strengths"] = user_messages[0].content
        if len(user_messages) > 1:
            collected_data["preferred_field"] = user_messages[1].content
        if len(user_messages) > 2:
            collected_data["values_motivation"] = user_messages[2].content
        if len(user_messages) > 3:
            collected_data["work_style"] = user_messages[3].content
        if len(user_messages) > 4:
            collected_data["long_term_vision"] = user_messages[4].content
        if len(user_messages) > 5:
            collected_data["additional_context"] = [msg.content for msg in user_messages[5:]]
        
        return collected_data

    async def _analyze_user_message(
        self, 
        user_message: str, 
        context: ConversationContext
    ) -> ConversationContext:
        """Analyze user message and update conversation context"""
        
        # Basic message validation
        if len(user_message.strip()) < 10:
            # Message too short, don't advance stage
            return context
        
        # Update context with new message
        context.message_count += 1
        context.last_updated = datetime.utcnow()
        
        return context

    async def _generate_stage_question(self, context: ConversationContext) -> str:
        """Generate appropriate question for current conversation stage"""
        
        stage_prompts = {
            ConversationStage.INTERESTS_STRENGTHS: self._get_interests_prompt(),
            ConversationStage.PREFERRED_FIELD: self._get_preferred_field_prompt(context),
            ConversationStage.VALUES_MOTIVATION: self._get_values_prompt(context),
            ConversationStage.WORK_STYLE: self._get_work_style_prompt(context),
            ConversationStage.LONG_TERM_VISION: self._get_long_term_vision_prompt(context),
            ConversationStage.ROADMAP_GENERATION: self._get_roadmap_generation_prompt(context),
            ConversationStage.MENTORING: self._get_mentoring_prompt(context)
        }
        
        prompt = stage_prompts.get(context.stage, self._get_default_prompt())
        
        # Generate response using AI
        response = await self._call_ai_service(prompt)
        
        return response

    def _get_interests_prompt(self) -> str:
        """Get prompt for interests and strengths stage"""
        return """You are a career counselor helping someone discover their ideal career path. 
        
        Start the conversation by asking about their interests and strengths. Ask in a warm, encouraging way:
        
        "Hi! I'm here to help you discover your ideal career path. Let's start by getting to know you better. 
        Can you tell me what subjects or activities you enjoy most and feel you excel at? 
        What makes you feel energized and engaged?"
        
        Keep your response conversational and supportive."""

    def _get_preferred_field_prompt(self, context: ConversationContext) -> str:
        """Get prompt for preferred field stage"""
        interests = context.collected_data.get("interests_strengths", "")
        
        return f"""Based on the user's interests and strengths: "{interests}"
        
        Now ask about their preferred field. Be encouraging and help them think broadly:
        
        "That's great to hear about your interests in {interests}! Now, if you could work in any field, 
        what would it be? Even if you're unsure, describe the type of work environment or impact you'd 
        like to have. Don't worry about being too specific - we're exploring possibilities!"
        
        Keep it conversational and supportive."""

    def _get_values_prompt(self, context: ConversationContext) -> str:
        """Get prompt for values and motivation stage"""
        field = context.collected_data.get("preferred_field", "")
        
        return f"""The user is interested in: "{field}"
        
        Now explore their values and motivations:
        
        "Excellent! I can see you're drawn to {field}. Now let's talk about what matters most to you 
        in a career. What values are important to you in your work? For example: creativity, security, 
        helping people, making a difference, continuous learning, work-life balance, leadership, 
        or something else entirely?"
        
        Be encouraging and help them think deeply about their motivations."""

    def _get_work_style_prompt(self, context: ConversationContext) -> str:
        """Get prompt for work style stage"""
        values = context.collected_data.get("values_motivation", "")
        
        return f"""The user values: "{values}"
        
        Now ask about their work style preferences:
        
        "I love that you value {values}! Now, let's talk about how you like to work. 
        Do you prefer remote work, being part of a team, solo deep work, or a mix of different styles? 
        What would your ideal workday look like? Are you someone who thrives on routine or variety?"
        
        Keep it engaging and help them visualize their ideal work environment."""

    def _get_long_term_vision_prompt(self, context: ConversationContext) -> str:
        """Get prompt for long-term vision stage"""
        work_style = context.collected_data.get("work_style", "")
        
        return f"""The user prefers: "{work_style}"
        
        Now explore their long-term vision:
        
        "Perfect! I can see you'd thrive in {work_style}. Now let's think about the bigger picture. 
        Where do you see yourself in 5-10 years? What achievements would make you proud? 
        What kind of impact do you want to have in your field or community?"
        
        Be inspiring and help them think ambitiously about their future."""

    def _get_roadmap_generation_prompt(self, context: ConversationContext) -> str:
        """Get prompt for roadmap generation stage"""
        return """Now that we've gathered all this information, let me create a personalized career roadmap for you!
        
        "Thank you for sharing all of that with me! I have a clear picture of your interests, goals, and 
        work style. Give me a moment to create a personalized career roadmap that will guide you toward 
        your ideal career. This roadmap will include specific milestones, skills to develop, and resources 
        to help you along the way."
        
        [The system will now generate a detailed roadmap based on all collected information]"""

    def _get_mentoring_prompt(self, context: ConversationContext) -> str:
        """Get prompt for ongoing mentoring stage"""
        return """Continue providing helpful career mentoring and guidance based on the user's established roadmap 
        and goals. Be supportive, specific, and actionable in your advice."""

    def _get_default_prompt(self) -> str:
        """Get default prompt for unexpected stages"""
        return """I'm here to help you with your career journey. How can I assist you today?"""

    async def _generate_roadmap_from_context(self, context: ConversationContext) -> Dict[str, Any]:
        """Generate a complete career roadmap based on collected conversation data"""
        
        prompt = f"""Based on the following career counseling conversation data, create a detailed career roadmap:

        Interests & Strengths: {context.collected_data.get('interests_strengths', '')}
        Preferred Field: {context.collected_data.get('preferred_field', '')}
        Values & Motivation: {context.collected_data.get('values_motivation', '')}
        Work Style: {context.collected_data.get('work_style', '')}
        Long-term Vision: {context.collected_data.get('long_term_vision', '')}

        Create a career roadmap with the following structure:
        
        1. Career Summary (title, description, field)
        2. 6-8 Milestones with:
           - Title
           - Description
           - Estimated timeline
           - Key skills to develop
           - Resources (courses, certifications, books)
           - Prerequisites
        
        The description should be a short, one-sentence summary of the roadmap's main objective.

        Format the response as a JSON object with this structure:
        {{
            "title": "Career path title",
            "description": "Brief description of the career path",
            "field": "Primary field/industry",
            "milestones": [
                {{
                    "title": "Milestone title",
                    "description": "Detailed description",
                    "estimated_duration": "Timeline estimate",
                    "skills": ["skill1", "skill2"],
                    "resources": ["resource1", "resource2"],
                    "prerequisites": ["prereq1", "prereq2"]
                }}
            ]
        }}
        
        Make it specific, actionable, and encouraging."""
        
        response = await self._call_ai_service(prompt)
        
        try:
            # Parse JSON response
            roadmap_data = json.loads(response)
            
            # Generate a summarized title
            title_prompt = f"Summarize the following career path title into two words: {roadmap_data['title']}"
            summarized_title = await self._call_ai_service(title_prompt)
            roadmap_data['summarized_title'] = summarized_title.strip()
            
            return roadmap_data
        except json.JSONDecodeError:
            # Fallback if AI doesn't return valid JSON
            return self._generate_fallback_roadmap(context)

    def _generate_fallback_roadmap(self, context: ConversationContext) -> Dict[str, Any]:
        """Generate a fallback roadmap if AI fails"""
        field = context.collected_data.get('preferred_field', 'Your chosen field')
        
        return {
            "title": f"Career Path in {field}",
            "description": f"A personalized roadmap for your career in {field}",
            "field": field,
            "milestones": [
                {
                    "title": "Foundation Building",
                    "description": "Build foundational knowledge and skills",
                    "estimated_duration": "3-6 months",
                    "skills": ["basic skills", "fundamental concepts"],
                    "resources": ["online courses", "books", "tutorials"],
                    "prerequisites": []
                },
                {
                    "title": "Skill Development",
                    "description": "Develop specialized skills",
                    "estimated_duration": "6-12 months",
                    "skills": ["specialized skills", "technical competencies"],
                    "resources": ["advanced courses", "certifications", "practice projects"],
                    "prerequisites": ["Foundation Building"]
                }
            ]
        }

    async def _generate_mentoring_response(
        self, 
        roadmap: Roadmap, 
        user_message: str, 
        recent_messages: List[ChatMessage]
    ) -> str:
        """Generate mentoring response for ongoing conversations"""
        
        # Build context from recent messages
        context = "\n".join([
            f"{'User' if msg.type == 'user' else 'AI'}: {msg.content}"
            for msg in reversed(recent_messages[-5:])
        ])
        
        prompt = f"""You are an AI career mentor helping someone with their career in {roadmap.field}.
        
        Roadmap: {roadmap.title}
        Description: {roadmap.description}
        
        Recent conversation:
        {context}
        
        User's current message: "{user_message}"
        
        Provide a helpful, encouraging, and specific response that:
        1. Addresses their question or concern
        2. Relates to their career roadmap
        3. Provides actionable advice
        4. Encourages continued progress
        
        Keep your response conversational and supportive."""
        
        response = await self._call_ai_service(prompt)
        return response

    async def _call_ai_service(self, prompt: str) -> str:
        """Call AI service with error handling and fallbacks"""
        
        # Try providers in order of priority
        for provider in settings.ai_provider_priority:
            try:
                if provider == "gemini" and self.gemini_model:
                    response = await self._call_gemini(prompt)
                    return response
                elif provider == "openai" and self.openai_client:
                    response = await self._call_openai(prompt)
                    return response
                elif provider == "anthropic" and self.anthropic_client:
                    response = await self._call_anthropic(prompt)
                    return response
            except Exception as e:
                logger.error(f"AI service error with {provider}: {str(e)}")
                continue
        
        # If all providers fail, return fallback
        return self._get_fallback_response(prompt)

    async def _call_gemini(self, prompt: str) -> str:
        """Call Google Gemini API"""
        try:
            # Configure generation settings
            generation_config = genai.types.GenerationConfig(
                max_output_tokens=settings.gemini_max_tokens,
                temperature=settings.gemini_temperature,
            )
            
            # Generate response
            response = await asyncio.to_thread(
                self.gemini_model.generate_content,
                prompt,
                generation_config=generation_config
            )
            
            try:
                return response.text
            except (ValueError, IndexError):
                # Handle cases where the response is empty or invalid
                logger.warning("Gemini API returned an empty or invalid response.")
                return ""
            
        except Exception as e:
            logger.error(f"Gemini API error: {str(e)}")
            raise

    async def _call_openai(self, prompt: str) -> str:
        """Call OpenAI API"""
        try:
            response = await self.openai_client.chat.completions.create(
                model=settings.openai_model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=settings.openai_max_tokens,
                temperature=settings.openai_temperature,
                timeout=settings.ai_timeout_seconds
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"OpenAI API error: {str(e)}")
            raise

    async def _call_anthropic(self, prompt: str) -> str:
        """Call Anthropic API"""
        try:
            response = await self.anthropic_client.messages.create(
                model=settings.anthropic_model,
                max_tokens=settings.openai_max_tokens,
                temperature=settings.openai_temperature,
                messages=[{"role": "user", "content": prompt}],
                timeout=settings.ai_timeout_seconds
            )
            return response.content[0].text
        except Exception as e:
            logger.error(f"Anthropic API error: {str(e)}")
            raise

    def _get_fallback_response(self, prompt: str) -> str:
        """Get fallback response when AI services are unavailable"""
        
        if "interests" in prompt.lower():
            return "Hi! I'm here to help you discover your ideal career path. Can you tell me what subjects or activities you enjoy most and feel you excel at? What makes you feel energized and engaged?"
        
        if "field" in prompt.lower():
            return "That's great to hear about your interests! Now, if you could work in any field, what would it be? Even if you're unsure, describe the type of impact you'd like to have."
        
        if "values" in prompt.lower():
            return "Excellent! Now let's talk about what matters most to you in a career. What values are important to you in your work? For example: creativity, security, helping people, etc."
        
        if "work style" in prompt.lower():
            return "I love that! Now, let's talk about how you like to work. Do you prefer remote work, teamwork, solo deep work, or something else? Describe your ideal workday."
        
        if "vision" in prompt.lower():
            return "Perfect! Now let's think about the bigger picture. Where do you see yourself in 5-10 years? What achievements would make you proud?"
        
        return "I'm here to help you with your career journey. Could you please share more about your goals and interests?"

    def count_tokens(self, text: str) -> int:
        """Count tokens in text for rate limiting"""
        try:
            if self.encoding:
                return len(self.encoding.encode(text))
            else:
                # Fallback to character count / 4 for Gemini
                return len(text) // 4
        except Exception:
            # Fallback to character count / 4
            return len(text) // 4

# Global instance
llm_service = LLMService()

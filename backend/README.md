# AI-Based Career Counselor Backend

This is the backend for the AI-Based Career Counselor project. It is built with FastAPI, SQLAlchemy, and SQLite, and provides a RESTful API for managing users, roadmaps, milestones, and chat messages.

## Features

- User registration and authentication (passwords are securely hashed)
- CRUD operations for users, roadmaps, milestones, and chat messages
- Relational database structure with SQLAlchemy ORM
- Sample data population and database initialization scripts
- Interactive API documentation via Swagger UI

## Project Structure

```text
backend/
├── app/
│   ├── api/                # API route definitions (auth, user, prompt, etc.)
│   ├── core/               # Security and configuration utilities
│   ├── models/             # SQLAlchemy ORM models (User, Roadmap, Milestone, ChatMessage)
│   ├── schemas/            # Pydantic schemas for request/response validation
│   ├── services/           # Business logic and service layer
│   ├── utils/              # Utility functions
│   ├── database.py         # Database connection and session management
│   ├── database_init.py    # Database initialization and sample data
│   └── main.py             # FastAPI application entry point
├── requirements.txt        # Python dependencies
├── DockerFile              # (Optional) Docker configuration
└── test_db.py              # Script to test database setup and sample data
```

## Database

- Uses SQLite (`mentor.db` by default) for local development.
- Models are defined in `app/models/` and include relationships between users, roadmaps, milestones, and chat messages.
- Database tables are created automatically on startup.

### Database Structure

The main tables and their relationships:

- **User**: Represents a user. Fields: `id`, `name`, `email`, `avatar_url`, `hashed_password`, `joined_at`.
  - One user can have multiple roadmaps.
- **Roadmap**: Represents a career roadmap. Fields: `id`, `user_id`, `title`, `description`, `field`, `progress`, `next_milestone`, `total_milestones`, `completed_milestones`, `estimated_time_to_complete`, `created_at`.
  - Each roadmap belongs to a user.
  - Each roadmap can have multiple milestones and chat messages.
- **Milestone**: Represents a step in a roadmap. Fields: `id`, `roadmap_id`, `title`, `description`, `completed`, `due_date`, `resources`.
  - Each milestone belongs to a roadmap.
- **ChatMessage**: Represents a message in the chat between user and AI mentor. Fields: `id`, `roadmap_id`, `user_id`, `type`, `content`, `timestamp`.
  - Each chat message is linked to a roadmap and a user.

The relationships are managed using SQLAlchemy's `relationship` and `ForeignKey` features, ensuring referential integrity and easy querying.

## Running the Backend

1. **Install dependencies:**

   ```sh
   pip install -r requirements.txt
   ```

2. **Start the FastAPI server:**

   ```sh
   uvicorn app.main:app --reload
   ```

3. **Access the API docs:**
   - Open [http://localhost:8000/docs](http://localhost:8000/docs) for interactive Swagger UI.

## Database Initialization & Testing

- To initialize the database with sample data, run:

  ```sh
  python app/database_init.py
  ```

- To test the database and see sample output, run:

  ```sh
  python test_db.py
  ```

## API Endpoints

- **User endpoints:** Register, list, retrieve, update, and delete users
- **Roadmap endpoints:** CRUD for roadmaps (per user)
- **Milestone endpoints:** CRUD for milestones (per roadmap)
- **Chat endpoints:** CRUD for chat messages (per roadmap/user)

See the `/docs` endpoint for full API details and to try out requests interactively.

## Security

- Passwords are hashed using bcrypt via Passlib.
- Sensitive fields (like hashed passwords) are never returned in API responses.

## Development Notes

- All database models and schemas are designed to match the frontend mock data structure.
- The backend is modular and ready for extension (e.g., adding authentication, more endpoints, or switching to PostgreSQL).

---

For any questions or contributions, please refer to the project documentation or contact the maintainers.

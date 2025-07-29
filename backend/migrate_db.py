"""
Database migration script to add completed_at column to milestones table
Run this script to update the database schema
"""

import sqlite3
from datetime import datetime
import os

def migrate_database():
    """Add completed_at column to milestones table"""
    
    # Path to the database file
    db_path = os.path.join(os.path.dirname(__file__), 'mentor.db')
    
    try:
        # Connect to the database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if the column already exists
        cursor.execute("PRAGMA table_info(milestones)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'completed_at' not in columns:
            print("Adding completed_at column to milestones table...")
            
            # Add the new column
            cursor.execute("""
                ALTER TABLE milestones 
                ADD COLUMN completed_at DATETIME
            """)
            
            # Update existing completed milestones with a timestamp
            # Set completed_at to current time for already completed milestones
            cursor.execute("""
                UPDATE milestones 
                SET completed_at = datetime('now') 
                WHERE completed = 1 AND completed_at IS NULL
            """)
            
            conn.commit()
            print("Migration completed successfully!")
            
            # Show some statistics
            cursor.execute("SELECT COUNT(*) FROM milestones WHERE completed = 1")
            completed_count = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM milestones WHERE completed_at IS NOT NULL")
            timestamped_count = cursor.fetchone()[0]
            
            print(f"Completed milestones: {completed_count}")
            print(f"Milestones with timestamps: {timestamped_count}")
            
        else:
            print("Column 'completed_at' already exists in milestones table.")
            
        conn.close()
        
    except sqlite3.Error as e:
        print(f"Database error: {e}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    migrate_database()

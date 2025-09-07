# PostgreSQL Database Configuration for Persistent Storage
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy import Column, String, Integer, Float, DateTime, Text, Boolean
from datetime import datetime
import asyncio
import json
from typing import Optional

# Database URL - uses PostgreSQL on Render.com or fallback to SQLite for local development
DATABASE_URL = os.environ.get(
    "DATABASE_URL", 
    "sqlite+aiosqlite:///./test.db"
).replace("postgres://", "postgresql+asyncpg://")  # Fix for Render.com PostgreSQL URLs

# Create async engine
engine = create_async_engine(
    DATABASE_URL,
    echo=True if os.environ.get("DEBUG") == "true" else False
)

# Create async session
async_session = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

# Base class for all models
Base = declarative_base()

# Employee Model
class Employee(Base):
    __tablename__ = "employees"
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String)
    position = Column(String)
    department = Column(String)
    role = Column(String, default="employee")
    start_date = Column(String)
    vacation_days_per_year = Column(Float, default=25.0)
    vacation_days_used = Column(Float, default=0.0)
    vacation_days_remaining = Column(Float, default=25.0)
    sick_days_used = Column(Float, default=0.0)
    skills_json = Column(Text, default="[]")  # JSON string for skills array
    personality_traits = Column(Text, default="")
    created_date = Column(String, default=lambda: datetime.now().isoformat())

# Vacation Model
class Vacation(Base):
    __tablename__ = "vacations"
    
    id = Column(String, primary_key=True)
    employee_id = Column(String, nullable=False)
    employee_name = Column(String, nullable=False)
    vacation_type = Column(String, nullable=False)  # URLAUB, KRANKHEIT, SONDERURLAUB
    start_date = Column(String, nullable=False)
    end_date = Column(String, nullable=False)
    days_count = Column(Integer, nullable=False)
    status = Column(String, default="genehmigt")
    notes = Column(Text, default="")
    description = Column(Text, default="")
    created_date = Column(String, default=lambda: datetime.now().isoformat())

# Login Model
class Login(Base):
    __tablename__ = "logins"
    
    username = Column(String, primary_key=True)
    password = Column(String, nullable=False)
    role = Column(String, default="user")
    created_date = Column(String, default=lambda: datetime.now().isoformat())

# Database initialization
async def create_tables():
    """Create all tables if they don't exist"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def get_session():
    """Get database session"""
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()

# Default data for initialization
DEFAULT_EMPLOYEES = [
    {
        "id": "1",
        "name": "Alexander Knoll",
        "email": "alexander@express-logistik.com",
        "position": "Geschäftsführer",
        "department": "Management",
        "role": "admin",
        "start_date": "2020-01-01",
        "vacation_days_per_year": 30.0,
        "vacation_days_used": 0.0,
        "vacation_days_remaining": 30.0,
        "sick_days_used": 0.0,
        "skills_json": json.dumps([
            {"name": "Leadership", "level": 5},
            {"name": "Strategy", "level": 5},
            {"name": "Business Development", "level": 5}
        ]),
        "personality_traits": "Führungsstark, strategisch denkend, innovativ",
        "created_date": "2024-01-01T00:00:00Z"
    },
    {
        "id": "2", 
        "name": "Maria Schmidt",
        "email": "maria@express-logistik.com",
        "position": "HR Manager",
        "department": "Human Resources",
        "role": "manager",
        "start_date": "2021-03-15",
        "vacation_days_per_year": 28.0,
        "vacation_days_used": 5.0,
        "vacation_days_remaining": 23.0,
        "sick_days_used": 2.0,
        "skills_json": json.dumps([
            {"name": "HR Management", "level": 5},
            {"name": "Recruiting", "level": 4},
            {"name": "Employee Relations", "level": 5}
        ]),
        "personality_traits": "Empathisch, organisiert, kommunikativ",
        "created_date": "2024-01-01T00:00:00Z"
    },
    {
        "id": "3",
        "name": "Thomas Weber", 
        "email": "thomas@express-logistik.com",
        "position": "Logistikleiter",
        "department": "Logistics",
        "role": "manager",
        "start_date": "2019-06-01",
        "vacation_days_per_year": 27.0,
        "vacation_days_used": 12.0,
        "vacation_days_remaining": 15.0, 
        "sick_days_used": 3.0,
        "skills_json": json.dumps([
            {"name": "Logistics Planning", "level": 5},
            {"name": "Supply Chain", "level": 4},
            {"name": "Team Management", "level": 4}
        ]),
        "personality_traits": "Strukturiert, zuverlässig, analytisch",
        "created_date": "2024-01-01T00:00:00Z"
    }
]

DEFAULT_LOGINS = {
    "admin": {"password": "admin123", "role": "admin"},
    "logistik": {"password": "logistik123", "role": "user"},
    "manager": {"password": "manager123", "role": "user"},
    "hr": {"password": "hr123", "role": "user"},
    "gerhard": {"password": "gerhard123", "role": "user"},
    "express": {"password": "express123", "role": "user"}
}

async def initialize_default_data():
    """Initialize database with default data if empty"""
    async with async_session() as session:
        try:
            # Check if employees exist
            from sqlalchemy import select
            result = await session.execute(select(Employee))
            existing_employees = result.scalars().all()
            
            if not existing_employees:
                # Add default employees
                for emp_data in DEFAULT_EMPLOYEES:
                    employee = Employee(**emp_data)
                    session.add(employee)
                
                print(f"✅ Initialized {len(DEFAULT_EMPLOYEES)} default employees")
            
            # Check if logins exist  
            result = await session.execute(select(Login))
            existing_logins = result.scalars().all()
            
            if not existing_logins:
                # Add default logins
                for username, data in DEFAULT_LOGINS.items():
                    login = Login(
                        username=username,
                        password=data["password"],
                        role=data["role"]
                    )
                    session.add(login)
                
                print(f"✅ Initialized {len(DEFAULT_LOGINS)} default login accounts")
            
            await session.commit()
            
        except Exception as e:
            print(f"❌ Error initializing default data: {e}")
            await session.rollback()
            raise
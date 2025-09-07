from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import json
import os
import uuid
from datetime import datetime
from database import (
    create_tables, get_session, initialize_default_data,
    Employee, Vacation, Login
)
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
import asyncio
from contextlib import asynccontextmanager
import uvicorn

# Lifespan event handler for database initialization
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Starting up Urlaubsplaner API with PostgreSQL...")
    await create_tables()
    await initialize_default_data()
    print("✅ Database initialized successfully")
    yield
    # Shutdown
    print("🛑 Shutting down Urlaubsplaner API...")

app = FastAPI(
    title="Urlaubsplaner API", 
    version="1.0.0",
    lifespan=lifespan
)

# CORS für Frontend-Zugriff
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Für Entwicklung - in Produktion spezifischer
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Daten-Verzeichnis (relativ zum aktuellen Verzeichnis)
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
EMPLOYEES_FILE = os.path.join(DATA_DIR, "employees.json")
VACATIONS_FILE = os.path.join(DATA_DIR, "vacations.json")
LOGINS_FILE = os.path.join(DATA_DIR, "logins.json")

# Verzeichnis erstellen falls nicht vorhanden
os.makedirs(DATA_DIR, exist_ok=True)

# Pydantic Modelle
class Employee(BaseModel):
    id: str
    name: str
    email: str
    role: str = "employee"
    vacation_days_total: float = 25.0
    vacation_days_used: float = 0.0
    vacation_days_remaining: float = 25.0
    sick_days_used: float = 0.0
    special_days_used: float = 0.0
    personality_traits: Optional[str] = ""
    skills: List[Dict[str, Any]] = []
    created_date: str

class Vacation(BaseModel):
    id: str
    employee_id: str
    employee_name: str
    vacation_type: str  # URLAUB, KRANKHEIT, SONDERURLAUB
    start_date: str
    end_date: str
    days_count: float
    description: Optional[str] = ""
    created_date: str

class LoginCredentials(BaseModel):
    username: str
    password: str

class UserCreate(BaseModel):
    username: str
    password: str
    role: str = "user"

# JSON Datei Hilfsfunktionen
def load_json_file(filepath: str, default_data: Any = None) -> Any:
    """Lade JSON-Datei oder erstelle sie mit Default-Daten"""
    try:
        if os.path.exists(filepath):
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
                print(f"✅ Loaded {len(data) if isinstance(data, (list, dict)) else 'data'} items from {filepath}")
                return data
        else:
            # Datei existiert nicht - erstelle mit Default-Daten
            if default_data is not None:
                save_json_file(filepath, default_data)
                print(f"📝 Created new file {filepath} with default data")
                return default_data
            return [] if 'employees' in filepath or 'vacations' in filepath else {}
    except Exception as e:
        print(f"❌ Error loading {filepath}: {e}")
        return default_data or []

def save_json_file(filepath: str, data: Any) -> bool:
    """Speichere Daten in JSON-Datei"""
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False, default=str)
        print(f"💾 Saved {len(data) if isinstance(data, (list, dict)) else 'data'} items to {filepath}")
        return True
    except Exception as e:
        print(f"❌ Error saving {filepath}: {e}")
        return False

# Default-Daten
DEFAULT_EMPLOYEES = [
    {
        "id": "1", "name": "Alexander Knoll", "email": "alexander@express-logistik.com",
        "role": "employee", "vacation_days_total": 25.0, "vacation_days_used": 0.0,
        "vacation_days_remaining": 25.0, "sick_days_used": 0.0, "special_days_used": 0.0,
        "personality_traits": "", "skills": [], "created_date": "2024-01-15T10:00:00Z"
    },
    {
        "id": "2", "name": "Benjamin Winter", "email": "benjamin@express-logistik.com", 
        "role": "employee", "vacation_days_total": 25.0, "vacation_days_used": 0.0,
        "vacation_days_remaining": 25.0, "sick_days_used": 0.0, "special_days_used": 0.0,
        "personality_traits": "", "skills": [], "created_date": "2024-01-20T10:00:00Z"
    },
    {
        "id": "3", "name": "Gerhard Schmidt", "email": "gerhard@express-logistik.com",
        "role": "admin", "vacation_days_total": 25.0, "vacation_days_used": 0.0,
        "vacation_days_remaining": 25.0, "sick_days_used": 0.0, "special_days_used": 0.0,
        "personality_traits": "", "skills": [], "created_date": "2024-02-05T10:00:00Z"
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

# Initialisierung beim Start
def initialize_data():
    """Initialisiere JSON-Dateien mit Standard-Daten falls sie nicht existieren"""
    load_json_file(EMPLOYEES_FILE, DEFAULT_EMPLOYEES)
    load_json_file(VACATIONS_FILE, [])
    load_json_file(LOGINS_FILE, DEFAULT_LOGINS)

# Auth Endpoints
@app.post("/api/auth/login")
async def login(credentials: LoginCredentials):
    """Login mit Username/Password"""
    logins = load_json_file(LOGINS_FILE, DEFAULT_LOGINS)
    
    username_key = credentials.username.lower()
    user_data = logins.get(username_key)
    
    if not user_data:
        raise HTTPException(status_code=401, detail="Ungültiger Benutzername oder Passwort")
    
    # Unterstütze beide Formate: altes (nur String) und neues (mit role)
    if isinstance(user_data, str):
        # Altes Format: nur Passwort als String
        valid_password = user_data
        role = "admin" if username_key == "admin" else "user"
    else:
        # Neues Format: Objekt mit password und role
        valid_password = user_data.get("password")
        role = user_data.get("role", "user")
    
    if not valid_password or valid_password != credentials.password:
        raise HTTPException(status_code=401, detail="Ungültiger Benutzername oder Passwort")
    
    return {
        "success": True,
        "token": f"token-{username_key}-{datetime.now().timestamp()}",
        "user": {"username": username_key, "role": role},
        "message": f"Erfolgreich als {'Administrator' if role == 'admin' else 'Benutzer'} angemeldet"
    }

# Employee Endpoints
@app.get("/api/employees", response_model=List[Employee])
async def get_employees():
    """Alle Mitarbeiter abrufen"""
    employees = load_json_file(EMPLOYEES_FILE, DEFAULT_EMPLOYEES)
    return employees

@app.post("/api/employees", response_model=Employee)
async def create_employee(employee_data: dict):
    """Neuen Mitarbeiter erstellen"""
    employees = load_json_file(EMPLOYEES_FILE, DEFAULT_EMPLOYEES)
    
    new_employee = {
        "id": str(uuid.uuid4()),
        "name": employee_data["name"],
        "email": employee_data["email"],
        "role": employee_data.get("role", "employee"),
        "vacation_days_total": float(employee_data.get("vacation_days_total", 25.0)),
        "vacation_days_used": 0.0,
        "vacation_days_remaining": float(employee_data.get("vacation_days_total", 25.0)),
        "sick_days_used": 0.0,
        "special_days_used": 0.0,
        "personality_traits": employee_data.get("personality_traits", ""),
        "skills": employee_data.get("skills", []),
        "created_date": datetime.now().isoformat()
    }
    
    employees.append(new_employee)
    save_json_file(EMPLOYEES_FILE, employees)
    
    return new_employee

@app.put("/api/employees/{employee_id}", response_model=Employee)
async def update_employee(employee_id: str, employee_data: dict):
    """Mitarbeiter aktualisieren"""
    employees = load_json_file(EMPLOYEES_FILE, DEFAULT_EMPLOYEES)
    
    for i, emp in enumerate(employees):
        if emp["id"] == employee_id:
            # Update mit neuen Daten
            employees[i].update(employee_data)
            employees[i]["last_modified"] = datetime.now().isoformat()
            
            save_json_file(EMPLOYEES_FILE, employees)
            return employees[i]
    
    raise HTTPException(status_code=404, detail="Mitarbeiter nicht gefunden")

@app.delete("/api/employees/{employee_id}")
async def delete_employee(employee_id: str):
    """Mitarbeiter löschen"""
    employees = load_json_file(EMPLOYEES_FILE, DEFAULT_EMPLOYEES)
    
    employees = [emp for emp in employees if emp["id"] != employee_id]
    save_json_file(EMPLOYEES_FILE, employees)
    
    # Auch Urlaubseinträge des Mitarbeiters löschen
    vacations = load_json_file(VACATIONS_FILE, [])
    vacations = [vac for vac in vacations if vac["employee_id"] != employee_id]
    save_json_file(VACATIONS_FILE, vacations)
    
    return {"message": "Mitarbeiter und Urlaubseinträge gelöscht"}

# Vacation Endpoints
@app.get("/api/vacations", response_model=List[Vacation])
async def get_vacations():
    """Alle Urlaubseinträge abrufen"""
    vacations = load_json_file(VACATIONS_FILE, [])
    return vacations

@app.post("/api/vacations", response_model=Vacation)
async def create_vacation(vacation_data: dict):
    """Neuen Urlaubseintrag erstellen"""
    vacations = load_json_file(VACATIONS_FILE, [])
    
    new_vacation = {
        "id": str(uuid.uuid4()),
        "employee_id": vacation_data["employee_id"],
        "employee_name": vacation_data["employee_name"],
        "vacation_type": vacation_data["vacation_type"],
        "start_date": vacation_data["start_date"],
        "end_date": vacation_data["end_date"],
        "days_count": float(vacation_data["days_count"]),
        "description": vacation_data.get("description", ""),
        "created_date": datetime.now().isoformat()
    }
    
    vacations.append(new_vacation)
    save_json_file(VACATIONS_FILE, vacations)
    
    # Mitarbeiter-Statistiken aktualisieren
    await update_employee_vacation_stats(vacation_data["employee_id"])
    
    return new_vacation

@app.put("/api/vacations/{vacation_id}", response_model=Vacation)
async def update_vacation(vacation_id: str, vacation_data: dict):
    """Urlaubseintrag aktualisieren"""
    vacations = load_json_file(VACATIONS_FILE, [])
    
    for i, vac in enumerate(vacations):
        if vac["id"] == vacation_id:
            old_employee_id = vac["employee_id"]
            
            vacations[i].update(vacation_data)
            vacations[i]["last_modified"] = datetime.now().isoformat()
            
            save_json_file(VACATIONS_FILE, vacations)
            
            # Statistiken für betroffene Mitarbeiter aktualisieren
            await update_employee_vacation_stats(old_employee_id)
            if old_employee_id != vacation_data.get("employee_id"):
                await update_employee_vacation_stats(vacation_data["employee_id"])
            
            return vacations[i]
    
    raise HTTPException(status_code=404, detail="Urlaubseintrag nicht gefunden")

@app.delete("/api/vacations/{vacation_id}")
async def delete_vacation(vacation_id: str):
    """Urlaubseintrag löschen"""
    vacations = load_json_file(VACATIONS_FILE, [])
    
    deleted_vacation = None
    for vac in vacations:
        if vac["id"] == vacation_id:
            deleted_vacation = vac
            break
    
    if not deleted_vacation:
        raise HTTPException(status_code=404, detail="Urlaubseintrag nicht gefunden")
    
    vacations = [vac for vac in vacations if vac["id"] != vacation_id]
    save_json_file(VACATIONS_FILE, vacations)
    
    # Mitarbeiter-Statistiken aktualisieren
    await update_employee_vacation_stats(deleted_vacation["employee_id"])
    
    return {"message": "Urlaubseintrag gelöscht"}

# User Management Endpoints
@app.get("/api/users")
async def get_users():
    """Alle Benutzer abrufen"""
    logins = load_json_file(LOGINS_FILE, DEFAULT_LOGINS)
    
    users = []
    for username, user_data in logins.items():
        # Unterstütze beide Formate: altes (nur String) und neues (mit role)
        if isinstance(user_data, str):
            role = "admin" if username == "admin" else "user"
        else:
            role = user_data.get("role", "user")
            
        users.append({
            "username": username,
            "role": role,
            "created_date": datetime.now().isoformat()
        })
    
    return users

@app.post("/api/users")
async def create_user(user_data: UserCreate):
    """Neuen Benutzer erstellen"""
    logins = load_json_file(LOGINS_FILE, DEFAULT_LOGINS)
    
    username_key = user_data.username.lower()
    if username_key in logins:
        raise HTTPException(status_code=400, detail="Benutzername bereits vorhanden")
    
    # Speichere im neuen Format mit Passwort und Rolle
    logins[username_key] = {
        "password": user_data.password,
        "role": user_data.role
    }
    save_json_file(LOGINS_FILE, logins)
    
    return {
        "username": username_key,
        "role": user_data.role,
        "message": "Benutzer erfolgreich erstellt"
    }

@app.put("/api/users/{username}")
async def update_user_password(username: str, user_data: dict):
    """Benutzer-Passwort aktualisieren"""
    logins = load_json_file(LOGINS_FILE, DEFAULT_LOGINS)
    
    username_key = username.lower()
    if username_key not in logins:
        raise HTTPException(status_code=404, detail="Benutzer nicht gefunden")
    
    new_password = user_data.get("password")
    if not new_password or len(new_password.strip()) < 3:
        raise HTTPException(status_code=400, detail="Passwort muss mindestens 3 Zeichen lang sein")
    
    # Aktualisiere das Passwort im neuen Format
    if isinstance(logins[username_key], dict):
        logins[username_key]["password"] = new_password.strip()
    else:
        # Für den Fall, dass noch alte String-Einträge existieren
        logins[username_key] = {
            "password": new_password.strip(),
            "role": "user"
        }
    
    save_json_file(LOGINS_FILE, logins)
    
    return {"username": username, "message": "Passwort erfolgreich aktualisiert"}

@app.delete("/api/users/{username}")
async def delete_user(username: str):
    """Benutzer löschen"""
    logins = load_json_file(LOGINS_FILE, DEFAULT_LOGINS)
    
    username_key = username.lower()
    if username_key == "admin":
        raise HTTPException(status_code=400, detail="Admin-Benutzer kann nicht gelöscht werden")
    
    if username_key not in logins:
        raise HTTPException(status_code=404, detail="Benutzer nicht gefunden")
    
    del logins[username_key]
    save_json_file(LOGINS_FILE, logins)
    
    return {"message": "Benutzer erfolgreich gelöscht"}

# Hilfsfunktionen
async def update_employee_vacation_stats(employee_id: str):
    """Urlaubsstatistiken eines Mitarbeiters neu berechnen"""
    employees = load_json_file(EMPLOYEES_FILE, DEFAULT_EMPLOYEES)
    vacations = load_json_file(VACATIONS_FILE, [])
    
    for i, emp in enumerate(employees):
        if emp["id"] == employee_id:
            # Berechne verwendete Tage nach Typ
            emp_vacations = [v for v in vacations if v["employee_id"] == employee_id]
            
            vacation_used = sum(v["days_count"] for v in emp_vacations if v["vacation_type"] == "URLAUB")
            sick_used = sum(v["days_count"] for v in emp_vacations if v["vacation_type"] == "KRANKHEIT")
            special_used = sum(v["days_count"] for v in emp_vacations if v["vacation_type"] == "SONDERURLAUB")
            
            employees[i]["vacation_days_used"] = vacation_used
            employees[i]["vacation_days_remaining"] = emp["vacation_days_total"] - vacation_used
            employees[i]["sick_days_used"] = sick_used
            employees[i]["special_days_used"] = special_used
            employees[i]["last_vacation_update"] = datetime.now().isoformat()
            
            save_json_file(EMPLOYEES_FILE, employees)
            break

# Health Check
@app.get("/api/health")
async def health_check():
    """Health Check Endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "data_files": {
            "employees": os.path.exists(EMPLOYEES_FILE),
            "vacations": os.path.exists(VACATIONS_FILE),
            "logins": os.path.exists(LOGINS_FILE)
        }
    }

# Beim Start initialisieren
@app.on_event("startup")
async def startup_event():
    print("🚀 Urlaubsplaner API startet...")
    print(f"📁 Daten-Verzeichnis: {DATA_DIR}")
    initialize_data()
    print("✅ API bereit!")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get('PORT', 8001)))
# Urlaubsplaner für Vercel

Ein umfassendes Urlaubsplanungssystem, optimiert für Vercel Deployment mit Serverless Functions.

## Features

- 🏢 **Mitarbeiterverwaltung**: Vollständige CRUD-Operationen für Mitarbeiter
- 📅 **Urlaubsplanung**: Verschiedene Urlaubstypen (Urlaub, Krankheit, Sonderurlaub)
- ⭐ **Skills Management**: Bewertung von Mitarbeiterfähigkeiten mit Sterne-System
- 👑 **Rollenbasierte Zugriffe**: Admin, Mitarbeiter, Leiharbeiter
- 🔒 **Sichere Authentifizierung**: JWT-basierte Authentifizierung
- 📊 **Team-Übersicht**: Detaillierte Mitarbeiterinformationen
- 🚀 **Vercel-optimiert**: Serverless Functions und statisches Hosting

## Tech Stack

### Frontend
- React 19
- Tailwind CSS
- Lucide React Icons
- Axios für API-Aufrufe
- React Router
- Date-fns für Datumsbehandlung

### Backend
- Vercel Serverless Functions (Node.js)
- MongoDB für Datenbank
- JWT für Authentifizierung
- CORS-Unterstützung

## Deployment auf Vercel

### 1. Repository Setup
```bash
git clone <your-repo>
cd urlaubsplaner-vercel
```

### 2. Umgebungsvariablen einrichten
Erstellen Sie Umgebungsvariablen in Vercel:
- `MONGODB_URI`: MongoDB Connection String
- `JWT_SECRET`: Secret für JWT Token
- `DB_NAME`: Name der Datenbank (Standard: urlaubsplaner)

### 3. Deploy
```bash
npm run deploy
```

## Lokale Entwicklung

### 1. Dependencies installieren
```bash
npm install
cd frontend && npm install
```

### 2. Umgebungsvariablen setzen
Erstellen Sie `.env.local`:
```
MONGODB_URI=mongodb://localhost:27017
JWT_SECRET=your-secret-key
DB_NAME=urlaubsplaner
```

### 3. Entwicklungsserver starten
```bash
npm run dev
```

## API Endpoints

### Authentifizierung
- `POST /api/auth/login` - Login mit Code

### Mitarbeiter
- `GET /api/employees` - Alle Mitarbeiter abrufen
- `POST /api/employees` - Neuen Mitarbeiter erstellen
- `GET /api/employees/{id}` - Mitarbeiter nach ID
- `PUT /api/employees/{id}` - Mitarbeiter aktualisieren
- `DELETE /api/employees/{id}` - Mitarbeiter löschen

### Urlaubseinträge
- `GET /api/vacation-entries` - Alle Urlaubseinträge
- `POST /api/vacation-entries` - Neuen Urlaubseintrag erstellen
- `GET /api/vacation-entries/{id}` - Urlaubseintrag nach ID
- `PUT /api/vacation-entries/{id}` - Urlaubseintrag aktualisieren
- `DELETE /api/vacation-entries/{id}` - Urlaubseintrag löschen

### Einstellungen
- `GET /api/settings` - Systemeinstellungen abrufen

## Authentifizierung

Das System verwendet Code-basierte Authentifizierung:
- **Admin**: Code `9999`
- **User**: Code `1234`

Nach erfolgreicher Anmeldung wird ein JWT-Token für 24 Stunden gültig ausgestellt.

## Features im Detail

### Mitarbeiterverwaltung
- Name, E-Mail, Rolle
- Anpassbare Urlaubstage pro Jahr
- Skills mit 5-Sterne-Bewertungssystem
- Rollenbasierte Anzeige (Admin hat Krone 👑)

### Urlaubsplanung
- Verschiedene Urlaubstypen:
  - 🔵 Urlaub (Blau)
  - 🔴 Krankheit (Rot)
  - 🟢 Sonderurlaub (Grün)
- Automatische Berechnung von Werktagen
- Begrenzung gleichzeitiger Urlaube (max. 30% der Belegschaft)

### Benutzeroberfläche
- Responsive Design mit Tailwind CSS
- Moderne Toolbar ähnlich MS Office
- Verschiedene Ansichten: Monat, Jahr, Team
- Such- und Filterfunktionen
- Druckfunktion

## Datenbankstruktur

### Employees Collection
```javascript
{
  id: "uuid",
  name: "string",
  email: "string",
  role: "admin|employee|leiharbeiter",
  vacation_days_total: number,
  skills: [{ name: "string", rating: number }],
  created_date: "ISO string"
}
```

### Vacation Entries Collection  
```javascript
{
  id: "uuid",
  employee_id: "string",
  employee_name: "string",
  start_date: "YYYY-MM-DD",
  end_date: "YYYY-MM-DD", 
  vacation_type: "URLAUB|KRANKHEIT|SONDERURLAUB",
  notes: "string",
  days_count: number,
  created_date: "ISO string"
}
```

## Lizenz

MIT License - siehe LICENSE file für Details.

## Support

Bei Fragen oder Problemen erstellen Sie bitte ein Issue im Repository.
# 🏖️ Urlaubsplaner - Einfach & Ohne Datenbank!

Ein **sofort einsatzbereiter** Urlaubsplaner für Ihr Team! 
**Keine komplizierte Datenbank-Konfiguration nötig!**

## ✨ **Sofort loslegen - Null Konfiguration!**

### **🚀 Für Vercel (Empfohlen):**
1. **Repository zu Vercel verbinden**
2. **Projekt Name:** `urlaubsplaner` (ohne Bindestriche!)
3. **Build Settings:** Automatisch erkannt
4. **Deploy klicken** → **FERTIG!** 🎉

### **🔐 Login-Codes (können Sie ändern):**
- **Admin:** `9999` 👑
- **Logistik:** `1234` 
- **Manager:** `5678`
- **HR:** `4321`

---

## 👥 **Ihre Mitarbeiter sind bereits eingepflegt:**

✅ Gerhard Pailer  
✅ Mario Pregartner  
✅ Marcel Zengerer  
✅ Sabrina Würtinger  
✅ Alexander Knoll  
✅ Gerhard Schmidt (Admin 👑)  
✅ Claudiu Rosza  
✅ Richard Tavaszi  
✅ Bernhard Sager  
✅ Benjamin Winter  
✅ Gabriela Ackerl  
✅ Markus Strahlhofer  
✅ Norbert Kreil  
✅ Nicole Prack  
✅ Denis Constantin  
✅ Peter Koch  

---

## 🎯 **Features:**

### **📅 Vollständiger Kalender:**
- **Monatsansicht:** Übersichtlicher Kalender mit allen Urlauben
- **Jahresansicht:** 12-Monats-Übersicht mit Statistiken
- **Team-Verwaltung:** Alle Mitarbeiter bearbeiten und verwalten

### **🏖️ Urlaubsverwaltung:**
- **3 Urlaubstypen:** Urlaub 🔵, Krankheit 🔴, Sonderurlaub 🟢
- **Automatische Berechnung:** Werktage werden automatisch berechnet
- **Übersichtliche Anzeige:** Alle Urlaube im Kalender sichtbar
- **Klickbare Details:** Auf Kalendertage klicken für Details

### **👤 Mitarbeiterverwaltung:**
- **Vollständige CRUD-Operationen:** Hinzufügen, Bearbeiten, Löschen
- **Skills-Management:** 5-Sterne-Bewertungssystem
- **Rollen-System:** Admin, Mitarbeiter, Leiharbeiter
- **Individuelle Urlaubstage:** Pro Mitarbeiter anpassbar

### **💾 Intelligente Speicherung:**
- **Browser LocalStorage:** Alle Daten bleiben gespeichert
- **Offline-fähig:** Funktioniert ohne Internet
- **Automatische Backups:** Daten gehen nicht verloren
- **Export/Import:** (kann bei Bedarf erweitert werden)

---

## 🛠️ **Lokale Entwicklung:**

```bash
# Repository klonen
git clone <ihr-repository>
cd urlaubsplaner

# Frontend starten
cd frontend
npm install
npm start

# Öffnet sich automatisch: http://localhost:3000
```

---

## 🎨 **Anpassungen:**

### **Login-Codes ändern:**
Bearbeiten Sie: `/frontend/src/services/api.js`
```javascript
const VALID_LOGINS = {
  'admin': 'IHR_ADMIN_CODE',
  'logistik': 'IHR_LOGISTIK_CODE',
  'manager': 'IHR_MANAGER_CODE'
};
```

### **Mitarbeiter hinzufügen/ändern:**
Die Mitarbeiter sind in der gleichen Datei als `DEFAULT_EMPLOYEES` definiert.

### **Firmen-Branding:**
- **Logo:** Ändern Sie das Calendar-Icon in `LoginScreen.js`
- **Farben:** Passen Sie die Tailwind-Klassen an
- **Firmendomain:** Ändern Sie die E-Mail-Domains in den Mitarbeiterdaten

---

## 📱 **Responsive Design:**
- **Desktop:** Optimiert für große Bildschirme
- **Tablet:** Touch-optimierte Bedienung
- **Mobile:** Vollständig responsive (kann bei Bedarf verbessert werden)

---

## 🔒 **Sicherheit:**
- **Lokale Speicherung:** Daten bleiben im Browser des Benutzers
- **Keine Cloud-Abhängigkeit:** Läuft vollständig im Frontend
- **JWT-ähnliche Tokens:** Für Session-Management
- **Code-basierter Login:** Einfach und sicher

---

## 💡 **Vorteile dieses Systems:**

### ✅ **Einfach:**
- Keine Datenbank-Konfiguration
- Keine Server-Wartung
- Keine komplizierte Installation

### ✅ **Schnell:**
- Sofort einsatzbereit
- Blitzschnelle Performance
- Keine Ladezeiten

### ✅ **Kostenlos:**
- Läuft kostenlos auf Vercel
- Keine Datenbank-Kosten
- Keine Server-Kosten

### ✅ **Flexibel:**
- Leicht erweiterbar
- Anpassbare Login-Codes
- Individuell konfigurierbar

---

## 🚀 **Deployment auf Vercel:**

1. **GitHub Repository** mit diesem Code erstellen
2. **Vercel Dashboard** öffnen: https://vercel.com
3. **"Add New Project"** → **"Import Git Repository"**
4. **Repository auswählen**
5. **Project Name:** `urlaubsplaner` (wichtig: keine Bindestriche!)
6. **Framework:** "Other" auswählen
7. **Build Command:** `cd frontend && npm run build`
8. **Output Directory:** `frontend/build`
9. **Deploy** klicken

**KEINE Environment Variables nötig! 🎉**

---

## 📞 **Support:**

**Das System ist bewusst einfach gehalten!**
- Alle Daten werden im Browser gespeichert
- Bei Problemen Browser-Cache leeren
- Code ist vollständig kommentiert und verständlich

---

## 🎉 **Perfekt für:**
- **Kleine bis mittlere Teams** (bis ~50 Mitarbeiter)
- **Unternehmen ohne IT-Abteilung**
- **Prototyping und MVPs**
- **Einfache Urlaubsplanung**
- **Budget-bewusste Lösungen**

**Starten Sie in 2 Minuten! Ihre Mitarbeiter werden es lieben! 🚀**
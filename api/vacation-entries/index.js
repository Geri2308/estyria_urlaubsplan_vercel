const { connectToDatabase } = require('../config/database');
const { corsHeaders, authenticateToken } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Berechne Werktage zwischen zwei Daten
function calculateBusinessDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let businessDays = 0;
  let currentDate = new Date(start);

  while (currentDate <= end) {
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Nicht Sonntag oder Samstag
      businessDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return businessDays;
}

// Prüfe gleichzeitige Urlaubsbegrenzungen
async function checkConcurrentVacations(db, startDate, endDate, excludeEntryId = null) {
  const vacationEntries = db.collection('vacation_entries');
  const employees = db.collection('employees');

  // Hole überlappende Urlaubseinträge
  const overlapQuery = {
    start_date: { $lte: endDate },
    end_date: { $gte: startDate },
    vacation_type: 'URLAUB'
  };

  if (excludeEntryId) {
    overlapQuery.id = { $ne: excludeEntryId };
  }

  const overlappingVacations = await vacationEntries.find(overlapQuery).toArray();
  const totalEmployees = await employees.countDocuments({});

  // Prüfe jeden Tag im Bereich
  const start = new Date(startDate);
  const end = new Date(endDate);
  let maxConcurrentCount = 0;
  let maxConcurrentDay = null;

  const currentDate = new Date(start);
  while (currentDate <= end) {
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Nur Werktage
      let dailyCount = 0;
      
      for (const vacation of overlappingVacations) {
        const vacationStart = new Date(vacation.start_date);
        const vacationEnd = new Date(vacation.end_date);
        
        if (vacationStart <= currentDate && currentDate <= vacationEnd) {
          dailyCount++;
        }
      }
      
      // Füge 1 für den neuen Urlaub hinzu
      dailyCount++;
      
      if (dailyCount > maxConcurrentCount) {
        maxConcurrentCount = dailyCount;
        maxConcurrentDay = new Date(currentDate);
      }
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const maxAllowed = Math.max(1, Math.floor((30 / 100) * totalEmployees)); // 30% Limit
  const percentage = totalEmployees > 0 ? Math.round((maxConcurrentCount / totalEmployees) * 100) : 0;

  return {
    is_valid: maxConcurrentCount <= maxAllowed,
    max_concurrent_count: maxConcurrentCount,
    max_allowed: maxAllowed,
    max_concurrent_day: maxConcurrentDay,
    percentage,
    total_employees: totalEmployees
  };
}

module.exports = async (req, res) => {
  corsHeaders(req, res, () => {});
  
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    await new Promise((resolve, reject) => {
      authenticateToken(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    const { db } = await connectToDatabase();
    const vacationEntries = db.collection('vacation_entries');
    const employees = db.collection('employees');

    switch (req.method) {
      case 'GET':
        const { employee_id, start_date, end_date, vacation_type } = req.query;
        let query = {};

        if (employee_id) query.employee_id = employee_id;
        if (start_date) query.end_date = { $gte: start_date };
        if (end_date) {
          if (!query.start_date) query.start_date = {};
          query.start_date.$lte = end_date;
        }
        if (vacation_type) query.vacation_type = vacation_type;

        const entries = await vacationEntries.find(query).sort({ start_date: 1 }).toArray();
        return res.status(200).json(entries);

      case 'POST':
        const { employee_id, start_date, end_date, vacation_type, notes } = req.body;

        if (!employee_id || !start_date || !end_date || !vacation_type) {
          return res.status(400).json({ error: 'Alle Pflichtfelder sind erforderlich' });
        }

        // Prüfe ob Mitarbeiter existiert
        const employee = await employees.findOne({ id: employee_id });
        if (!employee) {
          return res.status(404).json({ error: 'Mitarbeiter nicht gefunden' });
        }

        // Prüfe Datumsbereich
        if (new Date(start_date) > new Date(end_date)) {
          return res.status(400).json({ error: 'Startdatum muss vor oder gleich dem Enddatum sein' });
        }

        // Berechne Werktage
        const daysCount = calculateBusinessDays(start_date, end_date);

        // Prüfe gleichzeitige Urlaubsbegrenzungen (nur für tatsächliche Urlaube)
        if (vacation_type === 'URLAUB') {
          const concurrentCheck = await checkConcurrentVacations(db, start_date, end_date);
          if (!concurrentCheck.is_valid) {
            return res.status(400).json({
              error: `Zu viele gleichzeitige Urlaube. Maximum ${concurrentCheck.max_allowed} Personen (${concurrentCheck.percentage}%) können gleichzeitig im Urlaub sein. Spitzentag: ${concurrentCheck.max_concurrent_day?.toLocaleDateString('de-DE')} mit ${concurrentCheck.max_concurrent_count} Personen.`
            });
          }
        }

        const newEntry = {
          id: uuidv4(),
          employee_id,
          employee_name: employee.name,
          start_date,
          end_date,
          vacation_type,
          notes: notes || '',
          days_count: daysCount,
          created_date: new Date().toISOString()
        };

        await vacationEntries.insertOne(newEntry);
        return res.status(201).json(newEntry);

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Vacation Entries API Error:', error);
    if (error.message?.includes('Access token') || error.message?.includes('Ungültiger')) {
      return res.status(401).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Interner Serverfehler' });
  }
};
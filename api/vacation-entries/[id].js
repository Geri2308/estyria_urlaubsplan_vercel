const { connectToDatabase } = require('../config/database');
const { corsHeaders, authenticateToken } = require('../middleware/auth');

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

    const { id } = req.query;
    const { db } = await connectToDatabase();
    const vacationEntries = db.collection('vacation_entries');
    const employees = db.collection('employees');

    switch (req.method) {
      case 'GET':
        const entry = await vacationEntries.findOne({ id });
        if (!entry) {
          return res.status(404).json({ error: 'Urlaubseintrag nicht gefunden' });
        }
        return res.status(200).json(entry);

      case 'PUT':
        const { employee_id, start_date, end_date, vacation_type, notes } = req.body;

        if (!employee_id || !start_date || !end_date || !vacation_type) {
          return res.status(400).json({ error: 'Alle Pflichtfelder sind erforderlich' });
        }

        // Prüfe ob Eintrag existiert
        const existingEntry = await vacationEntries.findOne({ id });
        if (!existingEntry) {
          return res.status(404).json({ error: 'Urlaubseintrag nicht gefunden' });
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

        const updateData = {
          employee_id,
          employee_name: employee.name,
          start_date,
          end_date,
          vacation_type,
          notes: notes || '',
          days_count: daysCount
        };

        const updateResult = await vacationEntries.updateOne(
          { id },
          { $set: updateData }
        );

        if (updateResult.matchedCount === 0) {
          return res.status(404).json({ error: 'Urlaubseintrag nicht gefunden' });
        }

        const updatedEntry = await vacationEntries.findOne({ id });
        return res.status(200).json(updatedEntry);

      case 'DELETE':
        const deleteResult = await vacationEntries.deleteOne({ id });
        
        if (deleteResult.deletedCount === 0) {
          return res.status(404).json({ error: 'Urlaubseintrag nicht gefunden' });
        }

        return res.status(200).json({ message: 'Urlaubseintrag erfolgreich gelöscht' });

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Vacation Entry [id] API Error:', error);
    if (error.message?.includes('Access token') || error.message?.includes('Ungültiger')) {
      return res.status(401).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Interner Serverfehler' });
  }
};
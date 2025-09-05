const { connectToDatabase } = require('../config/database');
const { corsHeaders, authenticateToken } = require('../middleware/auth');

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
    const employees = db.collection('employees');

    switch (req.method) {
      case 'GET':
        const employee = await employees.findOne({ id });
        if (!employee) {
          return res.status(404).json({ error: 'Mitarbeiter nicht gefunden' });
        }
        return res.status(200).json(employee);

      case 'PUT':
        const updateData = {
          name: req.body.name,
          email: req.body.email || '',
          role: req.body.role || 'employee',
          vacation_days_total: req.body.vacation_days_total || 25,
          skills: req.body.skills || []
        };

        if (!updateData.name) {
          return res.status(400).json({ error: 'Name ist erforderlich' });
        }

        const updateResult = await employees.updateOne(
          { id },
          { $set: updateData }
        );

        if (updateResult.matchedCount === 0) {
          return res.status(404).json({ error: 'Mitarbeiter nicht gefunden' });
        }

        const updatedEmployee = await employees.findOne({ id });
        return res.status(200).json(updatedEmployee);

      case 'DELETE':
        // Lösche zuerst alle Urlaubseinträge des Mitarbeiters
        const vacationEntries = db.collection('vacation_entries');
        await vacationEntries.deleteMany({ employee_id: id });

        // Lösche dann den Mitarbeiter
        const deleteResult = await employees.deleteOne({ id });
        
        if (deleteResult.deletedCount === 0) {
          return res.status(404).json({ error: 'Mitarbeiter nicht gefunden' });
        }

        return res.status(200).json({ message: 'Mitarbeiter und alle Urlaubseinträge erfolgreich gelöscht' });

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Employee [id] API Error:', error);
    if (error.message?.includes('Access token') || error.message?.includes('Ungültiger')) {
      return res.status(401).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Interner Serverfehler' });
  }
};
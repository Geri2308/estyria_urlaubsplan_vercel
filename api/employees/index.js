const { connectToDatabase } = require('../config/database');
const { corsHeaders, authenticateToken } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

module.exports = async (req, res) => {
  corsHeaders(req, res, () => {});
  
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // Skip auth for OPTIONS requests
    if (req.method !== 'OPTIONS') {
      await new Promise((resolve, reject) => {
        authenticateToken(req, res, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    const { db } = await connectToDatabase();
    const employees = db.collection('employees');

    switch (req.method) {
      case 'GET':
        const allEmployees = await employees.find({}).toArray();
        return res.status(200).json(allEmployees);

      case 'POST':
        const newEmployee = {
          id: uuidv4(),
          name: req.body.name,
          email: req.body.email || '',
          role: req.body.role || 'employee',
          vacation_days_total: req.body.vacation_days_total || 25,
          skills: req.body.skills || [],
          created_date: new Date().toISOString()
        };

        if (!newEmployee.name) {
          return res.status(400).json({ error: 'Name ist erforderlich' });
        }

        await employees.insertOne(newEmployee);
        return res.status(201).json(newEmployee);

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Employee API Error:', error);
    if (error.message?.includes('Access token') || error.message?.includes('Ungültiger')) {
      return res.status(401).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Interner Serverfehler' });
  }
};
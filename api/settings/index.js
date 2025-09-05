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

    const { db } = await connectToDatabase();
    const employees = db.collection('employees');

    switch (req.method) {
      case 'GET':
        const totalEmployees = await employees.countDocuments({});
        const maxConcurrentPercentage = 30; // 30% Standard
        const maxConcurrentCalculated = Math.max(1, Math.floor((maxConcurrentPercentage / 100) * totalEmployees));

        return res.status(200).json({
          max_concurrent_percentage: maxConcurrentPercentage,
          max_concurrent_fixed: null,
          total_employees: totalEmployees,
          max_concurrent_calculated: maxConcurrentCalculated
        });

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Settings API Error:', error);
    if (error.message?.includes('Access token') || error.message?.includes('Ungültiger')) {
      return res.status(401).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Interner Serverfehler' });
  }
};
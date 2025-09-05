const jwt = require('jsonwebtoken');

const VALID_CREDENTIALS = {
  admin: { code: '9999', role: 'admin' },
  user: { code: '1234', role: 'user' }
};

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Code ist erforderlich' });
    }

    // Find matching credentials
    const userEntry = Object.entries(VALID_CREDENTIALS).find(
      ([, creds]) => creds.code === code
    );

    if (!userEntry) {
      return res.status(401).json({ error: 'Ungültiger Code' });
    }

    const [username, { role }] = userEntry;

    // Generate JWT token
    const token = jwt.sign(
      { username, role },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      token,
      user: { username, role },
      message: 'Erfolgreich angemeldet'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
};
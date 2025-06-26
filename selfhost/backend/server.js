
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: 100 // limite a 100 richieste per IP
});
app.use('/api/', limiter);

// Mock data per demo
const mockSubjects = [
  {
    name: 'Matematica',
    average: 8.2,
    grades: [
      { id: '1', subject: 'Matematica', value: 8, date: '2024-01-15', description: 'Verifica equazioni', type: 'written', teacher: 'Prof. Rossi', period: 'Primo Quadrimestre' },
      { id: '2', subject: 'Matematica', value: 7.5, date: '2024-02-10', description: 'Interrogazione funzioni', type: 'oral', teacher: 'Prof. Rossi', period: 'Primo Quadrimestre' },
      { id: '3', subject: 'Matematica', value: 9, date: '2024-02-28', description: 'Compito geometria', type: 'written', teacher: 'Prof. Rossi', period: 'Secondo Quadrimestre' }
    ]
  },
  {
    name: 'Italiano',
    average: 7.8,
    grades: [
      { id: '4', subject: 'Italiano', value: 8, date: '2024-01-20', description: 'Tema su Leopardi', type: 'written', teacher: 'Prof. Bianchi', period: 'Primo Quadrimestre' },
      { id: '5', subject: 'Italiano', value: 7.5, date: '2024-02-15', description: 'Analisi del testo', type: 'oral', teacher: 'Prof. Bianchi', period: 'Primo Quadrimestre' },
      { id: '6', subject: 'Italiano', value: 8, date: '2024-03-05', description: 'Verifica grammatica', type: 'written', teacher: 'Prof. Bianchi', period: 'Secondo Quadrimestre' }
    ]
  },
  {
    name: 'Storia',
    average: 7.3,
    grades: [
      { id: '7', subject: 'Storia', value: 7, date: '2024-01-25', description: 'Prima Guerra Mondiale', type: 'oral', teacher: 'Prof. Verdi', period: 'Primo Quadrimestre' },
      { id: '8', subject: 'Storia', value: 7.5, date: '2024-02-20', description: 'Rivoluzione Russa', type: 'written', teacher: 'Prof. Verdi', period: 'Primo Quadrimestre' },
      { id: '9', subject: 'Storia', value: 7.5, date: '2024-03-10', description: 'Fascismo in Italia', type: 'oral', teacher: 'Prof. Verdi', period: 'Secondo Quadrimestre' }
    ]
  }
];

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token di accesso richiesto' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token non valido' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Login con ClasseViva (con fallback a mock data)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log('Tentativo di login per:', username);

    // Se username è 'demo', usa mock data
    if (username.toLowerCase() === 'demo') {
      const token = jwt.sign(
        { id: username, username: username },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Salva utente nel database
      await pool.query(
        'INSERT INTO users (username, classeviva_token) VALUES ($1, $2) ON CONFLICT (username) DO UPDATE SET classeviva_token = $2, updated_at = NOW()',
        [username, token]
      );

      return res.json({
        success: true,
        token,
        user: {
          id: username,
          name: 'Mario Rossi Demo',
          username: username
        }
      });
    }

    // Prova con l'API reale ClasseViva
    try {
      const loginResponse = await axios.post('https://web.spaggiari.eu/rest/v1/auth/login', {
        ident: username,
        pass: password,
        customerCode: ""
      }, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Z-Dev-Apikey': '+zorro+'
        },
        timeout: 10000
      });

      const { token: cvToken, ident, firstName, lastName } = loginResponse.data;
      
      // Crea JWT token locale
      const token = jwt.sign(
        { id: ident, username: ident, cvToken },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Salva utente nel database
      await pool.query(
        'INSERT INTO users (username, classeviva_token, first_name, last_name) VALUES ($1, $2, $3, $4) ON CONFLICT (username) DO UPDATE SET classeviva_token = $2, first_name = $3, last_name = $4, updated_at = NOW()',
        [ident, cvToken, firstName, lastName]
      );

      res.json({
        success: true,
        token,
        user: {
          id: ident,
          name: `${firstName || ''} ${lastName || ''}`.trim() || username,
          username: ident
        }
      });

    } catch (cvError) {
      console.log('ClasseViva API non raggiungibile, uso mock data');
      
      // Fallback a mock data
      const token = jwt.sign(
        { id: username, username: username },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      await pool.query(
        'INSERT INTO users (username, classeviva_token) VALUES ($1, $2) ON CONFLICT (username) DO UPDATE SET classeviva_token = $2, updated_at = NOW()',
        [username, token]
      );

      res.json({
        success: true,
        token,
        user: {
          id: username,
          name: `Studente ${username}`,
          username: username
        }
      });
    }

  } catch (error) {
    console.error('Errore login:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// Ottieni voti
app.post('/api/grades', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.body;
    
    console.log('Richiesta voti per utente:', userId);

    // Se è demo o l'API reale non è disponibile, usa mock data
    if (userId.toLowerCase() === 'demo' || !req.user.cvToken) {
      return res.json({
        success: true,
        subjects: mockSubjects
      });
    }

    // Prova con l'API reale
    try {
      const gradesResponse = await axios.get(`https://web.spaggiari.eu/rest/v1/students/${userId}/grades`, {
        headers: {
          'Z-Auth-Token': req.user.cvToken,
          'Z-Dev-Apikey': '+zorro+',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      });

      // Processa i dati reali e li salva nel database
      const subjects = processClasseVivaGrades(gradesResponse.data);
      
      // Salva nel database locale
      for (const subject of subjects) {
        for (const grade of subject.grades) {
          await pool.query(
            'INSERT INTO grades (user_id, subject, grade_value, grade_date, description, grade_type, teacher, period) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (user_id, subject, grade_date, description) DO NOTHING',
            [userId, subject.name, grade.value, grade.date, grade.description, grade.type, grade.teacher, grade.period]
          );
        }
      }

      res.json({
        success: true,
        subjects: subjects
      });

    } catch (cvError) {
      console.log('API ClasseViva non raggiungibile, uso mock data');
      res.json({
        success: true,
        subjects: mockSubjects
      });
    }

  } catch (error) {
    console.error('Errore nel recupero voti:', error);
    res.status(500).json({ error: 'Errore nel recupero dei voti' });
  }
});

// Funzione per processare i dati ClasseViva
function processClasseVivaGrades(data) {
  // Implementa la logica per convertire i dati ClasseViva nel formato atteso
  // Questo dipende dalla struttura esatta dell'API ClasseViva
  return mockSubjects; // Fallback per ora
}

// Avvia il server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server avviato su porta ${PORT}`);
});

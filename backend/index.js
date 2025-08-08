require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const config = require('./config-rappels');
const fs = require('fs');
const { exec } = require('child_process');
const axios = require('axios'); // Added axios for webhook testing
const bcrypt = require('bcrypt');
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;

const jwt = require('jsonwebtoken');
const path = require('path');

// Test de connectivité internet au démarrage
exec('ping -c 1 8.8.8.8', (error, stdout, stderr) => {
  if (error) {
    console.log('[CHECK] Connexion internet KO');
  } else {
    console.log('[CHECK] Connexion internet OK');
  }
});

const app = express();
const PORT = config.server.port || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configuration email avec validation
let transporter = null;
if (config.email.user && config.email.pass) {
  transporter = nodemailer.createTransport({
    service: config.email.service,
    auth: {
      user: config.email.user,
      pass: config.email.pass
    }
  });
  
  // Test de la configuration email
  transporter.verify((error, success) => {
    if (error) {
      console.error('[EMAIL] Configuration email invalide:', error.message);
    } else {
      console.log('[EMAIL] Configuration email valide');
    }
  });
} else {
  console.warn('[EMAIL] Configuration email manquante - les rappels email seront désactivés');
}

// Connexion SQLite avec gestion d'erreur améliorée
const db = new sqlite3.Database(config.database.path || './garage.sqlite', (err) => {
  if (err) {
    console.error('[DB] Erreur de connexion à SQLite :', err.message);
    process.exit(1);
  }
  console.log('[DB] Connecté à SQLite');
});

// Créer la table users si elle n'existe pas
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  location TEXT,
  role TEXT DEFAULT 'Utilisateur',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME,
  deletion_date TEXT
)`, (err) => {
  if (err) {
    console.error('[DB] Erreur création table users:', err.message);
  } else {
    console.log('[DB] Table users prête');
  }
});

// Ajouter les colonnes manquantes si elles n'existent pas
const addMissingColumns = () => {
  const columns = [
    { name: 'email', type: 'TEXT' },
    { name: 'phone', type: 'TEXT' },
    { name: 'location', type: 'TEXT' },
    { name: 'role', type: 'TEXT DEFAULT "Utilisateur"' },
    { name: 'created_at', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP' },
    { name: 'expires_at', type: 'DATETIME' }
  ];

  columns.forEach(column => {
    db.run(`ALTER TABLE users ADD COLUMN ${column.name} ${column.type}`, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error(`[DB] Erreur ajout colonne ${column.name}:`, err.message);
      } else if (!err) {
        console.log(`[DB] Colonne ${column.name} ajoutée`);
      }
    });
  });
};

// Exécuter l'ajout des colonnes
addMissingColumns();

// Fonction utilitaire pour les requêtes avec promesses
const dbQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

// Fonction pour envoyer un email de rappel
async function envoyerRappelEmail(entretien, voiture) {
  if (!transporter) {
    console.warn('[RAPPEL] Service email non configuré');
    return false;
  }

  try {
    const mailOptions = {
      from: config.email.from,
      to: voiture.email_contact || config.rappels.emailFallback,
      subject: `Rappel d'entretien - ${voiture.marque} ${voiture.modele}`,
      html: `
        <h2>Rappel d'entretien</h2>
        <p><strong>Véhicule:</strong> ${voiture.marque} ${voiture.modele} (${voiture.immatriculation})</p>
        <p><strong>Type d'entretien:</strong> ${entretien.type}</p>
        <p><strong>Date prévue:</strong> ${entretien.date}</p>
        <br>
        <p>Merci de planifier cet entretien dans les plus brefs délais.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`[RAPPEL] Email envoyé pour l'entretien ${entretien.id}`);
    return true;
  } catch (error) {
    console.error('[RAPPEL] Erreur envoi email:', error);
    return false;
  }
}

// Fonction pour envoyer un rappel
async function envoyerRappel(entretien, voiture, userDb) {
  try {
    console.log(`[RAPPEL] Envoi rappel pour entretien ${entretien.id}`);
    
    let emailEnvoye = false;
    let smsEnvoye = false;
    
    // Envoi email
    if (config.rappels.emailEnabled && transporter) {
      emailEnvoye = await envoyerRappelEmail(entretien, voiture);
      if (emailEnvoye) {
        console.log(`[RAPPEL] Email envoyé avec succès pour entretien ${entretien.id}`);
      }
    }
    
    // Envoi SMS (préparé pour l'avenir)
    if (config.rappels.smsEnabled) {
      // TODO: Implémenter l'envoi SMS
      console.log('[RAPPEL] Service SMS non encore implémenté');
    }
    
    // Marquer comme envoyé
    await new Promise((resolve, reject) => {
      userDb.run('UPDATE entretiens SET rappel_envoye = 1 WHERE id = ?', [entretien.id], function(err) {
        if (err) reject(err); else resolve();
      });
    });
    // Enregistrer le rappel dans la base utilisateur
    const typeRappel = emailEnvoye && smsEnvoye ? 'email_sms' : (emailEnvoye ? 'email' : 'sms');
    await new Promise((resolve, reject) => {
      userDb.run(
        `INSERT INTO rappels (entretienId, type, date_envoi, statut) VALUES (?, ?, ?, ?)`,
        [entretien.id, typeRappel, new Date().toISOString(), 'envoye'],
        function (err) {
          if (err) reject(err); else resolve();
        }
      );
    });
    return { email_envoye: emailEnvoye, sms_envoye: smsEnvoye };
  } catch (error) {
    console.error(`[RAPPEL] Erreur envoi rappel pour entretien ${entretien.id}:`, error);
    return { email_envoye: false, sms_envoye: false };
  }
}

// Fonction pour vérifier et envoyer les rappels
async function verifierEtEnvoyerRappels() {
  try {
    const aujourdhui = new Date();
    const delaiRappel = new Date(aujourdhui);
    delaiRappel.setDate(aujourdhui.getDate() + config.rappels.delaiRappel);

    const query = `
      SELECT e.*, v.marque, v.modele, v.immatriculation, v.email_contact, v.telephone_contact
      FROM entretiens e
      JOIN voitures v ON e.voitureId = v.id
      WHERE e.date = ? AND e.rappel_envoye = 0
    `;

    const entretiens = await dbQuery(query, [delaiRappel.toISOString().split('T')[0]]);
    
    console.log(`[RAPPEL] ${entretiens.length} entretiens à rappeler pour le ${delaiRappel.toISOString().split('T')[0]}`);

    for (const entretien of entretiens) {
      console.log(`[RAPPEL] Vérification entretien ${entretien.id} pour le ${entretien.date}`);
      await envoyerRappel(entretien, entretien);
    }
  } catch (error) {
    console.error('[RAPPEL] Erreur lors de la vérification des rappels:', error);
  }
}

// Planifier la vérification des rappels (tous les jours à l'heure configurée)
const [heure, minute] = (config.rappels.heureEnvoi || '09:00').split(':');
cron.schedule(`${minute} ${heure} * * *`, () => {
  console.log('[RAPPEL] Vérification automatique des rappels...');
  verifierEtEnvoyerRappels();
});

// Après la tâche cron existante pour les rappels
cron.schedule('0 2 * * *', () => {
  verifierEtEnvoyerRappels();
});

// Tâche cron pour supprimer les comptes expirés (exécutée tous les jours à 3h du matin)
cron.schedule('0 3 * * *', async () => {
  console.log('[CRON] Vérification des comptes expirés...');
  
  try {
    // Récupérer tous les utilisateurs expirés
    const expiredUsers = await dbQuery(
      'SELECT id, username, email FROM users WHERE expires_at < datetime("now") AND deletion_date IS NULL'
    );
    
    for (const user of expiredUsers) {
      console.log(`[CRON] Suppression du compte expiré: ${user.username}`);
      
      // Marquer comme supprimé (soft delete)
      await dbRun(
        'UPDATE users SET deletion_date = datetime("now") WHERE id = ?',
        [user.id]
      );
      
      // Supprimer la base de données utilisateur
      const userDbPath = path.join(__dirname, `db_user_${user.id}.sqlite`);
      if (fs.existsSync(userDbPath)) {
        fs.unlinkSync(userDbPath);
        console.log(`[CRON] Base de données supprimée: db_user_${user.id}.sqlite`);
      }
    }
    
    console.log(`[CRON] ${expiredUsers.length} comptes supprimés`);
  } catch (err) {
    console.error('[CRON] Erreur lors de la suppression des comptes expirés:', err);
  }
});

// ✅ ROUTES API VOITURES

// Liste des voitures
app.get('/api/voitures', authenticate, (req, res) => {
  const dbPath = path.join(__dirname, `db_user_${req.userId}.sqlite`);
  const userDb = new sqlite3.Database(dbPath);

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const offset = (page - 1) * limit;
  const search = req.query.search || '';

  let query = 'SELECT * FROM voitures';
  let params = [];

  if (search) {
    query += ' WHERE marque LIKE ? OR modele LIKE ? OR immatriculation LIKE ?';
    params = [`%${search}%`, `%${search}%`, `%${search}%`];
  }

  query += ' ORDER BY marque, modele LIMIT ? OFFSET ?';
  params.push(limit, offset);

  userDb.all(query, params, (err, voitures) => {
    if (err) {
      userDb.close();
      return res.status(500).json({ error: err.message });
    }
    userDb.get('SELECT COUNT(*) as count FROM voitures', [], (err, total) => {
      userDb.close();
      if (err) return res.status(500).json({ error: err.message });
      res.json({
        voitures,
        pagination: {
          page,
          limit,
          total: total.count,
          pages: Math.ceil(total.count / limit)
        }
      });
    });
  });
});

// Ajouter une voiture
app.post('/api/voitures', authenticate, (req, res) => {
  const dbPath = path.join(__dirname, `db_user_${req.userId}.sqlite`);
  const userDb = new sqlite3.Database(dbPath);

  const { immatriculation, marque, modele, annee, kilometrage, email_contact, telephone_contact } = req.body;
  if (!immatriculation || !marque || !modele || !annee || !kilometrage) {
    userDb.close();
    return res.status(400).json({ error: 'Tous les champs sont obligatoires' });
  }

  userDb.run(
    `INSERT INTO voitures (immatriculation, marque, modele, annee, kilometrage, email_contact, telephone_contact)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [immatriculation, marque, modele, parseInt(annee), parseInt(kilometrage), email_contact || null, telephone_contact || null],
    function(err) {
      if (err) {
        userDb.close();
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Une voiture avec cette immatriculation existe déjà' });
        }
        return res.status(500).json({ error: err.message });
      }
      userDb.get('SELECT * FROM voitures WHERE id = ?', [this.lastID], (err, voiture) => {
        userDb.close();
        if (err) return res.status(500).json({ error: err.message });
        res.json({
          id: this.lastID,
          message: 'Voiture ajoutée avec succès',
          voiture
        });
      });
    }
  );
});

// Modifier une voiture
app.put('/api/voitures/:id', authenticate, async (req, res) => {
  const dbPath = path.join(__dirname, `db_user_${req.userId}.sqlite`);
  const userDb = new sqlite3.Database(dbPath);
  
  const { immatriculation, marque, modele, annee, kilometrage, email_contact, telephone_contact } = req.body;
  const id = req.params.id;

  if (!immatriculation || !marque || !modele || !annee || !kilometrage) {
    userDb.close();
    return res.status(400).json({ error: 'Tous les champs sont obligatoires' });
  }

  userDb.run (
    `UPDATE Voitures
     SET immatriculation=?, marque=?, modele=?, annee=?, kilometrage=?, email_contact=?, telephone_contact=?
     WHERE id=?`,
    [immatriculation, marque, modele, parseInt(annee), parseInt(kilometrage), email_contact || null, telephone_contact || null, id],
    function(err) {
      userDb.close();
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Une voiture avec cette immatriculation existe déjà' });
        }
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Voiture non trouvée' });
      }
      res.json({ message: 'Voiture modifiée avec succès' });
    }
  )
});

// Supprimer une voiture
app.delete('/api/voitures/:id', authenticate, async (req, res) => {
  const dbPath = path.join(__dirname, `db_user_${req.userId}.sqlite`);
  const userDb = new sqlite3.Database(dbPath);

  const id = req.params.id;

  userDb.run (`DELETE FROM voitures WHERE id=?`, [id], function(err) {
    userDb.close();
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Voiture non trouvée' });
    }
    res.json({ message: 'Voiture supprimée avec succès' });
  });
});

// ✅ ROUTES API ENTRETIENS

// Liste des entretiens
app.get('/api/entretiens', authenticate, (req, res) => {
  const dbPath = path.join(__dirname, `db_user_${req.userId}.sqlite`);
  const userDb = new sqlite3.Database(dbPath);

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const offset = (page - 1) * limit;
  const voitureId = req.query.voitureId;
  const dateDebut = req.query.dateDebut;
  const dateFin = req.query.dateFin;

  let query = `
    SELECT e.*, v.marque, v.modele, v.immatriculation
    FROM entretiens e
    JOIN voitures v ON e.voitureId = v.id
  `;
  let params = [];
  let conditions = [];

  if (voitureId) {
    conditions.push('e.voitureId = ?');
    params.push(voitureId);
  }
  if (dateDebut) {
    conditions.push('e.date >= ?');
    params.push(dateDebut);
  }
  if (dateFin) {
    conditions.push('e.date <= ?');
    params.push(dateFin);
  }
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  query += ' ORDER BY e.date DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  userDb.all(query, params, (err, entretiens) => {
    if (err) {
      userDb.close();
      return res.status(500).json({ error: err.message });
    }
    userDb.get('SELECT COUNT(*) as count FROM entretiens', [], (err, total) => {
      userDb.close();
      if (err) return res.status(500).json({ error: err.message });
      res.json({
        entretiens,
        pagination: {
          page,
          limit,
          total: total.count,
          pages: Math.ceil(total.count / limit)
        }
      });
    });
  });
});

// Ajouter un entretien
app.post('/api/entretiens', authenticate, (req, res) => {
  const dbPath = path.join(__dirname, `db_user_${req.userId}.sqlite`);
  const userDb = new sqlite3.Database(dbPath);

  const { voitureId, type, date, cout, fournisseur, kilometrage } = req.body;

  if (!voitureId || !type || !date || cout === undefined || cout === null || cout === '') {
    userDb.close();
    return res.status(400).json({ error: 'Champs obligatoires manquants : voitureId, type, date, cout' });
  }

  const coutFinal = cout === '' || cout === undefined ? null : parseFloat(cout);
  const kmFinal = kilometrage === '' || kilometrage === undefined ? null : parseInt(kilometrage);

  // Trouver le prochain ID disponible (1 si aucun entretien, sinon suivant)
  userDb.get(`
    SELECT COALESCE(MAX(id), 0) + 1 as nextId FROM entretiens
  `, (err, result) => {
    if (err) {
      userDb.close();
      return res.status(500).json({ error: err.message });
    }

    const nextId = result.nextId;

    // Insérer le nouvel entretien avec l'ID suivant
    userDb.run(
      `INSERT INTO entretiens (id, voitureId, type, date, cout, fournisseur, kilometrage, rappel_envoye)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
      [nextId, voitureId, type, date, coutFinal, fournisseur || '', kmFinal],
      function(err) {
        if (err) {
          userDb.close();
          return res.status(500).json({ error: err.message });
        }
        userDb.get('SELECT * FROM entretiens WHERE id = ?', [nextId], (err, entretien) => {
          userDb.close();
          if (err) return res.status(500).json({ error: err.message });
          res.json({
            id: nextId,
            message: 'Entretien ajouté avec succès',
            entretien
          });
        });
      }
    );
  });
});

// Modifier un entretien
app.put('/api/entretiens/:id', authenticate, async (req, res) => {
  const dbPath = path.join(__dirname, `db_user_${req.userId}.sqlite`);
  const userDb = new sqlite3.Database(dbPath);
  const { voitureId, type, date, cout, fournisseur, kilometrage } = req.body;
  const id = req.params.id;

  if (!voitureId || !type || !date || cout === undefined || cout === null || cout === '') {
    userDb.close();
    return res.status(400).json({ error: 'Champs obligatoires manquants : voitureId, type, date, cout' });
  }

  const coutFinal = cout === '' || cout === undefined ? null : parseFloat(cout);
  const kmFinal = kilometrage === '' || kilometrage === undefined ? null : parseInt(kilometrage);

  userDb.run(
    `UPDATE entretiens 
     SET voitureId=?, type=?, date=?, cout=?, fournisseur=?, kilometrage=?, rappel_envoye=0
     WHERE id=?`,
    [voitureId, type, date, coutFinal, fournisseur || '', kmFinal, id],
    function(err) {
      userDb.close();
      if (err) {
        console.error('[API] Erreur modification entretien :', err.message);
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Entretien non trouvé' });
      }
      res.json({ message: 'Entretien modifié avec succès' });
    }
  )
});

// Supprimer un entretien
app.delete('/api/entretiens/:id', authenticate, async (req, res) => {
  const dbPath = path.join(__dirname, `db_user_${req.userId}.sqlite`);
  const userDb = new sqlite3.Database(dbPath);
  const id = req.params.id;

  userDb.run('DELETE FROM entretiens WHERE id=?', [id], function(err) {
    if (err) {
      userDb.close();
      console.error('[API] Erreur suppression entretien :', err.message);
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      userDb.close();
      return res.status(404).json({ error: 'Entretien non trouvé' });
    }
    
    // Réinitialiser la séquence d'auto-incrémentation pour recommencer à 1
    userDb.run('DELETE FROM sqlite_sequence WHERE name="entretiens"', function(err) {
      if (err) {
        console.error('[API] Erreur réinitialisation séquence :', err.message);
      }
      userDb.close();
      res.json({ message: 'Entretien supprimé avec succès' });
    });
  });
});

// Route pour réinitialiser la séquence d'auto-incrémentation des entretiens
app.post('/api/entretiens/reset-sequence', authenticate, (req, res) => {
  const dbPath = path.join(__dirname, `db_user_${req.userId}.sqlite`);
  const userDb = new sqlite3.Database(dbPath);

  userDb.run('DELETE FROM sqlite_sequence WHERE name="entretiens"', function(err) {
    userDb.close();
    if (err) {
      console.error('[API] Erreur réinitialisation séquence :', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Séquence d\'auto-incrémentation réinitialisée avec succès' });
  });
});

// ✅ ROUTES API RAPPELS

// Obtenir les entretiens avec rappels à venir
app.get('/api/rappels', authenticate, (req, res) => {
  const dbPath = path.join(__dirname, `db_user_${req.userId}.sqlite`);
  const userDb = new sqlite3.Database(dbPath);

  const aujourdhui = new Date();
  const dans7Jours = new Date(aujourdhui);
  dans7Jours.setDate(aujourdhui.getDate() + (config.rappels.periodeVerification || 7));

  const query = `
    SELECT e.*, v.marque, v.modele, v.immatriculation, v.email_contact, v.telephone_contact
    FROM entretiens e
    JOIN voitures v ON e.voitureId = v.id
    WHERE e.date BETWEEN ? AND ?
    ORDER BY e.date ASC
  `;

  const params = [
    aujourdhui.toISOString().split('T')[0],
    dans7Jours.toISOString().split('T')[0]
  ];

  userDb.all(query, params, (err, rappels) => {
    userDb.close();
    if (err) {
      console.error('[API] Erreur /rappels :', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(rappels);
  });
});

// Route pour envoyer un rappel manuellement
app.post('/api/rappels/envoyer/:entretienId', authenticate, async (req, res) => {
  const dbPath = path.join(__dirname, `db_user_${req.userId}.sqlite`);
  const userDb = new sqlite3.Database(dbPath);
  const entretienId = req.params.entretienId;

  userDb.get('SELECT * from entretiens where id = ?', [entretienId], async (err, entretien) => {
    if (err || !entretien) {
      userDb.close();
      return res.status(404).json({ success: false, message: 'Entretien non trouvé' });
    }

    userDb.get('SELECT * from voitures where id = ?', [entretien.voitureId], async (err, voiture) => {
      if(err || !voiture) {
        userDb.close();
        return res.status(404).json({ success: false, message: 'Voiture non trouvée' });
      }

      try {
        const result = await envoyerRappel(entretien, voiture, userDb);
        userDb.close();
        res.json({ 
          success: true, 
          message: 'Rappel envoyé avec succès', 
          email_envoye: result.email_envoye, 
          sms_envoye: result.sms_envoye 
        });
      } catch (error) {
        userDb.close();
        console.error('[API] Erreur envoi rappel :', error);
        res.status(500).json({ success: false, message: 'Erreur lors de l\'envoi du rappel', error: error.message });
      }

    });
  });
});

// Historique des rappels pour un utilisateur spécifique
app.get('/api/rappels/historique', authenticate, (req, res) => {
  const dbPath = path.join(__dirname, `db_user_${req.userId}.sqlite`);
  const userDb = new sqlite3.Database(dbPath);

  const query = `
    SELECT r.*, e.type as type_entretien, e.date as date_entretien, v.marque, v.modele, v.immatriculation
    FROM rappels r
    JOIN entretiens e ON r.entretienId = e.id
    JOIN voitures v ON e.voitureId = v.id
    ORDER BY r.date_envoi DESC
  `;

  userDb.all(query, [], (err, historique) => {
    userDb.close();
    if (err) {
      console.error('[API] Erreur historique rappels:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(historique);
  });
});

// GET la configuration des rappels
app.get('/api/rappels/config', (req, res) => {
  res.json({
    email: config.email,
    sms: config.sms,
    rappels: config.rappels
  });
});

// POST pour mettre à jour la configuration des rappels
app.post('/api/rappels/config', (req, res) => {
  const newConfig = req.body;
  try {
    // Mettre à jour le fichier .env
    let envContent = '';
    for (const [key, value] of Object.entries(newConfig)) {
      if (typeof value === 'object') {
        for (const [subKey, subValue] of Object.entries(value)) {
          envContent += `${key.toUpperCase()}_${subKey.toUpperCase()}=${subValue}\n`;
        }
      } else {
        envContent += `${key.toUpperCase()}=${value}\n`;
      }
    }
    
    fs.writeFileSync('.env', envContent);
    res.json({ success: true, message: 'Configuration mise à jour' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Statistiques
app.get('/api/stats', authenticate, (req, res) => {
  const dbPath = path.join(__dirname, `db_user_${req.userId}.sqlite`);
  const userDb = new sqlite3.Database(dbPath);

  const query = `
    SELECT 
      (SELECT COUNT(*) FROM voitures) as total_voitures,
      (SELECT COUNT(*) FROM entretiens) as total_entretiens,
      (SELECT COUNT(*) FROM entretiens WHERE date >= date('now')) as entretiens_ce_mois,
      (SELECT COUNT(*) FROM rappels WHERE date_envoi >= date('now', '-7 days')) as rappels_7_jours
  `;

  userDb.get(query, [], (err, stats) => {
    userDb.close();
    if (err) {
      console.error('[API] Erreur stats:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(stats);
  });
});

// Statut MSG91
app.get('/api/msg91/status', (req, res) => {
  // This part of the code was removed as per the edit hint.
  // res.json(smsService.getStatus());
  res.json({ message: 'Service SMS désactivé' });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`[SERVER] Serveur démarré sur le port ${PORT}`);
  console.log('[RAPPEL] Système de rappel automatique activé');
});

// Route de connexion
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Champs manquants' });

  try {
    const user = await dbGet('SELECT * FROM users WHERE username = ? AND deletion_date IS NULL', [username]);
    if (!user) return res.status(401).json({ error: 'Utilisateur non trouvé' });

    // Vérifier si le compte a expiré
    if (user.expires_at && new Date(user.expires_at) < new Date()) {
      return res.status(401).json({ error: 'Votre compte a expiré. Veuillez contacter l\'administrateur.' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Mot de passe incorrect' });

    // Générer un token JWT
    const token = jwt.sign({ id: user.id, username: user.username }, 'votre_secret', { expiresIn: '8h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route d'inscription
app.post('/api/register', async (req, res) => {
  const { username, password, email, phone } = req.body;
  
  if (!username || !password || !email) {
    return res.status(400).json({ error: 'Champs obligatoires manquants (nom d\'utilisateur, mot de passe, email)' });
  }

  // Validation email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Format d\'email invalide' });
  }

  // Validation mot de passe
  if (password.length < 6) {
    return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
  }

  try {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await dbGet('SELECT * FROM users WHERE username = ? OR email = ?', [username, email]);
    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(409).json({ error: 'Ce nom d\'utilisateur est déjà utilisé' });
      } else {
        return res.status(409).json({ error: 'Cette adresse email est déjà utilisée' });
      }
    }

    // Calculer la date d'expiration (1 mois à partir d'aujourd'hui)
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);
    
    // Hasher le mot de passe
    const hash = await bcrypt.hash(password, 10);
    
    // Insérer le nouvel utilisateur avec date d'expiration
    const result = await dbRun(
      'INSERT INTO users (username, password, email, phone, role, expires_at) VALUES (?, ?, ?, ?, ?, ?)', 
      [username, hash, email, phone || null, 'Utilisateur', expiresAt.toISOString()]
    );
    
    // Création de la base dédiée à l'utilisateur
    createUserDatabase(result.lastID);
    
    res.json({ 
      message: 'Utilisateur créé avec succès',
      expiresAt: expiresAt.toISOString()
    });
  } catch (err) {
    console.error('Erreur inscription:', err);
    res.status(500).json({ error: 'Erreur lors de la création du compte' });
  }
});

function createUserDatabase(userId) {
  const dbPath = path.join(__dirname, `db_user_${userId}.sqlite`);
  const db = new sqlite3.Database(dbPath);
  db.serialize(() => {
    // Table utilisateurs
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      location TEXT,
      role TEXT DEFAULT 'Utilisateur',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      deletion_date TEXT
    )`);

    // Table voitures
    db.run(`CREATE TABLE IF NOT EXISTS voitures (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      immatriculation TEXT UNIQUE NOT NULL,
      marque TEXT NOT NULL,
      modele TEXT NOT NULL,
      annee INTEGER NOT NULL,
      kilometrage INTEGER NOT NULL,
      email_contact TEXT,
      telephone_contact TEXT
    )`);

    // Table entretiens
    db.run(`CREATE TABLE IF NOT EXISTS entretiens (
      id INTEGER PRIMARY KEY,
      voitureId INTEGER NOT NULL,
      type TEXT NOT NULL,
      date TEXT NOT NULL,
      cout REAL,
      fournisseur TEXT,
      kilometrage INTEGER,
      rappel_envoye INTEGER DEFAULT 0,
      FOREIGN KEY (voitureId) REFERENCES voitures(id)
    )`);

    // Table rappels
    db.run(`CREATE TABLE IF NOT EXISTS rappels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entretienId INTEGER NOT NULL,
      type TEXT NOT NULL,
      date_envoi TEXT NOT NULL,
      statut TEXT DEFAULT 'envoye',
      FOREIGN KEY (entretienId) REFERENCES entretiens(id)
    )`);
  });
  db.close();
}

// Middleware d'authentification
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token manquant' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, 'votre_secret');
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ error: 'Token invalide' });
  }
}

// Route pour récupérer le profil utilisateur
app.get('/api/profile', authenticate, async (req, res) => {
  try {
    const user = await dbGet('SELECT id, username, email, phone, location, role, expires_at FROM users WHERE id = ?', [req.userId]);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    // Calculer les jours restants
    const expiresAt = user.expires_at ? new Date(user.expires_at) : null;
    const now = new Date();
    const daysLeft = expiresAt ? Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24)) : null;
    
    // Récupérer les statistiques de l'utilisateur
    const userDbPath = path.join(__dirname, `db_user_${req.userId}.sqlite`);
    const userDb = new sqlite3.Database(userDbPath);
    
    const stats = await new Promise((resolve, reject) => {
      userDb.all(`
        SELECT 
          (SELECT COUNT(*) FROM voitures) as totalCars,
          (SELECT COUNT(*) FROM entretiens) as totalMaintenance,
          (SELECT COUNT(*) FROM entretiens WHERE date >= date('now', 'start of month')) as completedThisMonth,
          (SELECT AVG(cout) FROM entretiens WHERE cout IS NOT NULL) as averageCost
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows[0] || { totalCars: 0, totalMaintenance: 0, completedThisMonth: 0, averageCost: 0 });
      });
    });
    
    // Récupérer l'activité récente
    const recentActivity = await new Promise((resolve, reject) => {
      userDb.all(`
        SELECT 
          'maintenance' as type,
          'Entretien effectué sur ' || v.marque || ' ' || v.modele as description,
          e.date,
          'completed' as status
        FROM entretiens e
        JOIN voitures v ON e.voitureId = v.id
        ORDER BY e.date DESC
        LIMIT 5
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    userDb.close();
    
    res.json({
      user: {
        ...user,
        joinDate: new Date().toISOString().split('T')[0],
        daysLeft: daysLeft,
        isExpired: expiresAt ? expiresAt < now : false
      },
      stats: {
        totalCars: stats.totalCars,
        totalMaintenance: stats.totalMaintenance,
        upcomingMaintenance: 0,
        completedThisMonth: stats.completedThisMonth,
        averageCost: stats.averageCost || 0,
        maintenanceScore: Math.min(100, Math.max(0, 85 + Math.random() * 15))
      },
      recentActivity
    });
  } catch (err) {
    console.error('Erreur récupération profil:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour mettre à jour le profil utilisateur
app.put('/api/profile', authenticate, async (req, res) => {
  const { username, email, phone, newPassword } = req.body;
  
  try {
    // Vérifier si le nom d'utilisateur est déjà pris par un autre utilisateur
    if (username) {
      const existingUser = await dbGet('SELECT id FROM users WHERE username = ? AND id != ?', [username, req.userId]);
      if (existingUser) {
        return res.status(409).json({ error: 'Ce nom d\'utilisateur est déjà utilisé' });
      }
    }
    
    // Préparer les champs à mettre à jour
    let updateFields = [];
    let updateValues = [];
    
    if (username) {
      updateFields.push('username = ?');
      updateValues.push(username);
    }
    
    if (email) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    
    if (phone) {
      updateFields.push('phone = ?');
      updateValues.push(phone);
    }
    
    // Gérer le changement de mot de passe
    if (newPassword) {
      // Vérifier la longueur du mot de passe
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
      }
      
      // Hasher le nouveau mot de passe
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateFields.push('password = ?');
      updateValues.push(hashedPassword);
    }
    
    // Si aucun champ à mettre à jour
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'Aucune modification à apporter' });
    }
    
    // Ajouter l'ID de l'utilisateur pour la clause WHERE
    updateValues.push(req.userId);
    
    // Construire et exécuter la requête de mise à jour
    const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
    
    await dbRun(updateQuery, updateValues);
    
    // Récupérer les données mises à jour pour la réponse (sans created_at)
    const updatedUser = await dbGet(
      'SELECT id, username, email, phone, location, role FROM users WHERE id = ?', 
      [req.userId]
    );
    
    res.json({ 
      message: 'Profil mis à jour avec succès',
      user: {
        ...updatedUser,
        joinDate: new Date().toISOString().split('T')[0] // Date actuelle par défaut
      }
    });
    
  } catch (err) {
    console.error('Erreur mise à jour profil:', err);
    res.status(500).json({ error: 'Erreur serveur lors de la mise à jour du profil' });
  }
});

// Route pour vérifier l'expiration du compte
app.get('/api/profile/expiration', authenticate, async (req, res) => {
  try {
    const user = await dbGet('SELECT expires_at FROM users WHERE id = ?', [req.userId]);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    const expiresAt = user.expires_at ? new Date(user.expires_at) : null;
    const now = new Date();
    const daysLeft = expiresAt ? Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24)) : null;
    
    res.json({
      expiresAt: expiresAt?.toISOString(),
      daysLeft: daysLeft,
      isExpired: expiresAt ? expiresAt < now : false
    });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

// Configuration
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const DB_PATH = process.env.DB_PATH || './garage.sqlite';

async function createAdminUser() {
  console.log('🔧 Initialisation de la base de données...');
  
  const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('❌ Erreur de connexion à SQLite :', err.message);
      process.exit(1);
    }
    console.log('✅ Connecté à SQLite');
  });

  try {
    // Créer les tables
    await new Promise((resolve, reject) => {
      db.serialize(() => {
        // Table utilisateurs
        db.run(`CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          deletion_date TEXT
        )`, (err) => {
          if (err) reject(err);
          else console.log('✅ Table users créée');
        });

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
        )`, (err) => {
          if (err) reject(err);
          else console.log('✅ Table voitures créée');
        });

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
        )`, (err) => {
          if (err) reject(err);
          else console.log('✅ Table entretiens créée');
        });

        // Table rappels
        db.run(`CREATE TABLE IF NOT EXISTS rappels (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          entretienId INTEGER NOT NULL,
          type TEXT NOT NULL,
          date_envoi TEXT NOT NULL,
          statut TEXT DEFAULT 'envoye',
          FOREIGN KEY (entretienId) REFERENCES entretiens(id)
        )`, (err) => {
          if (err) reject(err);
          else console.log('✅ Table rappels créée');
        });

        resolve();
      });
    });

    // Vérifier si l'utilisateur admin existe déjà
    const existingUser = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE username = ?', [ADMIN_USERNAME], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (existingUser) {
      console.log('⚠️  L\'utilisateur admin existe déjà');
      return;
    }

    // Créer l'utilisateur admin
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    
    await new Promise((resolve, reject) => {
      db.run('INSERT INTO users (username, password) VALUES (?, ?)', 
        [ADMIN_USERNAME, hashedPassword], 
        function(err) {
          if (err) reject(err);
          else {
            console.log('✅ Utilisateur admin créé avec succès');
            console.log(`👤 Username: ${ADMIN_USERNAME}`);
            console.log(`🔑 Password: ${ADMIN_PASSWORD}`);
            console.log('📝 ID utilisateur:', this.lastID);
            
            // Créer la base de données dédiée à l'utilisateur
            createUserDatabase(this.lastID);
            resolve();
          }
        }
      );
    });

    console.log('🎉 Initialisation terminée avec succès!');
    console.log('🚀 Vous pouvez maintenant démarrer le serveur avec: npm start');

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
  } finally {
    db.close();
  }
}

function createUserDatabase(userId) {
  const dbPath = path.join(__dirname, `db_user_${userId}.sqlite`);
  const userDb = new sqlite3.Database(dbPath);
  
  userDb.serialize(() => {
    // Table utilisateurs
    userDb.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      deletion_date TEXT
    )`);

    // Table voitures
    userDb.run(`CREATE TABLE IF NOT EXISTS voitures (
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
    userDb.run(`CREATE TABLE IF NOT EXISTS entretiens (
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
    userDb.run(`CREATE TABLE IF NOT EXISTS rappels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entretienId INTEGER NOT NULL,
      type TEXT NOT NULL,
      date_envoi TEXT NOT NULL,
      statut TEXT DEFAULT 'envoye',
      FOREIGN KEY (entretienId) REFERENCES entretiens(id)
    )`);
  });
  
  userDb.close();
  console.log(`✅ Base de données utilisateur créée: db_user_${userId}.sqlite`);
}

// Exécuter le script
createAdminUser().catch(console.error); 
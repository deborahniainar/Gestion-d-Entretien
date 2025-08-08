# 🚗 Système de Gestion d'Entretien

Un système complet de gestion d'entretien de véhicules avec authentification, rappels automatiques et interface moderne.

## ✨ Fonctionnalités

- 🔐 **Authentification sécurisée** avec JWT
- 🚗 **Gestion des véhicules** (ajout, modification, suppression)
- 🔧 **Gestion des entretiens** avec historique
- 📅 **Calendrier des entretiens** avec vue temporelle
- 🔔 **Système de rappels automatiques** par email et SMS
- 📊 **Statistiques et rapports**
- 📱 **Interface responsive** avec Material-UI
- 🗄️ **Base de données SQLite** avec isolation par utilisateur

## 🛠️ Technologies Utilisées

### Backend
- **Node.js** avec Express
- **SQLite** pour la base de données
- **JWT** pour l'authentification
- **Nodemailer** pour les emails
- **Node-cron** pour les tâches planifiées
- **Bcrypt** pour le hachage des mots de passe

### Frontend
- **React** avec hooks
- **Material-UI** pour l'interface
- **React Router** pour la navigation
- **Axios** pour les requêtes API
- **React-toastify** pour les notifications

## 🚀 Installation

### Prérequis
- Node.js (version 14 ou supérieure)
- npm ou yarn

### 1. Cloner le projet
```bash
git clone <url-du-repo>
cd Gestion-d-Entretien
```

### 2. Installer les dépendances Backend
```bash
cd BackEnd
npm install
```

### 3. Configurer l'environnement
```bash
# Copier le fichier d'exemple
cp env.example .env

# Éditer le fichier .env avec vos paramètres
nano .env
```

**Configuration minimale du fichier .env :**
```env
# Configuration Email (Gmail recommandé)
EMAIL_SERVICE=gmail
EMAIL_USER=votre-email@gmail.com
EMAIL_PASS=votre-mot-de-passe-application
EMAIL_FROM=votre-email@gmail.com

# Configuration Base de Données
DB_PATH=./garage.sqlite

# Configuration Serveur
PORT=3001
NODE_ENV=development

# Configuration Rappels
RAPPEL_DELAI=3
RAPPEL_HEURE=09:00
RAPPEL_PERIODE=7
EMAIL_FALLBACK=admin@garage.com

# Configuration Admin (optionnel)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

### 4. Initialiser la base de données
```bash
npm run init
```

Cette commande va :
- Créer les tables nécessaires
- Créer un utilisateur admin par défaut
- Créer la base de données utilisateur

### 5. Démarrer le serveur Backend
```bash
npm start
# ou pour le développement (utilise nodemon)
npm run dev
```

### 6. Installer les dépendances Frontend
```bash
cd ../frontend
npm install
```

### 7. Démarrer le Frontend
```bash
npm start
```

## 🔑 Connexion

Une fois l'application démarrée :

1. **Accédez à** : `http://localhost:3000`
2. **Connectez-vous avec** :
   - Username : `admin`
   - Password : `admin123`

## 📧 Configuration Email

### Gmail (Recommandé)
1. Activez l'authentification à 2 facteurs sur votre compte Gmail
2. Générez un "mot de passe d'application"
3. Utilisez ce mot de passe dans `EMAIL_PASS`

### Autres fournisseurs
Modifiez `EMAIL_SERVICE` dans le fichier `.env` selon votre fournisseur.

## 📱 Configuration SMS (Optionnel)

Le système supporte Vonage pour les SMS :

1. Créez un compte sur [Vonage](https://vonage.com)
2. Obtenez votre API Key et Secret
3. Configurez dans le fichier `.env` :
```env
SMS_PROVIDER=vonage
VONAGE_API_KEY=votre-api-key
VONAGE_API_SECRET=votre-api-secret
VONAGE_PHONE_NUMBER=votre-numero-vonage
```

## 🗂️ Structure du Projet

```
Gestion d'Entretien/
├── BackEnd/
│   ├── index.js              # Serveur principal
│   ├── config-rappels.js     # Configuration
│   ├── createAdmin.js        # Script d'initialisation
│   ├── package.json
│   └── env.example
├── frontend/
│   ├── src/
│   │   ├── pages/           # Pages React
│   │   ├── services/        # Services API
│   │   └── App.js          # Application principale
│   └── package.json
└── README.md
```

## 🔧 API Endpoints

### Authentification
- `POST /api/login` - Connexion
- `POST /api/register` - Inscription

### Voitures
- `GET /api/voitures` - Liste des voitures
- `POST /api/voitures` - Ajouter une voiture
- `PUT /api/voitures/:id` - Modifier une voiture
- `DELETE /api/voitures/:id` - Supprimer une voiture

### Entretiens
- `GET /api/entretiens` - Liste des entretiens
- `POST /api/entretiens` - Ajouter un entretien
- `PUT /api/entretiens/:id` - Modifier un entretien
- `DELETE /api/entretiens/:id` - Supprimer un entretien

### Rappels
- `GET /api/rappels` - Entretiens à venir
- `GET /api/rappels/historique` - Historique des rappels
- `POST /api/rappels/envoyer/:id` - Envoyer un rappel manuel
- `GET /api/rappels/config` - Configuration des rappels
- `POST /api/rappels/config` - Mettre à jour la configuration

## 🚨 Résolution des Problèmes

### Erreur 401 (Unauthorized)
- Vérifiez que vous êtes connecté
- Vérifiez que le token JWT est valide
- Redémarrez l'application

### Erreur de base de données
- Vérifiez que le fichier `.env` est correctement configuré
- Relancez `npm run init` pour réinitialiser la base

### Erreur d'envoi d'email
- Vérifiez la configuration email dans `.env`
- Assurez-vous d'utiliser un mot de passe d'application Gmail
- Vérifiez que l'authentification à 2 facteurs est activée

## 🔄 Mise à Jour

Pour mettre à jour l'application :

```bash
# Backend
cd BackEnd
npm update
npm run init  # Si de nouvelles tables ont été ajoutées

# Frontend
cd ../frontend
npm update
```

## 📝 Licence

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## 📞 Support

Pour toute question ou problème :
- Ouvrez une issue sur GitHub
- Consultez la documentation des endpoints API
- Vérifiez les logs du serveur pour plus de détails 
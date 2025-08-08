# 🚀 Guide de Démarrage Rapide

## Installation Express

### Option 1: Script automatique (Recommandé)
```bash
./start.sh
```

### Option 2: Installation manuelle

#### 1. Prérequis
- Node.js (version 14+)
- npm

#### 2. Configuration Backend
```bash
cd BackEnd
npm install
cp env.example .env
# Éditer .env avec vos paramètres email
npm run init
npm start
```

#### 3. Configuration Frontend
```bash
cd frontend
npm install
npm start
```

## 🔑 Connexion

- **URL** : http://localhost:3000
- **Username** : admin
- **Password** : admin123

## 📧 Configuration Email (Obligatoire pour les rappels)

1. **Gmail** (Recommandé)
   - Activez l'authentification à 2 facteurs
   - Générez un "mot de passe d'application"
   - Utilisez ce mot de passe dans `EMAIL_PASS`

2. **Modifiez le fichier BackEnd/.env** :
```env
EMAIL_SERVICE=gmail
EMAIL_USER=votre-email@gmail.com
EMAIL_PASS=votre-mot-de-passe-application
EMAIL_FROM=votre-email@gmail.com
```

## 🚨 Résolution des Problèmes

### Erreur 401 (Unauthorized)
- Vérifiez que vous êtes connecté
- Redémarrez l'application

### Erreur de base de données
```bash
cd BackEnd
npm run init
```

### Erreur d'envoi d'email
- Vérifiez la configuration dans `.env`
- Assurez-vous d'utiliser un mot de passe d'application Gmail

## 📱 Fonctionnalités

- ✅ **Gestion des véhicules**
- ✅ **Planification d'entretiens**
- ✅ **Calendrier interactif**
- ✅ **Système de rappels automatiques**
- ✅ **Interface moderne et responsive**

## 🔧 Commandes Utiles

```bash
# Démarrer le Backend
cd BackEnd && npm start

# Démarrer le Frontend
cd frontend && npm start

# Réinitialiser la base de données
cd BackEnd && npm run init

# Mode développement
cd BackEnd && npm run dev
```

## 📞 Support

Pour toute question :
- Consultez le README.md principal
- Vérifiez les logs dans la console
- Ouvrez une issue sur GitHub 
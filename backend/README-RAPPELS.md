# 📧 Système de Rappel Automatique

## 🎯 Fonctionnalités

Le système de rappel automatique envoie des notifications par **email** (obligatoire) et **SMS** (optionnel) pour rappeler les entretiens à venir.

### ✅ Fonctionnalités incluses :

- **Rappels automatiques** : Envoi 3 jours avant chaque entretien
- **Notifications email** : Via Gmail (obligatoire)
- **Notifications SMS** : Via Twilio (optionnel)
- **Interface de gestion** : Page dédiée pour voir et gérer les rappels
- **Historique complet** : Suivi de tous les rappels envoyés
- **Rappels manuels** : Possibilité d'envoyer des rappels manuellement
- **Configuration flexible** : Paramètres personnalisables

## ⚙️ Configuration

### 1. Configuration Email (Gmail) - OBLIGATOIRE

#### Étape 1 : Activer l'authentification à 2 facteurs
1. Allez sur [Google Account](https://myaccount.google.com/)
2. Sécurité → Authentification à 2 facteurs → Activer

#### Étape 2 : Créer un mot de passe d'application
1. Sécurité → Mots de passe d'application
2. Sélectionnez "Autre (nom personnalisé)"
3. Nommez-le "Gestion Entretien"
4. Copiez le mot de passe généré (16 caractères)

#### Étape 3 : Configurer le fichier
Modifiez `config-rappels.js` :
```javascript
email: {
  service: 'gmail',
  user: 'votre-email@gmail.com', // Votre email Gmail
  pass: 'votre-mot-de-passe-app', // Le mot de passe d'application
  from: 'votre-email@gmail.com'
}
```

### 2. Configuration SMS (Twilio) - OPTIONNEL

> **Note :** Les SMS sont optionnels. Le système fonctionne parfaitement avec les emails uniquement.

#### Étape 1 : Créer un compte Twilio (optionnel)
1. Allez sur [Twilio](https://www.twilio.com/)
2. Créez un compte gratuit
3. Vérifiez votre numéro de téléphone

#### Étape 2 : Obtenir les informations
1. Dashboard → Account Info
2. Copiez :
   - Account SID
   - Auth Token
   - Votre numéro Twilio

#### Étape 3 : Configurer le fichier
Modifiez `config-rappels.js` :
```javascript
sms: {
  accountSid: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // Votre Account SID
  authToken: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',   // Votre Auth Token
  fromNumber: '+1234567890' // Votre numéro Twilio
}
```

**Ou laissez vide pour désactiver les SMS :**
```javascript
sms: {
  accountSid: '', // Laissez vide pour désactiver
  authToken: '',  // Laissez vide pour désactiver
  fromNumber: ''  // Laissez vide pour désactiver
}
```

## 🔧 Paramètres de configuration

Dans `config-rappels.js`, vous pouvez modifier :

```javascript
rappels: {
  delaiRappel: 3,           // Jours avant l'entretien pour envoyer le rappel
  heureEnvoi: 8,           // Heure d'envoi (format 24h)
  periodeVerification: 7,  // Jours à vérifier pour les rappels
  emailFallback: 'admin@stc.com' // Email de secours
}
```

## 📱 Utilisation

### Interface Web
1. Allez sur la page **"Rappels"** dans l'application
2. Voir les entretiens à venir dans les 7 prochains jours
3. Envoyer des rappels manuels si nécessaire
4. Consulter l'historique des rappels envoyés

### Fonctionnement automatique
- **Vérification quotidienne** : Tous les jours à 8h00 (configurable)
- **Rappels automatiques** : 3 jours avant chaque entretien
- **Double notification** : Email (toujours) + SMS (si configuré)

## 📋 Messages envoyés

### Email
```
Sujet: Rappel d'entretien - [Marque] [Modèle]

Véhicule: [Marque] [Modèle] ([Immatriculation])
Type d'entretien: [Type]
Date prévue: [Date]
Kilométrage: [Kilométrage] km
Prestataire: [Prestataire]

Merci de planifier cet entretien dans les plus brefs délais.
```

### SMS
```
RAPPEL ENTRETIEN: [Marque] [Modèle] - [Type] prévu le [Date]. 
Kilométrage: [Kilométrage] km.
```

## 🚨 Dépannage

### Erreurs Email
- **"Invalid login"** : Vérifiez le mot de passe d'application
- **"Authentication failed"** : Activez l'authentification à 2 facteurs
- **"Quota exceeded"** : Limite Gmail atteinte (250 emails/jour)

### Erreurs SMS
- **"Authentication failed"** : Vérifiez Account SID et Auth Token
- **"Invalid phone number"** : Format international requis (+261...)
- **"Insufficient funds"** : Crédit Twilio épuisé

### Logs de débogage
Les logs apparaissent dans la console du serveur :
```
[RAPPEL] Vérification automatique des rappels...
[RAPPEL] Email envoyé pour l'entretien 123
[RAPPEL] SMS envoyé pour l'entretien 123
```

## 🔒 Sécurité

- **Mots de passe d'application** : Plus sécurisés que les mots de passe normaux
- **Tokens Twilio** : Gardez-les secrets
- **Configuration** : Ne partagez pas le fichier `config-rappels.js`

## 💡 Conseils

1. **Testez d'abord** : Envoyez un rappel manuel pour vérifier la configuration
2. **Vérifiez les contacts** : Assurez-vous que les voitures ont des contacts configurés
3. **Surveillez les logs** : Vérifiez régulièrement les erreurs
4. **Sauvegardez** : Gardez une copie de votre configuration

## 📞 Support

En cas de problème :
1. Vérifiez les logs du serveur
2. Testez la configuration étape par étape
3. Consultez la documentation Gmail/Twilio 
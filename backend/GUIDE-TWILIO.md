# Guide de Configuration Twilio pour les SMS

## 🚀 Configuration Twilio

### 1. Créer un compte Twilio
1. Allez sur [twilio.com](https://www.twilio.com)
2. Cliquez sur "Sign up for free"
3. Remplissez le formulaire d'inscription
4. Vérifiez votre email et téléphone

### 2. Obtenir vos identifiants
1. Connectez-vous à votre console Twilio
2. Notez votre **Account SID** (commence par "AC...")
3. Notez votre **Auth Token**
4. Achetez un numéro de téléphone Twilio (gratuit pour les tests)

### 3. Configurer dans l'application
Modifiez `BackEnd/config-rappels.js` :
```javascript
sms: {
  accountSid: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // Votre Account SID
  authToken: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',   // Votre Auth Token
  fromNumber: '+1234567890'                        // Votre numéro Twilio
}
```

## 📱 Résolution des erreurs de numéros

### Erreur : "Verification cannot be sent to this phone number"

#### **Causes possibles :**
1. **Format incorrect** : Le numéro doit être au format international
2. **Numéro non supporté** : Certains numéros ne sont pas compatibles
3. **Compte Twilio en mode test** : Limitations en mode gratuit

#### **Solutions :**

##### **A. Utiliser le bon format**
```
✅ Correct : +261XXXXXXXXX (Madagascar)
❌ Incorrect : 261XXXXXXXXX, 0XXXXXXXXX
```

##### **B. Utiliser des numéros de test Twilio**
Pour les tests, utilisez ces numéros :
- `+15005550006` : Numéro de test valide
- `+15005550007` : Numéro de test invalide
- `+15005550008` : Numéro non vérifié

##### **C. Vérifier votre numéro sur Twilio**
1. Connectez-vous à votre console Twilio
2. Allez dans "Phone Numbers" > "Manage" > "Verified Caller IDs"
3. Ajoutez votre numéro de téléphone
4. Recevez le code de vérification par SMS
5. Entrez le code pour vérifier le numéro

##### **D. Utiliser un numéro de téléphone fixe**
Si le mobile ne fonctionne pas, essayez avec un numéro de téléphone fixe.

## 🔧 Configuration alternative

### Option 1 : SMS désactivés (recommandé pour les tests)
```javascript
sms: {
  accountSid: '', // Laissez vide
  authToken: '',  // Laissez vide
  fromNumber: ''  // Laissez vide
}
```

### Option 2 : Utiliser uniquement les emails
Configurez seulement la partie email et laissez les SMS vides.

## 📋 Test de la configuration

### 1. Test avec curl
```bash
curl -X POST http://localhost:3001/api/rappels/envoyer/1
```

### 2. Vérifier les logs
```bash
# Dans les logs du serveur, vous devriez voir :
[RAPPEL] Twilio configuré avec succès
[RAPPEL] SMS envoyé pour l'entretien 1
```

### 3. Test avec numéro de test
Ajoutez un numéro de test dans la base de données :
```sql
UPDATE voitures SET telephone_contact = '+15005550006' WHERE id = 1;
```

## 🆘 Dépannage

### Problème : "accountSid must start with AC"
- Vérifiez que votre Account SID commence bien par "AC"
- Copiez-le exactement depuis la console Twilio

### Problème : "Authentication failed"
- Vérifiez votre Auth Token
- Assurez-vous qu'il n'y a pas d'espaces en trop

### Problème : "Phone number is not verified"
- Vérifiez votre numéro sur Twilio
- Utilisez un numéro de test pour les essais

### Problème : "SMS not sent"
- Vérifiez que vous avez des crédits Twilio
- En mode gratuit, vous avez des limitations

## 💡 Conseils

1. **Commencez par les emails** : Configurez d'abord Gmail, puis Twilio
2. **Utilisez les numéros de test** : Pour éviter les problèmes de vérification
3. **Vérifiez les logs** : Le serveur affiche des messages détaillés
4. **Testez progressivement** : Email d'abord, puis SMS

## 📞 Support

Si vous avez des problèmes :
1. Vérifiez les logs du serveur
2. Testez avec les numéros de test Twilio
3. Consultez la documentation Twilio
4. Contactez le support Twilio si nécessaire 
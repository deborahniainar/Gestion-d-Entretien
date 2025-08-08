# Guide de Configuration Vonage (Nexmo) pour les SMS

## 🚀 Configuration Vonage

### 1. Créer un compte Vonage
1. Allez sur [vonage.com](https://www.vonage.com)
2. Cliquez sur "Sign up" ou "Get started for free"
3. Remplissez le formulaire d'inscription
4. Vérifiez votre email

### 2. Obtenir vos identifiants
1. Connectez-vous à votre console Vonage
2. Allez dans "API Keys" dans le menu
3. Notez votre **API Key** et **API Secret**
4. Achetez un numéro de téléphone (gratuit pour les tests)

### 3. Configurer dans l'application
Modifiez `BackEnd/config-rappels.js` :
```javascript
sms: {
  provider: 'vonage', // Changez de 'none' à 'vonage'
  
  vonage: {
    apiKey: 'votre-api-key',           // Votre API Key Vonage
    apiSecret: 'votre-api-secret',     // Votre API Secret Vonage
    fromNumber: '+1234567890'          // Votre numéro Vonage
  }
}
```

## 📱 Avantages de Vonage

### ✅ **Avantages :**
- **API simple** : Plus facile à utiliser que Twilio
- **Bonne couverture** : Supporte Madagascar et la plupart des pays
- **Documentation claire** : Très bien documenté
- **Prix compétitifs** : Souvent moins cher que Twilio
- **Support français** : Support client en français disponible

### ❌ **Inconvénients :**
- **Moins connu** : Moins de ressources communautaires
- **Limitations** : Certaines fonctionnalités avancées limitées

## 🔧 Test de la configuration

### 1. Vérifier le statut
```bash
curl -X GET http://localhost:3001/api/sms/status
```

### 2. Test avec un numéro
```bash
curl -X POST http://localhost:3001/api/sms/test \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"+261XXXXXXXXX"}'
```

### 3. Test avec un numéro de test
```bash
curl -X POST http://localhost:3001/api/sms/test \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"+447911123456"}'
```

## 📋 Comparaison des fournisseurs

| Fournisseur | Prix/SMS | Facilité | Support | Couverture |
|-------------|----------|----------|---------|------------|
| **Vonage**  | ~0.04€   | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Twilio      | ~0.05€   | ⭐⭐⭐⭐  | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| MessageBird | ~0.03€   | ⭐⭐⭐⭐  | ⭐⭐⭐   | ⭐⭐⭐⭐  |
| AWS SNS     | ~0.05€   | ⭐⭐     | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Orange      | Variable | ⭐⭐⭐   | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

## 🆘 Dépannage Vonage

### Problème : "Authentication failed"
- Vérifiez votre API Key et API Secret
- Assurez-vous qu'ils sont correctement copiés

### Problème : "Invalid phone number"
- Utilisez le format international : `+261XXXXXXXXX`
- Vérifiez que le numéro est valide

### Problème : "Insufficient balance"
- Ajoutez des crédits à votre compte Vonage
- Le compte gratuit a des limitations

### Problème : "Number not verified"
- Vérifiez votre numéro sur Vonage
- Utilisez un numéro de test pour les essais

## 💡 Conseils pour Vonage

1. **Commencez gratuitement** : Vonage offre des crédits gratuits
2. **Testez d'abord** : Utilisez les numéros de test avant la production
3. **Vérifiez les logs** : Le serveur affiche des messages détaillés
4. **Documentation** : Consultez la documentation Vonage pour plus d'infos

## 🔄 Migration depuis Twilio

### Étapes de migration :
1. **Créez un compte Vonage**
2. **Obtenez vos identifiants**
3. **Modifiez la configuration** :
   ```javascript
   sms: {
     provider: 'vonage', // Au lieu de 'twilio'
     vonage: {
       apiKey: 'votre-api-key',
       apiSecret: 'votre-api-secret',
       fromNumber: 'votre-numero'
     }
   }
   ```
4. **Redémarrez le serveur**
5. **Testez avec l'API de test**

## 📞 Support Vonage

- **Documentation** : [developer.vonage.com](https://developer.vonage.com)
- **Support client** : Disponible en français
- **Communauté** : Forum développeur actif
- **Chat** : Support en ligne disponible

## 🎯 Recommandation

**Vonage est recommandé** pour remplacer Twilio car :
- ✅ Plus simple à configurer
- ✅ Meilleur rapport qualité/prix
- ✅ Support français disponible
- ✅ API plus intuitive
- ✅ Moins de problèmes de vérification de numéros 
require('dotenv').config();

module.exports = {
  email: {
    service: process.env.EMAIL_SERVICE || 'gmail',
    user: process.env.EMAIL_USER || 'admin',
    pass: process.env.EMAIL_PASS || '',
    from: process.env.EMAIL_FROM || ''
  },
  sms: {
    provider: process.env.SMS_PROVIDER || 'none',
    enabled: process.env.SMS_PROVIDER !== 'none',
    vonage: {
      apiKey: process.env.VONAGE_API_KEY || '',
      apiSecret: process.env.VONAGE_API_SECRET || '',
      phoneNumber: process.env.VONAGE_PHONE_NUMBER || ''
    }
  },
  rappels: {
    delaiRappel: parseInt(process.env.RAPPEL_DELAI) || 3,
    heureEnvoi: process.env.RAPPEL_HEURE || '09:00',
    periodeVerification: parseInt(process.env.RAPPEL_PERIODE) || 7,
    emailFallback: process.env.EMAIL_FALLBACK || '',
    smsEnabled: process.env.SMS_PROVIDER !== 'none',
    emailEnabled: true
  },
  database: {
    path: process.env.DB_PATH || './garage.sqlite'
  },
  server: {
    port: parseInt(process.env.PORT) || 3001,
    nodeEnv: process.env.NODE_ENV || 'development'
  }
};
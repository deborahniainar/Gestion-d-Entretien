// Service de validation des données

/**
 * Valide une immatriculation française
 * @param {string} immatriculation 
 * @returns {boolean}
 */
const validateImmatriculation = (immatriculation) => {
  if (!immatriculation) return false;
  
  // Format français : AA-123-AA ou 1234-AB-56
  const regex = /^[A-Z]{2}-[0-9]{3}-[A-Z]{2}$|^[0-9]{4}-[A-Z]{2}-[0-9]{2}$/;
  return regex.test(immatriculation.toUpperCase());
};

/**
 * Valide une année
 * @param {number} annee 
 * @returns {boolean}
 */
const validateAnnee = (annee) => {
  const year = parseInt(annee);
  return year >= 1900 && year <= new Date().getFullYear() + 1;
};

/**
 * Valide un kilométrage
 * @param {number} kilometrage 
 * @returns {boolean}
 */
const validateKilometrage = (kilometrage) => {
  const km = parseInt(kilometrage);
  return km >= 0 && km <= 999999;
};

/**
 * Valide un email
 * @param {string} email 
 * @returns {boolean}
 */
const validateEmail = (email) => {
  if (!email) return true; // Email optionnel
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Valide un numéro de téléphone
 * @param {string} telephone 
 * @returns {boolean}
 */
const validateTelephone = (telephone) => {
  if (!telephone) return true; // Téléphone optionnel
  const regex = /^[\+]?[0-9\s\-\(\)]{8,15}$/;
  return regex.test(telephone);
};

/**
 * Valide un coût
 * @param {number} cout 
 * @returns {boolean}
 */
const validateCout = (cout) => {
  if (cout === null || cout === undefined || cout === '') return true;
  const montant = parseFloat(cout);
  return montant >= 0 && montant <= 999999;
};

/**
 * Valide une date
 * @param {string} date 
 * @returns {boolean}
 */
const validateDate = (date) => {
  if (!date) return false;
  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj);
};

/**
 * Valide les données d'une voiture
 * @param {object} voiture 
 * @returns {object}
 */
const validateVoiture = (voiture) => {
  const errors = [];

  if (!voiture.immatriculation) {
    errors.push('Immatriculation obligatoire');
  } else if (!validateImmatriculation(voiture.immatriculation)) {
    errors.push('Format d\'immatriculation invalide');
  }

  if (!voiture.marque || voiture.marque.trim().length < 2) {
    errors.push('Marque obligatoire (minimum 2 caractères)');
  }

  if (!voiture.modele || voiture.modele.trim().length < 2) {
    errors.push('Modèle obligatoire (minimum 2 caractères)');
  }

  if (!validateAnnee(voiture.annee)) {
    errors.push('Année invalide');
  }

  if (!validateKilometrage(voiture.kilometrage)) {
    errors.push('Kilométrage invalide');
  }

  if (!validateEmail(voiture.email_contact)) {
    errors.push('Email invalide');
  }

  if (!validateTelephone(voiture.telephone_contact)) {
    errors.push('Numéro de téléphone invalide');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valide les données d'un entretien
 * @param {object} entretien 
 * @returns {object}
 */
const validateEntretien = (entretien) => {
  const errors = [];

  if (!entretien.voitureId) {
    errors.push('Véhicule obligatoire');
  }

  if (!entretien.type || entretien.type.trim().length < 2) {
    errors.push('Type d\'entretien obligatoire (minimum 2 caractères)');
  }

  if (!validateDate(entretien.date)) {
    errors.push('Date invalide');
  }

  if (!validateCout(entretien.cout)) {
    errors.push('Coût invalide');
  }

  if (entretien.kilometrage && !validateKilometrage(entretien.kilometrage)) {
    errors.push('Kilométrage invalide');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Nettoie et formate les données d'entrée
 * @param {object} data 
 * @returns {object}
 */
const sanitizeData = (data) => {
  const cleaned = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      cleaned[key] = value.trim();
    } else {
      cleaned[key] = value;
    }
  }
  
  return cleaned;
};

module.exports = {
  validateImmatriculation,
  validateAnnee,
  validateKilometrage,
  validateEmail,
  validateTelephone,
  validateCout,
  validateDate,
  validateVoiture,
  validateEntretien,
  sanitizeData
}; 
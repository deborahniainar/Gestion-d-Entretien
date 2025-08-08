import axios from 'axios';

// Détecter si l'application tourne dans Electron
const isElectron = window.require && window.require('electron');

// Configuration de l'URL de base selon l'environnement
const getBaseURL = () => {
  if (isElectron) {
    return 'http://localhost:3001/api';
  } else {
    return '/api';  // ✅ Maintenant ça marche avec le proxy
  }
};

const API_BASE_URL = getBaseURL();

// Créer une instance axios avec configuration de base
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Intercepteur pour ajouter automatiquement le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('token');
      localStorage.removeItem('isAuthenticated');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Service pour les voitures
export const voituresService = {
  getAll: (params = {}) => api.get('/voitures', { params }),
  getById: (id) => api.get(`/voitures/${id}`),
  create: (data) => api.post('/voitures', data),
  update: (id, data) => api.put(`/voitures/${id}`, data),
  delete: (id) => api.delete(`/voitures/${id}`),
};

// Service pour les entretiens
export const entretiensService = {
  getAll: (params = {}) => api.get('/entretiens', { params }),
  getById: (id) => api.get(`/entretiens/${id}`),
  create: (data) => api.post('/entretiens', data),
  update: (id, data) => api.put(`/entretiens/${id}`, data),
  delete: (id) => api.delete(`/entretiens/${id}`),
  resetSequence: () => api.post('/entretiens/reset-sequence'),
};

// Service pour les rappels
export const rappelsService = {
  getAll: () => api.get('/rappels'),
  getHistorique: () => api.get('/rappels/historique'),
  envoyerRappel: (entretienId) => api.post(`/rappels/envoyer/${entretienId}`),
  getConfig: () => api.get('/rappels/config'),
  updateConfig: (config) => api.post('/rappels/config', config),
};

// Service pour l'authentification
export const authService = {
  login: (credentials) => api.post('/login', credentials),
  register: (userData) => api.post('/register', userData),
  getProfile: () => api.get('/profile'),
  updateProfile: (userData) => api.put('/profile', userData),
};

// Service pour les statistiques
export const statsService = {
  getStats: () => api.get('/stats'),
};

export default api; 
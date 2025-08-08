import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Alert,
  InputAdornment,
  IconButton,
  Divider,
  Fade,
  CircularProgress
} from '@mui/material';
import {
  Person as PersonIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  PersonAdd as PersonAddIcon,
  Login as LoginIcon,
  CarRepair as CarRepairIcon,
  Email as EmailIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import { authService } from '../services/api';

function Register() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ 
    username: '', 
    password: '', 
    email: '', 
    phone: '' 
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    setError(''); // Effacer l'erreur quand l'utilisateur tape
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleRegister = async () => {
    if (!credentials.username || !credentials.password || !credentials.email) {
      setError('Veuillez remplir tous les champs obligatoires (nom d\'utilisateur, mot de passe, email)');
      return;
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(credentials.email)) {
      setError('Veuillez entrer une adresse email valide');
      return;
    }

    // Validation mot de passe
    if (credentials.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await authService.register(credentials);
      alert('Inscription réussie, vous pouvez vous connecter.');
      navigate('/login');
    } catch (err) {
      console.error('Erreur d\'inscription:', err);
      setError(err.response?.data?.error || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleRegister();
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        pointerEvents: 'none'
      }
    }}>
      <Fade in={true} timeout={1000}>
        <Paper sx={{ 
          p: 4, 
          width: { xs: '90%', sm: 450 },
          borderRadius: '20px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
          }
        }}>
          {/* En-tête avec icône */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              mb: 2,
              boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)'
            }}>
              <CarRepairIcon sx={{ fontSize: 40, color: 'white' }} />
            </Box>
            <Typography variant="h4" sx={{ 
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1
            }}>
              Gestion d'Entretien
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Créez votre compte
            </Typography>
          </Box>
          
          {error && (
            <Fade in={true}>
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  borderRadius: '12px',
                  border: '1px solid rgba(211, 47, 47, 0.3)'
                }}
              >
                {error}
              </Alert>
            </Fade>
          )}
          
          {/* Champ nom d'utilisateur */}
          <TextField
            label="Nom d'utilisateur *"
            name="username"
            value={credentials.username}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            fullWidth
            margin="normal"
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                },
                '&.Mui-focused': {
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                }
              }
            }}
          />

          {/* Champ email */}
          <TextField
            label="Email *"
            name="email"
            type="email"
            value={credentials.email}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            fullWidth
            margin="normal"
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                },
                '&.Mui-focused': {
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                }
              }
            }}
          />

          {/* Champ téléphone */}
          <TextField
            label="Téléphone (optionnel)"
            name="phone"
            value={credentials.phone}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            fullWidth
            margin="normal"
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                },
                '&.Mui-focused': {
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                }
              }
            }}
          />

          {/* Champ mot de passe */}
          <TextField
            label="Mot de passe *"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={credentials.password}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            fullWidth
            margin="normal"
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleTogglePasswordVisibility}
                    edge="end"
                    sx={{ color: 'text.secondary' }}
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                },
                '&.Mui-focused': {
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                }
              }
            }}
          />

          {/* Bouton d'inscription */}
          <Button 
            variant="contained" 
            onClick={handleRegister}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PersonAddIcon />}
            sx={{ 
              mt: 3, 
              mb: 2,
              width: '100%',
              py: 1.5,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 25px rgba(102, 126, 234, 0.4)',
              },
              transition: 'all 0.3s ease',
              fontSize: '1.1rem',
              fontWeight: 'bold'
            }}
          >
            {loading ? 'Inscription...' : 'S\'inscrire'}
          </Button>

          <Divider sx={{ my: 2 }}>
            <Typography variant="body2" color="textSecondary">
              ou
            </Typography>
          </Divider>

          {/* Bouton se connecter */}
          <Button 
            variant="outlined"
            onClick={() => navigate('/login')}
            disabled={loading}
            startIcon={<LoginIcon />}
            sx={{ 
              width: '100%',
              py: 1.5,
              borderRadius: '12px',
              border: '2px solid #667eea',
              color: '#667eea',
              '&:hover': {
                border: '2px solid #5a6fd8',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.3s ease',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            Déjà un compte ? Se connecter
          </Button>

          {/* Footer */}
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="caption" color="textSecondary">
              © 2024 Gestion d'Entretien - Tous droits réservés
            </Typography>
          </Box>
        </Paper>
      </Fade>
    </Box>
  );
}

export default Register;
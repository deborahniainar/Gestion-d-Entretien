import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Fade,
  InputAdornment
} from '@mui/material';
import {
  Person as PersonIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CarRepair as CarRepairIcon,
  DirectionsCar as CarIcon,
  Notifications as NotificationsIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import { authService } from '../services/api';

function Profils() {
  const [user, setUser] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    joinDate: '',
    role: ''
  });
  
  const [stats, setStats] = useState({
    totalCars: 0,
    totalMaintenance: 0,
    upcomingMaintenance: 0,
    completedThisMonth: 0,
    averageCost: 0,
    maintenanceScore: 0
  });
  
  const [recentActivity, setRecentActivity] = useState([]);
  
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showProfilePassword, setShowProfilePassword] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await authService.getProfile();
      const { user: userData, stats: statsData, recentActivity: activityData } = response.data;
      
      setUser(userData);
      setStats(statsData);
      setRecentActivity(activityData);
    } catch (err) {
      console.error('Erreur chargement profil:', err);
      setError('Erreur lors du chargement des données du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    setEditData({ 
      username: user.username,
      email: user.email,
      phone: user.phone,
      newPassword: '',
      confirmPassword: ''
    });
    setEditMode(true);
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Validation des mots de passe
      if (editData.newPassword && editData.newPassword !== editData.confirmPassword) {
        setError('Les mots de passe ne correspondent pas');
        return;
      }
      
      if (editData.newPassword && editData.newPassword.length < 6) {
        setError('Le mot de passe doit contenir au moins 6 caractères');
        return;
      }
      
      // Préparer les données à envoyer (sans confirmPassword)
      const dataToSend = {
        username: editData.username,
        email: editData.email,
        phone: editData.phone
      };
      
      // Ajouter le nouveau mot de passe seulement s'il est fourni
      if (editData.newPassword) {
        dataToSend.newPassword = editData.newPassword;
      }
      
      await authService.updateProfile(dataToSend);
      
      // Mettre à jour l'état local
      setUser({
        ...user,
        username: editData.username,
        email: editData.email,
        phone: editData.phone
      });
      
      setEditMode(false);
      setSuccess('Profil mis à jour avec succès');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Erreur mise à jour profil:', err);
      setError(err.response?.data?.error || 'Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditData({});
  };

  const handleToggleProfilePassword = () => {
    setShowProfilePassword(!showProfilePassword);
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'maintenance': return <CarRepairIcon />;
      case 'reminder': return <NotificationsIcon />;
      case 'car': return <CarIcon />;
      default: return <InfoIcon />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* En-tête avec alertes */}
      {(error || success) && (
        <Box sx={{ mb: 3 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        </Box>
      )}

      {/* En-tête du profil */}
      <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Avatar sx={{ width: 80, height: 80, bgcolor: 'rgba(255,255,255,0.2)' }}>
              <PersonIcon sx={{ fontSize: 40 }} />
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              {user.username}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, mb: 1 }}>
              {user.role} • Membre depuis {new Date(user.joinDate).toLocaleDateString('fr-FR')}
            </Typography>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleEditProfile}
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
              }}
            >
              Modifier le profil
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Statistiques principales */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            '&:hover': { transform: 'translateY(-4px)', transition: 'transform 0.3s ease' }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats.totalCars}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Véhicules
                  </Typography>
                </Box>
                <CarIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
            '&:hover': { transform: 'translateY(-4px)', transition: 'transform 0.3s ease' }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats.totalMaintenance}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Entretiens
                  </Typography>
                </Box>
                <CarRepairIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            color: 'white',
            '&:hover': { transform: 'translateY(-4px)', transition: 'transform 0.3s ease' }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats.upcomingMaintenance}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Rappels
                  </Typography>
                </Box>
                <NotificationsIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
            color: 'white',
            '&:hover': { transform: 'translateY(-4px)', transition: 'transform 0.3s ease' }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats.maintenanceScore}%
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Score
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Contenu principal */}
      <Grid container spacing={3}>
        {/* Informations personnelles */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 'fit-content' }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', color: '#667eea' }}>
              Informations personnelles
            </Typography>
            
            <List>
              <ListItem>
                <ListItemIcon>
                  <EmailIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Email" 
                  secondary={user.email || 'Non renseigné'}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <PhoneIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Téléphone" 
                  secondary={user.phone || 'Non renseigné'}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <LockIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Mot de passe" 
                  secondary={showProfilePassword ? "Le mot de passe est masqué" : "••••••••"}
                />
                <IconButton
                  onClick={handleToggleProfilePassword}
                  size="small"
                  sx={{
                    color: showProfilePassword ? '#667eea' : 'text.secondary',
                    '&:hover': {
                      backgroundColor: 'rgba(102, 126, 234, 0.1)',
                      color: '#667eea',
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  {showProfilePassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <SecurityIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Rôle" 
                  secondary={user.role || 'Utilisateur'}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Activité récente */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 'fit-content' }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', color: '#667eea' }}>
              Activité récente
            </Typography>
            
            <List>
              {recentActivity.map((activity) => (
                <ListItem key={activity.id} sx={{ mb: 1 }}>
                  <ListItemIcon>
                    {getActivityIcon(activity.type)}
                  </ListItemIcon>
                  <ListItemText 
                    primary={activity.description}
                    secondary={new Date(activity.date).toLocaleDateString('fr-FR')}
                  />
                  <Chip 
                    label={activity.status === 'completed' ? 'Terminé' : 'En attente'}
                    color={getStatusColor(activity.status)}
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Dialog d'édition du profil */}
      <Dialog open={editMode} onClose={handleCancelEdit} maxWidth="sm" fullWidth>
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: '16px 16px 0 0'
        }}>
          Modifier le profil
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            fullWidth
            label="Nom d'utilisateur"
            value={editData.username || ''}
            onChange={(e) => setEditData({ ...editData, username: e.target.value })}
            margin="normal"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
              }
            }}
          />
          <TextField
            fullWidth
            label="Email"
            value={editData.email || ''}
            onChange={(e) => setEditData({ ...editData, email: e.target.value })}
            margin="normal"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
              }
            }}
          />
          <TextField
            fullWidth
            label="Téléphone"
            value={editData.phone || ''}
            onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
            margin="normal"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
              }
            }}
          />
          
          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="textSecondary">
              Changer le mot de passe (optionnel)
            </Typography>
          </Divider>
          
          <TextField
            fullWidth
            label="Nouveau mot de passe"
            type={showPassword ? 'text' : 'password'}
            value={editData.newPassword || ''}
            onChange={(e) => setEditData({ ...editData, newPassword: e.target.value })}
            margin="normal"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
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
              }
            }}
          />
          
          <TextField
            fullWidth
            label="Confirmer le nouveau mot de passe"
            type={showConfirmPassword ? 'text' : 'password'}
            value={editData.confirmPassword || ''}
            onChange={(e) => setEditData({ ...editData, confirmPassword: e.target.value })}
            margin="normal"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                    sx={{ color: 'text.secondary' }}
                  >
                    {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
              }
            }}
          />
          
          <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(102, 126, 234, 0.1)', borderRadius: '8px' }}>
            <Typography variant="body2" color="textSecondary">
              💡 <strong>Conseil :</strong> Laissez les champs de mot de passe vides si vous ne souhaitez pas le changer.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={handleCancelEdit}
            variant="outlined"
            startIcon={<CancelIcon />}
            sx={{
              borderRadius: '12px',
              border: '2px solid #667eea',
              color: '#667eea',
              '&:hover': {
                border: '2px solid #5a6fd8',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
              }
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSaveProfile}
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            disabled={loading}
            sx={{
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              }
            }}
          >
            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Profils;
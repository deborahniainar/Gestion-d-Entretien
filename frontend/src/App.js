import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Button, 
  Container, 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Typography
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import BuildIcon from '@mui/icons-material/Build';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Voitures from './pages/Voitures';
import Entretiens from './pages/Entretiens';
import Calendrier from './pages/Calendrier';
import Rappels from './pages/Rappels';
import Profils from './pages/Profils';
import Login from './pages/Login';
import Register from './pages/Register';
import { Logout as LogoutIcon, Warning as WarningIcon } from '@mui/icons-material';

const drawerWidth = 280;

function NavigationSidebar({ handleLogout }) {
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Voitures', icon: <DirectionsCarIcon />, color: '#1976d2' },
    { path: '/entretiens', label: 'Entretiens', icon: <BuildIcon />, color: '#E040FB' },
    { path: '/calendrier', label: 'Calendrier', icon: <CalendarMonthIcon />, color: '#00B8D4' },
    { path: '/rappels', label: 'Rappels', icon: <NotificationsIcon />, color: '#FF5252' },
    { path: '/profils', label: 'Profil', icon: <PersonIcon />, color: '#4CAF50' }
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: { xs: 64, md: drawerWidth },
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: { xs: 64, md: drawerWidth },
          boxSizing: 'border-box',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          border: '2px solid rgba(255, 255, 255, 0.8)',
          borderRadius: '16px',
          margin: '16px',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.5)',
          height: 'calc(100vh - 32px)',
          overflow: 'hidden',
          transition: 'width 0.3s',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        },
      }}
    >
      
      <Divider sx={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.5)', 
        mx: 2,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'rgba(255, 255, 255, 0.3)'
      }} />
      <List sx={{ mt: 2, px: 1, width: '100%' }}>
        {menuItems.map((item) => (
          <ListItem
            key={item.path}
            component={Link}
            to={item.path}
            sx={{
              color: location.pathname === item.path ? item.color : '#333',
              backgroundColor: location.pathname === item.path 
                ? `rgba(${item.color === '#1976d2' ? '25, 118, 210' : 
                          item.color === '#E040FB' ? '224, 64, 251' :
                          item.color === '#00B8D4' ? '0, 184, 212' : 
                          item.color === '#FF5252' ? '255, 82, 82' : '76, 175, 80'}, 0.15)` 
                : 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: location.pathname === item.path 
                ? `2px solid ${item.color}` 
                : '1px solid rgba(255, 255, 255, 0.3)',
              '&:hover': {
                backgroundColor: `rgba(${item.color === '#1976d2' ? '25, 118, 210' : 
                                        item.color === '#E040FB' ? '224, 64, 251' :
                                        item.color === '#00B8D4' ? '0, 184, 212' : 
                                        item.color === '#FF5252' ? '255, 82, 82' : '76, 175, 80'}, 0.1)`,
                color: item.color,
                transform: 'translateX(5px)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2)'
              },
              textDecoration: 'none',
              mb: 1,
              mx: 1,
              borderRadius: '12px',
              transition: 'all 0.3s ease',
              boxShadow: location.pathname === item.path 
                ? '0 4px 16px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2)' 
                : '0 2px 8px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(255, 255, 255, 0.1)',
              justifyContent: 'center',
              minHeight: { xs: 56, md: 48 },
              px: { xs: 0, md: 2 },
              width: '100%'
            }}
          >
            <ListItemIcon sx={{ 
              color: location.pathname === item.path ? item.color : '#666',
              minWidth: 0,
              display: 'flex',
              justifyContent: 'center',
              width: { xs: 1, md: 40 },
              mr: { xs: 0, md: 1 },
              fontWeight: 'bold',
              fontSize: 28
            }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.label} 
              sx={{ 
                display: { xs: 'none', md: 'block' },
                '& .MuiListItemText-primary': {
                  fontSize: '16px',
                  fontWeight: 'bold'
                }
              }}
            />
          </ListItem>
        ))}
      </List>
      
      <Box sx={{ mt: 'auto', p: { xs: 1, md: 2 }, textAlign: 'center', width: '100%' }}>
        <Button 
          variant="contained" 
          onClick={handleLogout}
          startIcon={<LogoutIcon />}
          sx={{
            background: 'linear-gradient(135deg, #ff5252 0%, #d32f2f 100%)',
            color: 'white',
            borderRadius: '12px',
            padding: '12px 24px',
            fontSize: '0.5rem',
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(255, 82, 82, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            '&:hover': {
              background: 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 20px rgba(255, 82, 82, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            },
            transition: 'all 0.3s ease',
            width: '100%',
            maxWidth: '200px'
          }}
        >
          Se déconnecter
        </Button>
      </Box>
    </Drawer>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('isAuthenticated') === 'true');
  // Ajoutez cet état pour le dialog de déconnexion
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  // Fonction à appeler après login
  const handleLogin = () => {
    localStorage.setItem('isAuthenticated', 'true');
    setIsAuthenticated(true);
  };

  // Remplacez la fonction handleLogout existante
  const handleLogout = () => {
    setLogoutDialogOpen(true);
  };

  // Ajoutez ces nouvelles fonctions
  const confirmLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setLogoutDialogOpen(false);
  };

  const cancelLogout = () => {
    setLogoutDialogOpen(false);
  };

  return (
    <Router>
      {!isAuthenticated ? (
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Login onLogin={handleLogin} />} />
        </Routes>
      ) : (
        <Box sx={{ 
          display: 'flex',
          minHeight: '100vh',
          background: 'white',
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
          <NavigationSidebar handleLogout={handleLogout} /> 
          
          <Box component="main" sx={{ 
            flexGrow: 1, 
            backgroundColor: 'white',
            minHeight: '100vh',
            position: 'relative',
            borderRadius: '0px',
            border: 'none',
            boxShadow: 'none',
            margin: '0px',
            overflow: 'hidden'
          }}>
            <Container maxWidth="xl" sx={{ py: 3, height: '100%' }}>
              <Routes>
                <Route path="/" element={<Voitures />} />
                <Route path="/entretiens" element={<Entretiens />} />
                <Route path="/calendrier" element={<Calendrier />} />
                <Route path="/rappels" element={<Rappels />} />
                <Route path="/profils" element={<Profils />} />
                <Route path="/register" element={<Register />} />
              </Routes>
            </Container>
          </Box>
        </Box>
      ) }

      {/* Ajoutez le Dialog de confirmation de déconnexion */}
      <Dialog
        open={logoutDialogOpen}
        onClose={cancelLogout}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            border: '1px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(20px)',
            minWidth: '400px',
            maxWidth: '500px'
          }
        }}
      >
        <DialogTitle sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          background: 'linear-gradient(135deg, #ff5252 0%, #d32f2f 100%)',
          color: 'white',
          borderRadius: '16px 16px 0 0',
          padding: '24px',
          '& .MuiTypography-root': {
            fontSize: '1.5rem',
            fontWeight: 'bold',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }
        }}>
          <WarningIcon sx={{ 
            fontSize: '2rem',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
          }} />
          Confirmation de déconnexion
        </DialogTitle>
        
        <DialogContent sx={{ padding: '32px 24px 24px' }}>
          <DialogContentText sx={{
            fontSize: '1.1rem',
            color: '#333',
            lineHeight: 1.6,
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            Êtes-vous sûr de vouloir vous déconnecter ?
          </DialogContentText>
          
          <Box sx={{
            background: 'rgba(255, 152, 0, 0.1)',
            border: '2px solid rgba(255, 152, 0, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            marginTop: '16px'
          }}>
            <Typography variant="h6" sx={{
              color: '#f57c00',
              fontWeight: 'bold',
              marginBottom: '8px',
              textAlign: 'center'
            }}>
              Informations importantes
            </Typography>
            
            <Box sx={{ fontSize: '0.95rem', color: '#333' }}>
              <Typography variant="body2" sx={{ marginBottom: '8px' }}>
                • Vous serez redirigé vers la page de connexion
              </Typography>
              <Typography variant="body2" sx={{ marginBottom: '8px' }}>
                • Votre session sera fermée
              </Typography>
              <Typography variant="body2">
                • Vous devrez vous reconnecter pour accéder à l'application
              </Typography>
            </Box>
          </Box>
          
          <Typography variant="body2" sx={{
            color: '#d32f2f',
            fontWeight: 'bold',
            textAlign: 'center',
            marginTop: '16px',
            padding: '12px',
            background: 'rgba(211, 47, 47, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(211, 47, 47, 0.3)'
          }}>
            ⚠️ Assurez-vous d'avoir sauvegardé vos modifications !
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{
          padding: '16px 24px 24px',
          gap: '12px',
          justifyContent: 'center'
        }}>
          <Button
            onClick={cancelLogout}
            variant="outlined"
            sx={{
              borderRadius: '12px',
              padding: '12px 24px',
              fontSize: '1rem',
              fontWeight: 'bold',
              border: '2px solid #2196f3',
              color: '#2196f3',
              background: 'rgba(33, 150, 243, 0.05)',
              '&:hover': {
                background: 'rgba(33, 150, 243, 0.1)',
                border: '2px solid #1976d2',
                color: '#1976d2',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 16px rgba(33, 150, 243, 0.3)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Annuler
          </Button>
          
          <Button
            onClick={confirmLogout}
            variant="contained"
            sx={{
              borderRadius: '12px',
              padding: '12px 24px',
              fontSize: '1rem',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #ff5252 0%, #d32f2f 100%)',
              color: 'white',
              boxShadow: '0 4px 12px rgba(255, 82, 82, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 20px rgba(255, 82, 82, 0.6)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Se déconnecter
          </Button>
        </DialogActions>
      </Dialog>
      
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </Router>
  );
}

export default App;

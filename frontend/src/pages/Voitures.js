import React, { useState, useEffect } from 'react';
import {
  Box, 
  TextField, 
  Button, 
  Paper, 
  Typography, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  // Ajoutez ces nouveaux imports
  DialogContentText
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import EmailIcon from '@mui/icons-material/Email';
import { Warning as WarningIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { voituresService } from '../services/api';

const Voitures = () => {
  const [voitures, setVoitures] = useState([]);
  const [formData, setFormData] = useState({
    immatriculation: '',
    marque: '',
    modele: '',
    annee: '',
    kilometrage: '',
    email_contact: '',
    telephone_contact: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null });
  
  // Ajoutez ces nouveaux états pour la confirmation de suppression
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [voitureToDelete, setVoitureToDelete] = useState(null);

  const fetchVoitures = async () => {
    try {
      // Vérifier si l'utilisateur est connecté
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('Aucun token trouvé, redirection vers login');
        window.location.href = '/login';
        return;
      }

      const response = await voituresService.getAll();
      console.log('Réponse API voitures:', response);
      
      const data = response.data;
      if (data.voitures) {
        setVoitures(data.voitures);
      } else if (Array.isArray(data)) {
        setVoitures(data);
      } else {
        setVoitures([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des voitures:', error);
      
      if (error.response?.status === 401) {
        toast.error('Session expirée, veuillez vous reconnecter');
        localStorage.removeItem('token');
        localStorage.removeItem('isAuthenticated');
        window.location.href = '/login';
      } else {
        toast.error('Erreur lors du chargement des voitures: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  useEffect(() => {
    fetchVoitures();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.immatriculation || !formData.marque || !formData.modele || !formData.annee || !formData.kilometrage) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      if (editingId) {
        await voituresService.update(editingId, formData);
        toast.success('Voiture modifiée avec succès!');
      } else {
        await voituresService.create(formData);
        toast.success('Voiture ajoutée avec succès!');
      }
      
      setFormData({
        immatriculation: '',
        marque: '',
        modele: '',
        annee: '',
        kilometrage: '',
        email_contact: '',
        telephone_contact: ''
      });
      setEditingId(null);
      setOpenDialog(false);
      fetchVoitures();
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message;
      toast.error('Erreur: ' + errorMessage);
    }
  };

  const handleEdit = (voiture) => {
    setFormData({
      immatriculation: voiture.immatriculation,
      marque: voiture.marque,
      modele: voiture.modele,
      annee: voiture.annee.toString(),
      kilometrage: voiture.kilometrage.toString(),
      email_contact: voiture.email_contact || '',
      telephone_contact: voiture.telephone_contact || ''
    });
    setEditingId(voiture.id);
    setOpenDialog(true);
  };

  // Remplacez la fonction handleDelete existante
  const handleDelete = async () => {
    try {
      await voituresService.delete(confirmDialog.id);
      toast.success('Voiture supprimée avec succès!');
      setConfirmDialog({ open: false, id: null });
      fetchVoitures();
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message;
      toast.error('Erreur: ' + errorMessage);
    }
  };

  // Ajoutez cette nouvelle fonction pour confirmer la suppression
  const confirmDelete = async () => {
    if (!voitureToDelete) return;
    
    try {
      await voituresService.delete(voitureToDelete.id);
      toast.success('Voiture supprimée avec succès!');
      fetchVoitures();
      setDeleteDialogOpen(false);
      setVoitureToDelete(null);
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message;
      toast.error('Erreur: ' + errorMessage);
    }
  };

  // Ajoutez cette fonction pour annuler la suppression
  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setVoitureToDelete(null);
  };

  // Modifiez la fonction qui ouvre le dialog de suppression
  const openDeleteDialog = (voiture) => {
    setVoitureToDelete(voiture);
    setDeleteDialogOpen(true);
  };

  const rowColors = [
    'rgba(255, 249, 196, 0.8)', // Jaune
    'rgba(187, 222, 251, 0.8)', // Bleu clair
    'rgba(255, 205, 210, 0.8)', // Rose clair
    'rgba(248, 187, 208, 0.8)', // Rose pâle
    'rgba(200, 230, 201, 0.8)', // Vert clair
    'rgba(225, 190, 231, 0.8)'  // Violet clair
  ];
  
  return (
    <Box sx={{ p: 2, m: 0, fontSize: 22 }}>
      <Typography variant="h4" sx={{ 
        mb: 3, 
        fontWeight: 'bold', 
        color: '#1976d2',
        textShadow: '0 2px 4px rgba(0,0,0,0.3)',
        textAlign: 'center'
      }}>
        Gestion des Voitures
      </Typography>

      <TableContainer component={Paper} sx={{
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        border: '2px solid rgba(255, 255, 255, 0.8)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.5)',
        overflow: 'hidden'
      }}>
        <Table>
          <TableHead>
            <TableRow sx={{ 
              background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.9) 0%, rgba(66, 165, 245, 0.9) 100%)',
              backdropFilter: 'blur(10px)'
            }}>
              <TableCell sx={{ 
                color: 'white', 
                fontWeight: 'bold', 
                fontSize: 18,
                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
              }}>Immatriculation</TableCell>
              <TableCell sx={{ 
                color: 'white', 
                fontWeight: 'bold', 
                fontSize: 18,
                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
              }}>Marque</TableCell>
              <TableCell sx={{ 
                color: 'white', 
                fontWeight: 'bold', 
                fontSize: 18,
                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
              }}>Modèle</TableCell>
              <TableCell sx={{ 
                color: 'white', 
                fontWeight: 'bold', 
                fontSize: 18,
                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
              }}>Année</TableCell>
              <TableCell sx={{ 
                color: 'white', 
                fontWeight: 'bold', 
                fontSize: 18,
                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
              }}>Kilométrage</TableCell>
              <TableCell sx={{ 
                color: 'white', 
                fontWeight: 'bold', 
                fontSize: 18,
                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
              }}>Contact</TableCell>
              <TableCell sx={{ 
                color: 'white', 
                fontWeight: 'bold', 
                fontSize: 18,
                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
              }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {voitures.map((voiture, idx) => {
              const bgColor = rowColors[idx % rowColors.length];
              return (
                <TableRow key={voiture.id} sx={{ 
                  backgroundColor: bgColor,
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    backgroundColor: `${bgColor.replace('0.8', '0.9')}`,
                    transform: 'scale(1.01)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease'
                  },
                  transition: 'all 0.3s ease'
                }}>
                  <TableCell sx={{ 
                    fontSize: 16, 
                    fontWeight: 'bold',
                    textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  }}>{voiture.immatriculation}</TableCell>
                  <TableCell sx={{ 
                    fontSize: 16,
                    textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  }}>{voiture.marque}</TableCell>
                  <TableCell sx={{ 
                    fontSize: 16,
                    textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  }}>{voiture.modele}</TableCell>
                  <TableCell sx={{ 
                    fontSize: 16,
                    textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  }}>{voiture.annee}</TableCell>
                  <TableCell sx={{ 
                    fontSize: 16,
                    textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  }}>{voiture.kilometrage.toLocaleString()} km</TableCell>
                  <TableCell sx={{ fontSize: 16 }}>
                    <Box>
                      {voiture.email_contact ? (
                        <Typography variant="body2" sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1, 
                          textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: 160
                        }}>
                          <EmailIcon sx={{ fontSize: 16, color: '#1976d2', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))' }} />
                          {voiture.email_contact}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          Aucun contact
                        </Typography>
                      )}
                      {voiture.telephone_contact && (
                        <Typography variant="body2" color="textSecondary">
                          📱 {voiture.telephone_contact}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      onClick={() => handleEdit(voiture)} 
                      sx={{ 
                        color: '#00B8D4', 
                        backgroundColor: 'rgba(0, 184, 212, 0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(0, 184, 212, 0.3)',
                        '&:hover': { 
                          backgroundColor: 'rgba(0, 184, 212, 0.2)', 
                          transform: 'scale(1.1)',
                          boxShadow: '0 4px 16px rgba(0, 184, 212, 0.3)'
                        }, 
                        transition: 'all 0.2s ease-in-out',
                        mr: 1
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      onClick={() => openDeleteDialog(voiture)} 
                      sx={{ 
                        color: '#FF5252', 
                        backgroundColor: 'rgba(255, 82, 82, 0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 82, 82, 0.3)',
                        '&:hover': { 
                          backgroundColor: 'rgba(255, 82, 82, 0.2)', 
                          transform: 'scale(1.1)',
                          boxShadow: '0 4px 16px rgba(255, 82, 82, 0.3)'
                        }, 
                        transition: 'all 0.2s ease-in-out' 
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Bouton d'ajout centré en bas */}
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          onClick={() => {
            setFormData({
              immatriculation: '',
              marque: '',
              modele: '',
              annee: '',
              kilometrage: '',
              email_contact: '',
              telephone_contact: ''
            });
            setEditingId(null);
            setOpenDialog(true);
          }}
          sx={{ 
            fontSize: 18, 
            background: 'linear-gradient(135deg, rgba(255, 214, 0, 0.9) 0%, rgba(0, 184, 212, 0.9) 100%)',
            backdropFilter: 'blur(20px)',
            color: '#333', 
            fontWeight: 'bold', 
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)', 
            border: '1px solid rgba(255, 255, 255, 0.3)',
            '&:hover': { 
              background: 'linear-gradient(135deg, rgba(0, 184, 212, 0.9) 0%, rgba(255, 214, 0, 0.9) 100%)', 
              color: '#fff', 
              transform: 'translateY(-2px) scale(1.04)', 
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)' 
            }, 
            transition: 'all 0.3s ease',
            px: 4,
            py: 1.5,
            borderRadius: '12px'
          }}
        >
          AJOUTER UNE VOITURE
        </Button>
      </Box>

      {/* Dialog pour ajouter/modifier une voiture */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }
        }}
      >
        <DialogTitle sx={{ 
          fontSize: 24, 
          fontWeight: 'bold', 
          color: '#333',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(66, 165, 245, 0.1) 100%)',
          backdropFilter: 'blur(10px)'
        }}>
          {editingId ? 'Modifier la Voiture' : 'Ajouter une Voiture'}
        </DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="Immatriculation *"
                value={formData.immatriculation}
                onChange={(e) => setFormData({ ...formData, immatriculation: e.target.value })}
                required
                fullWidth
                sx={{ 
                  fontSize: 18,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '8px'
                  }
                }}
              />
              <TextField
                label="Marque *"
                value={formData.marque}
                onChange={(e) => setFormData({ ...formData, marque: e.target.value })}
                required
                fullWidth
                sx={{ 
                  fontSize: 18,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '8px'
                  }
                }}
              />
              <TextField
                label="Modèle *"
                value={formData.modele}
                onChange={(e) => setFormData({ ...formData, modele: e.target.value })}
                required
                fullWidth
                sx={{ 
                  fontSize: 18,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '8px'
                  }
                }}
              />
              <TextField
                label="Année *"
                type="number"
                value={formData.annee}
                onChange={(e) => setFormData({ ...formData, annee: e.target.value })}
                required
                fullWidth
                sx={{ 
                  fontSize: 18,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '8px'
                  }
                }}
              />
              <TextField
                label="Kilométrage *"
                type="number"
                value={formData.kilometrage}
                onChange={(e) => setFormData({ ...formData, kilometrage: e.target.value })}
                required
                fullWidth
                sx={{ 
                  fontSize: 18,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '8px'
                  }
                }}
              />
              <TextField
                label="Email de contact"
                type="email"
                value={formData.email_contact}
                onChange={(e) => setFormData({ ...formData, email_contact: e.target.value })}
                fullWidth
                sx={{ 
                  fontSize: 18,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '8px'
                  }
                }}
                placeholder="contact@example.com"
              />
              <TextField
                label="Téléphone de contact"
                value={formData.telephone_contact}
                onChange={(e) => setFormData({ ...formData, telephone_contact: e.target.value })}
                fullWidth
                sx={{ 
                  fontSize: 18,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '8px'
                  }
                }}
                placeholder="+261 34 12 345 67"
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ 
            p: 3,
            background: 'linear-gradient(135deg, rgba(224, 64, 251, 0.1) 0%, rgba(213, 0, 249, 0.1) 100%)',
            backdropFilter: 'blur(10px)'
          }}>
            <Button 
              type="button"
              onClick={() => setOpenDialog(false)} 
              sx={{ 
                color: '#E040FB', 
                borderColor: '#E040FB', 
                fontWeight: 'bold', 
                fontSize: 16, 
                backgroundColor: 'rgba(224, 64, 251, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(224, 64, 251, 0.3)',
                '&:hover': { 
                  color: '#fff', 
                  backgroundColor: 'rgba(224, 64, 251, 0.2)', 
                  borderColor: '#D500F9',
                  boxShadow: '0 4px 16px rgba(224, 64, 251, 0.3)'
                },
                borderRadius: '8px',
                px: 3
              }}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              sx={{ 
                fontSize: 18, 
                background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.9) 0%, rgba(245, 124, 0, 0.9) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                '&:hover': { 
                  background: 'linear-gradient(135deg, rgba(245, 124, 0, 0.9) 0%, rgba(255, 152, 0, 0.9) 100%)',
                  boxShadow: '0 4px 16px rgba(255, 152, 0, 0.3)'
                },
                borderRadius: '8px',
                px: 3
              }}
            >
              {editingId ? 'Modifier' : 'Ajouter'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Remplacez l'ancien Dialog de confirmation par celui-ci */}
      <Dialog
        open={deleteDialogOpen}
        onClose={cancelDelete}
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
          Confirmation de suppression
        </DialogTitle>
        
        <DialogContent sx={{ padding: '32px 24px 24px' }}>
          <DialogContentText sx={{
            fontSize: '1.1rem',
            color: '#333',
            lineHeight: 1.6,
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            Êtes-vous sûr de vouloir supprimer cette voiture ?
          </DialogContentText>
          
          {voitureToDelete && (
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
                Détails de la voiture
              </Typography>
              
              <Box sx={{ display: 'grid', gap: '8px', fontSize: '0.95rem' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 'bold', color: '#666' }}>Immatriculation:</span>
                  <span style={{ color: '#333', fontWeight: 'bold' }}>{voitureToDelete.immatriculation}</span>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 'bold', color: '#666' }}>Marque:</span>
                  <span style={{ color: '#333' }}>{voitureToDelete.marque}</span>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 'bold', color: '#666' }}>Modèle:</span>
                  <span style={{ color: '#333' }}>{voitureToDelete.modele}</span>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 'bold', color: '#666' }}>Année:</span>
                  <span style={{ color: '#333' }}>{voitureToDelete.annee}</span>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 'bold', color: '#666' }}>Kilométrage:</span>
                  <span style={{ color: '#333' }}>{voitureToDelete.kilometrage} km</span>
                </Box>
              </Box>
            </Box>
          )}
          
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
            ⚠️ Cette action est irréversible !
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{
          padding: '16px 24px 24px',
          gap: '12px',
          justifyContent: 'center'
        }}>
          <Button
            onClick={cancelDelete}
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
            onClick={confirmDelete}
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
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Voitures;

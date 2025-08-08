// src/pages/Entretiens.js

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Box,
  Alert,
  MenuItem,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText  
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Warning as WarningIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { entretiensService, voituresService } from '../services/api';

// Ajoute la fonction utilitaire pour convertir une image en dataURL
function toDataURL(url) {
  return fetch(url)
    .then(res => res.blob())
    .then(blob => new Promise(resolve => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    }));
}

const Entretiens = () => {
  const [entretiens, setEntretiens] = useState([]);
  const [voitures, setVoitures] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entretienToDelete, setEntretienToDelete] = useState(null);
  // Initialisation du formData avec la date d'aujourd'hui par défaut
  const today = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({
    voitureId: '',
    date: today,
    type: '',
    cout: '',
    fournisseur: '',
    kilometrage: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [searchType, setSearchType] = useState('');

  const [openDialog, setOpenDialog] = useState(false);

  const fetchEntretiens = async () => {
    try {
      // Vérifier si l'utilisateur est connecté
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('Aucun token trouvé, redirection vers login');
        window.location.href = '/login';
        return;
      }

      const response = await entretiensService.getAll();
      console.log('Réponse API entretiens:', response);
      
      const data = response.data;
      if (data.entretiens) {
        setEntretiens(data.entretiens);
      } else if (Array.isArray(data)) {
        setEntretiens(data);
      } else {
        setEntretiens([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des entretiens:', error);
      
      if (error.response?.status === 401) {
        toast.error('Session expirée, veuillez vous reconnecter');
        localStorage.removeItem('token');
        localStorage.removeItem('isAuthenticated');
        window.location.href = '/login';
      } else {
        toast.error('Erreur lors du chargement des entretiens: ' + (error.response?.data?.error || error.message));
      }
    }
  };

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
    fetchEntretiens();
    fetchVoitures();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation des champs requis
    if (!formData.voitureId || !formData.type || !formData.date) {
      toast.error('Veuillez remplir tous les champs obligatoires (Voiture, Type, Date)');
      return;
    }
    if (formData.cout === '' || formData.cout === null || formData.cout === undefined) {
      // message natif navigateur
      return;
    }
    if (parseFloat(formData.cout) < 0) {
      document.getElementById('cout').setCustomValidity('Le coût ne peut pas être négatif');
      document.getElementById('cout').reportValidity();
      return;
    } else {
      document.getElementById('cout').setCustomValidity('');
    }
    
    if (formData.kilometrage && parseInt(formData.kilometrage) < 0) {
      document.getElementById('kilometrage').setCustomValidity('Le kilométrage ne peut pas être négatif');
      document.getElementById('kilometrage').reportValidity();
      return;
    } else if (document.getElementById('kilometrage')) {
      document.getElementById('kilometrage').setCustomValidity('');
    }
    
    // Préparation des données avec conversion des types
    const dataToSend = {
      voitureId: parseInt(formData.voitureId),
      type: formData.type,
      date: formData.date,
      cout: formData.cout ? parseFloat(formData.cout) : null,
      fournisseur: formData.fournisseur || '',
      kilometrage: formData.kilometrage ? parseInt(formData.kilometrage) : null
    };
    
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Token non trouvé, veuillez vous reconnecter.');
      return;
    }

    try {
      if (editingId) {
        await entretiensService.update(editingId, dataToSend);
      } else {
        await entretiensService.create(dataToSend);
      }

      toast.success(editingId ? 'Entretien modifié avec succès!' : 'Entretien ajouté avec succès!');
      
      setFormData({
        voitureId: '',
        date: today,
        type: '',
        cout: '',
        fournisseur: '',
        kilometrage: ''
      });
      setEditingId(null);
      setOpenDialog(false);
      
      // Recharger les entretiens
      fetchEntretiens();
    } catch (error) {
      console.error('Erreur:', error);
      const errorMessage = error.response?.data?.error || error.message;
      toast.error('Erreur: ' + errorMessage);
    }
  };

  const handleEdit = (entretien) => {
    setFormData({
      voitureId: entretien.voitureId,
      date: entretien.date,
      type: entretien.type,
      cout: entretien.cout,
      fournisseur: entretien.fournisseur,
      kilometrage: entretien.kilometrage || ''
    });
    setEditingId(entretien.id);
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    const entretien = entretiens.find(e => e.id === id);
    setEntretienToDelete(entretien);
    setDeleteDialogOpen(true);
  };

    // Fonction pour confirmer la suppression
    const confirmDelete = async () => {
      if (!entretienToDelete) return;
      
      try {
        await entretiensService.delete(entretienToDelete.id);
        toast.success('Entretien supprimé avec succès!');
        fetchEntretiens();
        setDeleteDialogOpen(false);
        setEntretienToDelete(null);
      } catch (error) {
        console.error('Erreur suppression:', error);
        const errorMessage = error.response?.data?.error || error.message;
        toast.error('Erreur: ' + errorMessage);
      }
    };

    // Fonction pour annuler la suppression
    const cancelDelete = () => {
      setDeleteDialogOpen(false);
      setEntretienToDelete(null);
    };

  // Modifie exportToPDF pour inclure le logo
  const exportToPDF = async () => {
    const doc = new jsPDF();

    // Ajoute le logo en haut à gauche
    try {
      const logoDataUrl = await toDataURL("/Logo.png"); // Chemin relatif au dossier public
      doc.addImage(logoDataUrl, "PNG", 10, 10, 20, 8); // x, y, width, height - très compact
      // Ajoute le texte sous le logo en majuscules et plus petit
      doc.setFontSize(4);
      doc.setTextColor(0, 0, 0); // Noir
      doc.text('SOCIÉTÉ DE TERRASSEMENT ET DE CONSTRUCTION', 10, 21);
      doc.setTextColor(0, 0, 0); // Remet la couleur par défaut pour le reste du PDF
    } catch (e) {
      // Si le logo n'est pas trouvé, continue sans
    }
    
    doc.setFontSize(20);
    doc.text('Rapport des Entretiens', 105, 20, { align: 'center' });
    
    if (filteredEntretiens.length > 0) {
      const dates = filteredEntretiens.map(e => new Date(e.date)).sort((a, b) => a - b);
      const dateDebut = dates[0].toLocaleDateString('fr-FR');
      const dateFin = dates[dates.length - 1].toLocaleDateString('fr-FR');
      doc.setFontSize(12);
      doc.text(`Période: du ${dateDebut} au ${dateFin}`, 105, 30, { align: 'center' });
    }
    


    // Ajouter des informations sur les filtres appliqués
    let filterInfo = '';
    if (searchDate || searchType) {
      filterInfo = 'Filtres appliqués: ';
      if (searchDate) filterInfo += `Date: ${searchDate}`;
      if (searchDate && searchType) filterInfo += ', ';
      if (searchType) filterInfo += `Type: ${searchType}`;
      doc.setFontSize(10);
      doc.text(filterInfo, 105, 40, { align: 'center' });
    }
    
    const tableData = filteredEntretiens.map(entretien => {
      const voiture = voitures.find(v => v.id === entretien.voitureId);
      return [
        voiture ? voiture.marque + ' ' + voiture.modele : `Voiture ID: ${entretien.voitureId}`,
        entretien.date,
        entretien.type,
        entretien.kilometrage || '',
        (entretien.cout === '' || entretien.cout === null ? 0 : parseFloat(entretien.cout) || 0) + ' KMF',
        entretien.fournisseur
      ];
    });

    autoTable(doc, {
      head: [['Voiture', 'Date', 'Type', 'Kilométrage', 'Coût', 'Fournisseur']],
      body: [
        ...tableData
      ],
      startY: searchDate || searchType ? 50 : 40,
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [255, 152, 0],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });

    // Ajout du total des coûts par voiture sous le tableau
    let y = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.setTextColor(33, 33, 33);
    doc.text('Total des coûts par voiture :', 10, y);
    y += 6;
    if (totalCoutsParVoiture.length === 0) {
      doc.setFontSize(10);
      doc.setTextColor(120, 120, 120);
      doc.text('Aucun coût enregistré.', 10, y);
    } else {
      totalCoutsParVoiture.forEach(({ voiture, total }) => {
        doc.setFontSize(10);
        doc.setTextColor(33, 33, 33);
        doc.text(
          `${voiture.marque} ${voiture.modele} (${voiture.immatriculation})`,
          12,
          y,
          { align: 'left' }
        );
        doc.setFontSize(10);
        doc.setTextColor(33, 33, 33);
        doc.text(
          `${total.toLocaleString()} KMF`,
          200,
          y,
          { align: 'right' }
        );
        y += 6;
      });
    }

    doc.save('entretiens.pdf');
  };

  const getVoitureName = (voitureId) => {
    const voiture = voitures.find(v => v.id === voitureId);
    return voiture ? `${voiture.marque} ${voiture.modele}` : `Voiture ID: ${voitureId}`;
  };

  // Filtrer les entretiens
  const filteredEntretiens = entretiens.filter(entretien => {
    const matchesDate = !searchDate || entretien.date === searchDate;
    const matchesType = !searchType || entretien.type === searchType;
    return matchesDate && matchesType;
  });

  // Trie les entretiens par id croissant
  const sortedEntretiens = Array.isArray(filteredEntretiens)
    ? [...filteredEntretiens].sort((a, b) => a.id - b.id)
    : [];

  // Calcul des totaux par voiture
  const totalCoutsParVoiture = voitures.map(voiture => {
    const total = filteredEntretiens
      .filter(e => e.voitureId === voiture.id)
      .reduce((sum, e) => sum + (e.cout === '' || e.cout === null ? 0 : parseFloat(e.cout) || 0), 0);
    return { voiture, total };
  }).filter(item => item.total > 0);

  
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" sx={{ 
        mb: 3, 
        fontWeight: 'bold', 
        color: '#E040FB',
        textShadow: '0 2px 4px rgba(0,0,0,0.3)',
        textAlign: 'center'
      }}>
        Gestion des Entretiens
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2, fontSize: 16 }}>
          {error}
        </Alert>
      )}

      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            border: '2px solid rgba(255, 255, 255, 0.8)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.5)',
            minWidth: '700px',
            maxWidth: '90vw',
            maxHeight: '90vh',
            overflow: 'auto'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, rgba(68, 138, 255, 0.1) 0%, rgba(224, 64, 251, 0.1) 100%)',
          backdropFilter: 'blur(10px)',
          fontWeight: 'bold',
          fontSize: '20px',
          textShadow: '0 1px 2px rgba(0,0,0,0.1)'
        }}>
          {editingId ? 'Modifier un Entretien' : 'Ajouter un Entretien'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box 
            component="form" 
            onSubmit={handleSubmit} 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: 3,
              width: '100%'
            }}
          >
            <TextField
              select
              label="Voiture"
              name="voitureId"
              id="voitureId"
              value={formData.voitureId}
              onChange={(e) => setFormData({ ...formData, voitureId: e.target.value })}
              required
              InputLabelProps={{ htmlFor: 'voitureId' }}
              sx={{ 
                fontSize: 18,
                mt: 2,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '8px'
                }
              }}
            >
              {voitures.map((voiture) => (
                <MenuItem key={voiture.id} value={voiture.id} sx={{ fontSize: 16 }}>
                  {voiture.marque} {voiture.modele} - {voiture.immatriculation}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              type="date"
              label="Date"
              name="date"
              id="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              InputLabelProps={{ shrink: true, htmlFor: 'date' }}
              sx={{ 
                fontSize: 18,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '8px'
                }
              }}
              inputProps={{ min: today }}
            />
            <TextField
              select
              label="Type d'entretien"
              name="type"
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              required
              InputLabelProps={{ htmlFor: 'type' }}
              sx={{ 
                fontSize: 18,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '8px'
                }
              }}
            >
              <MenuItem value="Vidange">Vidange</MenuItem>
              <MenuItem value="Pneus">Pneus</MenuItem>
              <MenuItem value="Huile">Huile</MenuItem>
              <MenuItem value="Moteur">Moteur</MenuItem>
              <MenuItem value="Autre">Autre</MenuItem>
            </TextField>
            <TextField
              type="number"
              label="Coût (KMF)"
              name="cout"
              id="cout"
              value={formData.cout}
              onChange={(e) => setFormData({ ...formData, cout: e.target.value })}
              InputLabelProps={{ htmlFor: 'cout' }}
              sx={{ 
                fontSize: 18,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '8px'
                }
              }}
              required
              inputProps={{ min: 0 }}
            />
            <TextField
              label="Fournisseur"
              name="fournisseur"
              id="fournisseur"
              value={formData.fournisseur}
              onChange={(e) => setFormData({ ...formData, fournisseur: e.target.value })}
              InputLabelProps={{ htmlFor: 'fournisseur' }}
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
              type="number"
              label="Kilométrage"
              name="kilometrage"
              id="kilometrage"
              value={formData.kilometrage}
              onChange={(e) => setFormData({ ...formData, kilometrage: e.target.value })}
              InputLabelProps={{ htmlFor: 'kilometrage' }}
              sx={{ 
                fontSize: 18,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '8px'
                }
              }}
              inputProps={{ min: 0 }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{
          background: 'linear-gradient(135deg, rgba(224, 64, 251, 0.1) 0%, rgba(213, 0, 249, 0.1) 100%)',
          backdropFilter: 'blur(10px)',
          padding: '16px 24px'
        }}>
          <Button 
            onClick={() => setOpenDialog(false)} 
            variant="outlined"
            sx={{
              backgroundColor: 'rgba(224, 64, 251, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(224, 64, 251, 0.8)',
              color: '#E040FB',
              borderRadius: '12px',
              boxShadow: '0 4px 16px rgba(224, 64, 251, 0.2)',
              '&:hover': {
                backgroundColor: 'rgba(224, 64, 251, 0.2)',
                border: '2px solid rgba(224, 64, 251, 1)',
                color: '#fff',
                boxShadow: '0 8px 24px rgba(224, 64, 251, 0.3)',
              },
            }}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, rgba(255, 214, 0, 0.9) 0%, rgba(0, 184, 212, 0.9) 100%)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: '#333',
              borderRadius: '12px',
              '&:hover': {
                background: 'linear-gradient(135deg, rgba(0, 184, 212, 0.9) 0%, rgba(255, 214, 0, 0.9) 100%)',
                color: '#fff',
                transform: 'translateY(-2px) scale(1.04)',
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            {editingId ? 'Modifier' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>

      <Paper sx={{ 
        p: 3,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        border: '2px solid rgba(255, 255, 255, 0.8)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.5)'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ 
            fontSize: 20, 
            fontWeight: 'bold', 
            color: '#333',
            textShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}>
            Liste des Entretiens ({filteredEntretiens.length})
          </Typography>
        </Box>
        
        {/* Filtres de recherche */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <TextField
            type="date"
            label="Filtrer par date"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
            sx={{ 
              minWidth: 200,
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                '&:hover': {
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
                },
                '&.Mui-focused': {
                  border: '1px solid rgba(68, 138, 255, 0.4)',
                  boxShadow: '0 4px 16px rgba(68, 138, 255, 0.1)'
                }
              }
            }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            select
            label="Filtrer par type"
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            sx={{ 
              minWidth: 150,
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                '&:hover': {
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
                },
                '&.Mui-focused': {
                  border: '1px solid rgba(68, 138, 255, 0.4)',
                  boxShadow: '0 4px 16px rgba(68, 138, 255, 0.1)'
                }
              }
            }}
          >
            <MenuItem value="">Tous les types</MenuItem>
            <MenuItem value="Vidange">Vidange</MenuItem>
            <MenuItem value="Pneus">Pneus</MenuItem>
          </TextField>
          <Button
            onClick={() => {
              setSearchDate('');
              setSearchType('');
            }}
            variant="outlined"
            sx={{
              backgroundColor: 'rgba(68, 138, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(68, 138, 255, 0.8)',
              color: '#448AFF',
              borderRadius: '12px',
              boxShadow: '0 4px 16px rgba(68, 138, 255, 0.2)',
              '&:hover': {
                backgroundColor: 'rgba(68, 138, 255, 0.2)',
                border: '2px solid rgba(68, 138, 255, 1)',
                color: '#fff',
                boxShadow: '0 8px 24px rgba(68, 138, 255, 0.3)',
              },
            }}
          >
            Effacer les filtres
          </Button>
        </Box>

        <TableContainer component={Paper} sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          border: '2px solid rgba(255, 255, 255, 0.8)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.5)',
          overflow: 'hidden'
        }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ 
                background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.9) 0%, rgba(66, 165, 245, 0.9) 100%)',
                backdropFilter: 'blur(10px)'
              }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: 16, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: 16, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>Voiture</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: 16, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>Date</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: 16, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>Type</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: 16, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>Kilométrage</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: 16, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>Coût (KMF)</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: 16, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>Fournisseur</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: 16, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedEntretiens.map((entretien, idx) => {
                const rowColors = [
                  'rgba(255, 249, 196, 0.8)', // Jaune
                  'rgba(187, 222, 251, 0.8)', // Bleu clair
                  'rgba(255, 205, 210, 0.8)', // Rose clair
                  'rgba(248, 187, 208, 0.8)', // Rose
                  'rgba(200, 230, 201, 0.8)', // Vert clair
                  'rgba(225, 190, 231, 0.8)'  // Violet clair
                ];
                const bgColor = rowColors[idx % rowColors.length];
                return (
                  <TableRow key={entretien.id} sx={{ 
                    backgroundColor: bgColor,
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      backgroundColor: `${bgColor.replace('0.8', '0.9')}`,
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                    },
                    transition: 'all 0.3s ease'
                  }}>
                    <TableCell sx={{ fontSize: 16, textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>{entretien.id}</TableCell>
                    <TableCell sx={{ fontSize: 16, textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>{getVoitureName(entretien.voitureId)}</TableCell>
                    <TableCell sx={{ fontSize: 16, textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>{entretien.date}</TableCell>
                    <TableCell sx={{ fontSize: 16, textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>{entretien.type}</TableCell>
                    <TableCell sx={{ fontSize: 16, textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>{entretien.kilometrage || '-'}</TableCell>
                    <TableCell sx={{ fontSize: 16, textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                      {entretien.cout === '' || entretien.cout === null ? '0' : parseFloat(entretien.cout).toLocaleString()} KMF
                    </TableCell>
                    <TableCell sx={{ fontSize: 16, textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>{entretien.fournisseur || '-'}</TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => handleEdit(entretien)}
                        sx={{
                          backgroundColor: 'rgba(0, 184, 212, 0.1)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(0, 184, 212, 0.3)',
                          color: '#00B8D4',
                          borderRadius: '8px',
                          margin: '0 2px',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 184, 212, 0.2)',
                            border: '1px solid rgba(0, 184, 212, 0.5)',
                            transform: 'scale(1.1)',
                            boxShadow: '0 4px 16px rgba(0, 184, 212, 0.3)',
                          },
                          transition: 'all 0.2s ease-in-out',
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDelete(entretien.id)}
                        sx={{
                          backgroundColor: 'rgba(255, 82, 82, 0.1)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 82, 82, 0.3)',
                          color: '#FF5252',
                          borderRadius: '8px',
                          margin: '0 2px',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 82, 82, 0.2)',
                            border: '1px solid rgba(255, 82, 82, 0.5)',
                            transform: 'scale(1.1)',
                            boxShadow: '0 4px 16px rgba(255, 82, 82, 0.3)',
                          },
                          transition: 'all 0.2s ease-in-out',
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
              {/* Ligne total des coûts */}
              <TableRow>
                <TableCell colSpan={8} sx={{ p: 0, border: 0 }}>
                  <Box sx={{ 
                    mt: 2, 
                    mb: 1,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '12px',
                    padding: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
                  }}>
                    <Typography variant="subtitle1" sx={{ 
                      fontWeight: 'bold', 
                      color: '#333', 
                      mb: 1, 
                      fontSize: 22,
                      textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }}>
                      Total des coûts:
                    </Typography>
                    {totalCoutsParVoiture.length === 0 ? (
                      <Typography variant="body2" color="textSecondary">Aucun coût enregistré.</Typography>
                    ) : (
                      totalCoutsParVoiture.map(({ voiture, total }) => (
                        <Box key={voiture.id} sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          ml: 2, 
                          mb: 0.5,
                          padding: '8px 12px',
                          backgroundColor: 'rgba(255, 255, 255, 0.5)',
                          borderRadius: '8px',
                          border: '1px solid rgba(255, 255, 255, 0.2)'
                        }}>
                          <Typography variant="body1" sx={{ 
                            color: '#000', 
                            fontWeight: 'bold', 
                            fontSize: 20,
                            textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                          }}>
                            {voiture.marque} {voiture.modele} ({voiture.immatriculation})
                          </Typography>
                          <Typography variant="body1" sx={{ 
                            color: '#000', 
                            fontWeight: 'bold', 
                            fontSize: 20, 
                            minWidth: 120, 
                            textAlign: 'right',
                            textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                          }}>
                            {total.toLocaleString()} KMF
                          </Typography>
                        </Box>
                      ))
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ display: 'flex', my: 3 }}>
          <Button
            onClick={() => {
              setOpenDialog(true);
              setEditingId(null);
              setFormData({
                voitureId: '',
                date: today,
                type: '',
                cout: '',
                fournisseur: '',
                kilometrage: ''
              });
            }}
            sx={{
              background: 'linear-gradient(135deg, rgba(255, 214, 0, 0.9) 0%, rgba(0, 184, 212, 0.9) 100%)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: '#333',
              fontSize: 16,
              fontWeight: 'bold',
              px: 4,
              py: 1.5,
              borderRadius: '12px',
              '&:hover': {
                background: 'linear-gradient(135deg, rgba(0, 184, 212, 0.9) 0%, rgba(255, 214, 0, 0.9) 100%)',
                color: '#fff',
                transform: 'translateY(-2px) scale(1.04)',
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            AJOUTER UN ENTRETIEN
          </Button>
        </Box>
        
        {/* Bouton Exporter en PDF en bas à gauche */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 2 }}>
          <Button
            onClick={exportToPDF}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, rgba(255, 82, 82, 0.9) 0%, rgba(68, 138, 255, 0.9) 100%)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: '#fff',
              fontSize: 16,
              fontWeight: 'bold',
              px: 3,
              py: 1.5,
              borderRadius: '12px',
              '&:hover': {
                background: 'linear-gradient(135deg, rgba(68, 138, 255, 0.9) 0%, rgba(255, 82, 82, 0.9) 100%)',
                color: '#fff',
                transform: 'translateY(-2px) scale(1.04)',
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Exporter en PDF
          </Button>
        </Box>
      </Paper>
      
      {/* Dialog de confirmation de suppression */}
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
            Êtes-vous sûr de vouloir supprimer cet entretien ?
          </DialogContentText>
          
          {entretienToDelete && (
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
                Détails de l'entretien
              </Typography>
              
              <Box sx={{ display: 'grid', gap: '8px', fontSize: '0.95rem' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 'bold', color: '#666' }}>Voiture:</span>
                  <span style={{ color: '#333' }}>
                    {getVoitureName(entretienToDelete.voitureId)}
                  </span>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 'bold', color: '#666' }}>Type:</span>
                  <span style={{ color: '#333' }}>{entretienToDelete.type}</span>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 'bold', color: '#666' }}>Date:</span>
                  <span style={{ color: '#333' }}>
                    {new Date(entretienToDelete.date).toLocaleDateString('fr-FR')}
                  </span>
                </Box>
                {entretienToDelete.cout && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 'bold', color: '#666' }}>Coût:</span>
                    <span style={{ color: '#333', fontWeight: 'bold' }}>
                      {parseFloat(entretienToDelete.cout).toLocaleString()} KMF
                    </span>
                  </Box>
                )}
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
    </Container>
  );
};

export default Entretiens;
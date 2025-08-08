import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Alert,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { 
  Email as EmailIcon,
  Sms as SmsIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { rappelsService } from '../services/api';

const Rappels = () => {
  const [rappels, setRappels] = useState([]);
  const [historique, setHistorique] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingRappelId, setLoadingRappelId] = useState(null); // Ajouté
  const [configDialog, setConfigDialog] = useState(false);
  const [config, setConfig] = useState({
    email: '',
    password: '',
    vonageApiKey: '',
    vonageApiSecret: '',
    vonagePhoneNumber: '',
    whatsappNumber: ''
  });

  const fetchRappels = async () => {
    try {
      setLoading(true);
      const response = await rappelsService.getAll();
      setRappels(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des rappels:', error);
      toast.error('Erreur lors du chargement des rappels');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistorique = async () => {
    try {
      const response = await rappelsService.getHistorique();
      setHistorique(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
      toast.error('Erreur lors du chargement de l\'historique');
    }
  };

  const fetchConfig = async () => {
    try {
      const response = await rappelsService.getConfig();
      setConfig(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration:', error);
      toast.error('Erreur lors du chargement de la configuration');
    }
  };

  useEffect(() => {
    fetchRappels();
    fetchHistorique();
    fetchConfig();
  }, []);

  const envoyerRappelManuel = async (entretienId) => {
    setLoadingRappelId(entretienId); // Ajouté
    console.log('envoyerRappelManuel appelé', entretienId);
    try {
      setLoading(true);
      const response = await rappelsService.envoyerRappel(entretienId);
      console.log('Réponse backend:', response.data);
      
      if (response.data.email_envoye || response.data.sms_envoye) {
        toast.success('Rappel envoyé avec succès!');
        fetchRappels();
        fetchHistorique();
      } else {
        toast.warning('Aucun rappel envoyé (vérifiez la configuration)');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du rappel:', error);
      toast.error('Erreur lors de l\'envoi du rappel');
    } finally {
      setLoading(false);
      setLoadingRappelId(null); // Ajouté
    }
  };

  const saveConfig = async () => {
    try {
      setLoading(true);
      await rappelsService.updateConfig(config);
      toast.success('Configuration sauvegardée avec succès!');
      setConfigDialog(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la configuration:', error);
      toast.error('Erreur lors de la sauvegarde de la configuration');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (date) => {
    const entretienDate = new Date(date);
    const aujourdhui = new Date();
    const diffTime = entretienDate - aujourdhui;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'error';
    if (diffDays <= 3) return 'warning';
    return 'success';
  };

  const getStatusText = (date) => {
    const entretienDate = new Date(date);
    const aujourdhui = new Date();
    const diffTime = entretienDate - aujourdhui;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'En retard';
    if (diffDays === 0) return 'Aujourd\'hui';
    if (diffDays === 1) return 'Demain';
    return `Dans ${diffDays} jours`;
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" sx={{ 
        mb: 3, 
        fontWeight: 'bold', 
        color: '#FF5252',
        textShadow: '0 2px 4px rgba(0,0,0,0.3)',
        textAlign: 'center'
      }}>
        Système de Rappels
      </Typography>

      {/* Alertes d'information */}
      <Box sx={{ mb: 3 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body1">
            <strong>Système de rappel automatique :</strong> Les rappels sont envoyés automatiquement 3 jours avant chaque entretien.
            Les notifications sont envoyées par email (obligatoire) et SMS (optionnel) si configurés.
          </Typography>
        </Alert>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="outlined"
            onClick={() => setConfigDialog(true)}
            sx={{
              borderColor: '#448AFF',
              color: '#448AFF',
              fontWeight: 'bold',
              fontSize: 16,
              px: 3,
              py: 1.5,
              '&:hover': {
                backgroundColor: 'rgba(68, 138, 255, 0.08)',
                borderColor: '#1976D2',
                color: '#1976D2',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            ⚙️ Configuration des Rappels
          </Button>
        </Box>
      </Box>

      {/* Entretiens à venir */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#333' }}>
          Entretiens à venir (7 prochains jours)
        </Typography>
        
        {rappels.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="textSecondary">
              Aucun entretien prévu dans les 7 prochains jours
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ background: 'linear-gradient(90deg, #448AFF 0%, #E040FB 100%)' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Véhicule</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Type</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Statut</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Contact</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rappels.map((rappel) => (
                  <TableRow key={rappel.id} sx={{ '&:nth-of-type(odd)': { backgroundColor: '#f5f5f5' } }}>
                    <TableCell>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {rappel.marque} {rappel.modele}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {rappel.immatriculation}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={rappel.type} 
                        color={rappel.type === 'Vidange' ? 'primary' : 'secondary'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(rappel.date).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatusText(rappel.date)}
                        color={getStatusColor(rappel.date)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        {rappel.email_contact && (
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            <EmailIcon sx={{ fontSize: 16, mr: 0.5, color: '#666' }} />
                            <Typography variant="body2" color="textSecondary">
                              {rappel.email_contact}
                            </Typography>
                          </Box>
                        )}
                        {rappel.telephone_contact && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <SmsIcon sx={{ fontSize: 16, mr: 0.5, color: '#666' }} />
                            <Typography variant="body2" color="textSecondary">
                              {rappel.telephone_contact}
                            </Typography>
                          </Box>
                        )}
                        {!rappel.email_contact && !rappel.telephone_contact && (
                          <Typography variant="body2" color="error">
                            Aucun contact configuré
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<SendIcon />}
                        onClick={() => envoyerRappelManuel(rappel.id)}
                        disabled={loadingRappelId === rappel.id}
                        sx={{ background: 'linear-gradient(90deg, #FFD600 0%, #00B8D4 100%)', color: '#333', fontWeight: 'bold', '&:hover': { background: 'linear-gradient(90deg, #00B8D4 0%, #FFD600 100%)', color: '#fff', transform: 'translateY(-2px) scale(1.04)', boxShadow: '0 6px 12px rgba(0,0,0,0.18)' }, transition: 'all 0.3s ease' }}
                      >
                        {loadingRappelId === rappel.id ? 'Envoi...' : 'Envoyer'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Historique des rappels */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#333' }}>
          Historique des rappels envoyés
        </Typography>
        
        {historique.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="textSecondary">
              Aucun rappel envoyé pour le moment
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ background: 'linear-gradient(90deg, #448AFF 0%, #E040FB 100%)' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Véhicule</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Entretien</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Type de rappel</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date d'envoi</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Statut</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {historique.map((rappel) => (
                  <TableRow key={rappel.id} sx={{ '&:nth-of-type(odd)': { backgroundColor: '#f5f5f5' } }}>
                    <TableCell>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {rappel.marque} {rappel.modele}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {rappel.immatriculation}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1">
                        {rappel.type_entretien}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {new Date(rappel.date_entretien).toLocaleDateString('fr-FR')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {rappel.type.includes('email') && (
                          <Chip icon={<EmailIcon />} label="Email" size="small" color="primary" />
                        )}
                        {rappel.type.includes('sms') && (
                          <Chip icon={<SmsIcon />} label="SMS" size="small" color="secondary" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {new Date(rappel.date_envoi).toLocaleString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={rappel.statut} 
                        color={rappel.statut === 'envoye' ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Dialog de configuration */}
      <Dialog open={configDialog} onClose={() => setConfigDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Configuration des rappels</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Configurez vos paramètres pour les notifications email et SMS.
          </Typography>
          
          <Typography variant="h6" sx={{ mb: 2 }}>Configuration Email (Gmail)</Typography>
          <TextField
            fullWidth
            label="Email Gmail"
            value={config.email}
            onChange={(e) => setConfig({ ...config, email: e.target.value })}
            sx={{ mb: 2 }}
            placeholder="votre-email@gmail.com"
          />
          <TextField
            fullWidth
            label="Mot de passe d'application"
            type="password"
            value={config.password}
            onChange={(e) => setConfig({ ...config, password: e.target.value })}
            sx={{ mb: 3 }}
            placeholder="Mot de passe d'application Gmail"
            helperText="Utilisez un mot de passe d'application Gmail, pas votre mot de passe principal"
          />

          <Typography variant="h6" sx={{ mb: 2 }}>Configuration SMS (Vonage) - Optionnel</Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Les SMS sont optionnels. Laissez ces champs vides si vous ne voulez pas utiliser les SMS.
              <br />
              <strong>Numéros de test Vonage :</strong> +15005550006 (valide), +15005550007 (invalide)
            </Typography>
          </Alert>
          <TextField
            fullWidth
            label="API Key"
            value={config.vonageApiKey}
            onChange={(e) => setConfig({ ...config, vonageApiKey: e.target.value })}
            sx={{ mb: 2 }}
            placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (optionnel)"
          />
          <TextField
            fullWidth
            label="API Secret"
            type="password"
            value={config.vonageApiSecret}
            onChange={(e) => setConfig({ ...config, vonageApiSecret: e.target.value })}
            sx={{ mb: 2 }}
            placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (optionnel)"
          />
          <TextField
            fullWidth
            label="Numéro Vonage"
            value={config.vonagePhoneNumber}
            onChange={(e) => setConfig({ ...config, vonagePhoneNumber: e.target.value })}
            placeholder="+1234567890 (optionnel)"
          />

          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Configuration WhatsApp (Vonage) - Optionnel</Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Les messages WhatsApp sont optionnels. Laissez ces champs vides si vous ne voulez pas utiliser les WhatsApp.
              <br />
              <strong>Numéros de test WhatsApp :</strong> +15005550006 (valide), +15005550007 (invalide)
            </Typography>
          </Alert>
          <TextField
            fullWidth
            label="Numéro WhatsApp"
            value={config.whatsappNumber}
            onChange={(e) => setConfig({ ...config, whatsappNumber: e.target.value })}
            placeholder="+1234567890 (optionnel)"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfigDialog(false)} sx={{ color: '#E040FB', borderColor: '#E040FB', fontWeight: 'bold', fontSize: 16, '&:hover': { color: '#fff', backgroundColor: 'rgba(224, 64, 251, 0.08)', borderColor: '#D500F9' } }}>
            Annuler
          </Button>
          <Button onClick={saveConfig} variant="contained" disabled={loading}>
            {loading ? 'Sauvegarde en cours...' : 'Sauvegarder'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Rappels; 
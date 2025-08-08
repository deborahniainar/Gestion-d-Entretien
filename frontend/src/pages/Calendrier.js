import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { Paper, Typography } from '@mui/material';
import { entretiensService } from '../services/api';

export default function Calendrier() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEntretiens = async () => {
      try {
        const res = await entretiensService.getAll();
        // Ajout d'un log pour debug
        console.log('Réponse API /entretiens:', res.data);
        // Sécurise pour toujours avoir un tableau
        setEvents(Array.isArray(res.data) ? res.data : (Array.isArray(res.data.entretiens) ? res.data.entretiens : []));
      } catch (error) {
        console.error('Erreur chargement entretiens:', error);
      }
    };
    fetchEntretiens();
  }, []);

  return (
    <Paper sx={{ padding: 2 }}>
      <Typography variant="h4" sx={{ 
        mb: 3, 
        fontWeight: 'bold', 
        color: '#1976d2',
        textShadow: '0 2px 4px rgba(0,0,0,0.3)',
        textAlign: 'center'
      }}>
        Calendrier des Entretiens
      </Typography>
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={events}
        height="auto"
      />
    </Paper>
  );
}

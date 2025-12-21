import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { timeTrackingApi, TimeEntry } from '../services/api/timeTracking';
import { format } from 'date-fns';

export default function TimeTracking() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const theme = useTheme();

  useEffect(() => {
    loadEntries();
    loadActiveEntry();
  }, [selectedDate]);

  const loadEntries = async () => {
    try {
      setLoading(true);
      const startDate = new Date(selectedDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(selectedDate);
      endDate.setHours(23, 59, 59, 999);
      
      const data = await timeTrackingApi.getAll(
        undefined,
        startDate.toISOString(),
        endDate.toISOString()
      );
      setEntries(data);
    } catch (error) {
      console.error('Error loading entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadActiveEntry = async () => {
    try {
      const active = await timeTrackingApi.getActive();
      setActiveEntry(active);
    } catch (error) {
      console.error('Error loading active entry:', error);
    }
  };

  const handleStart = async () => {
    try {
      await timeTrackingApi.start();
      await loadActiveEntry();
      await loadEntries();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Fehler beim Starten der Zeiterfassung');
    }
  };

  const handleStop = async () => {
    try {
      await timeTrackingApi.stop();
      setActiveEntry(null);
      await loadEntries();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Fehler beim Stoppen der Zeiterfassung');
    }
  };

  const calculateDuration = (start: string, end?: string, breakDuration: number = 0) => {
    if (!end) return 'Läuft...';
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const minutes = Math.floor((endTime - startTime) / 1000 / 60) - breakDuration;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Möchten Sie diesen Eintrag wirklich löschen?')) {
      try {
        await timeTrackingApi.delete(id);
        loadEntries();
      } catch (error) {
        console.error('Error deleting entry:', error);
      }
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h4" gutterBottom>
        Zeiterfassung
      </Typography>

      {/* Active Timer */}
      {activeEntry && (
        <Paper sx={{ p: 3, mb: 3, bgcolor: '#e3f2fd' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6">Aktive Zeiterfassung</Typography>
              <Typography variant="body2" color="text.secondary">
                Gestartet: {format(new Date(activeEntry.start_time), 'HH:mm:ss')}
              </Typography>
              {activeEntry.description && (
                <Typography variant="body2">{activeEntry.description}</Typography>
              )}
            </Box>
            <Button
              variant="contained"
              color="error"
              startIcon={<StopIcon />}
              onClick={handleStop}
            >
              Stoppen
            </Button>
          </Box>
        </Paper>
      )}

      {/* Controls */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
          mb: 3,
          p: 2,
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
          boxShadow: '0 6px 18px rgba(0,0,0,0.04)',
        }}
      >
        <TextField
          type="date"
          label="Datum"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        {!activeEntry && (
          <Button
            variant="contained"
            startIcon={<PlayArrowIcon />}
            onClick={handleStart}
          >
            Start
          </Button>
        )}
      </Box>

      {/* Time Entries Table */}
      <TableContainer component={Paper} sx={{ boxShadow: '0 10px 20px rgba(0,0,0,0.06)', borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Typ</TableCell>
              <TableCell>Start</TableCell>
              <TableCell>Ende</TableCell>
              <TableCell>Pause</TableCell>
              <TableCell>Dauer</TableCell>
              <TableCell>Projekt</TableCell>
              <TableCell>Beschreibung</TableCell>
              <TableCell>Aktionen</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">Lädt...</TableCell>
              </TableRow>
            ) : entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">Keine Zeiteinträge für diesen Tag</TableCell>
              </TableRow>
            ) : (
              entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <Chip label={entry.type} size="small" />
                  </TableCell>
                  <TableCell>{format(new Date(entry.start_time), 'HH:mm')}</TableCell>
                  <TableCell>{entry.end_time ? format(new Date(entry.end_time), 'HH:mm') : '-'}</TableCell>
                  <TableCell>{entry.break_duration} min</TableCell>
                  <TableCell>{calculateDuration(entry.start_time, entry.end_time, entry.break_duration)}</TableCell>
                  <TableCell>{entry.project_name || '-'}</TableCell>
                  <TableCell>{entry.description || '-'}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(entry.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}



















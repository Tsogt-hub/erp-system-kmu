import { useState, useEffect, useCallback, useRef } from 'react';
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
  Chip,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Alert,
  Snackbar,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  AccessTime as TimeIcon,
  Timer as TimerIcon,
} from '@mui/icons-material';
import { timeTrackingApi, TimeEntry, CreateTimeEntryData } from '../services/api/timeTracking';
import { projectsApi, Project } from '../services/api/projects';

// Helper function to format duration
const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Helper function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

// Helper function to format time
const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function Timesheets() {
  // State
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeTimer, setActiveTimer] = useState<TimeEntry | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Modal state
  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [formData, setFormData] = useState<CreateTimeEntryData>({
    project_id: undefined,
    start_time: '',
    end_time: '',
    break_duration: 0,
    description: '',
    type: 'work',
  });

  // Quick start state
  const [quickDescription, setQuickDescription] = useState('');
  const [quickProjectId, setQuickProjectId] = useState<number | ''>('');

  // Timer interval ref
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Calculate statistics
  const calculateStats = useCallback(() => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1); // Monday
    weekStart.setHours(0, 0, 0, 0);
    
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    let weekHours = 0;
    let monthHours = 0;
    let billableHours = 0;

    timeEntries.forEach(entry => {
      if (!entry.end_time) return; // Skip active entries
      
      const entryDate = new Date(entry.start_time);
      const durationMinutes = entry.duration_minutes || 0;
      const hours = durationMinutes / 60;

      if (entryDate >= weekStart) {
        weekHours += hours;
      }
      if (entryDate >= monthStart) {
        monthHours += hours;
      }
      if (entry.type === 'billable' || entry.type === 'work') {
        billableHours += hours;
      }
    });

    // Add active timer to stats
    if (activeTimer) {
      const activeHours = elapsedSeconds / 3600;
      const activeDate = new Date(activeTimer.start_time);
      if (activeDate >= weekStart) {
        weekHours += activeHours;
      }
      if (activeDate >= monthStart) {
        monthHours += activeHours;
      }
      billableHours += activeHours;
    }

    return {
      weekHours: weekHours.toFixed(1),
      monthHours: monthHours.toFixed(1),
      billableHours: billableHours.toFixed(1),
      revenue: (billableHours * 85).toFixed(2), // €85/hour average
    };
  }, [timeEntries, activeTimer, elapsedSeconds]);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [entriesData, projectsData, activeData] = await Promise.all([
        timeTrackingApi.getAll(),
        projectsApi.getAll(),
        timeTrackingApi.getActive(),
      ]);
      
      setTimeEntries(entriesData);
      setProjects(projectsData);
      
      if (activeData) {
        setActiveTimer(activeData);
        // Calculate elapsed time
        const startTime = new Date(activeData.start_time).getTime();
        const now = Date.now();
        setElapsedSeconds(Math.floor((now - startTime) / 1000));
      }
    } catch (err: any) {
      setError(err.message || 'Fehler beim Laden der Daten');
    } finally {
      setLoading(false);
    }
  }, []);

  // Start timer effect
  useEffect(() => {
    if (activeTimer) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setElapsedSeconds(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [activeTimer]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Start timer
  const handleStartTimer = async () => {
    try {
      const entry = await timeTrackingApi.start(
        quickProjectId || undefined,
        quickDescription || undefined
      );
      setActiveTimer(entry);
      setElapsedSeconds(0);
      setQuickDescription('');
      setQuickProjectId('');
      setSuccess('Timer gestartet!');
    } catch (err: any) {
      setError(err.message || 'Fehler beim Starten des Timers');
    }
  };

  // Stop timer
  const handleStopTimer = async () => {
    try {
      const entry = await timeTrackingApi.stop();
      setActiveTimer(null);
      setTimeEntries(prev => [entry, ...prev.filter(e => e.id !== entry.id)]);
      setSuccess('Timer gestoppt und Zeit gespeichert!');
    } catch (err: any) {
      setError(err.message || 'Fehler beim Stoppen des Timers');
    }
  };

  // Open create modal
  const handleOpenCreate = () => {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 16);
    setFormData({
      project_id: undefined,
      start_time: dateStr,
      end_time: dateStr,
      break_duration: 0,
      description: '',
      type: 'work',
    });
    setModalMode('create');
    setEditingEntry(null);
    setOpenModal(true);
  };

  // Open edit modal
  const handleOpenEdit = (entry: TimeEntry) => {
    setFormData({
      project_id: entry.project_id,
      start_time: new Date(entry.start_time).toISOString().slice(0, 16),
      end_time: entry.end_time ? new Date(entry.end_time).toISOString().slice(0, 16) : '',
      break_duration: entry.break_duration || 0,
      description: entry.description || '',
      type: entry.type,
    });
    setModalMode('edit');
    setEditingEntry(entry);
    setOpenModal(true);
  };

  // Save entry
  const handleSave = async () => {
    try {
      if (modalMode === 'create') {
        const entry = await timeTrackingApi.create(formData);
        setTimeEntries(prev => [entry, ...prev]);
        setSuccess('Zeiteintrag erstellt!');
      } else if (editingEntry) {
        const entry = await timeTrackingApi.update(editingEntry.id, formData);
        setTimeEntries(prev => prev.map(e => e.id === entry.id ? entry : e));
        setSuccess('Zeiteintrag aktualisiert!');
      }
      setOpenModal(false);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Speichern');
    }
  };

  // Delete entry
  const handleDelete = async (id: number) => {
    if (!confirm('Zeiteintrag wirklich löschen?')) return;
    
    try {
      await timeTrackingApi.delete(id);
      setTimeEntries(prev => prev.filter(e => e.id !== id));
      setSuccess('Zeiteintrag gelöscht!');
    } catch (err: any) {
      setError(err.message || 'Fehler beim Löschen');
    }
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1280, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, letterSpacing: '-0.03em', color: '#000000', mb: 1 }}>
        Zeiterfassung
      </Typography>

      {/* Active Timer Card */}
      <Card
        sx={{
          background: activeTimer 
            ? 'linear-gradient(135deg, #34C759 0%, #30D158 100%)'
            : 'rgba(255, 255, 255, 0.72)',
          backdropFilter: 'blur(60px) saturate(150%)',
          borderRadius: '20px',
          border: activeTimer ? 'none' : '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow: activeTimer 
            ? '0 15px 35px rgba(52, 199, 89, 0.4)'
            : '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
          overflow: 'visible',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {activeTimer ? (
            // Timer is running
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'pulse 2s infinite',
                    '@keyframes pulse': {
                      '0%': { boxShadow: '0 0 0 0 rgba(255,255,255,0.4)' },
                      '70%': { boxShadow: '0 0 0 15px rgba(255,255,255,0)' },
                      '100%': { boxShadow: '0 0 0 0 rgba(255,255,255,0)' },
                    },
                  }}
                >
                  <TimerIcon sx={{ fontSize: 32, color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: 'white', fontFamily: 'monospace', letterSpacing: 2 }}>
                    {formatDuration(elapsedSeconds)}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                    {activeTimer.description || 'Keine Beschreibung'}
                    {activeTimer.project_name && ` • ${activeTimer.project_name}`}
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                size="large"
                startIcon={<StopIcon />}
                onClick={handleStopTimer}
                sx={{
                  background: 'rgba(255,255,255,0.95)',
                  color: '#FF3B30',
                  fontWeight: 700,
                  borderRadius: '14px',
                  px: 4,
                  py: 1.5,
                  textTransform: 'none',
                  fontSize: '1rem',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
                  '&:hover': {
                    background: 'white',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                  },
                }}
              >
                Timer stoppen
              </Button>
            </Box>
          ) : (
            // Timer is not running - show start options
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <TimeIcon sx={{ fontSize: 28, color: '#007AFF' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Timer starten
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel size="small">Projekt (optional)</InputLabel>
                  <Select
                    value={quickProjectId}
                    onChange={(e) => setQuickProjectId(e.target.value as number | '')}
                    label="Projekt (optional)"
                    size="small"
                    sx={{ borderRadius: '10px' }}
                  >
                    <MenuItem value="">Kein Projekt</MenuItem>
                    {projects.map(project => (
                      <MenuItem key={project.id} value={project.id}>
                        {project.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  placeholder="Was arbeitest du gerade?"
                  value={quickDescription}
                  onChange={(e) => setQuickDescription(e.target.value)}
                  size="small"
                  sx={{ 
                    flex: 1, 
                    minWidth: 250,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                    }
                  }}
                />
                <Button
                  variant="contained"
                  startIcon={<PlayIcon />}
                  onClick={handleStartTimer}
                  sx={{
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                    background: 'linear-gradient(135deg, #34C759 0%, #30D158 100%)',
                    boxShadow: '0 4px 15px rgba(52, 199, 89, 0.35)',
                    '&:hover': {
                      boxShadow: '0 6px 20px rgba(52, 199, 89, 0.45)',
                    },
                  }}
                >
                  Timer starten
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 1 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: 'rgba(255, 255, 255, 0.72)',
              backdropFilter: 'blur(60px) saturate(150%)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
              height: '100%',
            }}
          >
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0 }}>
                Diese Woche
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#007AFF' }}>
                {stats.weekHours} Std.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: 'rgba(255, 255, 255, 0.72)',
              backdropFilter: 'blur(60px) saturate(150%)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
              height: '100%',
            }}
          >
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0 }}>
                Diesen Monat
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#34C759' }}>
                {stats.monthHours} Std.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: 'rgba(255, 255, 255, 0.72)',
              backdropFilter: 'blur(60px) saturate(150%)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
              height: '100%',
            }}
          >
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0 }}>
                Abrechenbar
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#FF9500' }}>
                {stats.billableHours} Std.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: 'rgba(255, 255, 255, 0.72)',
              backdropFilter: 'blur(60px) saturate(150%)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
              height: '100%',
            }}
          >
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0 }}>
                Umsatz
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#AF52DE' }}>
                {stats.revenue} €
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
          sx={{
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
            boxShadow: '0 4px 12px rgba(0, 122, 255, 0.3)',
          }}
        >
          Zeit manuell erfassen
        </Button>
      </Box>

      {/* Time Entries Table */}
      <TableContainer
        component={Paper}
        sx={{
          background: 'rgba(255, 255, 255, 0.72)',
          backdropFilter: 'blur(60px) saturate(150%)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Datum</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Projekt</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Beschreibung</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Start</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Ende</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Dauer</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Aktionen</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {timeEntries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                    <TimeIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                    <Typography color="text.secondary">
                      Keine Zeiteinträge vorhanden.
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Starte den Timer oben oder erfasse Zeit manuell.
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              timeEntries.map((entry) => (
                <TableRow key={entry.id} hover>
                  <TableCell>{formatDate(entry.start_time)}</TableCell>
                  <TableCell>
                    {entry.project_name ? (
                      <Chip 
                        label={entry.project_name} 
                        size="small" 
                        sx={{ 
                          bgcolor: 'rgba(0, 122, 255, 0.1)',
                          color: '#007AFF',
                          fontWeight: 500,
                        }}
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">—</Typography>
                    )}
                  </TableCell>
                  <TableCell>{entry.description || '—'}</TableCell>
                  <TableCell>{formatTime(entry.start_time)}</TableCell>
                  <TableCell>
                    {entry.end_time ? formatTime(entry.end_time) : (
                      <Chip 
                        label="Läuft..." 
                        size="small" 
                        color="success" 
                        sx={{ animation: 'pulse 2s infinite' }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                      {entry.duration_hours || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={entry.type === 'billable' ? 'Abrechenbar' : entry.type === 'work' ? 'Arbeit' : entry.type}
                      size="small"
                      sx={{
                        bgcolor: entry.type === 'billable' ? 'rgba(52, 199, 89, 0.1)' : 'rgba(255, 149, 0, 0.1)',
                        color: entry.type === 'billable' ? '#34C759' : '#FF9500',
                        fontWeight: 500,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                      <Tooltip title="Bearbeiten">
                        <IconButton size="small" onClick={() => handleOpenEdit(entry)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Löschen">
                        <IconButton size="small" color="error" onClick={() => handleDelete(entry.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Modal */}
      <Dialog 
        open={openModal} 
        onClose={() => setOpenModal(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(40px)',
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {modalMode === 'create' ? 'Zeit erfassen' : 'Zeiteintrag bearbeiten'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Projekt</InputLabel>
              <Select
                value={formData.project_id || ''}
                onChange={(e) => setFormData({ ...formData, project_id: e.target.value as number || undefined })}
                label="Projekt"
              >
                <MenuItem value="">Kein Projekt</MenuItem>
                {projects.map(project => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Beschreibung"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={2}
              fullWidth
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Startzeit"
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Endzeit"
                type="datetime-local"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Pause (Minuten)"
                type="number"
                value={formData.break_duration}
                onChange={(e) => setFormData({ ...formData, break_duration: parseInt(e.target.value) || 0 })}
                sx={{ width: 150 }}
              />
              <FormControl sx={{ flex: 1 }}>
                <InputLabel>Typ</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  label="Typ"
                >
                  <MenuItem value="work">Arbeit</MenuItem>
                  <MenuItem value="billable">Abrechenbar</MenuItem>
                  <MenuItem value="internal">Intern</MenuItem>
                  <MenuItem value="break">Pause</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenModal(false)} sx={{ borderRadius: '10px' }}>
            Abbrechen
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            sx={{
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
            }}
          >
            {modalMode === 'create' ? 'Erstellen' : 'Speichern'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbars */}
      <Snackbar
        open={!!error}
        autoHideDuration={5000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ borderRadius: '12px' }}>
          {error}
        </Alert>
      </Snackbar>
      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccess(null)} severity="success" sx={{ borderRadius: '12px' }}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
}

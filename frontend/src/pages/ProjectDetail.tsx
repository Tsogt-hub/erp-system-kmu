import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  CircularProgress,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { projectsApi, Project } from '../services/api/projects';
import { timeTrackingApi, TimeEntry } from '../services/api/timeTracking';
import { ticketsApi, Ticket } from '../services/api/tickets';
import { pipelinesApi, PipelineConfig } from '../services/api/pipelines';
import { format } from 'date-fns';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [pipelineConfig, setPipelineConfig] = useState<PipelineConfig | null>(null);

  useEffect(() => {
    if (id) {
      loadProjectData();
    }
  }, [id]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      const projectId = parseInt(id!);

      // Load project
      const projectData = await projectsApi.getById(projectId);
      setProject(projectData);

      // Load pipeline config if project has pipeline
      if (projectData.project_type) {
        try {
          const stats = await pipelinesApi.getStats(projectData.project_type);
          const pipeline = Array.isArray(stats) 
            ? stats.find((s) => s.pipeline.id === projectData.project_type)?.pipeline
            : stats?.pipeline;
          if (pipeline) {
            setPipelineConfig(pipeline);
          }
        } catch (error) {
          console.error('Error loading pipeline config:', error);
        }
      }

      // Load time entries
      const timeData = await timeTrackingApi.getAll(projectId);
      setTimeEntries(timeData);

      // Load tickets
      const ticketsData = await ticketsApi.getAll();
      const projectTickets = ticketsData.filter(t => t.project_id === projectId);
      setTickets(projectTickets);
    } catch (error) {
      console.error('Error loading project data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePipelineStepChange = async (newStep: string) => {
    if (!project) return;
    try {
      await pipelinesApi.moveProject(project.id, newStep);
      await loadProjectData(); // Reload to get updated project
    } catch (error) {
      console.error('Error updating pipeline step:', error);
      alert('Fehler beim Aktualisieren des Pipeline-Schritts');
    }
  };

  const calculateTotalHours = (entries: TimeEntry[]) => {
    return entries.reduce((total, entry) => {
      if (entry.end_time) {
        const start = new Date(entry.start_time).getTime();
        const end = new Date(entry.end_time).getTime();
        const minutes = (end - start) / 1000 / 60 - (entry.break_duration || 0);
        return total + minutes / 60;
      }
      return total;
    }, 0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'completed': return 'default';
      case 'draft': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!project) {
    return <Typography>Projekt nicht gefunden</Typography>;
  }

  const totalHours = calculateTotalHours(timeEntries);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/projects')}>
          Zurück
        </Button>
      </Box>

      {/* Projekt Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              {project.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Referenz: {project.reference}
            </Typography>
          </Box>
          <Chip
            label={project.status}
            color={getStatusColor(project.status) as any}
            size="medium"
          />
        </Box>

        {project.description && (
          <Typography variant="body1" sx={{ mt: 2 }}>
            {project.description}
          </Typography>
        )}

        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Kunde
                </Typography>
                <Typography variant="h6">
                  {project.customer_name || '-'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Erfasst Stunden
                </Typography>
                <Typography variant="h6">
                  {totalHours.toFixed(1)}h
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Tickets
                </Typography>
                <Typography variant="h6">
                  {tickets.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Erstellt
                </Typography>
                <Typography variant="h6">
                  {format(new Date(project.created_at), 'dd.MM.yyyy')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Paper>
        <Tabs value={tabValue} onChange={(_e, newValue) => setTabValue(newValue)}>
          <Tab label="Zeiteinträge" />
          <Tab label="Tickets" />
          <Tab label="Details" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Datum</TableCell>
                  <TableCell>Start</TableCell>
                  <TableCell>Ende</TableCell>
                  <TableCell>Dauer</TableCell>
                  <TableCell>Beschreibung</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {timeEntries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Keine Zeiteinträge für dieses Projekt
                    </TableCell>
                  </TableRow>
                ) : (
                  timeEntries.map((entry) => {
                    const start = new Date(entry.start_time);
                    const end = entry.end_time ? new Date(entry.end_time) : null;
                    const duration = end
                      ? ((end.getTime() - start.getTime()) / 1000 / 60 - (entry.break_duration || 0)) / 60
                      : 0;

                    return (
                      <TableRow key={entry.id}>
                        <TableCell>{format(start, 'dd.MM.yyyy')}</TableCell>
                        <TableCell>{format(start, 'HH:mm')}</TableCell>
                        <TableCell>{end ? format(end, 'HH:mm') : '-'}</TableCell>
                        <TableCell>{duration.toFixed(1)}h</TableCell>
                        <TableCell>{entry.description || '-'}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Titel</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Priorität</TableCell>
                  <TableCell>Fälligkeitsdatum</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      Keine Tickets für dieses Projekt
                    </TableCell>
                  </TableRow>
                ) : (
                  tickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell>{ticket.title}</TableCell>
                      <TableCell>
                        <Chip
                          label={ticket.status}
                          size="small"
                          color={
                            ticket.status === 'open'
                              ? 'error'
                              : ticket.status === 'in_progress'
                              ? 'warning'
                              : 'success'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Chip label={ticket.priority} size="small" />
                      </TableCell>
                      <TableCell>
                        {ticket.due_date ? format(new Date(ticket.due_date), 'dd.MM.yyyy') : '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Projektinformationen
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={project.status}
                  color={getStatusColor(project.status) as any}
                  sx={{ mt: 0.5 }}
                />
              </Box>
              {project.project_type && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Pipeline-Typ
                  </Typography>
                  <Chip
                    label={project.project_type}
                    variant="outlined"
                    sx={{ mt: 0.5 }}
                  />
                </Box>
              )}
              {pipelineConfig && project.pipeline_step && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Pipeline-Schritt
                  </Typography>
                  <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                    <InputLabel>Pipeline-Schritt</InputLabel>
                    <Select
                      value={project.pipeline_step}
                      label="Pipeline-Schritt"
                      onChange={(e) => handlePipelineStepChange(e.target.value)}
                    >
                      {pipelineConfig.steps.map((step) => (
                        <MenuItem key={step.id} value={step.id}>
                          {step.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              )}
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Quelle
                </Typography>
                <Typography variant="body1">{project.source || '-'}</Typography>
              </Box>
              {project.start_date && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Startdatum
                  </Typography>
                  <Typography variant="body1">
                    {format(new Date(project.start_date), 'dd.MM.yyyy')}
                  </Typography>
                </Box>
              )}
              {project.end_date && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Enddatum
                  </Typography>
                  <Typography variant="body1">
                    {format(new Date(project.end_date), 'dd.MM.yyyy')}
                  </Typography>
                </Box>
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Statistiken
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Gesamt erfasste Stunden
                </Typography>
                <Typography variant="h5">{totalHours.toFixed(1)}h</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Anzahl Zeiteinträge
                </Typography>
                <Typography variant="h5">{timeEntries.length}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Anzahl Tickets
                </Typography>
                <Typography variant="h5">{tickets.length}</Typography>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Box>
  );
}


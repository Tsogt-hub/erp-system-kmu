import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { format } from 'date-fns';
import { pipelinesApi, PipelineStats } from '../services/api/pipelines';
import { projectsApi, Project } from '../services/api/projects';
import PipelineKanban from './PipelineKanban';

export default function PipelineView() {
  const { type, step } = useParams<{ type?: string; step?: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [pipelineStats, setPipelineStats] = useState<PipelineStats | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<'kanban' | 'detail'>(searchParams.get('view') === 'kanban' ? 'kanban' : 'detail');

  useEffect(() => {
    loadPipelineData();
  }, [type, step]);

  const loadPipelineData = async () => {
    try {
      setLoading(true);
      if (type) {
        const stats = await pipelinesApi.getStats(type);
        if (Array.isArray(stats)) {
          setPipelineStats(stats.find((s) => s.pipeline.id === type) || null);
        } else {
          setPipelineStats(stats);
        }

        if (step) {
          const projectData = await pipelinesApi.getProjectsByStep(type, step);
          setProjects(projectData);
        }
      }
    } catch (error) {
      console.error('Error loading pipeline data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMoveProject = async (projectId: number, newStepId: string) => {
    try {
      await pipelinesApi.moveProject(projectId, newStepId);
      loadPipelineData();
    } catch (error) {
      console.error('Error moving project:', error);
      alert('Fehler beim Verschieben des Projekts');
    }
  };

  const getStepColor = (index: number): string => {
    const colors = [
      '#1976d2',
      '#2e7d32',
      '#ed6c02',
      '#d32f2f',
      '#9c27b0',
      '#0288d1',
      '#388e3c',
      '#f57c00',
      '#c2185b',
      '#7b1fa2',
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Lade...</Typography>
      </Box>
    );
  }

  if (!pipelineStats) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Pipeline nicht gefunden</Typography>
        <Button onClick={() => navigate('/projects')}>Zurück zu Projekten</Button>
      </Box>
    );
  }

  // Wenn keine Step-Auswahl und Kanban-View, zeige Kanban
  if (!step && viewMode === 'kanban') {
    return <PipelineKanban />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <IconButton onClick={() => navigate('/projects')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">
          {pipelineStats.pipeline.icon} {pipelineStats.pipeline.name}
        </Typography>
        <Chip label={`Gesamt: ${pipelineStats.total}`} color="primary" />
        <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
          <Button
            variant={viewMode === 'kanban' ? 'contained' : 'outlined'}
            startIcon={<ViewKanbanIcon />}
            onClick={() => {
              setViewMode('kanban');
              setSearchParams({ view: 'kanban' });
            }}
            size="small"
          >
            Kanban
          </Button>
          <Button
            variant={viewMode === 'detail' ? 'contained' : 'outlined'}
            startIcon={<ViewModuleIcon />}
            onClick={() => {
              setViewMode('detail');
              setSearchParams({ view: 'detail' });
            }}
            size="small"
          >
            Detail
          </Button>
        </Box>
      </Box>

      {step ? (
        // Detail-Ansicht für einen spezifischen Schritt - Hero-Struktur mit Spalten
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {pipelineStats.pipeline.steps.find((s) => s.id === step)?.name || step}
          </Typography>
          
          {/* Hero-Struktur: Tabelle mit Spalten */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Projekt</TableCell>
                  <TableCell>Referenz</TableCell>
                  <TableCell>Kunde</TableCell>
                  <TableCell>Typ</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Startdatum</TableCell>
                  <TableCell>Enddatum</TableCell>
                  <TableCell>Pipeline-Schritt</TableCell>
                  <TableCell>Aktionen</TableCell>
                </TableRow>
                {/* Filter-Zeile wie bei Hero ERP */}
                <TableRow sx={{ backgroundColor: '#FAFAFA' }}>
                  <TableCell>
                    <TextField
                      size="small"
                      placeholder="Projekt"
                      fullWidth
                      variant="outlined"
                      sx={{ '& .MuiOutlinedInput-root': { backgroundColor: '#FFFFFF' } }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      placeholder="Referenz"
                      fullWidth
                      variant="outlined"
                      sx={{ '& .MuiOutlinedInput-root': { backgroundColor: '#FFFFFF' } }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      placeholder="Kunde"
                      fullWidth
                      variant="outlined"
                      sx={{ '& .MuiOutlinedInput-root': { backgroundColor: '#FFFFFF' } }}
                    />
                  </TableCell>
                  <TableCell>
                    <FormControl size="small" fullWidth>
                      <Select
                        displayEmpty
                        sx={{ backgroundColor: '#FFFFFF' }}
                      >
                        <MenuItem value="">Alle</MenuItem>
                        <MenuItem value="pv">PV</MenuItem>
                        <MenuItem value="heatpump">Wärmepumpe</MenuItem>
                        <MenuItem value="service">Service</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <FormControl size="small" fullWidth>
                      <Select
                        displayEmpty
                        sx={{ backgroundColor: '#FFFFFF' }}
                      >
                        <MenuItem value="">Alle</MenuItem>
                        <MenuItem value="draft">Entwurf</MenuItem>
                        <MenuItem value="active">Aktiv</MenuItem>
                        <MenuItem value="completed">Abgeschlossen</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell />
                  <TableCell />
                  <TableCell>
                    <FormControl size="small" fullWidth>
                      <Select
                        displayEmpty
                        sx={{ backgroundColor: '#FFFFFF' }}
                      >
                        <MenuItem value="">Alle</MenuItem>
                        {pipelineStats.pipeline.steps.map((s) => (
                          <MenuItem key={s.id} value={s.id}>
                            {s.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<SearchIcon />}
                        sx={{ minWidth: 'auto', px: 1 }}
                      >
                        Suchen
                      </Button>
                      <IconButton
                        size="small"
                        onClick={() => {
                          // Reset filters
                        }}
                      >
                        <ClearIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">Lädt...</TableCell>
                  </TableRow>
                ) : projects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">Keine Projekte gefunden</TableCell>
                  </TableRow>
                ) : (
                  projects.map((project) => (
                    <TableRow key={project.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/projects/${project.id}`)}>
                      <TableCell>{project.name}</TableCell>
                      <TableCell>{project.reference || '-'}</TableCell>
                      <TableCell>{project.customer_name || '-'}</TableCell>
                      <TableCell>
                        <Chip
                          label={project.project_type || 'Allgemein'}
                          size="small"
                          color={project.project_type === 'pv' ? 'primary' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={project.status}
                          size="small"
                          color={
                            project.status === 'completed'
                              ? 'success'
                              : project.status === 'active'
                              ? 'primary'
                              : 'default'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        {project.start_date
                          ? format(new Date(project.start_date), 'dd.MM.yyyy')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {project.end_date
                          ? format(new Date(project.end_date), 'dd.MM.yyyy')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <FormControl size="small" fullWidth>
                          <Select
                            value={project.pipeline_step || ''}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleMoveProject(project.id, e.target.value);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            sx={{ minWidth: 150 }}
                          >
                            {pipelineStats.pipeline.steps.map((s) => (
                              <MenuItem key={s.id} value={s.id}>
                                {s.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => navigate(`/projects/${project.id}`)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Möchten Sie dieses Projekt wirklich löschen?')) {
                              // Handle delete
                            }
                          }}
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
      ) : (
        // Pipeline-Übersicht mit allen Schritten
        <Grid container spacing={2}>
          {pipelineStats.pipeline.steps.map((stepItem, index) => {
            const stepStats = pipelineStats.stats.find((s) => s.step === stepItem.id);
            const count = stepStats?.count || 0;
            const overdue = stepStats?.overdue || 0;

            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={stepItem.id}>
                <Card
                  sx={{
                    borderTop: `4px solid ${getStepColor(index)}`,
                    cursor: 'pointer',
                    '&:hover': {
                      boxShadow: 4,
                    },
                  }}
                  onClick={() => navigate(`/pipelines/${type}/${stepItem.id}`)}
                >
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      {stepItem.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                      <Chip
                        label={`${count} Projekte`}
                        size="small"
                        color={count > 0 ? 'primary' : 'default'}
                      />
                      {overdue > 0 && (
                        <Chip
                          label={`${overdue} überfällig`}
                          size="small"
                          color="error"
                        />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Klicken zum Anzeigen
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}


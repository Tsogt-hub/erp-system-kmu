import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { FormControl, Select, MenuItem } from '@mui/material';
import { projectsApi, Project, CreateProjectData } from '../services/api/projects';

export default function Projects() {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<CreateProjectData>({
    name: '',
    description: '',
    status: 'draft',
  });
  
  // Filter States
  const [filters, setFilters] = useState({
    name: '',
    reference: '',
    customer: '',
    status: '',
  });

  useEffect(() => {
    loadProjects();
  }, []);

  // Filter-Logik
  useEffect(() => {
    let result = projects;
    
    if (filters.name) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }
    if (filters.reference) {
      result = result.filter(p => 
        p.reference?.toLowerCase().includes(filters.reference.toLowerCase())
      );
    }
    if (filters.customer) {
      result = result.filter(p => 
        p.customer_name?.toLowerCase().includes(filters.customer.toLowerCase())
      );
    }
    if (filters.status) {
      result = result.filter(p => p.status === filters.status);
    }
    
    setFilteredProjects(result);
  }, [projects, filters]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await projectsApi.getAll();
      setProjects(data);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await projectsApi.create(formData);
      setOpen(false);
      setFormData({ name: '', description: '', status: 'draft' });
      loadProjects();
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Möchten Sie dieses Projekt wirklich löschen?')) {
      try {
        await projectsApi.delete(id);
        loadProjects();
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Projekte</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
        >
          Neues Projekt
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Referenz</TableCell>
              <TableCell>Kunde</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Startdatum</TableCell>
              <TableCell>Aktionen</TableCell>
            </TableRow>
            {/* Filter-Zeile wie bei Hero ERP */}
            <TableRow sx={{ backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : '#FAFAFA' }}>
              <TableCell>
                <TextField
                  size="small"
                  placeholder="Name"
                  fullWidth
                  variant="outlined"
                  value={filters.name}
                  onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                />
              </TableCell>
              <TableCell>
                <TextField
                  size="small"
                  placeholder="Referenz"
                  fullWidth
                  variant="outlined"
                  value={filters.reference}
                  onChange={(e) => setFilters({ ...filters, reference: e.target.value })}
                />
              </TableCell>
              <TableCell>
                <TextField
                  size="small"
                  placeholder="Kunde"
                  fullWidth
                  variant="outlined"
                  value={filters.customer}
                  onChange={(e) => setFilters({ ...filters, customer: e.target.value })}
                />
              </TableCell>
              <TableCell>
                <FormControl size="small" fullWidth>
                  <Select
                    displayEmpty
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  >
                    <MenuItem value="">Alle</MenuItem>
                    <MenuItem value="draft">Entwurf</MenuItem>
                    <MenuItem value="active">Aktiv</MenuItem>
                    <MenuItem value="completed">Abgeschlossen</MenuItem>
                  </Select>
                </FormControl>
              </TableCell>
              <TableCell />
              <TableCell>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<SearchIcon />}
                    sx={{ minWidth: 'auto', px: 1 }}
                    onClick={() => {
                      // Filter wird automatisch durch useEffect angewendet
                    }}
                  >
                    Suchen
                  </Button>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setFilters({ name: '', reference: '', customer: '', status: '' });
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
                <TableCell colSpan={6} align="center">
                  Lädt...
                </TableCell>
              </TableRow>
            ) : filteredProjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Keine Projekte gefunden
                </TableCell>
              </TableRow>
            ) : (
              filteredProjects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>{project.name}</TableCell>
                  <TableCell>{project.reference}</TableCell>
                  <TableCell>{project.customer_name || '-'}</TableCell>
                  <TableCell>{project.status}</TableCell>
                  <TableCell>
                    {project.start_date
                      ? new Date(project.start_date).toLocaleDateString('de-DE')
                      : '-'}
                  </TableCell>
                  <TableCell>
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
                      onClick={() => handleDelete(project.id)}
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

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Neues Projekt erstellen</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Projektname"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Beschreibung"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            margin="normal"
            multiline
            rows={3}
          />
          <TextField
            fullWidth
            select
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            margin="normal"
            SelectProps={{ native: true }}
          >
            <option value="draft">Entwurf</option>
            <option value="active">Aktiv</option>
            <option value="completed">Abgeschlossen</option>
            <option value="cancelled">Abgebrochen</option>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Abbrechen</Button>
          <Button onClick={handleCreate} variant="contained" disabled={!formData.name}>
            Erstellen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}


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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { ticketsApi, Ticket, CreateTicketData } from '../services/api/tickets';
import { format } from 'date-fns';

export default function Tickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [formData, setFormData] = useState<CreateTicketData>({
    title: '',
    description: '',
    status: 'open',
    priority: 'medium',
  });

  useEffect(() => {
    loadTickets();
  }, [statusFilter]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const status = statusFilter === 'all' ? undefined : statusFilter;
      const data = await ticketsApi.getAll(status);
      setTickets(data);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await ticketsApi.create(formData);
      setOpen(false);
      setFormData({ title: '', description: '', status: 'open', priority: 'medium' });
      loadTickets();
    } catch (error) {
      console.error('Error creating ticket:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Möchten Sie dieses Ticket wirklich löschen?')) {
      try {
        await ticketsApi.delete(id);
        loadTickets();
      } catch (error) {
        console.error('Error deleting ticket:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'error';
      case 'in_progress': return 'warning';
      case 'resolved': return 'success';
      case 'closed': return 'default';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'default';
      case 'medium': return 'warning';
      case 'high': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Tickets</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
          Neues Ticket
        </Button>
      </Box>

      <Box sx={{ mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">Alle</MenuItem>
            <MenuItem value="open">Offen</MenuItem>
            <MenuItem value="in_progress">In Bearbeitung</MenuItem>
            <MenuItem value="resolved">Gelöst</MenuItem>
            <MenuItem value="closed">Geschlossen</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Titel</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priorität</TableCell>
              <TableCell>Zugewiesen</TableCell>
              <TableCell>Fälligkeitsdatum</TableCell>
              <TableCell>Erstellt</TableCell>
              <TableCell>Aktionen</TableCell>
            </TableRow>
            {/* Filter-Zeile wie bei Hero ERP */}
            <TableRow sx={{ backgroundColor: '#FAFAFA' }}>
              <TableCell>
                <TextField
                  size="small"
                  placeholder="Titel"
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
                    <MenuItem value="open">Offen</MenuItem>
                    <MenuItem value="in_progress">In Bearbeitung</MenuItem>
                    <MenuItem value="resolved">Gelöst</MenuItem>
                    <MenuItem value="closed">Geschlossen</MenuItem>
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
                    <MenuItem value="low">Niedrig</MenuItem>
                    <MenuItem value="medium">Mittel</MenuItem>
                    <MenuItem value="high">Hoch</MenuItem>
                  </Select>
                </FormControl>
              </TableCell>
              <TableCell>
                <TextField
                  size="small"
                  placeholder="Zugewiesen"
                  fullWidth
                  variant="outlined"
                  sx={{ '& .MuiOutlinedInput-root': { backgroundColor: '#FFFFFF' } }}
                />
              </TableCell>
              <TableCell />
              <TableCell />
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
                <TableCell colSpan={7} align="center">Lädt...</TableCell>
              </TableRow>
            ) : tickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">Keine Tickets gefunden</TableCell>
              </TableRow>
            ) : (
              tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>{ticket.title}</TableCell>
                  <TableCell>
                    <Chip
                      label={ticket.status}
                      color={getStatusColor(ticket.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={ticket.priority}
                      color={getPriorityColor(ticket.priority) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{ticket.assigned_user_name || '-'}</TableCell>
                  <TableCell>
                    {ticket.due_date ? format(new Date(ticket.due_date), 'dd.MM.yyyy') : '-'}
                  </TableCell>
                  <TableCell>{format(new Date(ticket.created_at), 'dd.MM.yyyy')}</TableCell>
                  <TableCell>
                    <IconButton size="small" color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(ticket.id)}
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
        <DialogTitle>Neues Ticket erstellen</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Titel"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Beschreibung"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Priorität</InputLabel>
            <Select
              value={formData.priority}
              label="Priorität"
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            >
              <MenuItem value="low">Niedrig</MenuItem>
              <MenuItem value="medium">Mittel</MenuItem>
              <MenuItem value="high">Hoch</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            type="date"
            label="Fälligkeitsdatum"
            value={formData.due_date || ''}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Abbrechen</Button>
          <Button onClick={handleCreate} variant="contained" disabled={!formData.title}>
            Erstellen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}


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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { format } from 'date-fns';
import { tasksApi, Task, CreateTaskData } from '../services/api/tasks';

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState<CreateTaskData>({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    due_date: '',
  });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tasksApi.getAll();
      setTasks(data);
    } catch (err) {
      console.error('Error loading tasks:', err);
      setError('Fehler beim Laden der Aufgaben');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      if (editingTask) {
        // Update
        await tasksApi.update(editingTask.id, formData);
      } else {
        // Create
        await tasksApi.create(formData);
      }
      setOpen(false);
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        due_date: '',
      });
      loadTasks();
    } catch (err) {
      console.error('Error saving task:', err);
      setError('Fehler beim Speichern der Aufgabe');
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      due_date: task.due_date || '',
    });
    setOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Möchten Sie diese Aufgabe wirklich löschen?')) {
      try {
        await tasksApi.delete(id);
        loadTasks();
      } catch (err) {
        console.error('Error deleting task:', err);
        setError('Fehler beim Löschen der Aufgabe');
      }
    }
  };

  const handleStatusChange = async (id: number, status: 'todo' | 'in_progress' | 'done') => {
    try {
      await tasksApi.update(id, { status });
      loadTasks();
    } catch (err) {
      console.error('Error updating task status:', err);
      setError('Fehler beim Aktualisieren des Status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'default';
      case 'in_progress': return 'warning';
      case 'done': return 'success';
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Aufgaben</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => {
          setEditingTask(null);
          setFormData({ title: '', description: '', status: 'todo', priority: 'medium', due_date: '' });
          setOpen(true);
        }}>
          Neue Aufgabe
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Titel</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priorität</TableCell>
              <TableCell>Fälligkeitsdatum</TableCell>
              <TableCell>Erstellt</TableCell>
              <TableCell>Aktionen</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Keine Aufgaben vorhanden
                </TableCell>
              </TableRow>
            ) : (
              tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>{task.title}</TableCell>
                  <TableCell>
                    <Chip label={task.status} color={getStatusColor(task.status) as any} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip label={task.priority} color={getPriorityColor(task.priority) as any} size="small" />
                  </TableCell>
                  <TableCell>
                    {task.due_date ? format(new Date(task.due_date), 'dd.MM.yyyy') : '-'}
                  </TableCell>
                  <TableCell>{format(new Date(task.created_at), 'dd.MM.yyyy')}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      color="success"
                      onClick={() => handleStatusChange(task.id, 'done')}
                      title="Als erledigt markieren"
                    >
                      <CheckCircleIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleEdit(task)}
                      title="Bearbeiten"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(task.id)}
                      title="Löschen"
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

      <Dialog open={open} onClose={() => { setOpen(false); setEditingTask(null); }} maxWidth="sm" fullWidth>
        <DialogTitle>{editingTask ? 'Aufgabe bearbeiten' : 'Neue Aufgabe'}</DialogTitle>
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
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.status}
              label="Status"
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            >
              <MenuItem value="todo">Zu erledigen</MenuItem>
              <MenuItem value="in_progress">In Bearbeitung</MenuItem>
              <MenuItem value="done">Erledigt</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Priorität</InputLabel>
            <Select
              value={formData.priority}
              label="Priorität"
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
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
            value={formData.due_date}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpen(false); setEditingTask(null); }}>Abbrechen</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!formData.title}>
            {editingTask ? 'Speichern' : 'Erstellen'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}



















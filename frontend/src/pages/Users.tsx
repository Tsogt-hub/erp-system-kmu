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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { usersApi, User, UpdateUserData } from '../services/api/users';
import { format } from 'date-fns';

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UpdateUserData>({
    first_name: '',
    last_name: '',
    email: '',
    role_id: 3,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await usersApi.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role_id: user.role_id,
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!editingUser) return;

    try {
      await usersApi.update(editingUser.id, formData);
      setOpen(false);
      setEditingUser(null);
      loadUsers();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Möchten Sie diesen Benutzer wirklich löschen?')) {
      try {
        await usersApi.delete(id);
        loadUsers();
      } catch (error: any) {
        alert(error.response?.data?.error || 'Fehler beim Löschen');
      }
    }
  };

  const getRoleName = (roleId: number) => {
    const roles: { [key: number]: string } = {
      1: 'Admin',
      2: 'Manager',
      3: 'Mitarbeiter',
      4: 'Kunde',
    };
    return roles[roleId] || 'Unbekannt';
  };

  const getRoleColor = (roleId: number) => {
    const colors: { [key: number]: 'default' | 'primary' | 'secondary' | 'error' } = {
      1: 'error',
      2: 'primary',
      3: 'default',
      4: 'secondary',
    };
    return colors[roleId] || 'default';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Benutzerverwaltung</Typography>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>E-Mail</TableCell>
              <TableCell>Rolle</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Erstellt</TableCell>
              <TableCell>Aktionen</TableCell>
            </TableRow>
            {/* Filter-Zeile wie bei Hero ERP */}
            <TableRow sx={{ backgroundColor: '#FAFAFA' }}>
              <TableCell>
                <TextField
                  size="small"
                  placeholder="Name"
                  fullWidth
                  variant="outlined"
                  sx={{ '& .MuiOutlinedInput-root': { backgroundColor: '#FFFFFF' } }}
                />
              </TableCell>
              <TableCell>
                <TextField
                  size="small"
                  placeholder="E-Mail"
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
                    <MenuItem value="1">Admin</MenuItem>
                    <MenuItem value="2">Manager</MenuItem>
                    <MenuItem value="3">Mitarbeiter</MenuItem>
                    <MenuItem value="4">Kunde</MenuItem>
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
                    <MenuItem value="active">Aktiv</MenuItem>
                    <MenuItem value="inactive">Inaktiv</MenuItem>
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
                <TableCell colSpan={6} align="center">Lädt...</TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">Keine Benutzer gefunden</TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.first_name} {user.last_name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.role_name || getRoleName(user.role_id)}
                      color={getRoleColor(user.role_id)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.is_active ? 'Aktiv' : 'Inaktiv'}
                      color={user.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{format(new Date(user.created_at), 'dd.MM.yyyy')}</TableCell>
                  <TableCell>
                    <IconButton size="small" color="primary" onClick={() => handleEdit(user)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(user.id)}
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

      <Dialog open={open} onClose={() => { setOpen(false); setEditingUser(null); }} maxWidth="sm" fullWidth>
        <DialogTitle>Benutzer bearbeiten</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Vorname"
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Nachname"
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="E-Mail"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            margin="normal"
            required
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Rolle</InputLabel>
            <Select
              value={formData.role_id}
              label="Rolle"
              onChange={(e) => setFormData({ ...formData, role_id: e.target.value as number })}
            >
              <MenuItem value={1}>Admin</MenuItem>
              <MenuItem value={2}>Manager</MenuItem>
              <MenuItem value={3}>Mitarbeiter</MenuItem>
              <MenuItem value={4}>Kunde</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpen(false); setEditingUser(null); }}>Abbrechen</Button>
          <Button onClick={handleSave} variant="contained">
            Speichern
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}


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
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Autocomplete,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { inventoryMovementsApi, InventoryMovement, CreateMovementData, MovementStats } from '../services/api/inventoryMovements';
import { inventoryApi, Item } from '../services/api/inventory';
import { getContacts, Contact } from '../services/api/contacts';

export default function InventoryIncoming() {
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [stats, setStats] = useState<MovementStats | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [suppliers, setSuppliers] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [formData, setFormData] = useState<Omit<CreateMovementData, 'movement_type'>>({
    item_id: 0,
    quantity: 1,
    unit_price: 0,
    movement_date: new Date().toISOString().split('T')[0],
  });

  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  useEffect(() => {
    loadData();
  }, [dateFrom, dateTo]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters: { from_date?: string; to_date?: string } = {};
      if (dateFrom) filters.from_date = dateFrom;
      if (dateTo) filters.to_date = dateTo;

      const [movementsData, itemsData, contactsData] = await Promise.all([
        inventoryMovementsApi.getIncoming(filters).catch(() => []),
        inventoryApi.getItems().catch(() => []),
        getContacts().catch(() => []),
      ]);
      
      setMovements(movementsData);
      setItems(itemsData.filter(i => !i.is_service));
      setSuppliers(contactsData.filter(c => c.category === 'supplier'));
      
      // Calculate stats
      const statsData: MovementStats = {
        total_movements: movementsData.length,
        incoming_count: movementsData.length,
        outgoing_count: 0,
        incoming_value: movementsData.reduce((sum, m) => sum + (m.total_value || m.quantity * (m.unit_price || 0)), 0),
        outgoing_value: 0,
        net_change: movementsData.reduce((sum, m) => sum + m.quantity, 0),
      };
      setStats(statsData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Fehler beim Laden der Daten');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await inventoryMovementsApi.createIncoming(formData);
      setDialogOpen(false);
      setFormData({
        item_id: 0,
        quantity: 1,
        unit_price: 0,
        movement_date: new Date().toISOString().split('T')[0],
      });
      setSelectedItem(null);
      loadData();
    } catch (err) {
      console.error('Error saving:', err);
      setError('Fehler beim Speichern');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Möchten Sie diese Einbuchung wirklich löschen?')) {
      try {
        await inventoryMovementsApi.delete(id);
        loadData();
      } catch (err) {
        console.error('Error deleting:', err);
        setError('Fehler beim Löschen');
      }
    }
  };

  const handleItemSelect = (item: Item | null) => {
    setSelectedItem(item);
    if (item) {
      setFormData(prev => ({
        ...prev,
        item_id: item.id,
        unit_price: item.purchase_price || item.price,
      }));
    }
  };

  const filteredMovements = movements.filter(movement => {
    const searchLower = searchTerm.toLowerCase();
    return (
      movement.item_name?.toLowerCase().includes(searchLower) ||
      movement.item_sku?.toLowerCase().includes(searchLower) ||
      movement.supplier_name?.toLowerCase().includes(searchLower) ||
      movement.reference_number?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: 700, letterSpacing: '-0.03em', color: '#000000', mb: 3 }}
      >
        Einbuchungen
      </Typography>

      {/* Stats Cards */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              background: 'rgba(255, 255, 255, 0.72)',
              backdropFilter: 'blur(60px) saturate(150%)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
            }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Einbuchungen
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#34C759' }}>
                  {stats.incoming_count}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              background: 'rgba(255, 255, 255, 0.72)',
              backdropFilter: 'blur(60px) saturate(150%)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
            }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Warenwert
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#007AFF' }}>
                  {stats.incoming_value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              background: 'rgba(255, 255, 255, 0.72)',
              backdropFilter: 'blur(60px) saturate(150%)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
            }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Einheiten
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#5856D6' }}>
                  +{stats.net_change}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              background: 'rgba(255, 255, 255, 0.72)',
              backdropFilter: 'blur(60px) saturate(150%)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
            }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Ø Stückpreis
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#FF9500' }}>
                  {stats.net_change > 0 
                    ? (stats.incoming_value / stats.net_change).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })
                    : '0,00 €'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Toolbar */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          placeholder="Suchen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'rgba(0, 0, 0, 0.6)' }} /> }}
          sx={{ background: 'rgba(255, 255, 255, 0.72)', borderRadius: '10px', minWidth: 200 }}
        />
        <TextField
          label="Von"
          type="date"
          size="small"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ background: 'rgba(255, 255, 255, 0.72)', borderRadius: '10px', minWidth: 150 }}
        />
        <TextField
          label="Bis"
          type="date"
          size="small"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ background: 'rgba(255, 255, 255, 0.72)', borderRadius: '10px', minWidth: 150 }}
        />
        {(searchTerm || dateFrom || dateTo) && (
          <IconButton onClick={() => { setSearchTerm(''); setDateFrom(''); setDateTo(''); }}>
            <ClearIcon />
          </IconButton>
        )}
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
          sx={{
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #34C759 0%, #30D158 100%)',
            boxShadow: '0 4px 12px rgba(52, 199, 89, 0.3)',
          }}
        >
          Neue Einbuchung
        </Button>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} sx={{
        background: 'rgba(255, 255, 255, 0.72)',
        backdropFilter: 'blur(60px) saturate(150%)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
      }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Datum</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Artikel</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>SKU</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Menge</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Stückpreis</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Gesamtwert</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Lieferant</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Referenz</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Aktionen</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredMovements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    Keine Einbuchungen vorhanden.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredMovements.map((movement) => (
                <TableRow key={movement.id} hover>
                  <TableCell>
                    {format(new Date(movement.movement_date), 'dd.MM.yyyy', { locale: de })}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {movement.item_name}
                    </Typography>
                  </TableCell>
                  <TableCell>{movement.item_sku || '-'}</TableCell>
                  <TableCell>
                    <Chip label={`+${movement.quantity}`} color="success" size="small" />
                  </TableCell>
                  <TableCell>
                    {movement.unit_price 
                      ? movement.unit_price.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {movement.total_value 
                        ? movement.total_value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })
                        : (movement.quantity * (movement.unit_price || 0)).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                    </Typography>
                  </TableCell>
                  <TableCell>{movement.supplier_name || '-'}</TableCell>
                  <TableCell>{movement.reference_number || '-'}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleDelete(movement.id)} color="error">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
          Neue Einbuchung
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Autocomplete
                options={items}
                getOptionLabel={(option) => `${option.name} ${option.sku ? `(${option.sku})` : ''}`}
                value={selectedItem}
                onChange={(_, newValue) => handleItemSelect(newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="Artikel *" placeholder="Artikel suchen..." />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Menge *"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Stückpreis (€)"
                type="number"
                value={formData.unit_price || ''}
                onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) || 0 })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Lieferant</InputLabel>
                <Select
                  value={formData.supplier_id || ''}
                  label="Lieferant"
                  onChange={(e) => setFormData({ ...formData, supplier_id: Number(e.target.value) || undefined })}
                >
                  <MenuItem value="">Kein Lieferant</MenuItem>
                  {suppliers.map(s => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.first_name} {s.last_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Datum"
                type="date"
                value={formData.movement_date}
                onChange={(e) => setFormData({ ...formData, movement_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Chargen-Nr."
                value={formData.batch_number || ''}
                onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notizen"
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
          <Button onClick={() => setDialogOpen(false)}>Abbrechen</Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            disabled={!formData.item_id || formData.quantity < 1}
            sx={{ background: 'linear-gradient(135deg, #34C759 0%, #30D158 100%)' }}
          >
            Einbuchen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

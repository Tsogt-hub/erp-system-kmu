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
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as ReceivedIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { purchaseOrdersApi, PurchaseOrder, CreatePurchaseOrderData, PurchaseOrderStats } from '../services/api/purchaseOrders';
import { getContacts, Contact } from '../services/api/contacts';

export default function PurchaseOrders() {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [stats, setStats] = useState<PurchaseOrderStats | null>(null);
  const [suppliers, setSuppliers] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<CreatePurchaseOrderData>({
    supplier_id: 0,
    order_date: new Date().toISOString().split('T')[0],
    subtotal: 0,
    tax_rate: 19,
    tax_amount: 0,
    shipping_cost: 0,
    total_amount: 0,
  });

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters = statusFilter ? { status: statusFilter } : undefined;
      const [ordersData, contactsData] = await Promise.all([
        purchaseOrdersApi.getAll(filters).catch(() => []),
        getContacts(),
      ]);
      setOrders(ordersData);
      // Filter suppliers from contacts
      const supplierContacts = contactsData.filter(c => c.category === 'supplier');
      setSuppliers(supplierContacts);
      
      // Calculate stats locally
      const statsData: PurchaseOrderStats = {
        total: ordersData.length,
        pending: ordersData.filter(o => o.status === 'draft' || o.status === 'sent').length,
        in_transit: ordersData.filter(o => o.status === 'shipped').length,
        received: ordersData.filter(o => o.status === 'received' || o.status === 'completed').length,
        total_value: ordersData.reduce((sum, o) => sum + o.total_amount, 0),
        outstanding_value: ordersData
          .filter(o => o.payment_status !== 'paid')
          .reduce((sum, o) => sum + o.total_amount, 0),
      };
      setStats(statsData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Fehler beim Laden der Daten');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (order?: PurchaseOrder) => {
    if (order) {
      setEditingOrder(order);
      setFormData({
        supplier_id: order.supplier_id,
        order_date: order.order_date.split('T')[0],
        expected_delivery_date: order.expected_delivery_date?.split('T')[0],
        subtotal: order.subtotal,
        tax_rate: order.tax_rate,
        tax_amount: order.tax_amount,
        shipping_cost: order.shipping_cost,
        total_amount: order.total_amount,
        delivery_address: order.delivery_address,
        notes: order.notes,
      });
    } else {
      setEditingOrder(null);
      setFormData({
        supplier_id: 0,
        order_date: new Date().toISOString().split('T')[0],
        subtotal: 0,
        tax_rate: 19,
        tax_amount: 0,
        shipping_cost: 0,
        total_amount: 0,
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingOrder) {
        await purchaseOrdersApi.update(editingOrder.id, formData);
      } else {
        await purchaseOrdersApi.create(formData);
      }
      setDialogOpen(false);
      loadData();
    } catch (err) {
      console.error('Error saving order:', err);
      setError('Fehler beim Speichern');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Möchten Sie diese Bestellung wirklich löschen?')) {
      try {
        await purchaseOrdersApi.delete(id);
        loadData();
      } catch (err) {
        console.error('Error deleting order:', err);
        setError('Fehler beim Löschen');
      }
    }
  };

  const handleStatusChange = async (id: number, status: PurchaseOrder['status']) => {
    try {
      await purchaseOrdersApi.updateStatus(id, status);
      loadData();
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Fehler beim Aktualisieren des Status');
    }
  };

  const calculateTotals = (subtotal: number, taxRate: number, shipping: number) => {
    const taxAmount = (subtotal * taxRate) / 100;
    const totalAmount = subtotal + taxAmount + shipping;
    setFormData(prev => ({
      ...prev,
      subtotal,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      shipping_cost: shipping,
      total_amount: totalAmount,
    }));
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
      draft: 'default',
      sent: 'primary',
      confirmed: 'info',
      shipped: 'warning',
      received: 'success',
      completed: 'success',
      cancelled: 'error',
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: 'Entwurf',
      sent: 'Versendet',
      confirmed: 'Bestätigt',
      shipped: 'Unterwegs',
      received: 'Empfangen',
      completed: 'Abgeschlossen',
      cancelled: 'Storniert',
    };
    return labels[status] || status;
  };

  const filteredOrders = orders.filter(order => {
    const searchLower = searchTerm.toLowerCase();
    return (
      order.order_number?.toLowerCase().includes(searchLower) ||
      order.supplier_name?.toLowerCase().includes(searchLower)
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
        sx={{
          fontWeight: 700,
          letterSpacing: '-0.03em',
          color: '#000000',
          mb: 3,
        }}
      >
        Einkaufsbestellungen
      </Typography>

      {/* Stats Cards */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={2}>
            <Card
              sx={{
                background: 'rgba(255, 255, 255, 0.72)',
                backdropFilter: 'blur(60px) saturate(150%)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
              }}
            >
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Gesamt
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#007AFF' }}>
                  {stats.total}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card
              sx={{
                background: 'rgba(255, 255, 255, 0.72)',
                backdropFilter: 'blur(60px) saturate(150%)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
              }}
            >
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Ausstehend
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#FF9500' }}>
                  {stats.pending}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card
              sx={{
                background: 'rgba(255, 255, 255, 0.72)',
                backdropFilter: 'blur(60px) saturate(150%)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
              }}
            >
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Unterwegs
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#5856D6' }}>
                  {stats.in_transit}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card
              sx={{
                background: 'rgba(255, 255, 255, 0.72)',
                backdropFilter: 'blur(60px) saturate(150%)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
              }}
            >
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Empfangen
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#34C759' }}>
                  {stats.received}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card
              sx={{
                background: 'rgba(255, 255, 255, 0.72)',
                backdropFilter: 'blur(60px) saturate(150%)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
              }}
            >
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Gesamtwert
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#007AFF' }}>
                  {stats.total_value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card
              sx={{
                background: 'rgba(255, 255, 255, 0.72)',
                backdropFilter: 'blur(60px) saturate(150%)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
              }}
            >
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Offen
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#FF3B30' }}>
                  {stats.outstanding_value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
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
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'rgba(0, 0, 0, 0.6)' }} />,
          }}
          sx={{
            background: 'rgba(255, 255, 255, 0.72)',
            borderRadius: '10px',
            minWidth: 250,
          }}
        />

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ background: 'rgba(255, 255, 255, 0.72)', borderRadius: '10px' }}
          >
            <MenuItem value="">Alle</MenuItem>
            <MenuItem value="draft">Entwurf</MenuItem>
            <MenuItem value="sent">Versendet</MenuItem>
            <MenuItem value="confirmed">Bestätigt</MenuItem>
            <MenuItem value="shipped">Unterwegs</MenuItem>
            <MenuItem value="received">Empfangen</MenuItem>
            <MenuItem value="completed">Abgeschlossen</MenuItem>
            <MenuItem value="cancelled">Storniert</MenuItem>
          </Select>
        </FormControl>

        {searchTerm || statusFilter ? (
          <IconButton onClick={() => { setSearchTerm(''); setStatusFilter(''); }}>
            <ClearIcon />
          </IconButton>
        ) : null}

        <Box sx={{ flexGrow: 1 }} />

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
            boxShadow: '0 4px 12px rgba(0, 122, 255, 0.3)',
          }}
        >
          Neue Bestellung
        </Button>
      </Box>

      {/* Table */}
      <TableContainer
        component={Paper}
        sx={{
          background: 'rgba(255, 255, 255, 0.72)',
          backdropFilter: 'blur(60px) saturate(150%)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Bestellnummer</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Lieferant</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Bestelldatum</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Liefertermin</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Betrag</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Zahlung</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Aktionen</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    {orders.length === 0 
                      ? 'Keine Einkaufsbestellungen vorhanden. Erstellen Sie eine neue Bestellung.'
                      : 'Keine Bestellungen gefunden für die aktuelle Filterung.'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {order.order_number}
                    </Typography>
                  </TableCell>
                  <TableCell>{order.supplier_name || 'Unbekannt'}</TableCell>
                  <TableCell>
                    {format(new Date(order.order_date), 'dd.MM.yyyy', { locale: de })}
                  </TableCell>
                  <TableCell>
                    {order.expected_delivery_date 
                      ? format(new Date(order.expected_delivery_date), 'dd.MM.yyyy', { locale: de })
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {order.total_amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={getStatusLabel(order.status)} 
                      color={getStatusColor(order.status)} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={order.payment_status === 'paid' ? 'Bezahlt' : order.payment_status === 'partial' ? 'Teilweise' : 'Offen'}
                      color={order.payment_status === 'paid' ? 'success' : order.payment_status === 'partial' ? 'warning' : 'default'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Bearbeiten">
                      <IconButton size="small" onClick={() => handleOpenDialog(order)} color="primary">
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {order.status === 'draft' && (
                      <Tooltip title="An Lieferant senden">
                        <IconButton 
                          size="small" 
                          onClick={() => handleStatusChange(order.id, 'sent')} 
                          color="info"
                        >
                          <SendIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    {order.status === 'shipped' && (
                      <Tooltip title="Als empfangen markieren">
                        <IconButton 
                          size="small" 
                          onClick={() => handleStatusChange(order.id, 'received')} 
                          color="success"
                        >
                          <ReceivedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Löschen">
                      <IconButton size="small" onClick={() => handleDelete(order.id)} color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
          {editingOrder ? 'Bestellung bearbeiten' : 'Neue Einkaufsbestellung'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Lieferant *</InputLabel>
                <Select
                  value={formData.supplier_id}
                  label="Lieferant *"
                  onChange={(e) => setFormData({ ...formData, supplier_id: Number(e.target.value) })}
                >
                  {suppliers.length === 0 && (
                    <MenuItem value="" disabled>
                      Keine Lieferanten vorhanden - Erstellen Sie zuerst einen Kontakt mit Kategorie "Lieferant"
                    </MenuItem>
                  )}
                  {suppliers.map((supplier) => (
                    <MenuItem key={supplier.id} value={supplier.id}>
                      {supplier.first_name} {supplier.last_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Bestelldatum"
                type="date"
                value={formData.order_date}
                onChange={(e) => setFormData({ ...formData, order_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Erwarteter Liefertermin"
                type="date"
                value={formData.expected_delivery_date || ''}
                onChange={(e) => setFormData({ ...formData, expected_delivery_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Warenwert (€)"
                type="number"
                value={formData.subtotal}
                onChange={(e) => calculateTotals(parseFloat(e.target.value) || 0, formData.tax_rate, formData.shipping_cost || 0)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Steuersatz (%)"
                type="number"
                value={formData.tax_rate}
                onChange={(e) => calculateTotals(formData.subtotal, parseFloat(e.target.value) || 0, formData.shipping_cost || 0)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Versandkosten (€)"
                type="number"
                value={formData.shipping_cost || 0}
                onChange={(e) => calculateTotals(formData.subtotal, formData.tax_rate, parseFloat(e.target.value) || 0)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Gesamtbetrag"
                value={formData.total_amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                InputProps={{ readOnly: true }}
                sx={{ backgroundColor: '#f5f5f5' }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Lieferadresse"
                value={formData.delivery_address || ''}
                onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notizen"
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
          <Button onClick={() => setDialogOpen(false)}>Abbrechen</Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            disabled={!formData.supplier_id}
            sx={{
              background: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
            }}
          >
            {editingOrder ? 'Speichern' : 'Erstellen'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

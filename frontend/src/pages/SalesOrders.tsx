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
  Visibility as ViewIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as CompleteIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { salesOrdersApi, SalesOrder, CreateSalesOrderData, SalesOrderStats } from '../services/api/salesOrders';
import { getContacts, Contact } from '../services/api/contacts';
import { getCompanies, Company } from '../services/api/companies';

export default function SalesOrders() {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [stats, setStats] = useState<SalesOrderStats | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<SalesOrder | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<CreateSalesOrderData>({
    contact_id: 0,
    order_date: new Date().toISOString().split('T')[0],
    subtotal: 0,
    tax_rate: 19,
    tax_amount: 0,
    discount_amount: 0,
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
      const [ordersData, contactsData, companiesData] = await Promise.all([
        salesOrdersApi.getAll(filters).catch(() => []),
        getContacts(),
        getCompanies(),
      ]);
      setOrders(ordersData);
      setContacts(contactsData);
      setCompanies(companiesData);
      
      // Calculate stats locally if API doesn't provide them
      const statsData: SalesOrderStats = {
        total: ordersData.length,
        confirmed: ordersData.filter(o => o.status === 'confirmed').length,
        in_progress: ordersData.filter(o => o.status === 'in_progress').length,
        completed: ordersData.filter(o => o.status === 'completed').length,
        total_value: ordersData.reduce((sum, o) => sum + o.total_amount, 0),
      };
      setStats(statsData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Fehler beim Laden der Daten');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (order?: SalesOrder) => {
    if (order) {
      setEditingOrder(order);
      setFormData({
        contact_id: order.contact_id,
        company_id: order.company_id,
        offer_id: order.offer_id,
        order_date: order.order_date.split('T')[0],
        delivery_date: order.delivery_date?.split('T')[0],
        subtotal: order.subtotal,
        tax_rate: order.tax_rate,
        tax_amount: order.tax_amount,
        discount_amount: order.discount_amount,
        total_amount: order.total_amount,
        shipping_address: order.shipping_address,
        billing_address: order.billing_address,
        notes: order.notes,
      });
    } else {
      setEditingOrder(null);
      setFormData({
        contact_id: 0,
        order_date: new Date().toISOString().split('T')[0],
        subtotal: 0,
        tax_rate: 19,
        tax_amount: 0,
        discount_amount: 0,
        total_amount: 0,
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingOrder) {
        await salesOrdersApi.update(editingOrder.id, formData);
      } else {
        await salesOrdersApi.create(formData);
      }
      setDialogOpen(false);
      loadData();
    } catch (err) {
      console.error('Error saving order:', err);
      setError('Fehler beim Speichern');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Möchten Sie diesen Auftrag wirklich löschen?')) {
      try {
        await salesOrdersApi.delete(id);
        loadData();
      } catch (err) {
        console.error('Error deleting order:', err);
        setError('Fehler beim Löschen');
      }
    }
  };

  const handleStatusChange = async (id: number, status: SalesOrder['status']) => {
    try {
      await salesOrdersApi.updateStatus(id, status);
      loadData();
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Fehler beim Aktualisieren des Status');
    }
  };

  const calculateTotals = (subtotal: number, taxRate: number, discount: number) => {
    const taxAmount = (subtotal * taxRate) / 100;
    const totalAmount = subtotal + taxAmount - discount;
    setFormData(prev => ({
      ...prev,
      subtotal,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      discount_amount: discount,
      total_amount: totalAmount,
    }));
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
      draft: 'default',
      confirmed: 'primary',
      in_progress: 'info',
      shipped: 'warning',
      delivered: 'success',
      completed: 'success',
      cancelled: 'error',
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: 'Entwurf',
      confirmed: 'Bestätigt',
      in_progress: 'In Bearbeitung',
      shipped: 'Versendet',
      delivered: 'Geliefert',
      completed: 'Abgeschlossen',
      cancelled: 'Storniert',
    };
    return labels[status] || status;
  };

  const filteredOrders = orders.filter(order => {
    const searchLower = searchTerm.toLowerCase();
    return (
      order.order_number?.toLowerCase().includes(searchLower) ||
      order.contact_name?.toLowerCase().includes(searchLower) ||
      order.company_name?.toLowerCase().includes(searchLower)
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
        Verkaufsaufträge
      </Typography>

      {/* Stats Cards */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={2.4}>
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
          <Grid item xs={12} sm={6} md={2.4}>
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
                  Bestätigt
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#5856D6' }}>
                  {stats.confirmed}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
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
                  In Bearbeitung
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#FF9500' }}>
                  {stats.in_progress}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
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
                  Abgeschlossen
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#34C759' }}>
                  {stats.completed}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
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
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#34C759' }}>
                  {stats.total_value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
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
            <MenuItem value="confirmed">Bestätigt</MenuItem>
            <MenuItem value="in_progress">In Bearbeitung</MenuItem>
            <MenuItem value="shipped">Versendet</MenuItem>
            <MenuItem value="delivered">Geliefert</MenuItem>
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
          Neuer Auftrag
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
              <TableCell sx={{ fontWeight: 600 }}>Auftragsnummer</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Kunde</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Auftragsdatum</TableCell>
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
                      ? 'Keine Verkaufsaufträge vorhanden. Erstellen Sie einen neuen Auftrag oder konvertieren Sie ein Angebot.'
                      : 'Keine Aufträge gefunden für die aktuelle Filterung.'}
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
                  <TableCell>
                    {order.contact_name || 'Unbekannt'}
                    {order.company_name && (
                      <Typography variant="caption" display="block" color="text.secondary">
                        {order.company_name}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {format(new Date(order.order_date), 'dd.MM.yyyy', { locale: de })}
                  </TableCell>
                  <TableCell>
                    {order.delivery_date 
                      ? format(new Date(order.delivery_date), 'dd.MM.yyyy', { locale: de })
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
                    {order.status === 'confirmed' && (
                      <Tooltip title="In Bearbeitung setzen">
                        <IconButton 
                          size="small" 
                          onClick={() => handleStatusChange(order.id, 'in_progress')} 
                          color="info"
                        >
                          <ShippingIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    {order.status === 'delivered' && (
                      <Tooltip title="Abschließen">
                        <IconButton 
                          size="small" 
                          onClick={() => handleStatusChange(order.id, 'completed')} 
                          color="success"
                        >
                          <CompleteIcon fontSize="small" />
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
          {editingOrder ? 'Auftrag bearbeiten' : 'Neuer Verkaufsauftrag'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Kunde *</InputLabel>
                <Select
                  value={formData.contact_id}
                  label="Kunde *"
                  onChange={(e) => setFormData({ ...formData, contact_id: Number(e.target.value) })}
                >
                  {contacts.map((contact) => (
                    <MenuItem key={contact.id} value={contact.id}>
                      {contact.first_name} {contact.last_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Unternehmen</InputLabel>
                <Select
                  value={formData.company_id || ''}
                  label="Unternehmen"
                  onChange={(e) => setFormData({ ...formData, company_id: Number(e.target.value) || undefined })}
                >
                  <MenuItem value="">Kein Unternehmen</MenuItem>
                  {companies.map((company) => (
                    <MenuItem key={company.id} value={company.id}>
                      {company.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Auftragsdatum"
                type="date"
                value={formData.order_date}
                onChange={(e) => setFormData({ ...formData, order_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Liefertermin"
                type="date"
                value={formData.delivery_date || ''}
                onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Zwischensumme (€)"
                type="number"
                value={formData.subtotal}
                onChange={(e) => calculateTotals(parseFloat(e.target.value) || 0, formData.tax_rate, formData.discount_amount)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Steuersatz (%)"
                type="number"
                value={formData.tax_rate}
                onChange={(e) => calculateTotals(formData.subtotal, parseFloat(e.target.value) || 0, formData.discount_amount)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Rabatt (€)"
                type="number"
                value={formData.discount_amount}
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
                value={formData.shipping_address || ''}
                onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })}
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
            disabled={!formData.contact_id}
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

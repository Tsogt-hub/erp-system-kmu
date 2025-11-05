import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Payment as PaymentIcon,
  Search as SearchIcon,
  PictureAsPdf as PdfIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { getInvoices, getInvoiceStats, createInvoice, updateInvoice, deleteInvoice, recordPayment, Invoice, InvoiceStats } from '../services/api/invoices';
import { getContacts, Contact } from '../services/api/contacts';
import { getCompanies, Company } from '../services/api/companies';

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<InvoiceStats | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [formData, setFormData] = useState({
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    contact_id: 0,
    company_id: 0,
    subtotal: 0,
    tax_rate: 19,
    tax_amount: 0,
    discount_amount: 0,
    total_amount: 0,
    currency: 'EUR',
    payment_terms: '30 Tage netto',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const filters = statusFilter ? { status: statusFilter } : undefined;
      const [invoicesData, statsData, contactsData, companiesData] = await Promise.all([
        getInvoices(filters),
        getInvoiceStats(),
        getContacts(),
        getCompanies(),
      ]);
      setInvoices(invoicesData);
      setStats(statsData);
      setContacts(contactsData);
      setCompanies(companiesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (invoice?: Invoice) => {
    if (invoice) {
      setSelectedInvoice(invoice);
      setFormData({
        invoice_date: new Date(invoice.invoice_date).toISOString().split('T')[0],
        due_date: new Date(invoice.due_date).toISOString().split('T')[0],
        contact_id: invoice.contact_id,
        company_id: invoice.company_id || 0,
        subtotal: invoice.subtotal,
        tax_rate: invoice.tax_rate,
        tax_amount: invoice.tax_amount,
        discount_amount: invoice.discount_amount,
        total_amount: invoice.total_amount,
        currency: invoice.currency,
        payment_terms: invoice.payment_terms || '30 Tage netto',
        notes: invoice.notes || '',
      });
    } else {
      setSelectedInvoice(null);
      setFormData({
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        contact_id: 0,
        company_id: 0,
        subtotal: 0,
        tax_rate: 19,
        tax_amount: 0,
        discount_amount: 0,
        total_amount: 0,
        currency: 'EUR',
        payment_terms: '30 Tage netto',
        notes: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedInvoice(null);
  };

  const handleSave = async () => {
    try {
      if (selectedInvoice) {
        await updateInvoice(selectedInvoice.id, formData);
      } else {
        await createInvoice(formData);
      }
      handleCloseDialog();
      loadData();
    } catch (error) {
      console.error('Failed to save invoice:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Möchten Sie diese Rechnung wirklich löschen?')) {
      try {
        await deleteInvoice(id);
        loadData();
      } catch (error) {
        console.error('Failed to delete invoice:', error);
      }
    }
  };

  const handleOpenPaymentDialog = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPaymentAmount(invoice.total_amount - invoice.paid_amount);
    setOpenPaymentDialog(true);
  };

  const handleRecordPayment = async () => {
    if (selectedInvoice && paymentAmount > 0) {
      try {
        await recordPayment(selectedInvoice.id, paymentAmount);
        setOpenPaymentDialog(false);
        loadData();
      } catch (error) {
        console.error('Failed to record payment:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'sent':
        return 'info';
      case 'overdue':
        return 'error';
      case 'partially_paid':
        return 'warning';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Entwurf';
      case 'sent':
        return 'Versendet';
      case 'paid':
        return 'Bezahlt';
      case 'partially_paid':
        return 'Teilweise bezahlt';
      case 'overdue':
        return 'Überfällig';
      case 'cancelled':
        return 'Storniert';
      default:
        return status;
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      invoice.invoice_number.toLowerCase().includes(searchLower) ||
      invoice.contact_name?.toLowerCase().includes(searchLower) ||
      invoice.company_name?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Box sx={{ p: 3 }}>
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
        Rechnungen
      </Typography>

      {/* Stats Cards */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                background: 'rgba(255, 255, 255, 0.72)',
                backdropFilter: 'blur(60px) saturate(150%)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
              }}
            >
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Gesamtumsatz
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#34C759' }}>
                  {stats.total_revenue.toFixed(2)} €
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
              }}
            >
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Ausstehend
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#FF9500' }}>
                  {stats.outstanding_amount.toFixed(2)} €
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
              }}
            >
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Überfällig
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#FF3B30' }}>
                  {stats.overdue}
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
        </Grid>
      )}

      {/* Toolbar */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
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
            backdropFilter: 'blur(10px)',
            borderRadius: '10px',
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'rgba(0, 0, 0, 0.1)',
              },
            },
          }}
        />

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{
              background: 'rgba(255, 255, 255, 0.72)',
              borderRadius: '10px',
            }}
          >
            <MenuItem value="">Alle</MenuItem>
            <MenuItem value="draft">Entwurf</MenuItem>
            <MenuItem value="sent">Versendet</MenuItem>
            <MenuItem value="paid">Bezahlt</MenuItem>
            <MenuItem value="partially_paid">Teilweise bezahlt</MenuItem>
            <MenuItem value="overdue">Überfällig</MenuItem>
            <MenuItem value="cancelled">Storniert</MenuItem>
          </Select>
        </FormControl>

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
            '&:hover': {
              background: 'linear-gradient(135deg, #0051D5 0%, #003DA5 100%)',
              boxShadow: '0 6px 16px rgba(0, 122, 255, 0.4)',
            },
          }}
        >
          Neue Rechnung
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
          boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Rechnungsnummer</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Kunde</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Datum</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Fällig am</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Betrag</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Bezahlt</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Aktionen</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredInvoices.map((invoice) => (
              <TableRow key={invoice.id} hover>
                <TableCell>{invoice.invoice_number}</TableCell>
                <TableCell>
                  {invoice.contact_name || 'Unbekannt'}
                  {invoice.company_name && (
                    <Typography variant="caption" display="block" color="text.secondary">
                      {invoice.company_name}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>{new Date(invoice.invoice_date).toLocaleDateString('de-DE')}</TableCell>
                <TableCell>{new Date(invoice.due_date).toLocaleDateString('de-DE')}</TableCell>
                <TableCell>{invoice.total_amount.toFixed(2)} €</TableCell>
                <TableCell>{invoice.paid_amount.toFixed(2)} €</TableCell>
                <TableCell>
                  <Chip label={getStatusLabel(invoice.status)} color={getStatusColor(invoice.status)} size="small" />
                </TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleOpenDialog(invoice)} color="primary">
                    <EditIcon fontSize="small" />
                  </IconButton>
                  {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                    <IconButton size="small" onClick={() => handleOpenPaymentDialog(invoice)} color="success">
                      <PaymentIcon fontSize="small" />
                    </IconButton>
                  )}
                  <IconButton size="small" onClick={() => handleDelete(invoice.id)} color="error">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{selectedInvoice ? 'Rechnung bearbeiten' : 'Neue Rechnung'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Rechnungsdatum"
                type="date"
                value={formData.invoice_date}
                onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fälligkeitsdatum"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Kontakt</InputLabel>
                <Select
                  value={formData.contact_id}
                  label="Kontakt"
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
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Zwischensumme"
                type="number"
                value={formData.subtotal}
                onChange={(e) => {
                  const subtotal = parseFloat(e.target.value) || 0;
                  const taxAmount = (subtotal * formData.tax_rate) / 100;
                  const totalAmount = subtotal + taxAmount - formData.discount_amount;
                  setFormData({ ...formData, subtotal, tax_amount: taxAmount, total_amount: totalAmount });
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Steuersatz (%)"
                type="number"
                value={formData.tax_rate}
                onChange={(e) => {
                  const taxRate = parseFloat(e.target.value) || 0;
                  const taxAmount = (formData.subtotal * taxRate) / 100;
                  const totalAmount = formData.subtotal + taxAmount - formData.discount_amount;
                  setFormData({ ...formData, tax_rate: taxRate, tax_amount: taxAmount, total_amount: totalAmount });
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Rabatt"
                type="number"
                value={formData.discount_amount}
                onChange={(e) => {
                  const discount = parseFloat(e.target.value) || 0;
                  const totalAmount = formData.subtotal + formData.tax_amount - discount;
                  setFormData({ ...formData, discount_amount: discount, total_amount: totalAmount });
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Gesamtbetrag"
                type="number"
                value={formData.total_amount.toFixed(2)}
                InputProps={{ readOnly: true }}
                sx={{ backgroundColor: '#f5f5f5' }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Zahlungsbedingungen"
                value={formData.payment_terms}
                onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notizen"
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Abbrechen</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Speichern
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={openPaymentDialog} onClose={() => setOpenPaymentDialog(false)}>
        <DialogTitle>Zahlung erfassen</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom sx={{ mt: 2 }}>
            Rechnungsnummer: {selectedInvoice?.invoice_number}
          </Typography>
          <Typography variant="body2" gutterBottom>
            Gesamtbetrag: {selectedInvoice?.total_amount.toFixed(2)} €
          </Typography>
          <Typography variant="body2" gutterBottom>
            Bereits bezahlt: {selectedInvoice?.paid_amount.toFixed(2)} €
          </Typography>
          <Typography variant="body2" gutterBottom sx={{ mb: 2 }}>
            Ausstehend: {selectedInvoice ? (selectedInvoice.total_amount - selectedInvoice.paid_amount).toFixed(2) : 0} €
          </Typography>
          <TextField
            fullWidth
            label="Zahlungsbetrag"
            type="number"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
            InputProps={{
              endAdornment: <Typography>€</Typography>,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPaymentDialog(false)}>Abbrechen</Button>
          <Button onClick={handleRecordPayment} variant="contained" color="primary">
            Zahlung erfassen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

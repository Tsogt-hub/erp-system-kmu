import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
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
  Tabs,
  Tab,
  Tooltip,
  LinearProgress,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import PaymentIcon from '@mui/icons-material/Payment';
import WarningIcon from '@mui/icons-material/Warning';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ReceiptIcon from '@mui/icons-material/Receipt';
import NotificationsIcon from '@mui/icons-material/Notifications';
import {
  openItemsApi,
  OpenItem,
  CreatePaymentData,
  PAYMENT_STATUSES,
  PAYMENT_METHODS,
  getPaymentStatusLabel,
  getPaymentStatusColor,
  formatCurrency,
  getDaysOverdue,
} from '../services/api/openItems';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export default function Accounting() {
  const [tabValue, setTabValue] = useState(0);
  const [items, setItems] = useState<OpenItem[]>([]);
  const [overdueItems, setOverdueItems] = useState<OpenItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState({
    totalOpen: 0,
    totalOverdue: 0,
    openAmount: 0,
    overdueAmount: 0,
    paidThisMonth: 0,
  });

  // Payment dialog
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<OpenItem | null>(null);
  const [paymentForm, setPaymentForm] = useState<Partial<CreatePaymentData>>({
    amount: 0,
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'Überweisung',
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [openData, overdueData, statsData] = await Promise.all([
        openItemsApi.getOpen(),
        openItemsApi.getOverdue(),
        openItemsApi.getStatistics(),
      ]);
      setItems(openData);
      setOverdueItems(overdueData);
      setStatistics(statsData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenPaymentDialog = (item: OpenItem) => {
    setSelectedItem(item);
    setPaymentForm({
      amount: item.open_amount,
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: 'Überweisung',
    });
    setPaymentDialogOpen(true);
  };

  const handleAddPayment = async () => {
    if (!selectedItem) return;
    try {
      await openItemsApi.addPayment(selectedItem.id, paymentForm as CreatePaymentData);
      setPaymentDialogOpen(false);
      setSelectedItem(null);
      loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDunning = async (item: OpenItem) => {
    if (window.confirm(`Mahnstufe für ${item.document_number} erhöhen?`)) {
      try {
        await openItemsApi.incrementDunning(item.id);
        loadData();
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  const renderItemsTable = (itemList: OpenItem[]) => (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Dokument</TableCell>
            <TableCell>Kunde</TableCell>
            <TableCell>Rechnungsdatum</TableCell>
            <TableCell>Fällig am</TableCell>
            <TableCell align="right">Betrag</TableCell>
            <TableCell align="right">Bezahlt</TableCell>
            <TableCell align="right">Offen</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Mahnstufe</TableCell>
            <TableCell>Aktionen</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {itemList.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} align="center">
                <Typography color="text.secondary">Keine Einträge</Typography>
              </TableCell>
            </TableRow>
          ) : (
            itemList.map((item) => {
              const daysOverdue = getDaysOverdue(item.due_date);
              return (
                <TableRow key={item.id} hover>
                  <TableCell>
                    <Typography fontWeight={600}>{item.document_number}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.document_type}
                    </Typography>
                  </TableCell>
                  <TableCell>{item.customer_name || '-'}</TableCell>
                  <TableCell>{new Date(item.invoice_date).toLocaleDateString('de-DE')}</TableCell>
                  <TableCell>
                    <Box>
                      {new Date(item.due_date).toLocaleDateString('de-DE')}
                      {daysOverdue > 0 && (
                        <Typography variant="caption" color="error" display="block">
                          {daysOverdue} Tage überfällig
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="right">{formatCurrency(item.total_amount)}</TableCell>
                  <TableCell align="right" sx={{ color: 'success.main' }}>
                    {formatCurrency(item.paid_amount)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: item.open_amount > 0 ? 'error.main' : 'success.main' }}>
                    {formatCurrency(item.open_amount)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getPaymentStatusLabel(item.status)}
                      size="small"
                      sx={{ bgcolor: getPaymentStatusColor(item.status), color: 'white' }}
                    />
                  </TableCell>
                  <TableCell>
                    {item.dunning_level > 0 ? (
                      <Chip
                        label={`Stufe ${item.dunning_level}`}
                        size="small"
                        color="warning"
                      />
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Zahlung erfassen">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenPaymentDialog(item)}
                        >
                          <PaymentIcon />
                        </IconButton>
                      </Tooltip>
                      {item.status !== 'paid' && (
                        <Tooltip title="Mahnen">
                          <IconButton
                            size="small"
                            color="warning"
                            onClick={() => handleDunning(item)}
                          >
                            <NotificationsIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={600}>
          💰 Buchhaltung
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadData}
          disabled={loading}
        >
          Aktualisieren
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ReceiptIcon color="primary" />
                <Typography color="text.secondary">Offene Posten</Typography>
              </Box>
              <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
                {statistics.totalOpen}
              </Typography>
              <Typography variant="h6" color="primary">
                {formatCurrency(statistics.openAmount)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningIcon color="error" />
                <Typography color="text.secondary">Überfällig</Typography>
              </Box>
              <Typography variant="h4" fontWeight={700} sx={{ mt: 1, color: 'error.main' }}>
                {statistics.totalOverdue}
              </Typography>
              <Typography variant="h6" color="error">
                {formatCurrency(statistics.overdueAmount)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUpIcon color="success" />
                <Typography color="text.secondary">Diesen Monat bezahlt</Typography>
              </Box>
              <Typography variant="h4" fontWeight={700} sx={{ mt: 1, color: 'success.main' }}>
                {formatCurrency(statistics.paidThisMonth)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccountBalanceIcon color="info" />
                <Typography color="text.secondary">Zahlungsquote</Typography>
              </Box>
              <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
                {statistics.openAmount > 0
                  ? Math.round((1 - statistics.overdueAmount / statistics.openAmount) * 100)
                  : 100}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={statistics.openAmount > 0
                  ? (1 - statistics.overdueAmount / statistics.openAmount) * 100
                  : 100}
                sx={{ mt: 1, height: 8, borderRadius: 4 }}
                color="success"
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 2 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Alle offenen Posten
                <Chip label={items.length} size="small" />
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Überfällig
                <Chip label={overdueItems.length} size="small" color="error" />
              </Box>
            }
          />
        </Tabs>
      </Paper>

      {loading ? (
        <Paper sx={{ p: 3 }}>
          <Typography>Lädt...</Typography>
        </Paper>
      ) : (
        <>
          <TabPanel value={tabValue} index={0}>
            <Paper>{renderItemsTable(items)}</Paper>
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <Paper>{renderItemsTable(overdueItems)}</Paper>
          </TabPanel>
        </>
      )}

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Zahlung erfassen
          {selectedItem && (
            <Typography variant="subtitle2" color="text.secondary">
              {selectedItem.document_number} - {selectedItem.customer_name}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Box sx={{ mb: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Gesamtbetrag</Typography>
                  <Typography fontWeight={600}>{formatCurrency(selectedItem.total_amount)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Noch offen</Typography>
                  <Typography fontWeight={600} color="error">
                    {formatCurrency(selectedItem.open_amount)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
          <TextField
            fullWidth
            label="Betrag"
            type="number"
            value={paymentForm.amount || ''}
            onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) || 0 })}
            margin="normal"
            InputProps={{
              startAdornment: <Typography sx={{ mr: 1 }}>€</Typography>,
            }}
          />
          <TextField
            fullWidth
            label="Zahlungsdatum"
            type="date"
            value={paymentForm.payment_date || ''}
            onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Zahlungsart</InputLabel>
            <Select
              value={paymentForm.payment_method || 'Überweisung'}
              label="Zahlungsart"
              onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
            >
              {PAYMENT_METHODS.map((method) => (
                <MenuItem key={method} value={method}>{method}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Referenz / Verwendungszweck"
            value={paymentForm.reference || ''}
            onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Notizen"
            multiline
            rows={2}
            value={paymentForm.notes || ''}
            onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialogOpen(false)}>Abbrechen</Button>
          <Button
            onClick={handleAddPayment}
            variant="contained"
            disabled={!paymentForm.amount || paymentForm.amount <= 0}
          >
            Zahlung buchen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}







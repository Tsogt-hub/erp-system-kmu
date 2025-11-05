import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  Grid,
  Card,
  CardContent,
  Divider,
  Autocomplete,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { offersApi, Offer, OfferItem, CreateOfferItemData } from '../services/api/offers';
import { inventoryApi } from '../services/api/inventory';
import { format } from 'date-fns';

export default function OfferDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [items, setItems] = useState<OfferItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<OfferItem | null>(null);
  const [itemForm, setItemForm] = useState<CreateOfferItemData>({
    offer_id: parseInt(id || '0'),
    description: '',
    quantity: 1,
    unit: 'Stück',
    unit_price: 0,
    discount_percent: 0,
    tax_rate: 19.00,
  });
  const [availableItems, setAvailableItems] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      loadOffer();
      loadItems();
      loadAvailableItems();
    }
  }, [id]);

  const loadOffer = async () => {
    try {
      setLoading(true);
      const data = await offersApi.getById(parseInt(id!));
      setOffer(data);
      if (data.items) {
        setItems(data.items);
      }
    } catch (error) {
      console.error('Error loading offer:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadItems = async () => {
    try {
      const data = await offersApi.getItems(parseInt(id!));
      setItems(data);
    } catch (error) {
      console.error('Error loading items:', error);
    }
  };

  const loadAvailableItems = async () => {
    try {
      const data = await inventoryApi.getItems();
      setAvailableItems(data);
    } catch (error) {
      console.error('Error loading available items:', error);
    }
  };

  const handleItemCreate = async () => {
    try {
      if (editingItem) {
        await offersApi.updateItem(editingItem.id, itemForm);
      } else {
        await offersApi.createItem(itemForm);
      }
      setItemDialogOpen(false);
      setEditingItem(null);
      setItemForm({
        offer_id: parseInt(id || '0'),
        description: '',
        quantity: 1,
        unit: 'Stück',
        unit_price: 0,
        discount_percent: 0,
        tax_rate: 19.00,
      });
      loadItems();
      loadOffer(); // Reload to get updated amount
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  const handleItemEdit = (item: OfferItem) => {
    setEditingItem(item);
    setItemForm({
      offer_id: item.offer_id,
      item_id: item.item_id || undefined,
      description: item.description,
      quantity: item.quantity,
      unit: item.unit,
      unit_price: item.unit_price,
      discount_percent: item.discount_percent || 0,
      tax_rate: item.tax_rate,
    });
    setItemDialogOpen(true);
  };

  const handleItemDelete = async (itemId: number) => {
    if (window.confirm('Möchten Sie diese Position wirklich löschen?')) {
      try {
        await offersApi.deleteItem(itemId);
        loadItems();
        loadOffer(); // Reload to get updated amount
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const calculateItemTotal = (item: OfferItem): number => {
    const subtotal = item.quantity * item.unit_price;
    const discount = item.discount_percent ? (subtotal * item.discount_percent / 100) : 0;
    return subtotal - discount;
  };

  const calculateItemTotalWithTax = (item: OfferItem): number => {
    const total = calculateItemTotal(item);
    return total * (1 + item.tax_rate / 100);
  };

  const calculateSubtotal = (): number => {
    return items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  };

  const calculateTax = (): number => {
    return items.reduce((sum, item) => {
      const itemTotal = calculateItemTotal(item);
      return sum + (itemTotal * item.tax_rate / 100);
    }, 0);
  };

  const calculateTotal = (): number => {
    return calculateSubtotal() + calculateTax();
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Lade...</Typography>
      </Box>
    );
  }

  if (!offer) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Angebot nicht gefunden</Typography>
        <Button onClick={() => navigate('/offers')}>Zurück zu Angeboten</Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <IconButton onClick={() => navigate('/offers')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">Angebot {offer.offer_number}</Typography>
        <Chip
          label={offer.status}
          color={offer.status === 'accepted' ? 'success' : offer.status === 'rejected' ? 'error' : 'default'}
          size="small"
        />
        <Box sx={{ ml: 'auto' }}>
          <Button
            variant="contained"
            startIcon={<PictureAsPdfIcon />}
            onClick={() => {
              const token = localStorage.getItem('token');
              const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/offers/${offer.id}/pdf`;
              fetch(url, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              })
                .then((response) => response.blob())
                .then((blob) => {
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Angebot-${offer.offer_number}.pdf`;
                  document.body.appendChild(a);
                  a.click();
                  window.URL.revokeObjectURL(url);
                  document.body.removeChild(a);
                })
                .catch((error) => {
                  console.error('Error downloading PDF:', error);
                  alert('Fehler beim Download des PDFs');
                });
            }}
          >
            PDF herunterladen
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Positionen</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setEditingItem(null);
                    setItemForm({
                      offer_id: parseInt(id!),
                      description: '',
                      quantity: 1,
                      unit: 'Stück',
                      unit_price: 0,
                      discount_percent: 0,
                      tax_rate: 19.00,
                    });
                    setItemDialogOpen(true);
                  }}
                >
                  Position hinzufügen
                </Button>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Pos.</TableCell>
                      <TableCell>Beschreibung</TableCell>
                      <TableCell align="right">Menge</TableCell>
                      <TableCell align="right">Einzelpreis</TableCell>
                      <TableCell align="right">Rabatt %</TableCell>
                      <TableCell align="right">Netto</TableCell>
                      <TableCell align="right">MwSt. %</TableCell>
                      <TableCell align="right">Brutto</TableCell>
                      <TableCell>Aktionen</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} align="center">
                          Keine Positionen vorhanden
                        </TableCell>
                      </TableRow>
                    ) : (
                      items.map((item, index) => (
                        <TableRow key={item.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{item.description}</TableCell>
                          <TableCell align="right">
                            {item.quantity} {item.unit}
                          </TableCell>
                          <TableCell align="right">{item.unit_price.toFixed(2)} €</TableCell>
                          <TableCell align="right">
                            {item.discount_percent ? `${item.discount_percent.toFixed(1)}%` : '-'}
                          </TableCell>
                          <TableCell align="right">{calculateItemTotal(item).toFixed(2)} €</TableCell>
                          <TableCell align="right">{item.tax_rate.toFixed(1)}%</TableCell>
                          <TableCell align="right">{calculateItemTotalWithTax(item).toFixed(2)} €</TableCell>
                          <TableCell>
                            <IconButton size="small" onClick={() => handleItemEdit(item)}>
                              <EditIcon />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={() => handleItemDelete(item.id)}>
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Angebotsdetails</Typography>
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Kunde</Typography>
                <Typography variant="body1">{offer.customer_name || '-'}</Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Projekt</Typography>
                <Typography variant="body1">{offer.project_name || '-'}</Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Gültig bis</Typography>
                <Typography variant="body1">
                  {offer.valid_until ? format(new Date(offer.valid_until), 'dd.MM.yyyy') : '-'}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Zwischensumme (netto):</Typography>
                <Typography fontWeight="bold">{calculateSubtotal().toFixed(2)} €</Typography>
              </Box>

              <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                <Typography>MwSt.:</Typography>
                <Typography>{calculateTax().toFixed(2)} €</Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">Gesamt (brutto):</Typography>
                <Typography variant="h6" color="primary">
                  {calculateTotal().toFixed(2)} €
                </Typography>
              </Box>

              {offer.notes && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Notizen
                    </Typography>
                    <Typography variant="body2">{offer.notes}</Typography>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Item Dialog */}
      <Dialog open={itemDialogOpen} onClose={() => setItemDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingItem ? 'Position bearbeiten' : 'Neue Position hinzufügen'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Autocomplete
                options={availableItems}
                getOptionLabel={(option) => `${option.name}${option.sku ? ` (${option.sku})` : ''}`}
                value={availableItems.find(item => item.id === itemForm.item_id) || null}
                onChange={(event, newValue) => {
                  if (newValue) {
                    setItemForm({
                      ...itemForm,
                      item_id: newValue.id,
                      description: newValue.name,
                      unit_price: newValue.price || 0,
                      unit: newValue.unit || 'Stück',
                    });
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Artikel auswählen (optional)"
                    placeholder="Artikel suchen oder manuell eingeben"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Beschreibung"
                value={itemForm.description}
                onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                required
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                type="number"
                label="Menge"
                value={itemForm.quantity}
                onChange={(e) => setItemForm({ ...itemForm, quantity: parseFloat(e.target.value) || 0 })}
                required
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Einheit"
                value={itemForm.unit}
                onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                type="number"
                label="Einzelpreis (€)"
                value={itemForm.unit_price}
                onChange={(e) => setItemForm({ ...itemForm, unit_price: parseFloat(e.target.value) || 0 })}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                label="Rabatt (%)"
                value={itemForm.discount_percent}
                onChange={(e) => setItemForm({ ...itemForm, discount_percent: parseFloat(e.target.value) || 0 })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                label="MwSt. (%)"
                value={itemForm.tax_rate}
                onChange={(e) => setItemForm({ ...itemForm, tax_rate: parseFloat(e.target.value) || 19.00 })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setItemDialogOpen(false)}>Abbrechen</Button>
          <Button
            onClick={handleItemCreate}
            variant="contained"
            disabled={!itemForm.description || !itemForm.quantity || !itemForm.unit_price}
          >
            {editingItem ? 'Speichern' : 'Hinzufügen'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}


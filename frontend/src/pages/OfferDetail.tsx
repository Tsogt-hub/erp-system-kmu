import { useState, useEffect, useCallback } from 'react';
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
  LinearProgress,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  InputAdornment,
  Tooltip,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SearchIcon from '@mui/icons-material/Search';
import ReceiptIcon from '@mui/icons-material/Receipt';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import {
  offersApi,
  Offer,
  OfferItem,
  CreateOfferItemData,
  calculateItemMargin,
  calculateItemNetTotal,
  calculateItemGrossTotal,
  DEFAULT_INTRO_TEXT,
  DEFAULT_PAYMENT_TERMS,
} from '../services/api/offers';
import { inventoryApi, Item, ITEM_CATEGORIES } from '../services/api/inventory';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

// Marge-Anzeige wie bei Hero
function MarginProgressBar({ marginPercent }: { marginPercent: number }) {
  const color = marginPercent >= 30 ? 'success' : marginPercent >= 20 ? 'warning' : 'error';
  const displayPercent = Math.min(Math.max(marginPercent, 0), 100);
  
  return (
    <Tooltip title={`Marge: ${marginPercent.toFixed(1)}%`}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 80 }}>
        <LinearProgress
          variant="determinate"
          value={displayPercent}
          color={color}
          sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
        />
        <Typography variant="caption" sx={{ minWidth: 40 }}>
          {marginPercent.toFixed(1)}%
        </Typography>
      </Box>
    </Tooltip>
  );
}

// Artikelsuche-Panel wie bei Hero
function ArticleSearchPanel({
  onSelectItem,
  searchQuery,
  setSearchQuery,
}: {
  onSelectItem: (item: Item) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const data = await inventoryApi.getItems(searchQuery, selectedCategory);
      setItems(data);
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      loadItems();
    }, 300);
    return () => clearTimeout(debounce);
  }, [loadItems]);

  return (
    <Box>
      <TextField
        fullWidth
        size="small"
        placeholder="Name, Hersteller, Kategorie, Bezeichnung"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />
      
      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <InputLabel>Kategorie</InputLabel>
        <Select
          value={selectedCategory}
          label="Kategorie"
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <MenuItem value="">Alle Kategorien</MenuItem>
          {ITEM_CATEGORIES.map((cat) => (
            <MenuItem key={cat.value} value={cat.value}>
              {cat.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {loading ? (
        <LinearProgress />
      ) : (
        <List dense sx={{ maxHeight: 400, overflow: 'auto' }}>
          {items.map((item) => (
            <ListItemButton
              key={item.id}
              onClick={() => onSelectItem(item)}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                border: '1px solid',
                borderColor: 'divider',
                '&:hover': {
                  backgroundColor: 'action.hover',
                  borderColor: 'primary.main',
                },
              }}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AddIcon color="primary" fontSize="small" />
                    <Typography variant="body2" fontWeight={500}>
                      {item.name}
                    </Typography>
                    <Typography variant="body2" color="primary" sx={{ ml: 'auto' }}>
                      {item.price?.toFixed(2)} €/ {item.unit}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {item.description?.substring(0, 100)}
                    {item.description && item.description.length > 100 ? '...' : ''}
                  </Typography>
                }
              />
            </ListItemButton>
          ))}
          {items.length === 0 && !loading && (
            <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
              Keine Artikel gefunden
            </Typography>
          )}
        </List>
      )}
    </Box>
  );
}

export default function OfferDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [items, setItems] = useState<OfferItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<OfferItem | null>(null);
  const [sidebarTab, setSidebarTab] = useState(0);
  const [articleSearchQuery, setArticleSearchQuery] = useState('');
  const [availableItems, setAvailableItems] = useState<Item[]>([]);
  
  const [itemForm, setItemForm] = useState<CreateOfferItemData>({
    offer_id: parseInt(id || '0'),
    description: '',
    quantity: 1,
    unit: 'Stk',
    unit_price: 0,
    purchase_price: 0,
    discount_percent: 0,
    tax_rate: 0, // 0% für PV-Anlagen
  });

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
      resetItemForm();
      loadItems();
      loadOffer();
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  const resetItemForm = () => {
    setItemForm({
      offer_id: parseInt(id || '0'),
      description: '',
      quantity: 1,
      unit: 'Stk',
      unit_price: 0,
      purchase_price: 0,
      discount_percent: 0,
      tax_rate: 0,
    });
  };

  const handleItemEdit = (item: OfferItem) => {
    setEditingItem(item);
    setItemForm({
      offer_id: item.offer_id,
      item_id: item.item_id || undefined,
      description: item.description,
      long_description: item.long_description,
      features: item.features,
      quantity: item.quantity,
      unit: item.unit,
      unit_price: item.unit_price,
      purchase_price: item.purchase_price || 0,
      discount_percent: item.discount_percent || 0,
      tax_rate: item.tax_rate,
      image_url: item.image_url,
    });
    setItemDialogOpen(true);
  };

  const handleItemDelete = async (itemId: number) => {
    if (window.confirm('Möchten Sie diese Position wirklich löschen?')) {
      try {
        await offersApi.deleteItem(itemId);
        loadItems();
        loadOffer();
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const handleAddFromInventory = (inventoryItem: Item) => {
    setEditingItem(null);
    setItemForm({
      offer_id: parseInt(id!),
      item_id: inventoryItem.id,
      description: inventoryItem.name,
      long_description: inventoryItem.description,
      features: inventoryItem.features,
      quantity: 1,
      unit: inventoryItem.unit || 'Stk',
      unit_price: inventoryItem.price || 0,
      purchase_price: inventoryItem.purchase_price || 0,
      discount_percent: 0,
      tax_rate: 0,
      image_url: inventoryItem.image_url,
    });
    setItemDialogOpen(true);
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await offersApi.update(parseInt(id!), { status: newStatus });
      loadOffer();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDuplicate = async () => {
    try {
      const newOffer = await offersApi.duplicate(parseInt(id!));
      navigate(`/offers/${newOffer.id}`);
    } catch (error) {
      console.error('Error duplicating offer:', error);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      const blob = await offersApi.generatePdf(parseInt(id!));
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Angebot-${offer?.offer_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Fehler beim Download des PDFs');
    }
  };

  // Berechnungen
  const calculateSubtotal = (): number => {
    return items.reduce((sum, item) => sum + calculateItemNetTotal(item), 0);
  };

  const calculateTotalPurchase = (): number => {
    return items.reduce((sum, item) => sum + (item.purchase_price || 0) * item.quantity, 0);
  };

  const calculateTotalMargin = (): number => {
    return calculateSubtotal() - calculateTotalPurchase();
  };

  const calculateTotalMarginPercent = (): number => {
    const purchase = calculateTotalPurchase();
    if (purchase === 0) return 0;
    return (calculateTotalMargin() / purchase) * 100;
  };

  const calculateTax = (): number => {
    return items.reduce((sum, item) => {
      const itemTotal = calculateItemNetTotal(item);
      return sum + (itemTotal * item.tax_rate / 100);
    }, 0);
  };

  const calculateTotal = (): number => {
    return calculateSubtotal() + calculateTax();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'default';
      case 'sent': return 'info';
      case 'accepted': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Entwurf';
      case 'sent': return 'Versendet';
      case 'accepted': return 'Angenommen';
      case 'rejected': return 'Abgelehnt';
      default: return status;
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Lade Angebot...</Typography>
      </Box>
    );
  }

  if (!offer) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Angebot nicht gefunden</Alert>
        <Button onClick={() => navigate('/offers')} sx={{ mt: 2 }}>
          Zurück zu Angeboten
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 100px)' }}>
      {/* Hauptbereich */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <IconButton onClick={() => navigate('/offers')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" fontWeight={600}>
            Angebot {offer.offer_number}
          </Typography>
          <Chip
            label={getStatusLabel(offer.status)}
            color={getStatusColor(offer.status) as any}
            size="small"
          />
          
          <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<ContentCopyIcon />}
              onClick={handleDuplicate}
              size="small"
            >
              Duplizieren
            </Button>
            {offer.status === 'draft' && (
              <Button
                variant="outlined"
                color="info"
                startIcon={<SendIcon />}
                onClick={() => handleStatusChange('sent')}
                size="small"
              >
                Versenden
              </Button>
            )}
            {offer.status === 'sent' && (
              <Button
                variant="outlined"
                color="success"
                startIcon={<CheckCircleIcon />}
                onClick={() => handleStatusChange('accepted')}
                size="small"
              >
                Angenommen
              </Button>
            )}
            <Button
              variant="contained"
              startIcon={<PictureAsPdfIcon />}
              onClick={handleDownloadPdf}
              size="small"
            >
              PDF
            </Button>
          </Box>
        </Box>

        {/* Kopfbereich */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Kunde
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {offer.customer_name || '-'}
              </Typography>
              {offer.project_address && (
                <Typography variant="body2" color="text.secondary">
                  {offer.project_address}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Angebotsnummer
                  </Typography>
                  <Typography variant="body1">{offer.offer_number}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Datum
                  </Typography>
                  <Typography variant="body1">
                    {format(new Date(offer.created_at), 'dd.MM.yyyy', { locale: de })}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Projekt
                  </Typography>
                  <Typography variant="body1">{offer.project_name || '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Gültig bis
                  </Typography>
                  <Typography variant="body1">
                    {offer.valid_until
                      ? format(new Date(offer.valid_until), 'dd.MM.yyyy', { locale: de })
                      : '-'}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Einleitungstext */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
            {offer.intro_text || DEFAULT_INTRO_TEXT}
          </Typography>
        </Paper>

        {/* Positionstabelle */}
        <Paper sx={{ mb: 3 }}>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Positionen</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditingItem(null);
                resetItemForm();
                setItemDialogOpen(true);
              }}
              size="small"
            >
              Position hinzufügen
            </Button>
          </Box>
          
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell width={60}>Pos</TableCell>
                  <TableCell width={60}>Menge</TableCell>
                  <TableCell width={60}>Einheit</TableCell>
                  <TableCell>Bezeichnung</TableCell>
                  <TableCell width={80} align="right">MwSt.</TableCell>
                  <TableCell width={100} align="right">Einzelpreis</TableCell>
                  <TableCell width={120} align="center">Aufschlag</TableCell>
                  <TableCell width={100} align="right">Gesamt</TableCell>
                  <TableCell width={80}></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        Keine Positionen vorhanden. Fügen Sie Artikel aus dem Artikelstamm hinzu.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item, index) => {
                    const margin = calculateItemMargin(item);
                    const netTotal = calculateItemNetTotal(item);
                    
                    return (
                      <TableRow key={item.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {(index + 1).toString().padStart(3, '0')}
                          </Typography>
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                            {item.image_url && (
                              <Box
                                component="img"
                                src={item.image_url}
                                alt={item.description}
                                sx={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 1 }}
                              />
                            )}
                            <Box>
                              <Typography variant="body2" fontWeight={500}>
                                {item.description}
                              </Typography>
                              {item.long_description && (
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                  {item.long_description.substring(0, 100)}
                                  {item.long_description.length > 100 ? '...' : ''}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="right">{item.tax_rate.toFixed(1)}%</TableCell>
                        <TableCell align="right">{item.unit_price.toFixed(2)} €</TableCell>
                        <TableCell align="center">
                          <MarginProgressBar marginPercent={margin.marginPercent} />
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight={500}>
                            {netTotal.toFixed(2)} €
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => handleItemEdit(item)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => handleItemDelete(item.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Summenblock */}
          <Box sx={{ p: 3, backgroundColor: '#fafafa' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', gap: 4 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">EK</Typography>
                    <Typography variant="body2">{calculateTotalPurchase().toFixed(2)} €</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Aufschlag €</Typography>
                    <Typography variant="body2">{calculateTotalMargin().toFixed(2)} €</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Aufschlag %</Typography>
                    <MarginProgressBar marginPercent={calculateTotalMarginPercent()} />
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ textAlign: 'right' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Nettobetrag:</Typography>
                    <Typography fontWeight={500}>{calculateSubtotal().toFixed(2)} €</Typography>
                  </Box>
                  {offer.discount_amount && offer.discount_amount > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, color: 'error.main' }}>
                      <Typography>Rabatt:</Typography>
                      <Typography>- {offer.discount_amount.toFixed(2)} €</Typography>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>zzgl. {items[0]?.tax_rate || 0}% MwSt.:</Typography>
                    <Typography>{calculateTax().toFixed(2)} €</Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6">Gesamtsumme:</Typography>
                    <Typography variant="h6" color="primary">
                      {calculateTotal().toFixed(2)} €
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>

        {/* Zahlungsbedingungen */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
            {offer.payment_terms || DEFAULT_PAYMENT_TERMS}
          </Typography>
        </Paper>
      </Box>

      {/* Sidebar - Artikelstamm */}
      <Paper sx={{ width: 350, borderLeft: '1px solid', borderColor: 'divider', overflow: 'auto' }}>
        <Tabs
          value={sidebarTab}
          onChange={(_, v) => setSidebarTab(v)}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Artikel & Leistungen" />
          <Tab label="Texte & Titel" />
        </Tabs>

        <Box sx={{ p: 2 }}>
          {sidebarTab === 0 && (
            <>
              <Typography variant="subtitle2" gutterBottom>
                Neuen Artikel hinzufügen
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setEditingItem(null);
                    resetItemForm();
                    setItemDialogOpen(true);
                  }}
                  size="small"
                >
                  + Artikel
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setEditingItem(null);
                    setItemForm({
                      ...itemForm,
                      description: '',
                      unit: 'pauschal',
                    });
                    setItemDialogOpen(true);
                  }}
                  size="small"
                >
                  + Leistung
                </Button>
              </Box>

              <Typography variant="subtitle2" gutterBottom>
                Artikel aus Artikelstamm hinzufügen
              </Typography>
              <ArticleSearchPanel
                onSelectItem={handleAddFromInventory}
                searchQuery={articleSearchQuery}
                setSearchQuery={setArticleSearchQuery}
              />
            </>
          )}

          {sidebarTab === 1 && (
            <Box>
              <Typography variant="body2" color="text.secondary">
                Texte und Titel können hier verwaltet werden.
              </Typography>
            </Box>
          )}
        </Box>

        {/* Übersicht */}
        <Divider />
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Übersicht
          </Typography>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Positionen</Typography>
              <Typography variant="body2">{items.length}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Gesamt</Typography>
              <Typography variant="body2" fontWeight={500}>
                {calculateTotal().toFixed(2)} €
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Paper>

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
                value={availableItems.find((item) => item.id === itemForm.item_id) || null}
                onChange={(_, newValue) => {
                  if (newValue) {
                    setItemForm({
                      ...itemForm,
                      item_id: newValue.id,
                      description: newValue.name,
                      long_description: newValue.description,
                      unit_price: newValue.price || 0,
                      purchase_price: newValue.purchase_price || 0,
                      unit: newValue.unit || 'Stk',
                      image_url: newValue.image_url,
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
                label="Bezeichnung"
                value={itemForm.description}
                onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Ausführliche Beschreibung"
                value={itemForm.long_description || ''}
                onChange={(e) => setItemForm({ ...itemForm, long_description: e.target.value })}
                multiline
                rows={3}
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
              <FormControl fullWidth>
                <InputLabel>Einheit</InputLabel>
                <Select
                  value={itemForm.unit}
                  label="Einheit"
                  onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })}
                >
                  <MenuItem value="Stk">Stk</MenuItem>
                  <MenuItem value="pauschal">pauschal</MenuItem>
                  <MenuItem value="m">m</MenuItem>
                  <MenuItem value="m²">m²</MenuItem>
                  <MenuItem value="km">km</MenuItem>
                  <MenuItem value="Std">Std</MenuItem>
                  <MenuItem value="Satz">Satz</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                type="number"
                label="MwSt. (%)"
                value={itemForm.tax_rate}
                onChange={(e) => setItemForm({ ...itemForm, tax_rate: parseFloat(e.target.value) || 0 })}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                type="number"
                label="EK-Preis (€)"
                value={itemForm.purchase_price}
                onChange={(e) => setItemForm({ ...itemForm, purchase_price: parseFloat(e.target.value) || 0 })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">€</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                type="number"
                label="VK-Preis (€)"
                value={itemForm.unit_price}
                onChange={(e) => setItemForm({ ...itemForm, unit_price: parseFloat(e.target.value) || 0 })}
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start">€</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                type="number"
                label="Rabatt (%)"
                value={itemForm.discount_percent}
                onChange={(e) => setItemForm({ ...itemForm, discount_percent: parseFloat(e.target.value) || 0 })}
              />
            </Grid>
            
            {/* Marge-Vorschau */}
            {itemForm.purchase_price && itemForm.purchase_price > 0 && (
              <Grid item xs={12}>
                <Alert severity="info" icon={false}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2">
                      Marge: {((itemForm.unit_price - itemForm.purchase_price) / itemForm.purchase_price * 100).toFixed(1)}%
                    </Typography>
                    <Typography variant="body2">
                      ({((itemForm.unit_price - itemForm.purchase_price) * itemForm.quantity).toFixed(2)} €)
                    </Typography>
                    <Box sx={{ flexGrow: 1 }}>
                      <MarginProgressBar
                        marginPercent={((itemForm.unit_price - itemForm.purchase_price) / itemForm.purchase_price * 100)}
                      />
                    </Box>
                  </Box>
                </Alert>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setItemDialogOpen(false)}>Abbrechen</Button>
          <Button
            onClick={handleItemCreate}
            variant="contained"
            disabled={!itemForm.description || !itemForm.quantity || itemForm.unit_price === undefined}
          >
            {editingItem ? 'Speichern' : 'Hinzufügen'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

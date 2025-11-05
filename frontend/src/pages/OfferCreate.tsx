import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  TextField,
  Autocomplete,
  Chip,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { offersApi, CreateOfferData, OfferText, OfferTitle } from '../services/api/offers';
import { inventoryApi, Item } from '../services/api/inventory';
import { crmApi, Contact } from '../services/api/crm';
import ArticleDialog from '../components/common/ArticleDialog';
import ServiceDialog from '../components/common/ServiceDialog';
import TextDialog from '../components/common/TextDialog';
import TitleDialog from '../components/common/TitleDialog';

interface OfferPosition {
  id: string; // Temporäre ID
  item_id?: number;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  discount_percent?: number;
  tax_rate: number;
  position_order: number;
  item_name?: string;
  item_sku?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 0 }}>{children}</Box>}
    </div>
  );
}

export default function OfferCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const contactId = searchParams.get('contactId');

  const [contact, setContact] = useState<Contact | null>(null);
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [availableItems, setAvailableItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [positions, setPositions] = useState<OfferPosition[]>([]);
  const [editingPosition, setEditingPosition] = useState<OfferPosition | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState(0);
  const [itemSearchTerm, setItemSearchTerm] = useState('');
  const [newArticleDialogOpen, setNewArticleDialogOpen] = useState(false);
  const [newServiceDialogOpen, setNewServiceDialogOpen] = useState(false);
  const [newTextDialogOpen, setNewTextDialogOpen] = useState(false);
  const [newTitleDialogOpen, setNewTitleDialogOpen] = useState(false);
  const [texts, setTexts] = useState<(OfferText & { tempId?: string })[]>([]);
  const [titles, setTitles] = useState<(OfferTitle & { tempId?: string })[]>([]);
  const [editingText, setEditingText] = useState<(OfferText & { tempId?: string }) | null>(null);
  const [editingTitle, setEditingTitle] = useState<(OfferTitle & { tempId?: string }) | null>(null);

  const [formData, setFormData] = useState<CreateOfferData>({
    customer_id: contactId ? parseInt(contactId) : undefined,
    amount: 0,
    tax_rate: 19.00,
    status: 'draft',
  });

  const [positionForm, setPositionForm] = useState<Partial<OfferPosition>>({
    description: '',
    quantity: 1,
    unit: 'Stück',
    unit_price: 0,
    discount_percent: 0,
    tax_rate: 19.00,
  });

  useEffect(() => {
    loadData();
  }, [contactId]);

  useEffect(() => {
    // Filtere Artikel basierend auf Suchbegriff
    if (!itemSearchTerm) {
      setFilteredItems(availableItems);
    } else {
      const searchLower = itemSearchTerm.toLowerCase();
      setFilteredItems(
        availableItems.filter(
          (item) =>
            item.name?.toLowerCase().includes(searchLower) ||
            item.sku?.toLowerCase().includes(searchLower) ||
            item.description?.toLowerCase().includes(searchLower)
        )
      );
    }
  }, [itemSearchTerm, availableItems]);

  const loadData = async () => {
    try {
      // Lade alle Kontakte für Auswahl
      const contacts = await crmApi.getContacts();
      setAllContacts(contacts);

      // Lade Kontakt falls vorhanden
      if (contactId) {
        const contactData = await crmApi.getContactById(parseInt(contactId));
        setContact(contactData);
        setFormData(prev => ({ ...prev, customer_id: contactData.id }));
      }

      // Lade verfügbare Artikel
      const items = await inventoryApi.getItems();
      setAvailableItems(items);
      setFilteredItems(items);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleAddItem = (item: Item) => {
    const newPosition: OfferPosition = {
      id: `temp-${Date.now()}`,
      item_id: item.id,
      description: item.name || '',
      quantity: 1,
      unit: item.unit || 'Stück',
      unit_price: item.price || 0,
      discount_percent: 0,
      tax_rate: 19.00,
      position_order: positions.length + 1,
      item_name: item.name,
      item_sku: item.sku,
    };
    setPositions([...positions, newPosition]);
    recalculateTotal([...positions, newPosition]);
  };

  const handleRemovePosition = (positionId: string) => {
    const newPositions = positions.filter(p => p.id !== positionId);
    setPositions(newPositions);
    recalculateTotal(newPositions);
  };

  const handleEditPosition = (position: OfferPosition) => {
    setEditingPosition(position);
    setPositionForm({
      description: position.description,
      quantity: position.quantity,
      unit: position.unit,
      unit_price: position.unit_price,
      discount_percent: position.discount_percent || 0,
      tax_rate: position.tax_rate,
    });
    setEditDialogOpen(true);
  };

  const handleSavePosition = () => {
    if (editingPosition) {
      const updatedPositions = positions.map(p =>
        p.id === editingPosition.id
          ? { ...p, ...positionForm }
          : p
      );
      setPositions(updatedPositions);
      recalculateTotal(updatedPositions);
      setEditDialogOpen(false);
      setEditingPosition(null);
      setPositionForm({
        description: '',
        quantity: 1,
        unit: 'Stück',
        unit_price: 0,
        discount_percent: 0,
        tax_rate: 19.00,
      });
    }
  };

  const recalculateTotal = (pos: OfferPosition[]) => {
    const total = pos.reduce((sum, p) => {
      const subtotal = p.quantity * p.unit_price;
      const discount = p.discount_percent ? (subtotal * p.discount_percent / 100) : 0;
      return sum + subtotal - discount;
    }, 0);
    setFormData(prev => ({ ...prev, amount: total }));
  };

  const calculateSubtotal = () => {
    return positions.reduce((sum, p) => {
      const subtotal = p.quantity * p.unit_price;
      const discount = p.discount_percent ? (subtotal * p.discount_percent / 100) : 0;
      return sum + subtotal - discount;
    }, 0);
  };

  const calculateTax = () => {
    return positions.reduce((sum, p) => {
      const subtotal = p.quantity * p.unit_price;
      const discount = p.discount_percent ? (subtotal * p.discount_percent / 100) : 0;
      const itemTotal = subtotal - discount;
      return sum + (itemTotal * p.tax_rate / 100);
    }, 0);
  };

  const calculateGrandTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleCreateOffer = async () => {
    try {
      // Erstelle Angebot
      const newOffer = await offersApi.create(formData);

      // Erstelle Positionen (Artikel & Leistungen)
      for (const position of positions) {
        await offersApi.createItem({
          offer_id: newOffer.id,
          item_id: position.item_id,
          description: position.description,
          quantity: position.quantity,
          unit: position.unit,
          unit_price: position.unit_price,
          discount_percent: position.discount_percent,
          tax_rate: position.tax_rate,
        });
      }

      // Erstelle Texte (nur temporäre, nicht bereits gespeicherte)
      for (const text of texts) {
        if (text.tempId) {
          await offersApi.createText({
            offer_id: newOffer.id,
            title: text.title,
            description: text.description,
            position_order: text.position_order,
          });
        }
      }

      // Erstelle Titel (nur temporäre, nicht bereits gespeicherte)
      for (const title of titles) {
        if (title.tempId) {
          await offersApi.createTitle({
            offer_id: newOffer.id,
            title: title.title,
            position_order: title.position_order,
          });
        }
      }

      navigate(`/offers/${newOffer.id}`);
    } catch (error) {
      console.error('Error creating offer:', error);
      alert('Fehler beim Erstellen des Angebots');
    }
  };

  const handleSaveArticle = (data: any) => {
    // Hier würde normalerweise der Artikel erstellt/aktualisiert werden
    // Für jetzt fügen wir ihn als Position hinzu
    const newPosition: OfferPosition = {
      id: `temp-article-${Date.now()}`,
      description: data.name,
      quantity: 1,
      unit: data.unit || 'Stk',
      unit_price: data.list_price || 0,
      discount_percent: 0,
      tax_rate: data.vat_rate || 19.00,
      position_order: positions.length + texts.length + titles.length + 1,
    };
    setPositions([...positions, newPosition]);
    recalculateTotal([...positions, newPosition]);
  };

  const handleSaveService = (data: any) => {
    // Hier würde normalerweise die Leistung erstellt/aktualisiert werden
    // Für jetzt fügen wir sie als Position hinzu
    const newPosition: OfferPosition = {
      id: `temp-service-${Date.now()}`,
      description: data.name,
      quantity: 1,
      unit: data.unit || 'h',
      unit_price: 0, // Wird in Kalkulation berechnet
      discount_percent: 0,
      tax_rate: 19.00,
      position_order: positions.length + texts.length + titles.length + 1,
    };
    setPositions([...positions, newPosition]);
    recalculateTotal([...positions, newPosition]);
  };

  const handleSaveText = (data: { title: string; description?: string }) => {
    if (editingText) {
      setTexts(texts.map(t => (t.tempId && editingText.tempId && t.tempId === editingText.tempId) || t.id === editingText.id ? { ...t, ...data } : t));
      setEditingText(null);
    } else {
      const tempId = `temp-text-${Date.now()}`;
      const newText = {
        id: 0,
        offer_id: 0,
        title: data.title,
        description: data.description,
        position_order: positions.length + texts.length + titles.length + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tempId,
      };
      setTexts([...texts, newText]);
    }
  };

  const handleSaveTitle = (data: { title: string }) => {
    if (editingTitle) {
      setTitles(titles.map(t => (t.tempId && editingTitle.tempId && t.tempId === editingTitle.tempId) || t.id === editingTitle.id ? { ...t, ...data } : t));
      setEditingTitle(null);
    } else {
      const tempId = `temp-title-${Date.now()}`;
      const newTitle = {
        id: 0,
        offer_id: 0,
        title: data.title,
        position_order: positions.length + texts.length + titles.length + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tempId,
      };
      setTitles([...titles, newTitle]);
    }
  };

  const handleRemoveText = (textId: string | number) => {
    setTexts(texts.filter(t => {
      if (t.tempId) {
        return t.tempId !== textId.toString();
      }
      return t.id.toString() !== textId.toString();
    }));
  };

  const handleRemoveTitle = (titleId: string | number) => {
    setTitles(titles.filter(t => {
      if (t.tempId) {
        return t.tempId !== titleId.toString();
      }
      return t.id.toString() !== titleId.toString();
    }));
  };

  const handleEditText = (text: OfferText & { tempId?: string }) => {
    setEditingText(text);
    setNewTextDialogOpen(true);
  };

  const handleEditTitle = (title: OfferTitle & { tempId?: string }) => {
    setEditingTitle(title);
    setNewTitleDialogOpen(true);
  };

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 120px)' }}>
      {/* Hauptbereich - Angebot */}
      <Box sx={{ flex: 1, overflowY: 'auto', pr: 2 }}>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/offers')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4">Angebot erstellen</Typography>
        </Box>

        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Kunde</Typography>
            {contact ? (
              <Box>
                <Typography variant="body1" fontWeight={600}>
                  {contact.first_name} {contact.last_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {contact.customer_number && `Kundennummer: ${contact.customer_number}`}
                </Typography>
                {contact.address && (
                  <Typography variant="body2" color="text.secondary">
                    {contact.address} {contact.postal_code}
                  </Typography>
                )}
              </Box>
            ) : (
              <Autocomplete
                options={allContacts}
                getOptionLabel={(option) => `${option.first_name} ${option.last_name}${option.customer_number ? ` (${option.customer_number})` : ''}`}
                value={contact}
                onChange={(_, value) => {
                  setContact(value);
                  if (value) {
                    setFormData(prev => ({ ...prev, customer_id: value.id }));
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Kontakt auswählen"
                    placeholder="Kontakt suchen..."
                  />
                )}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Positionen</Typography>
              <Chip label={`${positions.length} Positionen`} />
            </Box>

            {positions.length === 0 ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '400px',
                  textAlign: 'center',
                  border: '2px dashed',
                  borderColor: 'divider',
                  borderRadius: 2,
                  p: 4,
                }}
              >
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Keine Positionen
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Fügen Sie Artikel oder Leistungen aus der rechten Sidebar hinzu
                </Typography>
              </Box>
            ) : (
              <Box>
                {positions.map((position) => (
                  <Card
                    key={position.id}
                    sx={{
                      mb: 2,
                      '&:hover': {
                        boxShadow: 4,
                      },
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'start', gap: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                            <Typography variant="subtitle1" fontWeight={600}>
                              {position.description}
                            </Typography>
                            <Box>
                              <IconButton
                                size="small"
                                onClick={() => handleEditPosition(position)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleRemovePosition(position.id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>
                          <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={3}>
                              <Typography variant="caption" color="text.secondary">Menge</Typography>
                              <Typography variant="body2">{position.quantity} {position.unit}</Typography>
                            </Grid>
                            <Grid item xs={3}>
                              <Typography variant="caption" color="text.secondary">Einzelpreis</Typography>
                              <Typography variant="body2">{position.unit_price.toFixed(2)} €</Typography>
                            </Grid>
                            <Grid item xs={3}>
                              <Typography variant="caption" color="text.secondary">Rabatt</Typography>
                              <Typography variant="body2">{position.discount_percent || 0}%</Typography>
                            </Grid>
                            <Grid item xs={3}>
                              <Typography variant="caption" color="text.secondary">Gesamt</Typography>
                              <Typography variant="body2" fontWeight={600}>
                                {((position.quantity * position.unit_price) * (1 - (position.discount_percent || 0) / 100)).toFixed(2)} €
                              </Typography>
                            </Grid>
                          </Grid>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}

            {/* Zusammenfassung */}
            {positions.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1">Zwischensumme (netto):</Typography>
                  <Typography variant="body1">{calculateSubtotal().toFixed(2)} €</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1">MwSt.:</Typography>
                  <Typography variant="body1">{calculateTax().toFixed(2)} €</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6">Gesamt (brutto):</Typography>
                  <Typography variant="h6">{calculateGrandTotal().toFixed(2)} €</Typography>
                </Box>
              </>
            )}
          </CardContent>
        </Card>

        <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button variant="outlined" onClick={() => navigate('/offers')}>
            Abbrechen
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleCreateOffer}
            disabled={positions.length === 0}
          >
            Angebot speichern
          </Button>
        </Box>
      </Box>

      {/* Rechte Sidebar - Artikel & Leistungen (Hero-Style) */}
      <Paper
        sx={{
          width: 400,
          borderLeft: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        <Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
          <Tabs value={sidebarTab} onChange={(_, newValue) => setSidebarTab(newValue)}>
            <Tab label="Artikel & Leistungen" />
            <Tab label="Texte & Titel" />
          </Tabs>
        </Box>

        <TabPanel value={sidebarTab} index={0}>
          <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Neuen Artikel hinzufügen */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Neuen Artikel hinzufügen
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => setNewArticleDialogOpen(true)}
                  fullWidth
                  sx={{ borderColor: 'divider', color: 'text.primary', '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' } }}
                >
                  Artikel
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => setNewServiceDialogOpen(true)}
                  fullWidth
                  sx={{ borderColor: 'divider', color: 'text.primary', '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' } }}
                >
                  Leistung
                </Button>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Artikel aus Artikelstamm hinzufügen */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Artikel aus Artikelstamm hinzufügen
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Name, Hersteller, Kategorie, Be..."
                value={itemSearchTerm}
                onChange={(e) => setItemSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 1 }}
              />
              <Button variant="text" size="small" fullWidth>
                Erweiterte Suche
              </Button>
            </Box>

            {/* Artikel-Liste */}
            <Box sx={{ flex: 1, overflowY: 'auto' }}>
              {filteredItems.length === 0 ? (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                  {itemSearchTerm ? 'Keine Artikel gefunden' : 'Keine Artikel verfügbar'}
                </Typography>
              ) : (
                <List>
                  {filteredItems.map((item) => (
                    <ListItem
                      key={item.id}
                      sx={{
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="body2" fontWeight={600}>
                            {item.name}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              {item.price?.toFixed(2) || '0.00'} € / {item.unit || 'Stk'}
                            </Typography>
                            {item.description && (
                              <Typography variant="caption" color="text.secondary" display="block">
                                {item.description.substring(0, 100)}
                                {item.description.length > 100 ? '...' : ''}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={() => handleAddItem(item)}
                          sx={{
                            color: 'primary.main',
                            '&:hover': {
                              backgroundColor: 'primary.light',
                              color: 'white',
                            },
                          }}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={sidebarTab} index={1}>
          <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Neuen Text/Titel hinzufügen */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Neuen Text/Titel hinzufügen
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setEditingText(null);
                    setNewTextDialogOpen(true);
                  }}
                  fullWidth
                  sx={{ borderColor: 'divider', color: 'text.primary', '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' } }}
                >
                  Text
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setEditingTitle(null);
                    setNewTitleDialogOpen(true);
                  }}
                  fullWidth
                  sx={{ borderColor: 'divider', color: 'text.primary', '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' } }}
                >
                  Titel
                </Button>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Suchfeld */}
            <TextField
              fullWidth
              size="small"
              placeholder="Bezeichnung, etc."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            {/* Texte & Titel Liste */}
            <Box sx={{ flex: 1, overflowY: 'auto' }}>
              {texts.length === 0 && titles.length === 0 ? (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                  Keine Texte oder Titel vorhanden
                </Typography>
              ) : (
                <List>
                  {texts.map((text) => (
                    <ListItem
                      key={text.id}
                      sx={{
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="body2" fontWeight={600}>
                            {text.title}
                          </Typography>
                        }
                        secondary={
                          text.description && (
                            <Typography variant="caption" color="text.secondary">
                              {text.description.substring(0, 100)}
                              {text.description.length > 100 ? '...' : ''}
                            </Typography>
                          )
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={() => handleEditText(text)}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={() => handleRemoveText(text.tempId || text.id)}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                  {titles.map((title) => (
                    <ListItem
                      key={title.id}
                      sx={{
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="body2" fontWeight={600}>
                            {title.title}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            Zwischenüberschrift
                          </Typography>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={() => handleEditTitle(title)}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={() => handleRemoveTitle(title.tempId || title.id)}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </Box>
        </TabPanel>
      </Paper>

      {/* Edit Position Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Position bearbeiten</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Beschreibung"
            value={positionForm.description}
            onChange={(e) => setPositionForm({ ...positionForm, description: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            type="number"
            label="Menge"
            value={positionForm.quantity}
            onChange={(e) => setPositionForm({ ...positionForm, quantity: parseFloat(e.target.value) || 0 })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Einheit"
            value={positionForm.unit}
            onChange={(e) => setPositionForm({ ...positionForm, unit: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            type="number"
            label="Einzelpreis"
            value={positionForm.unit_price}
            onChange={(e) => setPositionForm({ ...positionForm, unit_price: parseFloat(e.target.value) || 0 })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            type="number"
            label="Rabatt (%)"
            value={positionForm.discount_percent || 0}
            onChange={(e) => setPositionForm({ ...positionForm, discount_percent: parseFloat(e.target.value) || 0 })}
            margin="normal"
          />
          <TextField
            fullWidth
            type="number"
            label="MwSt. (%)"
            value={positionForm.tax_rate || 19.00}
            onChange={(e) => setPositionForm({ ...positionForm, tax_rate: parseFloat(e.target.value) || 19.00 })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Abbrechen</Button>
          <Button onClick={handleSavePosition} variant="contained" disabled={!positionForm.description}>
            Speichern
          </Button>
        </DialogActions>
      </Dialog>


      {/* Neue Leistung Dialog */}
      <ServiceDialog
        open={newServiceDialogOpen}
        onClose={() => setNewServiceDialogOpen(false)}
        onSave={handleSaveService}
      />

      {/* Neuer Artikel Dialog */}
      <ArticleDialog
        open={newArticleDialogOpen}
        onClose={() => setNewArticleDialogOpen(false)}
        onSave={handleSaveArticle}
      />

      {/* Neuer Text Dialog */}
      <TextDialog
        open={newTextDialogOpen}
        onClose={() => {
          setNewTextDialogOpen(false);
          setEditingText(null);
        }}
        onSave={(data) => {
          handleSaveText(data);
          setNewTextDialogOpen(false);
        }}
        text={editingText}
      />

      {/* Neuer Titel Dialog */}
      <TitleDialog
        open={newTitleDialogOpen}
        onClose={() => {
          setNewTitleDialogOpen(false);
          setEditingTitle(null);
        }}
        onSave={(data) => {
          handleSaveTitle(data);
          setNewTitleDialogOpen(false);
        }}
        title={editingTitle}
      />
    </Box>
  );
}

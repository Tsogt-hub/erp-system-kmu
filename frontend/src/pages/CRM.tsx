import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArchiveIcon from '@mui/icons-material/Archive';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { crmApi, Company, Contact, CreateCompanyData, CreateContactData } from '../services/api/crm';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function CRM() {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyDialogOpen, setCompanyDialogOpen] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [companyForm, setCompanyForm] = useState<CreateCompanyData>({ name: '' });
  const [contactForm, setContactForm] = useState<CreateContactData & { category?: string; type?: string }>({
    first_name: '',
    last_name: '',
    category: 'contact',
    type: 'person', // Kontakte sind immer Personen
    customer_number: '',
    address: '',
    postal_code: '',
    availability: '',
  });
  const [contactFilters, setContactFilters] = useState({
    category: '',
    type: '',
    showArchived: false,
  });

  useEffect(() => {
    loadData();
  }, [tabValue, contactFilters]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (tabValue === 0) {
        // Kontakte - nur Personen (type='person')
        const params = new URLSearchParams();
        params.append('type', 'person'); // Nur Personen, keine Unternehmen
        if (contactFilters.category) params.append('category', contactFilters.category);
        if (contactFilters.showArchived) params.append('archived', 'true');
        
        const queryString = params.toString();
        const url = queryString ? `/api/crm/contacts?${queryString}` : '/api/crm/contacts';
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await response.json();
        setContacts(data);
      } else {
        // Unternehmen - nur Unternehmen (type='company')
        const data = await crmApi.getCompanies();
        setCompanies(data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyCreate = async () => {
    try {
      await crmApi.createCompany(companyForm);
      setCompanyDialogOpen(false);
      setCompanyForm({ name: '' });
      loadData();
    } catch (error) {
      console.error('Error creating company:', error);
    }
  };

  const handleContactCreate = async () => {
    try {
      if (contactForm.first_name && contactForm.last_name) {
        // Edit existing contact
        const contactId = (contactForm as any).id;
        if (contactId) {
          await crmApi.updateContact(contactId, contactForm);
        } else {
          await crmApi.createContact(contactForm);
        }
        setContactDialogOpen(false);
        setContactForm({ first_name: '', last_name: '', category: 'contact', type: 'person', customer_number: '', address: '', postal_code: '', availability: '' });
        loadData();
      }
    } catch (error) {
      console.error('Error creating/updating contact:', error);
    }
  };

  const handleEditContact = (contact: Contact) => {
    setContactForm({
      ...contact,
      category: contact.category || 'contact',
      type: contact.type || 'person',
    } as any);
    setContactDialogOpen(true);
  };

  const handleDelete = async (type: 'company' | 'contact', id: number) => {
    if (window.confirm('Möchten Sie diesen Eintrag wirklich löschen?')) {
      try {
        if (type === 'company') {
          await crmApi.deleteCompany(id);
        } else {
          await crmApi.deleteContact(id);
        }
        loadData();
      } catch (error) {
        console.error('Error deleting:', error);
      }
    }
  };

  const handleArchiveContact = async (id: number, archive: boolean) => {
    try {
      await crmApi.updateContact(id, { is_archived: archive } as any);
      loadData();
    } catch (error) {
      console.error('Error archiving contact:', error);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        CRM
      </Typography>

      <Tabs value={tabValue} onChange={(_e, newValue) => setTabValue(newValue)} sx={{ mb: 2 }}>
        <Tab label="Kontakte" />
        <Tab label="Unternehmen" />
      </Tabs>

      {/* Kontakte Tab - nur Personen */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
          <Typography variant="h6">Kontakte</Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Kategorie</InputLabel>
              <Select
                value={contactFilters.category}
                label="Kategorie"
                onChange={(e) => setContactFilters({ ...contactFilters, category: e.target.value })}
              >
                <MenuItem value="">Alle</MenuItem>
                <MenuItem value="customer">Kunde</MenuItem>
                <MenuItem value="supplier">Lieferant</MenuItem>
                <MenuItem value="partner">Partner</MenuItem>
                <MenuItem value="contact">Ansprechpartner</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant={contactFilters.showArchived ? 'contained' : 'outlined'}
              onClick={() => setContactFilters({ ...contactFilters, showArchived: !contactFilters.showArchived })}
            >
              {contactFilters.showArchived ? <UnarchiveIcon /> : <ArchiveIcon />}
              {contactFilters.showArchived ? 'Aktiv' : 'Archiv'}
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setContactDialogOpen(true)}>
              Neuer Kontakt
            </Button>
          </Box>
        </Box>

        {/* Hero-Struktur: Spalten wie in Hero CRM */}
        <TableContainer component={Paper} sx={{ 
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
        }}>
          <Table sx={{ tableLayout: 'fixed' }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '8%', fontWeight: 600 }}>Typ</TableCell>
                <TableCell sx={{ width: '10%', fontWeight: 600 }}>Kundennummer</TableCell>
                <TableCell sx={{ width: '12%', fontWeight: 600 }}>Firmenname</TableCell>
                <TableCell sx={{ width: '10%', fontWeight: 600 }}>Vorname</TableCell>
                <TableCell sx={{ width: '10%', fontWeight: 600 }}>Nachname</TableCell>
                <TableCell sx={{ width: '12%', fontWeight: 600 }}>E-Mail</TableCell>
                <TableCell sx={{ width: '10%', fontWeight: 600 }}>Kategorie</TableCell>
                <TableCell sx={{ width: '12%', fontWeight: 600 }}>Ort</TableCell>
                <TableCell sx={{ width: '16%', fontWeight: 600 }}>Aktionen</TableCell>
              </TableRow>
              {/* Filter-Zeile wie bei Hero ERP */}
              <TableRow sx={{ 
                backgroundColor: 'rgba(250, 250, 250, 0.8)',
                '& .MuiTableCell-root': {
                  padding: '8px 12px',
                  borderBottom: '2px solid rgba(0, 0, 0, 0.1)',
                }
              }}>
                <TableCell>
                  <FormControl size="small" fullWidth>
                    <Select
                      displayEmpty
                      sx={{ 
                        backgroundColor: '#FFFFFF',
                        fontSize: '0.875rem',
                        '& .MuiSelect-select': { py: 0.75 }
                      }}
                    >
                      <MenuItem value="">Alle</MenuItem>
                      <MenuItem value="person">Person</MenuItem>
                      <MenuItem value="company">Firma</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    placeholder="Kundennr."
                    fullWidth
                    variant="outlined"
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        backgroundColor: '#FFFFFF',
                        fontSize: '0.875rem',
                      },
                      '& .MuiOutlinedInput-input': { py: 0.75 }
                    }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    placeholder="Firma"
                    fullWidth
                    variant="outlined"
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        backgroundColor: '#FFFFFF',
                        fontSize: '0.875rem',
                      },
                      '& .MuiOutlinedInput-input': { py: 0.75 }
                    }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    placeholder="Vorname"
                    fullWidth
                    variant="outlined"
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        backgroundColor: '#FFFFFF',
                        fontSize: '0.875rem',
                      },
                      '& .MuiOutlinedInput-input': { py: 0.75 }
                    }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    placeholder="Nachname"
                    fullWidth
                    variant="outlined"
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        backgroundColor: '#FFFFFF',
                        fontSize: '0.875rem',
                      },
                      '& .MuiOutlinedInput-input': { py: 0.75 }
                    }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    placeholder="E-Mail"
                    fullWidth
                    variant="outlined"
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        backgroundColor: '#FFFFFF',
                        fontSize: '0.875rem',
                      },
                      '& .MuiOutlinedInput-input': { py: 0.75 }
                    }}
                  />
                </TableCell>
                <TableCell>
                  <FormControl size="small" fullWidth>
                    <Select
                      displayEmpty
                      sx={{ 
                        backgroundColor: '#FFFFFF',
                        fontSize: '0.875rem',
                        '& .MuiSelect-select': { py: 0.75 }
                      }}
                    >
                      <MenuItem value="">Alle</MenuItem>
                      <MenuItem value="customer">Kunde</MenuItem>
                      <MenuItem value="supplier">Lieferant</MenuItem>
                      <MenuItem value="partner">Partner</MenuItem>
                      <MenuItem value="contact">Ansprechpartner</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    placeholder="Ort"
                    fullWidth
                    variant="outlined"
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        backgroundColor: '#FFFFFF',
                        fontSize: '0.875rem',
                      },
                      '& .MuiOutlinedInput-input': { py: 0.75 }
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-start' }}>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<SearchIcon sx={{ fontSize: '1rem' }} />}
                      sx={{ 
                        minWidth: 'auto',
                        px: 1.5,
                        py: 0.5,
                        fontSize: '0.8125rem'
                      }}
                    >
                      Suchen
                    </Button>
                    <IconButton
                      size="small"
                      onClick={() => {
                        // Reset filters
                      }}
                      sx={{ padding: '4px' }}
                    >
                      <ClearIcon sx={{ fontSize: '1.1rem' }} />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">Lädt...</TableCell>
                </TableRow>
              ) : contacts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">Keine Kontakte gefunden</TableCell>
                </TableRow>
              ) : (
                contacts.map((contact) => (
                  <TableRow key={contact.id} hover sx={{ cursor: 'pointer' }}>
                    <TableCell>
                      <Chip
                        label={contact.type === 'company' ? 'Firma' : 'Person'}
                        size="small"
                        color={contact.type === 'company' ? 'primary' : 'default'}
                      />
                    </TableCell>
                    <TableCell>{contact.customer_number || '-'}</TableCell>
                    <TableCell>{contact.company_name || '-'}</TableCell>
                    <TableCell>{contact.first_name || '-'}</TableCell>
                    <TableCell>{contact.last_name || '-'}</TableCell>
                    <TableCell>{contact.email || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={
                          contact.category === 'customer' ? 'Kunde' :
                          contact.category === 'supplier' ? 'Lieferant' :
                          contact.category === 'partner' ? 'Partner' :
                          'Ansprechpartner'
                        }
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {contact.address && contact.postal_code 
                        ? `${contact.address}, ${contact.postal_code}` 
                        : contact.address || contact.postal_code || '-'}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => navigate(`/offers/create?contactId=${contact.id}`)}
                        title="Angebot erstellen"
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="primary" onClick={() => handleEditContact(contact)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleArchiveContact(contact.id, !contact.is_archived)}
                      >
                        {contact.is_archived ? <UnarchiveIcon /> : <ArchiveIcon />}
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete('contact', contact.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Unternehmen Tab - nur Unternehmen */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
          <Typography variant="h6">Unternehmen</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCompanyDialogOpen(true)}>
            Neues Unternehmen
          </Button>
        </Box>

        {/* Hero-Struktur: Spalten wie in Hero CRM */}
        <TableContainer component={Paper} sx={{ 
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
        }}>
          <Table sx={{ tableLayout: 'fixed' }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '8%', fontWeight: 600 }}>Typ</TableCell>
                <TableCell sx={{ width: '10%', fontWeight: 600 }}>Kundennummer</TableCell>
                <TableCell sx={{ width: '12%', fontWeight: 600 }}>Firmenname</TableCell>
                <TableCell sx={{ width: '10%', fontWeight: 600 }}>Vorname</TableCell>
                <TableCell sx={{ width: '10%', fontWeight: 600 }}>Nachname</TableCell>
                <TableCell sx={{ width: '12%', fontWeight: 600 }}>E-Mail</TableCell>
                <TableCell sx={{ width: '10%', fontWeight: 600 }}>Kategorie</TableCell>
                <TableCell sx={{ width: '12%', fontWeight: 600 }}>Ort</TableCell>
                <TableCell sx={{ width: '16%', fontWeight: 600 }}>Aktionen</TableCell>
              </TableRow>
              {/* Filter-Zeile wie bei Hero ERP */}
              <TableRow sx={{ 
                backgroundColor: 'rgba(250, 250, 250, 0.8)',
                '& .MuiTableCell-root': {
                  padding: '8px 12px',
                  borderBottom: '2px solid rgba(0, 0, 0, 0.1)',
                }
              }}>
                <TableCell>
                  <FormControl size="small" fullWidth>
                    <Select
                      displayEmpty
                      sx={{ 
                        backgroundColor: '#FFFFFF',
                        fontSize: '0.875rem',
                        '& .MuiSelect-select': { py: 0.75 }
                      }}
                    >
                      <MenuItem value="">Alle</MenuItem>
                      <MenuItem value="company">Firma</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    placeholder="Kundennr."
                    fullWidth
                    variant="outlined"
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        backgroundColor: '#FFFFFF',
                        fontSize: '0.875rem',
                      },
                      '& .MuiOutlinedInput-input': { py: 0.75 }
                    }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    placeholder="Firma"
                    fullWidth
                    variant="outlined"
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        backgroundColor: '#FFFFFF',
                        fontSize: '0.875rem',
                      },
                      '& .MuiOutlinedInput-input': { py: 0.75 }
                    }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    placeholder="Vorname"
                    fullWidth
                    variant="outlined"
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        backgroundColor: '#FFFFFF',
                        fontSize: '0.875rem',
                      },
                      '& .MuiOutlinedInput-input': { py: 0.75 }
                    }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    placeholder="Nachname"
                    fullWidth
                    variant="outlined"
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        backgroundColor: '#FFFFFF',
                        fontSize: '0.875rem',
                      },
                      '& .MuiOutlinedInput-input': { py: 0.75 }
                    }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    placeholder="E-Mail"
                    fullWidth
                    variant="outlined"
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        backgroundColor: '#FFFFFF',
                        fontSize: '0.875rem',
                      },
                      '& .MuiOutlinedInput-input': { py: 0.75 }
                    }}
                  />
                </TableCell>
                <TableCell>
                  <FormControl size="small" fullWidth>
                    <Select
                      displayEmpty
                      sx={{ 
                        backgroundColor: '#FFFFFF',
                        fontSize: '0.875rem',
                        '& .MuiSelect-select': { py: 0.75 }
                      }}
                    >
                      <MenuItem value="">Alle</MenuItem>
                      <MenuItem value="customer">Kunde</MenuItem>
                      <MenuItem value="supplier">Lieferant</MenuItem>
                      <MenuItem value="partner">Partner</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    placeholder="Ort"
                    fullWidth
                    variant="outlined"
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        backgroundColor: '#FFFFFF',
                        fontSize: '0.875rem',
                      },
                      '& .MuiOutlinedInput-input': { py: 0.75 }
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-start' }}>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<SearchIcon sx={{ fontSize: '1rem' }} />}
                      sx={{ 
                        minWidth: 'auto',
                        px: 1.5,
                        py: 0.5,
                        fontSize: '0.8125rem'
                      }}
                    >
                      Suchen
                    </Button>
                    <IconButton
                      size="small"
                      onClick={() => {
                        // Reset filters
                      }}
                      sx={{ padding: '4px' }}
                    >
                      <ClearIcon sx={{ fontSize: '1.1rem' }} />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">Lädt...</TableCell>
                </TableRow>
              ) : companies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">Keine Unternehmen gefunden</TableCell>
                </TableRow>
              ) : (
                companies.map((company) => (
                  <TableRow key={company.id} hover sx={{ cursor: 'pointer' }}>
                    <TableCell>
                      <Chip label="Firma" size="small" color="primary" />
                    </TableCell>
                    <TableCell>{company.customer_number || '-'}</TableCell>
                    <TableCell>{company.name}</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>{company.email || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={company.category === 'customer' ? 'Kunde' : company.category === 'supplier' ? 'Lieferant' : 'Partner'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{company.city || '-'}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <IconButton size="small" color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete('company', company.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Company Dialog */}
      <Dialog open={companyDialogOpen} onClose={() => setCompanyDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Neues Unternehmen erstellen</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={companyForm.name}
            onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="E-Mail"
            value={companyForm.email || ''}
            onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
            margin="normal"
            type="email"
          />
          <TextField
            fullWidth
            label="Telefon"
            value={companyForm.phone || ''}
            onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Stadt"
            value={companyForm.city || ''}
            onChange={(e) => setCompanyForm({ ...companyForm, city: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompanyDialogOpen(false)}>Abbrechen</Button>
          <Button onClick={handleCompanyCreate} variant="contained" disabled={!companyForm.name}>
            Erstellen
          </Button>
        </DialogActions>
      </Dialog>

      {/* Contact Dialog */}
      <Dialog open={contactDialogOpen} onClose={() => setContactDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{(contactForm as any).id ? 'Kontakt bearbeiten' : 'Neuen Kontakt erstellen'}</DialogTitle>
        <DialogContent>
          {/* Typ ist immer 'person' für Kontakte */}
          <input type="hidden" value="person" />
          <FormControl fullWidth margin="normal">
            <InputLabel>Kategorie</InputLabel>
            <Select
              value={contactForm.category || 'contact'}
              label="Kategorie"
              onChange={(e) => setContactForm({ ...contactForm, category: e.target.value })}
            >
              <MenuItem value="customer">Kunde</MenuItem>
              <MenuItem value="supplier">Lieferant</MenuItem>
              <MenuItem value="partner">Partner</MenuItem>
              <MenuItem value="contact">Ansprechpartner</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Kundennummer"
            value={contactForm.customer_number || ''}
            onChange={(e) => setContactForm({ ...contactForm, customer_number: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Vorname"
            value={contactForm.first_name}
            onChange={(e) => setContactForm({ ...contactForm, first_name: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Nachname"
            value={contactForm.last_name}
            onChange={(e) => setContactForm({ ...contactForm, last_name: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Straße"
            value={contactForm.address || ''}
            onChange={(e) => setContactForm({ ...contactForm, address: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Postleitzahl"
            value={contactForm.postal_code || ''}
            onChange={(e) => setContactForm({ ...contactForm, postal_code: e.target.value })}
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Erreichbarkeit</InputLabel>
            <Select
              value={contactForm.availability || ''}
              label="Erreichbarkeit"
              onChange={(e) => setContactForm({ ...contactForm, availability: e.target.value })}
            >
              <MenuItem value="">Nicht angegeben</MenuItem>
              <MenuItem value="Vormittags">Vormittags</MenuItem>
              <MenuItem value="Nachmittags">Nachmittags</MenuItem>
              <MenuItem value="Abends">Abends</MenuItem>
              <MenuItem value="Ganztags">Ganztags</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="E-Mail"
            value={contactForm.email || ''}
            onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
            margin="normal"
            type="email"
          />
          <TextField
            fullWidth
            label="Telefon"
            value={contactForm.phone || ''}
            onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Mobil"
            value={contactForm.mobile || ''}
            onChange={(e) => setContactForm({ ...contactForm, mobile: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Position"
            value={contactForm.position || ''}
            onChange={(e) => setContactForm({ ...contactForm, position: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setContactDialogOpen(false);
            setContactForm({ first_name: '', last_name: '', category: 'contact', type: 'person' });
          }}>Abbrechen</Button>
          <Button onClick={handleContactCreate} variant="contained" disabled={!contactForm.first_name || !contactForm.last_name}>
            {(contactForm as any).id ? 'Aktualisieren' : 'Erstellen'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}


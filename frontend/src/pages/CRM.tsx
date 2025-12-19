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
import { crmApi, Company, Contact, CreateCompanyData, CreateContactData, LEAD_SOURCES, REACHABILITY_OPTIONS, SALUTATION_OPTIONS } from '../services/api/crm';
import { apiClient } from '../services/api/client';

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
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [companyForm, setCompanyForm] = useState<CreateCompanyData>({ name: '' });
  const [contactForm, setContactForm] = useState<CreateContactData & { category?: string; type?: string; id?: number }>({
    first_name: '',
    last_name: '',
    category: 'contact',
    type: 'person', // Kontakte sind immer Personen
    customer_number: '',
    address: '',
    postal_code: '',
    city: '',
    country: 'Deutschland',
    availability: '',
    salutation: '',
    lead_source: '',
    website: '',
    fax: '',
    birthday: '',
    is_invoice_recipient: false,
    additional_salutation: '',
  });
  const [contactFilters, setContactFilters] = useState({
    category: '',
    type: '',
    showArchived: false,
  });
  
  // Erweiterte Filter für Kontakte-Tabelle
  const [contactTableFilters, setContactTableFilters] = useState({
    type: '',
    customerNumber: '',
    companyName: '',
    firstName: '',
    lastName: '',
    email: '',
    category: '',
    location: '',
    leadSource: '',
  });
  
  // Erweiterte Filter für Unternehmen-Tabelle
  const [companyTableFilters, setCompanyTableFilters] = useState({
    customerNumber: '',
    companyName: '',
    email: '',
    category: '',
    location: '',
  });
  
  // Gefilterte Kontakte
  const filteredContacts = contacts.filter(contact => {
    if (contactTableFilters.type && contact.type !== contactTableFilters.type) return false;
    if (contactTableFilters.customerNumber && !contact.customer_number?.toLowerCase().includes(contactTableFilters.customerNumber.toLowerCase())) return false;
    if (contactTableFilters.companyName && !contact.company_name?.toLowerCase().includes(contactTableFilters.companyName.toLowerCase())) return false;
    if (contactTableFilters.firstName && !contact.first_name?.toLowerCase().includes(contactTableFilters.firstName.toLowerCase())) return false;
    if (contactTableFilters.lastName && !contact.last_name?.toLowerCase().includes(contactTableFilters.lastName.toLowerCase())) return false;
    if (contactTableFilters.email && !contact.email?.toLowerCase().includes(contactTableFilters.email.toLowerCase())) return false;
    if (contactTableFilters.category && contact.category !== contactTableFilters.category) return false;
    if (contactTableFilters.leadSource && contact.lead_source !== contactTableFilters.leadSource) return false;
    if (contactTableFilters.location) {
      const locationStr = `${contact.address || ''} ${contact.postal_code || ''}`.toLowerCase();
      if (!locationStr.includes(contactTableFilters.location.toLowerCase())) return false;
    }
    return true;
  });
  
  // Gefilterte Unternehmen
  const filteredCompanies = companies.filter(company => {
    if (companyTableFilters.customerNumber && !company.customer_number?.toLowerCase().includes(companyTableFilters.customerNumber.toLowerCase())) return false;
    if (companyTableFilters.companyName && !company.name?.toLowerCase().includes(companyTableFilters.companyName.toLowerCase())) return false;
    if (companyTableFilters.email && !company.email?.toLowerCase().includes(companyTableFilters.email.toLowerCase())) return false;
    if (companyTableFilters.category && company.category !== companyTableFilters.category) return false;
    if (companyTableFilters.location && !company.city?.toLowerCase().includes(companyTableFilters.location.toLowerCase())) return false;
    return true;
  });
  
  // Reset Filter Funktionen
  const resetContactFilters = () => {
    setContactTableFilters({
      type: '',
      customerNumber: '',
      companyName: '',
      firstName: '',
      lastName: '',
      email: '',
      category: '',
      location: '',
      leadSource: '',
    });
  };
  
  const resetCompanyFilters = () => {
    setCompanyTableFilters({
      customerNumber: '',
      companyName: '',
      email: '',
      category: '',
      location: '',
    });
  };

  useEffect(() => {
    loadData();
  }, [tabValue, contactFilters]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (tabValue === 0) {
        // Kontakte - nur Personen (type='person')
        const params: any = { type: 'person' }; // Nur Personen, keine Unternehmen
        if (contactFilters.category) params.category = contactFilters.category;
        if (contactFilters.showArchived) params.archived = 'true';
        
        const response = await apiClient.get('/crm/contacts', { params });
        setContacts(response.data);
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
      if (editingCompany) {
        await crmApi.updateCompany(editingCompany.id, companyForm);
      } else {
        await crmApi.createCompany(companyForm);
      }
      setCompanyDialogOpen(false);
      setEditingCompany(null);
      setCompanyForm({ name: '' });
      loadData();
    } catch (error) {
      console.error('Error saving company:', error);
    }
  };

  const handleEditCompany = (company: Company) => {
    setEditingCompany(company);
    setCompanyForm({
      name: company.name,
      email: company.email,
      phone: company.phone,
      city: company.city,
      category: company.category,
      customer_number: company.customer_number,
    });
    setCompanyDialogOpen(true);
  };

  const handleContactCreate = async () => {
    try {
      if (contactForm.first_name && contactForm.last_name) {
        const { id, ...dataToSave } = contactForm;
        if (id) {
          await crmApi.updateContact(id, dataToSave);
        } else {
          await crmApi.createContact(dataToSave);
        }
        setContactDialogOpen(false);
        resetContactForm();
        loadData();
      }
    } catch (error) {
      console.error('Error creating/updating contact:', error);
    }
  };

  const resetContactForm = () => {
    setContactForm({ 
      first_name: '', 
      last_name: '', 
      category: 'contact', 
      type: 'person',
      customer_number: '',
      address: '',
      postal_code: '',
      city: '',
      country: 'Deutschland',
      availability: '',
      salutation: '',
      lead_source: '',
      website: '',
      fax: '',
      birthday: '',
      is_invoice_recipient: false,
      additional_salutation: '',
    });
  };

  const handleEditContact = (contact: Contact) => {
    setContactForm({
      id: contact.id,
      first_name: contact.first_name,
      last_name: contact.last_name,
      email: contact.email || '',
      phone: contact.phone || '',
      mobile: contact.mobile || '',
      position: contact.position || '',
      notes: contact.notes || '',
      category: contact.category || 'contact',
      type: contact.type || 'person',
      customer_number: contact.customer_number || '',
      address: contact.address || '',
      postal_code: contact.postal_code || '',
      city: contact.city || '',
      country: contact.country || 'Deutschland',
      availability: contact.availability || '',
      salutation: contact.salutation || '',
      lead_source: contact.lead_source || '',
      website: contact.website || '',
      fax: contact.fax || '',
      birthday: contact.birthday || '',
      is_invoice_recipient: contact.is_invoice_recipient || false,
      additional_salutation: contact.additional_salutation || '',
    });
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
                <TableCell sx={{ width: '6%', fontWeight: 600 }}>Typ</TableCell>
                <TableCell sx={{ width: '8%', fontWeight: 600 }}>Kundennr.</TableCell>
                <TableCell sx={{ width: '10%', fontWeight: 600 }}>Firmenname</TableCell>
                <TableCell sx={{ width: '9%', fontWeight: 600 }}>Vorname</TableCell>
                <TableCell sx={{ width: '9%', fontWeight: 600 }}>Nachname</TableCell>
                <TableCell sx={{ width: '12%', fontWeight: 600 }}>E-Mail</TableCell>
                <TableCell sx={{ width: '8%', fontWeight: 600 }}>Kategorie</TableCell>
                <TableCell sx={{ width: '10%', fontWeight: 600 }}>Lead-Quelle</TableCell>
                <TableCell sx={{ width: '10%', fontWeight: 600 }}>Ort</TableCell>
                <TableCell sx={{ width: '18%', fontWeight: 600 }}>Aktionen</TableCell>
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
                      value={contactTableFilters.type}
                      onChange={(e) => setContactTableFilters({ ...contactTableFilters, type: e.target.value })}
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
                    value={contactTableFilters.customerNumber}
                    onChange={(e) => setContactTableFilters({ ...contactTableFilters, customerNumber: e.target.value })}
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
                    value={contactTableFilters.companyName}
                    onChange={(e) => setContactTableFilters({ ...contactTableFilters, companyName: e.target.value })}
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
                    value={contactTableFilters.firstName}
                    onChange={(e) => setContactTableFilters({ ...contactTableFilters, firstName: e.target.value })}
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
                    value={contactTableFilters.lastName}
                    onChange={(e) => setContactTableFilters({ ...contactTableFilters, lastName: e.target.value })}
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
                    value={contactTableFilters.email}
                    onChange={(e) => setContactTableFilters({ ...contactTableFilters, email: e.target.value })}
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
                      value={contactTableFilters.category}
                      onChange={(e) => setContactTableFilters({ ...contactTableFilters, category: e.target.value })}
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
                  <FormControl size="small" fullWidth>
                    <Select
                      displayEmpty
                      value={contactTableFilters.leadSource}
                      onChange={(e) => setContactTableFilters({ ...contactTableFilters, leadSource: e.target.value })}
                      sx={{ 
                        backgroundColor: '#FFFFFF',
                        fontSize: '0.75rem',
                        '& .MuiSelect-select': { py: 0.75 }
                      }}
                    >
                      <MenuItem value="">Alle</MenuItem>
                      {LEAD_SOURCES.map(source => (
                        <MenuItem key={source} value={source}>{source}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    placeholder="Ort"
                    fullWidth
                    variant="outlined"
                    value={contactTableFilters.location}
                    onChange={(e) => setContactTableFilters({ ...contactTableFilters, location: e.target.value })}
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
                      onClick={resetContactFilters}
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
                  <TableCell colSpan={10} align="center">Lädt...</TableCell>
                </TableRow>
              ) : filteredContacts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center">Keine Kontakte gefunden</TableCell>
                </TableRow>
              ) : (
                filteredContacts.map((contact) => (
                  <TableRow 
                    key={contact.id} 
                    hover 
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/crm/contacts/${contact.id}`)}
                  >
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
                    <TableCell sx={{ fontSize: '0.8rem' }}>{contact.email || '-'}</TableCell>
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
                      {contact.lead_source ? (
                        <Chip
                          label={contact.lead_source}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem' }}
                        />
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {contact.city || contact.postal_code 
                        ? `${contact.postal_code || ''} ${contact.city || ''}`.trim()
                        : '-'}
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
                      value="company"
                      disabled
                      sx={{ 
                        backgroundColor: '#FFFFFF',
                        fontSize: '0.875rem',
                        '& .MuiSelect-select': { py: 0.75 }
                      }}
                    >
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
                    value={companyTableFilters.customerNumber}
                    onChange={(e) => setCompanyTableFilters({ ...companyTableFilters, customerNumber: e.target.value })}
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
                    value={companyTableFilters.companyName}
                    onChange={(e) => setCompanyTableFilters({ ...companyTableFilters, companyName: e.target.value })}
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
                  {/* Vorname nicht relevant für Unternehmen */}
                </TableCell>
                <TableCell>
                  {/* Nachname nicht relevant für Unternehmen */}
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    placeholder="E-Mail"
                    fullWidth
                    variant="outlined"
                    value={companyTableFilters.email}
                    onChange={(e) => setCompanyTableFilters({ ...companyTableFilters, email: e.target.value })}
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
                      value={companyTableFilters.category}
                      onChange={(e) => setCompanyTableFilters({ ...companyTableFilters, category: e.target.value })}
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
                    value={companyTableFilters.location}
                    onChange={(e) => setCompanyTableFilters({ ...companyTableFilters, location: e.target.value })}
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
                      onClick={resetCompanyFilters}
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
              ) : filteredCompanies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">Keine Unternehmen gefunden</TableCell>
                </TableRow>
              ) : (
                filteredCompanies.map((company) => (
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
                      <IconButton size="small" color="primary" onClick={() => handleEditCompany(company)}>
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
      <Dialog open={companyDialogOpen} onClose={() => { setCompanyDialogOpen(false); setEditingCompany(null); }} maxWidth="sm" fullWidth>
        <DialogTitle>{editingCompany ? 'Unternehmen bearbeiten' : 'Neues Unternehmen erstellen'}</DialogTitle>
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
          <Button onClick={() => { setCompanyDialogOpen(false); setEditingCompany(null); }}>Abbrechen</Button>
          <Button onClick={handleCompanyCreate} variant="contained" disabled={!companyForm.name}>
            {editingCompany ? 'Speichern' : 'Erstellen'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Contact Dialog - Hero-Style mit allen Feldern */}
      <Dialog open={contactDialogOpen} onClose={() => setContactDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ borderBottom: '1px solid rgba(0,0,0,0.1)', pb: 2 }}>
          {contactForm.id ? 'Kontakt bearbeiten' : 'Neuen Kontakt erstellen'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {/* Typ ist immer 'person' für Kontakte */}
          <input type="hidden" value="person" />
          
          {/* Grunddaten */}
          <Typography variant="subtitle2" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
            Grunddaten
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Kategorie *</InputLabel>
              <Select
                value={contactForm.category || 'contact'}
                label="Kategorie *"
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
              size="small"
              label="Kundennummer"
              value={contactForm.customer_number || ''}
              onChange={(e) => setContactForm({ ...contactForm, customer_number: e.target.value })}
            />
          </Box>
          
          {/* Persönliche Daten */}
          <Typography variant="subtitle2" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
            Persönliche Daten
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2, mb: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Anrede</InputLabel>
              <Select
                value={contactForm.salutation || ''}
                label="Anrede"
                onChange={(e) => setContactForm({ ...contactForm, salutation: e.target.value })}
              >
                <MenuItem value="">Keine Angabe</MenuItem>
                {SALUTATION_OPTIONS.map(opt => (
                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              size="small"
              label="Vorname *"
              value={contactForm.first_name}
              onChange={(e) => setContactForm({ ...contactForm, first_name: e.target.value })}
              required
            />
            <TextField
              fullWidth
              size="small"
              label="Nachname *"
              value={contactForm.last_name}
              onChange={(e) => setContactForm({ ...contactForm, last_name: e.target.value })}
              required
            />
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
            <TextField
              fullWidth
              size="small"
              label="Zusätzliche Anrede"
              placeholder="z.B. z.Hd., c/o"
              value={contactForm.additional_salutation || ''}
              onChange={(e) => setContactForm({ ...contactForm, additional_salutation: e.target.value })}
            />
            <TextField
              fullWidth
              size="small"
              label="Geburtstag"
              type="date"
              value={contactForm.birthday || ''}
              onChange={(e) => setContactForm({ ...contactForm, birthday: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
          <TextField
            fullWidth
            size="small"
            label="Position / Funktion"
            value={contactForm.position || ''}
            onChange={(e) => setContactForm({ ...contactForm, position: e.target.value })}
            sx={{ mb: 3 }}
          />

          {/* Adresse */}
          <Typography variant="subtitle2" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
            Adresse
          </Typography>
          <TextField
            fullWidth
            size="small"
            label="Straße und Hausnummer"
            value={contactForm.address || ''}
            onChange={(e) => setContactForm({ ...contactForm, address: e.target.value })}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 2, mb: 3 }}>
            <TextField
              fullWidth
              size="small"
              label="PLZ"
              value={contactForm.postal_code || ''}
              onChange={(e) => setContactForm({ ...contactForm, postal_code: e.target.value })}
            />
            <TextField
              fullWidth
              size="small"
              label="Stadt"
              value={contactForm.city || ''}
              onChange={(e) => setContactForm({ ...contactForm, city: e.target.value })}
            />
            <TextField
              fullWidth
              size="small"
              label="Land"
              value={contactForm.country || 'Deutschland'}
              onChange={(e) => setContactForm({ ...contactForm, country: e.target.value })}
            />
          </Box>

          {/* Kontaktdaten */}
          <Typography variant="subtitle2" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
            Kontaktdaten
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              size="small"
              label="E-Mail"
              type="email"
              value={contactForm.email || ''}
              onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
            />
            <TextField
              fullWidth
              size="small"
              label="Website"
              value={contactForm.website || ''}
              onChange={(e) => setContactForm({ ...contactForm, website: e.target.value })}
            />
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2, mb: 3 }}>
            <TextField
              fullWidth
              size="small"
              label="Telefon"
              value={contactForm.phone || ''}
              onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
            />
            <TextField
              fullWidth
              size="small"
              label="Mobil"
              value={contactForm.mobile || ''}
              onChange={(e) => setContactForm({ ...contactForm, mobile: e.target.value })}
            />
            <TextField
              fullWidth
              size="small"
              label="Fax"
              value={contactForm.fax || ''}
              onChange={(e) => setContactForm({ ...contactForm, fax: e.target.value })}
            />
          </Box>

          {/* Lead-Informationen */}
          <Typography variant="subtitle2" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
            Lead-Informationen
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Lead-Quelle</InputLabel>
              <Select
                value={contactForm.lead_source || ''}
                label="Lead-Quelle"
                onChange={(e) => setContactForm({ ...contactForm, lead_source: e.target.value })}
              >
                <MenuItem value="">Keine Angabe</MenuItem>
                {LEAD_SOURCES.map(source => (
                  <MenuItem key={source} value={source}>{source}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Erreichbarkeit</InputLabel>
              <Select
                value={contactForm.availability || ''}
                label="Erreichbarkeit"
                onChange={(e) => setContactForm({ ...contactForm, availability: e.target.value })}
              >
                <MenuItem value="">Keine Angabe</MenuItem>
                {REACHABILITY_OPTIONS.map(opt => (
                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Notizen */}
          <Typography variant="subtitle2" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
            Notizen
          </Typography>
          <TextField
            fullWidth
            size="small"
            label="Notizen"
            multiline
            rows={3}
            value={contactForm.notes || ''}
            onChange={(e) => setContactForm({ ...contactForm, notes: e.target.value })}
          />
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid rgba(0,0,0,0.1)', p: 2 }}>
          <Button onClick={() => {
            setContactDialogOpen(false);
            setContactForm({ 
              first_name: '', 
              last_name: '', 
              category: 'contact', 
              type: 'person',
              customer_number: '',
              address: '',
              postal_code: '',
              city: '',
              country: 'Deutschland',
              availability: '',
              salutation: '',
              lead_source: '',
              website: '',
              fax: '',
              birthday: '',
              is_invoice_recipient: false,
              additional_salutation: '',
            });
          }}>Abbrechen</Button>
          <Button onClick={handleContactCreate} variant="contained" disabled={!contactForm.first_name || !contactForm.last_name}>
            {contactForm.id ? 'Aktualisieren' : 'Erstellen'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}


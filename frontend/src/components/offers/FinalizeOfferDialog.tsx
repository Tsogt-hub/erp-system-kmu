import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  FormControlLabel,
  Checkbox,
  TextField,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DescriptionIcon from '@mui/icons-material/Description';
import EmailIcon from '@mui/icons-material/Email';
import SaveIcon from '@mui/icons-material/Save';
import WarningIcon from '@mui/icons-material/Warning';
import { Offer } from '../../services/api/offers';
import { format } from 'date-fns';

interface FinalizeOfferDialogProps {
  open: boolean;
  offer: Offer;
  onClose: () => void;
  onFinalize: () => Promise<void>;
}

export default function FinalizeOfferDialog({
  open,
  offer,
  onClose,
  onFinalize,
}: FinalizeOfferDialogProps) {
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [sendByEmail, setSendByEmail] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFinalize = async () => {
    try {
      setLoading(true);
      await onFinalize();
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  // Dateiname generieren
  const generateFileName = () => {
    const date = format(new Date(), 'dd-MM-yyyy');
    const customerName = offer.customer_name?.replace(/[^a-zA-Z0-9]/g, '') || 'Kunde';
    return `Angebot-ANG-XXXX-${customerName}-${date}`;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CheckCircleIcon color="success" />
        Dokument abschließen
      </DialogTitle>

      <DialogContent>
        <Alert severity="info" sx={{ mb: 3 }}>
          Beim Abschließen wird dem Angebot eine offizielle Angebotsnummer zugewiesen. 
          Danach kann das Dokument nicht mehr bearbeitet werden.
        </Alert>

        {/* Zusammenfassung */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Zusammenfassung
          </Typography>
          <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Kunde:</Typography>
              <Typography variant="body2" fontWeight="bold">
                {offer.customer_name || 'Nicht angegeben'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Projekt:</Typography>
              <Typography variant="body2">
                {offer.project_name || 'Nicht angegeben'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Gültig bis:</Typography>
              <Typography variant="body2">
                {offer.valid_until ? format(new Date(offer.valid_until), 'dd.MM.yyyy') : '-'}
              </Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body1" fontWeight="bold">Gesamtbetrag:</Typography>
              <Typography variant="body1" fontWeight="bold" color="primary">
                {formatCurrency(offer.amount * 1.19)}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Dokumentname */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Dokumentname
          </Typography>
          <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <DescriptionIcon color="action" />
            <Typography variant="body2">{generateFileName()}.pdf</Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            Die Angebotsnummer wird beim Abschließen automatisch vergeben.
          </Typography>
        </Box>

        {/* Optionen */}
        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Optionen
        </Typography>

        <FormControlLabel
          control={
            <Checkbox
              checked={saveAsTemplate}
              onChange={(e) => setSaveAsTemplate(e.target.checked)}
            />
          }
          label="Als Vorlage speichern"
        />
        
        {saveAsTemplate && (
          <TextField
            fullWidth
            size="small"
            label="Vorlagenname"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            sx={{ ml: 4, mb: 2, maxWidth: 'calc(100% - 32px)' }}
          />
        )}

        <FormControlLabel
          control={
            <Checkbox
              checked={sendByEmail}
              onChange={(e) => setSendByEmail(e.target.checked)}
            />
          }
          label="Per E-Mail versenden"
        />
        
        {sendByEmail && (
          <TextField
            fullWidth
            size="small"
            label="E-Mail-Adresse"
            type="email"
            value={emailAddress}
            onChange={(e) => setEmailAddress(e.target.value)}
            sx={{ ml: 4, mb: 2, maxWidth: 'calc(100% - 32px)' }}
          />
        )}

        {/* Checkliste */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Vor dem Abschließen prüfen
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircleIcon color="success" fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Kundendaten vollständig" />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircleIcon color="success" fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Alle Positionen korrekt" />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircleIcon color="success" fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Preise und Mengen geprüft" />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                {offer.intro_text ? (
                  <CheckCircleIcon color="success" fontSize="small" />
                ) : (
                  <WarningIcon color="warning" fontSize="small" />
                )}
              </ListItemIcon>
              <ListItemText 
                primary="Einleitungstext vorhanden" 
                secondary={!offer.intro_text ? 'Optional' : undefined}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                {offer.payment_terms ? (
                  <CheckCircleIcon color="success" fontSize="small" />
                ) : (
                  <WarningIcon color="warning" fontSize="small" />
                )}
              </ListItemIcon>
              <ListItemText 
                primary="Zahlungsbedingungen angegeben" 
                secondary={!offer.payment_terms ? 'Empfohlen' : undefined}
              />
            </ListItem>
          </List>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} disabled={loading}>
          Abbrechen
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<SaveIcon />}
          onClick={handleFinalize}
          disabled={loading}
        >
          Nur erstellen
        </Button>
        
        {sendByEmail && (
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={18} /> : <EmailIcon />}
            onClick={handleFinalize}
            disabled={loading || !emailAddress}
            color="primary"
          >
            Erstellen & versenden
          </Button>
        )}
        
        {!sendByEmail && (
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={18} /> : <CheckCircleIcon />}
            onClick={handleFinalize}
            disabled={loading}
            color="success"
          >
            Dokument abschließen
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

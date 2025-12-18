import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Tooltip,
  Alert,
  Grid,
  Card,
  CardContent,
  CardActions,
  Switch,
  FormControlLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DescriptionIcon from '@mui/icons-material/Description';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  offerTemplatesApi,
  OfferTemplate,
  CreateOfferTemplateData,
} from '../services/api/offerTemplates';

export default function OfferTemplates() {
  const [templates, setTemplates] = useState<OfferTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<OfferTemplate | null>(null);
  const [form, setForm] = useState<Partial<CreateOfferTemplateData>>({
    name: '',
    description: '',
    intro_text: '',
    footer_text: '',
    payment_terms: '',
    valid_days: 21,
    tax_rate: 19,
    is_active: true,
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await offerTemplatesApi.getAll(false);
      setTemplates(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenDialog = (template?: OfferTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setForm({
        name: template.name,
        description: template.description || '',
        intro_text: template.intro_text || '',
        footer_text: template.footer_text || '',
        payment_terms: template.payment_terms || '',
        valid_days: template.valid_days,
        tax_rate: template.tax_rate,
        is_active: template.is_active,
      });
    } else {
      setEditingTemplate(null);
      setForm({
        name: '',
        description: '',
        intro_text: '',
        footer_text: '',
        payment_terms: '',
        valid_days: 21,
        tax_rate: 19,
        is_active: true,
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingTemplate) {
        await offerTemplatesApi.update(editingTemplate.id, form);
      } else {
        await offerTemplatesApi.create(form as CreateOfferTemplateData);
      }
      setDialogOpen(false);
      loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Möchten Sie diese Vorlage wirklich löschen?')) {
      try {
        await offerTemplatesApi.delete(id);
        loadData();
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  const handleDuplicate = async (template: OfferTemplate) => {
    try {
      await offerTemplatesApi.create({
        name: `${template.name} (Kopie)`,
        description: template.description,
        intro_text: template.intro_text,
        footer_text: template.footer_text,
        payment_terms: template.payment_terms,
        valid_days: template.valid_days,
        tax_rate: template.tax_rate,
        is_active: true,
      });
      loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleToggleActive = async (template: OfferTemplate) => {
    try {
      await offerTemplatesApi.update(template.id, { is_active: !template.is_active });
      loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={600}>
          📋 Angebotsvorlagen
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadData}
            disabled={loading}
          >
            Aktualisieren
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Neue Vorlage
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Templates Grid */}
      {loading ? (
        <Typography>Lädt...</Typography>
      ) : templates.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <DescriptionIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Keine Vorlagen vorhanden
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Erstellen Sie Ihre erste Angebotsvorlage, um Zeit zu sparen.
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            Vorlage erstellen
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {templates.map((template) => (
            <Grid item xs={12} sm={6} md={4} key={template.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  opacity: template.is_active ? 1 : 0.6,
                }}
              >
                <CardContent sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" fontWeight={600}>
                      {template.name}
                    </Typography>
                    <Chip
                      label={template.is_active ? 'Aktiv' : 'Inaktiv'}
                      size="small"
                      color={template.is_active ? 'success' : 'default'}
                    />
                  </Box>
                  {template.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {template.description}
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={`${template.valid_days} Tage gültig`}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={`${template.tax_rate}% MwSt.`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                    Erstellt von: {template.created_user_name || 'Unbekannt'}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', borderTop: '1px solid', borderColor: 'divider' }}>
                  <Tooltip title="Duplizieren">
                    <IconButton size="small" onClick={() => handleDuplicate(template)}>
                      <ContentCopyIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Bearbeiten">
                    <IconButton size="small" onClick={() => handleOpenDialog(template)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Löschen">
                    <IconButton size="small" color="error" onClick={() => handleDelete(template.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Edit/Create Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingTemplate ? 'Vorlage bearbeiten' : 'Neue Vorlage erstellen'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Name *"
                value={form.name || ''}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.is_active !== false}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  />
                }
                label="Aktiv"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Beschreibung"
                value={form.description || ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Gültigkeit (Tage)"
                type="number"
                value={form.valid_days || 21}
                onChange={(e) => setForm({ ...form, valid_days: parseInt(e.target.value) || 21 })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="MwSt.-Satz (%)"
                type="number"
                value={form.tax_rate || 19}
                onChange={(e) => setForm({ ...form, tax_rate: parseFloat(e.target.value) || 19 })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Einleitungstext"
                value={form.intro_text || ''}
                onChange={(e) => setForm({ ...form, intro_text: e.target.value })}
                multiline
                rows={4}
                placeholder="Sehr geehrte(r) {{Kunde.Anrede}} {{Kunde.Nachname}},&#10;&#10;vielen Dank für Ihr Interesse an unseren Leistungen..."
                helperText="Verwenden Sie Platzhalter wie {{Kunde.Name}}, {{Projekt.Name}}, etc."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Zahlungsbedingungen"
                value={form.payment_terms || ''}
                onChange={(e) => setForm({ ...form, payment_terms: e.target.value })}
                multiline
                rows={3}
                placeholder="Zahlbar innerhalb von 14 Tagen ohne Abzug."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Fußtext"
                value={form.footer_text || ''}
                onChange={(e) => setForm({ ...form, footer_text: e.target.value })}
                multiline
                rows={4}
                placeholder="Mit freundlichen Grüßen,&#10;{{Benutzer.Name}}"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Abbrechen</Button>
          <Button onClick={handleSave} variant="contained" disabled={!form.name}>
            {editingTemplate ? 'Speichern' : 'Erstellen'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}






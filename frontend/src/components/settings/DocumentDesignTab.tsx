import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
  Tooltip,
  Card,
  CardContent,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadIcon from '@mui/icons-material/CloudUpload';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { HexColorPicker } from 'react-colorful';
import { pdfSettingsApi, PDFSettings, UpdatePDFSettingsData } from '../../services/api/pdfSettings';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

const DOCUMENT_TYPES = [
  { value: 'default', label: 'Standard (für alle)' },
  { value: 'offer', label: 'Angebot' },
  { value: 'invoice', label: 'Rechnung' },
  { value: 'order', label: 'Auftragsbestätigung' },
];

const FONT_FAMILIES = [
  { value: 'Helvetica', label: 'Helvetica (Standard)' },
  { value: 'Times-Roman', label: 'Times Roman' },
  { value: 'Courier', label: 'Courier' },
];

const FONT_SIZES = [8, 9, 10, 11, 12, 14];

export default function DocumentDesignTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [documentType, setDocumentType] = useState('default');
  const [settings, setSettings] = useState<PDFSettings | null>(null);
  const [tabValue, setTabValue] = useState(0);
  
  // Color picker states
  const [showPrimaryPicker, setShowPrimaryPicker] = useState(false);
  const [showSecondaryPicker, setShowSecondaryPicker] = useState(false);
  
  // Preview
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Einstellungen laden
  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await pdfSettingsApi.getByDocumentType(documentType);
      setSettings(data);
    } catch (err: any) {
      setError('Fehler beim Laden der Einstellungen');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [documentType]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Vorschau laden
  const loadPreview = useCallback(async () => {
    try {
      setPreviewLoading(true);
      const url = pdfSettingsApi.getPreviewUrl(documentType);
      // Token für Auth hinzufügen
      const token = localStorage.getItem('token');
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        setPreviewUrl(objectUrl);
      }
    } catch (err) {
      console.error('Vorschau konnte nicht geladen werden:', err);
    } finally {
      setPreviewLoading(false);
    }
  }, [documentType]);

  useEffect(() => {
    if (settings) {
      loadPreview();
    }
  }, [settings, loadPreview]);

  // Einstellungen speichern
  const handleSave = async () => {
    if (!settings) return;
    
    try {
      setSaving(true);
      setError(null);
      
      const updateData: UpdatePDFSettingsData = {
        primary_color: settings.primary_color,
        secondary_color: settings.secondary_color,
        logo_url: settings.logo_url,
        logo_position_x: settings.logo_position_x,
        logo_position_y: settings.logo_position_y,
        logo_width: settings.logo_width,
        font_family: settings.font_family,
        font_size: settings.font_size,
        margin_top: settings.margin_top,
        margin_right: settings.margin_right,
        margin_bottom: settings.margin_bottom,
        margin_left: settings.margin_left,
        show_sender_line: settings.show_sender_line,
        show_fold_marks: settings.show_fold_marks,
        footer_font_size: settings.footer_font_size,
        intro_text_template: settings.intro_text_template,
        footer_text_template: settings.footer_text_template,
        letterhead_first_page_only: settings.letterhead_first_page_only,
      };
      
      const updatedSettings = await pdfSettingsApi.update(documentType, updateData);
      setSettings(updatedSettings);
      setSuccess('Einstellungen gespeichert');
      setTimeout(() => setSuccess(null), 3000);
      
      // Vorschau aktualisieren
      loadPreview();
    } catch (err: any) {
      setError('Fehler beim Speichern');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Feld aktualisieren
  const updateField = (field: keyof PDFSettings, value: any) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  };

  // Logo hochladen
  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      setSaving(true);
      const result = await pdfSettingsApi.uploadLogo(file, documentType);
      updateField('logo_url', result.logoUrl);
      setSuccess('Logo hochgeladen');
      setTimeout(() => setSuccess(null), 3000);
      loadPreview();
    } catch (err: any) {
      setError('Fehler beim Hochladen des Logos');
    } finally {
      setSaving(false);
    }
  };

  // Briefpapier hochladen
  const handleLetterheadUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      setSaving(true);
      const result = await pdfSettingsApi.uploadLetterhead(file, documentType);
      updateField('letterhead_url', result.letterheadUrl);
      setSuccess('Briefpapier hochgeladen');
      setTimeout(() => setSuccess(null), 3000);
      loadPreview();
    } catch (err: any) {
      setError('Fehler beim Hochladen des Briefpapiers');
    } finally {
      setSaving(false);
    }
  };

  // Logo löschen
  const handleDeleteLogo = async () => {
    try {
      setSaving(true);
      await pdfSettingsApi.deleteLogo(documentType);
      updateField('logo_url', null);
      setSuccess('Logo gelöscht');
      setTimeout(() => setSuccess(null), 3000);
      loadPreview();
    } catch (err: any) {
      setError('Fehler beim Löschen des Logos');
    } finally {
      setSaving(false);
    }
  };

  // Briefpapier löschen
  const handleDeleteLetterhead = async () => {
    try {
      setSaving(true);
      await pdfSettingsApi.deleteLetterhead(documentType);
      updateField('letterhead_url', null);
      setSuccess('Briefpapier gelöscht');
      setTimeout(() => setSuccess(null), 3000);
      loadPreview();
    } catch (err: any) {
      setError('Fehler beim Löschen des Briefpapiers');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Linke Seite: Einstellungen */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3 }}>
            {/* Dokumententyp-Auswahl */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Dokumententyp</InputLabel>
                <Select
                  value={documentType}
                  label="Dokumententyp"
                  onChange={(e) => setDocumentType(e.target.value)}
                  size="small"
                >
                  {DOCUMENT_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Box>
                <Tooltip title="Vorschau aktualisieren">
                  <IconButton onClick={loadPreview} disabled={previewLoading}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Speichern...' : 'Speichern'}
                </Button>
              </Box>
            </Box>

            {/* Tabs für Kategorien */}
            <Tabs
              value={tabValue}
              onChange={(_, v) => setTabValue(v)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Branding" />
              <Tab label="Layout" />
              <Tab label="Texte" />
              <Tab label="Erweitert" />
            </Tabs>

            {/* Tab: Branding */}
            <TabPanel value={tabValue} index={0}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Firmenfarben
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Primärfarbe
                  </Typography>
                  <Box sx={{ position: 'relative' }}>
                    <Box
                      onClick={() => setShowPrimaryPicker(!showPrimaryPicker)}
                      sx={{
                        width: '100%',
                        height: 40,
                        backgroundColor: settings?.primary_color || '#1976D2',
                        borderRadius: 1,
                        cursor: 'pointer',
                        border: '2px solid #ddd',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography sx={{ color: '#fff', textShadow: '0 0 2px #000' }}>
                        {settings?.primary_color}
                      </Typography>
                    </Box>
                    {showPrimaryPicker && (
                      <Box sx={{ position: 'absolute', zIndex: 10, mt: 1 }}>
                        <Box
                          sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
                          onClick={() => setShowPrimaryPicker(false)}
                        />
                        <HexColorPicker
                          color={settings?.primary_color || '#1976D2'}
                          onChange={(color) => updateField('primary_color', color)}
                        />
                      </Box>
                    )}
                  </Box>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Akzentfarbe
                  </Typography>
                  <Box sx={{ position: 'relative' }}>
                    <Box
                      onClick={() => setShowSecondaryPicker(!showSecondaryPicker)}
                      sx={{
                        width: '100%',
                        height: 40,
                        backgroundColor: settings?.secondary_color || '#FF9800',
                        borderRadius: 1,
                        cursor: 'pointer',
                        border: '2px solid #ddd',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography sx={{ color: '#fff', textShadow: '0 0 2px #000' }}>
                        {settings?.secondary_color}
                      </Typography>
                    </Box>
                    {showSecondaryPicker && (
                      <Box sx={{ position: 'absolute', zIndex: 10, mt: 1 }}>
                        <Box
                          sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
                          onClick={() => setShowSecondaryPicker(false)}
                        />
                        <HexColorPicker
                          color={settings?.secondary_color || '#FF9800'}
                          onChange={(color) => updateField('secondary_color', color)}
                        />
                      </Box>
                    )}
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Logo
              </Typography>
              
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  {settings?.logo_url ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <ImageIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2">Logo hochgeladen</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {settings.logo_url}
                        </Typography>
                      </Box>
                      <IconButton color="error" onClick={handleDeleteLogo}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="logo-upload"
                        type="file"
                        onChange={handleLogoUpload}
                      />
                      <label htmlFor="logo-upload">
                        <Button
                          variant="outlined"
                          component="span"
                          startIcon={<UploadIcon />}
                        >
                          Logo hochladen
                        </Button>
                      </label>
                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        PNG, JPG, SVG (max. 5MB)
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>

              {settings?.logo_url && (
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <TextField
                      label="Position X"
                      type="number"
                      size="small"
                      fullWidth
                      value={settings?.logo_position_x || 0}
                      onChange={(e) => updateField('logo_position_x', Number(e.target.value))}
                      InputProps={{ endAdornment: 'pt' }}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      label="Position Y"
                      type="number"
                      size="small"
                      fullWidth
                      value={settings?.logo_position_y || 0}
                      onChange={(e) => updateField('logo_position_y', Number(e.target.value))}
                      InputProps={{ endAdornment: 'pt' }}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      label="Breite"
                      type="number"
                      size="small"
                      fullWidth
                      value={settings?.logo_width || 100}
                      onChange={(e) => updateField('logo_width', Number(e.target.value))}
                      InputProps={{ endAdornment: 'pt' }}
                    />
                  </Grid>
                </Grid>
              )}

              <Divider sx={{ my: 3 }} />

              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Briefpapier (PDF-Hintergrund)
              </Typography>
              
              <Card variant="outlined">
                <CardContent>
                  {settings?.letterhead_url ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <PictureAsPdfIcon sx={{ fontSize: 40, color: 'error.main' }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2">Briefpapier hochgeladen</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {settings.letterhead_url}
                        </Typography>
                      </Box>
                      <IconButton color="error" onClick={handleDeleteLetterhead}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                      <input
                        accept="application/pdf"
                        style={{ display: 'none' }}
                        id="letterhead-upload"
                        type="file"
                        onChange={handleLetterheadUpload}
                      />
                      <label htmlFor="letterhead-upload">
                        <Button
                          variant="outlined"
                          component="span"
                          startIcon={<UploadIcon />}
                        >
                          Briefpapier-PDF hochladen
                        </Button>
                      </label>
                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        PDF-Datei (max. 10MB)
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>

              {settings?.letterhead_url && (
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings?.letterhead_first_page_only || false}
                      onChange={(e) => updateField('letterhead_first_page_only', e.target.checked)}
                    />
                  }
                  label="Nur auf erster Seite anzeigen"
                  sx={{ mt: 2 }}
                />
              )}
            </TabPanel>

            {/* Tab: Layout */}
            <TabPanel value={tabValue} index={1}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Schrift
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Schriftart</InputLabel>
                    <Select
                      value={settings?.font_family || 'Helvetica'}
                      label="Schriftart"
                      onChange={(e) => updateField('font_family', e.target.value)}
                    >
                      {FONT_FAMILIES.map((font) => (
                        <MenuItem key={font.value} value={font.value}>
                          {font.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Schriftgröße</InputLabel>
                    <Select
                      value={settings?.font_size || 10}
                      label="Schriftgröße"
                      onChange={(e) => updateField('font_size', Number(e.target.value))}
                    >
                      {FONT_SIZES.map((size) => (
                        <MenuItem key={size} value={size}>
                          {size} pt
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Seitenränder (in Punkten)
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={3}>
                  <TextField
                    label="Oben"
                    type="number"
                    size="small"
                    fullWidth
                    value={settings?.margin_top || 40}
                    onChange={(e) => updateField('margin_top', Number(e.target.value))}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    label="Rechts"
                    type="number"
                    size="small"
                    fullWidth
                    value={settings?.margin_right || 50}
                    onChange={(e) => updateField('margin_right', Number(e.target.value))}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    label="Unten"
                    type="number"
                    size="small"
                    fullWidth
                    value={settings?.margin_bottom || 40}
                    onChange={(e) => updateField('margin_bottom', Number(e.target.value))}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    label="Links"
                    type="number"
                    size="small"
                    fullWidth
                    value={settings?.margin_left || 50}
                    onChange={(e) => updateField('margin_left', Number(e.target.value))}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Fußzeile
              </Typography>
              
              <TextField
                label="Schriftgröße Fußzeile"
                type="number"
                size="small"
                value={settings?.footer_font_size || 7}
                onChange={(e) => updateField('footer_font_size', Number(e.target.value))}
                InputProps={{ endAdornment: 'pt' }}
                sx={{ width: 150 }}
              />
            </TabPanel>

            {/* Tab: Texte */}
            <TabPanel value={tabValue} index={2}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Einleitungstext
              </Typography>
              <TextField
                multiline
                rows={3}
                fullWidth
                placeholder="Vielen Dank für Ihr Interesse. Gerne unterbreiten wir Ihnen folgendes Angebot:"
                value={settings?.intro_text_template || ''}
                onChange={(e) => updateField('intro_text_template', e.target.value)}
                sx={{ mb: 3 }}
              />

              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Zahlungsbedingungen / Fußtext
              </Typography>
              <TextField
                multiline
                rows={3}
                fullWidth
                placeholder="Zahlbar innerhalb von 14 Tagen nach Rechnungserhalt ohne Abzug."
                value={settings?.footer_text_template || ''}
                onChange={(e) => updateField('footer_text_template', e.target.value)}
              />
            </TabPanel>

            {/* Tab: Erweitert */}
            <TabPanel value={tabValue} index={3}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Optionen
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings?.show_sender_line || false}
                    onChange={(e) => updateField('show_sender_line', e.target.checked)}
                  />
                }
                label="Absenderzeile anzeigen"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings?.show_fold_marks || false}
                    onChange={(e) => updateField('show_fold_marks', e.target.checked)}
                  />
                }
                label="Falzmarken anzeigen"
              />
            </TabPanel>
          </Paper>
        </Grid>

        {/* Rechte Seite: Vorschau */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2, height: '100%', minHeight: 600 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Vorschau
            </Typography>
            
            {previewLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 500 }}>
                <CircularProgress />
              </Box>
            ) : previewUrl ? (
              <Box
                component="iframe"
                src={previewUrl}
                sx={{
                  width: '100%',
                  height: 550,
                  border: '1px solid #ddd',
                  borderRadius: 1,
                }}
              />
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 500,
                  backgroundColor: '#f5f5f5',
                  borderRadius: 1,
                }}
              >
                <Typography color="text.secondary">
                  Keine Vorschau verfügbar
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}



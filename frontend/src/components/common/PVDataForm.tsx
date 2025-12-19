import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Alert,
  InputAdornment,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SaveIcon from '@mui/icons-material/Save';
import SolarPowerIcon from '@mui/icons-material/SolarPower';
import HomeIcon from '@mui/icons-material/Home';
import RoofingIcon from '@mui/icons-material/Roofing';
import BoltIcon from '@mui/icons-material/Bolt';
import EvStationIcon from '@mui/icons-material/EvStation';
import {
  pvProjectDataApi,
  PVProjectData,
  CreatePVProjectDataInput,
  BUILDING_AGE_CLASSES,
  BUILDING_TYPES,
  OWNERSHIP_TYPES,
  ROOF_TYPES,
  ROOF_MATERIALS,
  ROOF_ORIENTATIONS,
  ROOF_ANGLES,
  WALLBOX_INTEREST,
  STORAGE_INTEREST,
  INSTALLATION_LOCATIONS,
} from '../../services/api/pvProjectData';

interface PVDataFormProps {
  projectId: number;
  readOnly?: boolean;
}

export default function PVDataForm({ projectId, readOnly = false }: PVDataFormProps) {
  const [data, setData] = useState<Partial<PVProjectData>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await pvProjectDataApi.getByProjectId(projectId);
      if (result) {
        setData(result);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      await pvProjectDataApi.upsert(projectId, data as CreatePVProjectDataInput);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof PVProjectData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return <Typography>Lädt...</Typography>;
  }

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>Daten gespeichert!</Alert>}

      {/* Zeitplan */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SolarPowerIcon color="primary" />
            <Typography variant="subtitle1" fontWeight={600}>Zeitplan</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Geplanter Starttermin"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={data.planned_start || ''}
                onChange={(e) => updateField('planned_start', e.target.value)}
                disabled={readOnly}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Anmerkungen zum Termin"
                multiline
                rows={2}
                value={data.start_notes || ''}
                onChange={(e) => updateField('start_notes', e.target.value)}
                disabled={readOnly}
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Gebäude */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HomeIcon color="primary" />
            <Typography variant="subtitle1" fontWeight={600}>Gebäude</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Baujahr</InputLabel>
                <Select
                  value={data.building_age_class || ''}
                  label="Baujahr"
                  onChange={(e) => updateField('building_age_class', e.target.value)}
                  disabled={readOnly}
                >
                  {BUILDING_AGE_CLASSES.map((opt) => (
                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Gebäudetyp</InputLabel>
                <Select
                  value={data.building_type || ''}
                  label="Gebäudetyp"
                  onChange={(e) => updateField('building_type', e.target.value)}
                  disabled={readOnly}
                >
                  {BUILDING_TYPES.map((opt) => (
                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Anzahl Bewohner"
                type="number"
                value={data.residents_count || ''}
                onChange={(e) => updateField('residents_count', parseInt(e.target.value) || 0)}
                disabled={readOnly}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Eigentumsverhältnis</InputLabel>
                <Select
                  value={data.ownership || ''}
                  label="Eigentumsverhältnis"
                  onChange={(e) => updateField('ownership', e.target.value)}
                  disabled={readOnly}
                >
                  {OWNERSHIP_TYPES.map((opt) => (
                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Energetischer Zustand */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BoltIcon color="primary" />
            <Typography variant="subtitle1" fontWeight={600}>Energetischer Zustand</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Jahresverbrauch"
                type="number"
                value={data.annual_consumption_kwh || ''}
                onChange={(e) => updateField('annual_consumption_kwh', parseFloat(e.target.value) || 0)}
                disabled={readOnly}
                InputProps={{
                  endAdornment: <InputAdornment position="end">kWh</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Jährliche Stromkosten"
                type="number"
                value={data.annual_costs_eur || ''}
                onChange={(e) => updateField('annual_costs_eur', parseFloat(e.target.value) || 0)}
                disabled={readOnly}
                InputProps={{
                  endAdornment: <InputAdornment position="end">€</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Stromanbieter"
                value={data.electricity_provider || ''}
                onChange={(e) => updateField('electricity_provider', e.target.value)}
                disabled={readOnly}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Aktueller Tarif"
                value={data.current_tariff || ''}
                onChange={(e) => updateField('current_tariff', e.target.value)}
                disabled={readOnly}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Durchgeführte Sanierungen"
                multiline
                rows={2}
                value={data.completed_renovations || ''}
                onChange={(e) => updateField('completed_renovations', e.target.value)}
                disabled={readOnly}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Geplante Sanierungen"
                multiline
                rows={2}
                value={data.planned_renovations || ''}
                onChange={(e) => updateField('planned_renovations', e.target.value)}
                disabled={readOnly}
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Dach */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <RoofingIcon color="primary" />
            <Typography variant="subtitle1" fontWeight={600}>Dach</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Dachtyp</InputLabel>
                <Select
                  value={data.roof_type || ''}
                  label="Dachtyp"
                  onChange={(e) => updateField('roof_type', e.target.value)}
                  disabled={readOnly}
                >
                  {ROOF_TYPES.map((opt) => (
                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Dachmaterial</InputLabel>
                <Select
                  value={data.roof_material || ''}
                  label="Dachmaterial"
                  onChange={(e) => updateField('roof_material', e.target.value)}
                  disabled={readOnly}
                >
                  {ROOF_MATERIALS.map((opt) => (
                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Dachausrichtung</InputLabel>
                <Select
                  value={data.roof_orientation || ''}
                  label="Dachausrichtung"
                  onChange={(e) => updateField('roof_orientation', e.target.value)}
                  disabled={readOnly}
                >
                  {ROOF_ORIENTATIONS.map((opt) => (
                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Dachneigung</InputLabel>
                <Select
                  value={data.roof_angle || ''}
                  label="Dachneigung"
                  onChange={(e) => updateField('roof_angle', e.target.value)}
                  disabled={readOnly}
                >
                  {ROOF_ANGLES.map((opt) => (
                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Dachalter"
                type="number"
                value={data.roof_age || ''}
                onChange={(e) => updateField('roof_age', parseInt(e.target.value) || 0)}
                disabled={readOnly}
                InputProps={{
                  endAdornment: <InputAdornment position="end">Jahre</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Dachfläche"
                type="number"
                value={data.roof_area_m2 || ''}
                onChange={(e) => updateField('roof_area_m2', parseFloat(e.target.value) || 0)}
                disabled={readOnly}
                InputProps={{
                  endAdornment: <InputAdornment position="end">m²</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Dachzustand"
                value={data.roof_condition || ''}
                onChange={(e) => updateField('roof_condition', e.target.value)}
                disabled={readOnly}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Anmerkungen zum Dach"
                multiline
                rows={2}
                value={data.roof_notes || ''}
                onChange={(e) => updateField('roof_notes', e.target.value)}
                disabled={readOnly}
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Gewünschte PV-Anlage */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EvStationIcon color="primary" />
            <Typography variant="subtitle1" fontWeight={600}>Gewünschte PV-Anlage</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={data.existing_pv || false}
                    onChange={(e) => updateField('existing_pv', e.target.checked)}
                    disabled={readOnly}
                  />
                }
                label="Bestehende PV-Anlage vorhanden"
              />
            </Grid>
            {data.existing_pv && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Bestehende Leistung"
                  type="number"
                  value={data.existing_pv_kwp || ''}
                  onChange={(e) => updateField('existing_pv_kwp', parseFloat(e.target.value) || 0)}
                  disabled={readOnly}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">kWp</InputAdornment>,
                  }}
                />
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Gewünschte Leistung"
                type="number"
                value={data.desired_kwp || ''}
                onChange={(e) => updateField('desired_kwp', parseFloat(e.target.value) || 0)}
                disabled={readOnly}
                InputProps={{
                  endAdornment: <InputAdornment position="end">kWp</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Verfügbare Fläche"
                type="number"
                value={data.available_area_m2 || ''}
                onChange={(e) => updateField('available_area_m2', parseFloat(e.target.value) || 0)}
                disabled={readOnly}
                InputProps={{
                  endAdornment: <InputAdornment position="end">m²</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Installationsort</InputLabel>
                <Select
                  value={data.installation_location || ''}
                  label="Installationsort"
                  onChange={(e) => updateField('installation_location', e.target.value)}
                  disabled={readOnly}
                >
                  {INSTALLATION_LOCATIONS.map((opt) => (
                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Interesse an Wallbox</InputLabel>
                <Select
                  value={data.interest_wallbox || ''}
                  label="Interesse an Wallbox"
                  onChange={(e) => updateField('interest_wallbox', e.target.value)}
                  disabled={readOnly}
                >
                  {WALLBOX_INTEREST.map((opt) => (
                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Interesse an Speicher</InputLabel>
                <Select
                  value={data.interest_storage || ''}
                  label="Interesse an Speicher"
                  onChange={(e) => updateField('interest_storage', e.target.value)}
                  disabled={readOnly}
                >
                  {STORAGE_INTEREST.map((opt) => (
                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {(data.interest_storage === 'Ja, sofort' || data.interest_storage === 'Ja, später') && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Gewünschte Speicherkapazität"
                  type="number"
                  value={data.desired_storage_kwh || ''}
                  onChange={(e) => updateField('desired_storage_kwh', parseFloat(e.target.value) || 0)}
                  disabled={readOnly}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">kWh</InputAdornment>,
                  }}
                />
              </Grid>
            )}
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Elektrische Installation */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BoltIcon color="primary" />
            <Typography variant="subtitle1" fontWeight={600}>Elektrische Installation</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Zählertyp"
                value={data.meter_type || ''}
                onChange={(e) => updateField('meter_type', e.target.value)}
                disabled={readOnly}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Zählerstandort"
                value={data.meter_location || ''}
                onChange={(e) => updateField('meter_location', e.target.value)}
                disabled={readOnly}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Netzanschlussleistung"
                type="number"
                value={data.grid_connection_power || ''}
                onChange={(e) => updateField('grid_connection_power', parseFloat(e.target.value) || 0)}
                disabled={readOnly}
                InputProps={{
                  endAdornment: <InputAdornment position="end">kW</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={data.three_phase_available !== false}
                    onChange={(e) => updateField('three_phase_available', e.target.checked)}
                    disabled={readOnly}
                  />
                }
                label="Drehstromanschluss vorhanden"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Sonstiges */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" fontWeight={600}>Sonstiges</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Verschattungsprobleme"
                multiline
                rows={2}
                value={data.shading_issues || ''}
                onChange={(e) => updateField('shading_issues', e.target.value)}
                disabled={readOnly}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Besondere Anforderungen"
                multiline
                rows={2}
                value={data.special_requirements || ''}
                onChange={(e) => updateField('special_requirements', e.target.value)}
                disabled={readOnly}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Allgemeine Notizen"
                multiline
                rows={3}
                value={data.notes || ''}
                onChange={(e) => updateField('notes', e.target.value)}
                disabled={readOnly}
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Save Button */}
      {!readOnly && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Speichern...' : 'Speichern'}
          </Button>
        </Box>
      )}
    </Box>
  );
}








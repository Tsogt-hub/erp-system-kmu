import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import InsightsIcon from '@mui/icons-material/Insights';
import TimelineIcon from '@mui/icons-material/Timeline';
import AddIcon from '@mui/icons-material/Add';
import { metadataApi, DataAsset, DataQualityRule } from '../services/api/metadata';

const sensitivityColors: Record<string, string> = {
  public: '#34C759',
  internal: '#0A84FF',
  confidential: '#FF3B30',
};

interface CreateAssetFormState {
  name: string;
  domain: string;
  owner: string;
  sensitivity: 'public' | 'internal' | 'confidential';
  description?: string;
}

export default function DataQuality() {
  const [assets, setAssets] = useState<DataAsset[]>([]);
  const [rules, setRules] = useState<DataQualityRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formState, setFormState] = useState<CreateAssetFormState>({
    name: '',
    domain: '',
    owner: '',
    sensitivity: 'internal',
  });

  const rulesByAsset = useMemo(() => {
    return rules.reduce<Record<number, DataQualityRule[]>>((acc, rule) => {
      if (!acc[rule.asset_id]) {
        acc[rule.asset_id] = [];
      }
      acc[rule.asset_id].push(rule);
      return acc;
    }, {});
  }, [rules]);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [assetData, ruleData] = await Promise.all([
          metadataApi.listAssets(),
          metadataApi.listQualityRules(),
        ]);
        setAssets(assetData);
        setRules(ruleData);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleCreateAsset = async () => {
    try {
      const created = await metadataApi.createAsset({
        ...formState,
        tags: [],
      });
      setAssets((prev) => [...prev, created]);
      setDialogOpen(false);
      setFormState({
        name: '',
        domain: '',
        owner: '',
        sensitivity: 'internal',
      });
    } catch (error) {
      console.error('Fehler beim Anlegen des Data Assets', error);
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Datenfundament & Qualität
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Überwache Domänen, Verantwortlichkeiten und Qualitätsregeln deiner ERP-Datenbasis.
          </Typography>
        </Box>
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          sx={{
            background: 'linear-gradient(135deg, #0A84FF 0%, #64D2FF 100%)',
            boxShadow: '0 12px 24px rgba(10, 132, 255, 0.3)',
            borderRadius: 2,
          }}
          onClick={() => setDialogOpen(true)}
        >
          Data Asset anlegen
        </Button>
      </Stack>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Stack spacing={2}>
            {loading && (
              <Typography variant="body2" color="text.secondary">
                Lade Datenfundament...
              </Typography>
            )}
            {!loading && assets.length === 0 && (
              <Card variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent sx={{ textAlign: 'center', py: 6 }}>
                  <ShieldIcon sx={{ fontSize: 48, color: '#AEAEB2', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Noch keine Data Assets registriert
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Lege deine ersten Daten-Domänen an, um Verantwortlichkeiten und Aufbewahrung zu steuern.
                  </Typography>
                </CardContent>
              </Card>
            )}
            {assets.map((asset) => (
              <Card
                key={asset.id}
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  borderColor: 'rgba(10, 132, 255, 0.12)',
                  backdropFilter: 'blur(18px)',
                  background: 'rgba(255, 255, 255, 0.85)',
                }}
              >
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="h6" fontWeight={600}>
                      {asset.name}
                    </Typography>
                    <Chip
                      label={asset.sensitivity}
                      sx={{
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        backgroundColor: sensitivityColors[asset.sensitivity] ?? '#636366',
                        color: '#fff',
                      }}
                    />
                  </Stack>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    Domäne: {asset.domain} • Owner: {asset.owner}
                  </Typography>
                  {asset.description && (
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      {asset.description}
                    </Typography>
                  )}
                  <Divider sx={{ my: 2 }} />
                  <Stack spacing={1.2}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1C1C1E' }}>
                      Qualitätsregeln
                    </Typography>
                    {(rulesByAsset[asset.id] ?? []).length === 0 && (
                      <Typography variant="body2" color="text.secondary">
                        Noch keine Regeln definiert.
                      </Typography>
                    )}
                    {(rulesByAsset[asset.id] ?? []).map((rule) => (
                      <Stack
                        key={rule.id}
                        direction="row"
                        alignItems="center"
                        spacing={1.5}
                        sx={{
                          background: 'rgba(10, 132, 255, 0.04)',
                          borderRadius: 2,
                          px: 1.5,
                          py: 1,
                        }}
                      >
                        <InsightsIcon sx={{ fontSize: 18, color: '#0A84FF' }} />
                        <Box>
                          <Typography variant="subtitle2">{rule.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {rule.dimension} • Schwelle {rule.threshold} • {rule.severity}
                          </Typography>
                        </Box>
                      </Stack>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Grid>

        <Grid item xs={12} md={4}>
          <Stack spacing={2}>
            <Card
              variant="outlined"
              sx={{
                borderRadius: 3,
                borderColor: 'rgba(88, 86, 214, 0.18)',
                background: 'linear-gradient(160deg, rgba(88, 86, 214, 0.18), rgba(0, 0, 0, 0))',
              }}
            >
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1.5} mb={1.5}>
                  <TimelineIcon sx={{ color: '#5856D6' }} />
                  <Typography variant="subtitle1" fontWeight={600}>
                    Pipeline Status
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  Synchronisierte Datenquellen: {assets.length > 0 ? 'ERP Core' : '–'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Qualitätsregeln aktiv: {rules.length}
                </Typography>
              </CardContent>
            </Card>
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Governance Quicklinks
                </Typography>
                <Stack spacing={1}>
                  <Button variant="text" sx={{ justifyContent: 'flex-start' }}>
                    Retention Policies
                  </Button>
                  <Button variant="text" sx={{ justifyContent: 'flex-start' }}>
                    Audit Logs
                  </Button>
                  <Button variant="text" sx={{ justifyContent: 'flex-start' }}>
                    Rollen & Berechtigungen
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Neues Data Asset</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Name"
              value={formState.name}
              onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
            <TextField
              label="Domäne"
              value={formState.domain}
              onChange={(event) => setFormState((prev) => ({ ...prev, domain: event.target.value }))}
              required
            />
            <TextField
              label="Owner"
              value={formState.owner}
              onChange={(event) => setFormState((prev) => ({ ...prev, owner: event.target.value }))}
              required
            />
            <TextField
              label="Klassifizierung"
              select
              value={formState.sensitivity}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  sensitivity: event.target.value as CreateAssetFormState['sensitivity'],
                }))
              }
            >
              <MenuItem value="public">Public</MenuItem>
              <MenuItem value="internal">Internal</MenuItem>
              <MenuItem value="confidential">Confidential</MenuItem>
            </TextField>
            <TextField
              label="Beschreibung"
              value={formState.description ?? ''}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
              multiline
              minRows={3}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Abbrechen</Button>
          <Button variant="contained" onClick={handleCreateAsset} disabled={!formState.name || !formState.domain || !formState.owner}>
            Speichern
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}



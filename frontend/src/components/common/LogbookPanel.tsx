import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  TextField,
  Button,
  IconButton,
  Divider,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Collapse,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import RefreshIcon from '@mui/icons-material/Refresh';
import { format, formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import {
  logEntriesApi,
  LogEntry,
  LOG_ACTIONS,
  LOG_ACTION_LABELS,
  LOG_ACTION_ICONS,
  LOG_ACTION_COLORS,
} from '../../services/api/logEntries';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

interface LogbookPanelProps {
  entityType: 'contact' | 'company' | 'project' | 'offer' | 'invoice' | 'task';
  entityId: number;
  title?: string;
  maxHeight?: number;
  showAddForm?: boolean;
}

export default function LogbookPanel({
  entityType,
  entityId,
  title = 'Logbuch',
  maxHeight = 400,
  showAddForm = true,
}: LogbookPanelProps) {
  const user = useSelector((state: RootState) => state.auth.user);
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [actionFilter, setActionFilter] = useState<string>('');

  // Form state
  const [newEntry, setNewEntry] = useState({
    action: LOG_ACTIONS.NOTE_ADDED,
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadEntries();
  }, [entityType, entityId, actionFilter]);

  const loadEntries = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await logEntriesApi.getByEntity(entityType, entityId, {
        limit: 50,
        action: actionFilter || undefined,
      });
      setEntries(data);
    } catch (err: any) {
      console.error('Error loading log entries:', err);
      setError('Fehler beim Laden des Logbuchs');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = async () => {
    if (!newEntry.description.trim() || !user) return;

    try {
      setSubmitting(true);
      await logEntriesApi.create({
        entity_type: entityType,
        entity_id: entityId,
        action: newEntry.action,
        description: newEntry.description,
        user_id: user.id,
      });
      setNewEntry({ action: LOG_ACTIONS.NOTE_ADDED, description: '' });
      setShowForm(false);
      loadEntries();
    } catch (err: any) {
      console.error('Error adding log entry:', err);
      setError('Fehler beim Hinzufügen des Eintrags');
    } finally {
      setSubmitting(false);
    }
  };

  const getActionIcon = (action: string) => {
    return LOG_ACTION_ICONS[action] || '📌';
  };

  const getActionColor = (action: string) => {
    return LOG_ACTION_COLORS[action] || '#757575';
  };

  const getActionLabel = (action: string) => {
    return LOG_ACTION_LABELS[action] || action;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffHours < 24) {
      return formatDistanceToNow(date, { addSuffix: true, locale: de });
    }
    return format(date, 'dd.MM.yyyy HH:mm', { locale: de });
  };

  return (
    <Paper sx={{ p: 2 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6">{title}</Typography>
          <Chip label={entries.length} size="small" color="primary" />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton size="small" onClick={loadEntries} title="Aktualisieren">
            <RefreshIcon />
          </IconButton>
          <IconButton size="small" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      </Box>

      <Collapse in={expanded}>
        {/* Filter */}
        <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Filter</InputLabel>
            <Select
              value={actionFilter}
              label="Filter"
              onChange={(e) => setActionFilter(e.target.value)}
            >
              <MenuItem value="">Alle Einträge</MenuItem>
              {Object.entries(LOG_ACTION_LABELS).map(([key, label]) => (
                <MenuItem key={key} value={key}>
                  {LOG_ACTION_ICONS[key]} {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {showAddForm && (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setShowForm(!showForm)}
              size="small"
            >
              Eintrag
            </Button>
          )}
        </Box>

        {/* Add Form */}
        {showForm && (
          <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
            <Typography variant="subtitle2" gutterBottom>
              Neuer Eintrag
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Typ</InputLabel>
                <Select
                  value={newEntry.action}
                  label="Typ"
                  onChange={(e) =>
                    setNewEntry({ ...newEntry, action: e.target.value })
                  }
                >
                  <MenuItem value={LOG_ACTIONS.NOTE_ADDED}>
                    {LOG_ACTION_ICONS.note_added} Notiz
                  </MenuItem>
                  <MenuItem value={LOG_ACTIONS.CALL_LOGGED}>
                    {LOG_ACTION_ICONS.call_logged} Anruf
                  </MenuItem>
                  <MenuItem value={LOG_ACTIONS.EMAIL_SENT}>
                    {LOG_ACTION_ICONS.email_sent} E-Mail
                  </MenuItem>
                  <MenuItem value={LOG_ACTIONS.MEETING_SCHEDULED}>
                    {LOG_ACTION_ICONS.meeting_scheduled} Termin
                  </MenuItem>
                  <MenuItem value={LOG_ACTIONS.REMINDER_SET}>
                    {LOG_ACTION_ICONS.reminder_set} Erinnerung
                  </MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                multiline
                rows={3}
                size="small"
                label="Beschreibung"
                value={newEntry.description}
                onChange={(e) =>
                  setNewEntry({ ...newEntry, description: e.target.value })
                }
                placeholder="Was ist passiert?"
              />

              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button
                  size="small"
                  onClick={() => {
                    setShowForm(false);
                    setNewEntry({ action: LOG_ACTIONS.NOTE_ADDED, description: '' });
                  }}
                >
                  Abbrechen
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleAddEntry}
                  disabled={!newEntry.description.trim() || submitting}
                >
                  {submitting ? <CircularProgress size={20} /> : 'Hinzufügen'}
                </Button>
              </Box>
            </Box>
          </Paper>
        )}

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Entries List */}
        <Box sx={{ maxHeight, overflowY: 'auto' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : entries.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 3, color: 'text.secondary' }}>
              <Typography>Keine Einträge vorhanden</Typography>
            </Box>
          ) : (
            <List disablePadding>
              {entries.map((entry, index) => (
                <Box key={entry.id}>
                  <ListItem
                    alignItems="flex-start"
                    sx={{
                      px: 0,
                      '&:hover': { bgcolor: 'grey.50' },
                      borderRadius: 1,
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor: getActionColor(entry.action),
                          width: 36,
                          height: 36,
                          fontSize: '1rem',
                        }}
                      >
                        {getActionIcon(entry.action)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            flexWrap: 'wrap',
                          }}
                        >
                          <Chip
                            label={getActionLabel(entry.action)}
                            size="small"
                            sx={{
                              bgcolor: getActionColor(entry.action),
                              color: 'white',
                              height: 20,
                              fontSize: '0.7rem',
                            }}
                          />
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontSize: '0.75rem' }}
                          >
                            {entry.user_name || 'System'} • {formatDate(entry.created_at)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Typography
                          variant="body2"
                          sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}
                        >
                          {entry.description}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < entries.length - 1 && <Divider component="li" />}
                </Box>
              ))}
            </List>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
}


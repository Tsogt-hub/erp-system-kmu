import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Paper,
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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  Tooltip,
  Badge,
  Collapse,
  FormControlLabel,
  Switch,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import NotificationsIcon from '@mui/icons-material/Notifications';
import {
  remindersApi,
  Reminder,
  CreateReminderData,
  REMINDER_TYPES,
  REMINDER_PRIORITIES,
  REMINDER_TYPE_ICONS,
  isReminderOverdue,
  formatReminderDueDate,
} from '../../services/api/reminders';

interface ReminderPanelProps {
  entityType: 'project' | 'contact' | 'offer' | 'company';
  entityId: number;
  title?: string;
}

export default function ReminderPanel({ entityType, entityId, title = 'Wiedervorlagen' }: ReminderPanelProps) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [expanded, setExpanded] = useState(true);
  const [form, setForm] = useState<Partial<CreateReminderData>>({
    title: '',
    description: '',
    reminder_type: 'Wiedervorlage',
    priority: 'normal',
    due_date: new Date().toISOString().split('T')[0],
    due_time: '',
    notify_email: true,
    notify_push: true,
  });

  const loadReminders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await remindersApi.getByEntity(entityType, entityId, showCompleted);
      setReminders(data);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Laden der Wiedervorlagen');
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId, showCompleted]);

  useEffect(() => {
    loadReminders();
  }, [loadReminders]);

  const handleOpenDialog = (reminder?: Reminder) => {
    if (reminder) {
      setEditingReminder(reminder);
      setForm({
        title: reminder.title,
        description: reminder.description || '',
        reminder_type: reminder.reminder_type,
        priority: reminder.priority,
        due_date: reminder.due_date,
        due_time: reminder.due_time || '',
        notify_email: reminder.notify_email,
        notify_push: reminder.notify_push,
      });
    } else {
      setEditingReminder(null);
      setForm({
        title: '',
        description: '',
        reminder_type: 'Wiedervorlage',
        priority: 'normal',
        due_date: new Date().toISOString().split('T')[0],
        due_time: '',
        notify_email: true,
        notify_push: true,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingReminder(null);
  };

  const handleSave = async () => {
    try {
      if (editingReminder) {
        await remindersApi.update(editingReminder.id, form);
      } else {
        await remindersApi.create({
          ...form,
          entity_type: entityType,
          entity_id: entityId,
        } as CreateReminderData);
      }
      handleCloseDialog();
      loadReminders();
    } catch (err: any) {
      setError(err.message || 'Fehler beim Speichern');
    }
  };

  const handleToggleComplete = async (reminder: Reminder) => {
    try {
      if (reminder.is_completed) {
        await remindersApi.uncomplete(reminder.id);
      } else {
        await remindersApi.complete(reminder.id);
      }
      loadReminders();
    } catch (err: any) {
      setError(err.message || 'Fehler beim Aktualisieren');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Möchten Sie diese Wiedervorlage wirklich löschen?')) {
      try {
        await remindersApi.delete(id);
        loadReminders();
      } catch (err: any) {
        setError(err.message || 'Fehler beim Löschen');
      }
    }
  };

  const getPriorityColor = (priority: string) => {
    const p = REMINDER_PRIORITIES.find(rp => rp.value === priority);
    return p?.color || '#9E9E9E';
  };

  const activeReminders = reminders.filter(r => !r.is_completed);
  const completedReminders = reminders.filter(r => r.is_completed);
  const overdueCount = activeReminders.filter(r => isReminderOverdue(r)).length;

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton size="small" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
          <Badge badgeContent={overdueCount} color="error" max={99}>
            <NotificationsIcon color="primary" />
          </Badge>
          <Typography variant="h6">{title}</Typography>
          <Chip
            label={`${activeReminders.length} offen`}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={showCompleted}
                onChange={(e) => setShowCompleted(e.target.checked)}
              />
            }
            label="Erledigte"
            sx={{ mr: 1 }}
          />
          <IconButton size="small" onClick={loadReminders} disabled={loading}>
            <RefreshIcon />
          </IconButton>
          <Button
            size="small"
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Neu
          </Button>
        </Box>
      </Box>

      <Collapse in={expanded}>
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {loading ? (
          <Typography color="text.secondary">Lädt...</Typography>
        ) : reminders.length === 0 ? (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
            Keine Wiedervorlagen vorhanden
          </Typography>
        ) : (
          <List dense>
            {/* Active Reminders */}
            {activeReminders.map((reminder) => {
              const overdue = isReminderOverdue(reminder);
              return (
                <ListItem
                  key={reminder.id}
                  sx={{
                    borderRadius: 1,
                    mb: 1,
                    bgcolor: overdue ? 'error.light' : 'background.paper',
                    border: '1px solid',
                    borderColor: overdue ? 'error.main' : 'divider',
                    '&:hover': { bgcolor: overdue ? 'error.light' : 'action.hover' },
                  }}
                >
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={reminder.is_completed}
                      onChange={() => handleToggleComplete(reminder)}
                    />
                  </ListItemIcon>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Typography variant="h6">
                      {REMINDER_TYPE_ICONS[reminder.reminder_type] || '📝'}
                    </Typography>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: overdue ? 600 : 400,
                            color: overdue ? 'error.dark' : 'text.primary',
                          }}
                        >
                          {reminder.title}
                        </Typography>
                        <Chip
                          label={reminder.priority}
                          size="small"
                          sx={{
                            bgcolor: getPriorityColor(reminder.priority),
                            color: 'white',
                            fontSize: '0.7rem',
                            height: 20,
                          }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="caption" color={overdue ? 'error.dark' : 'text.secondary'}>
                          {formatReminderDueDate(reminder)}
                          {overdue && ' - ÜBERFÄLLIG'}
                        </Typography>
                        {reminder.description && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {reminder.description}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title="Bearbeiten">
                      <IconButton size="small" onClick={() => handleOpenDialog(reminder)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Löschen">
                      <IconButton size="small" color="error" onClick={() => handleDelete(reminder.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })}

            {/* Completed Reminders */}
            {showCompleted && completedReminders.length > 0 && (
              <>
                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, color: 'text.secondary' }}>
                  Erledigt ({completedReminders.length})
                </Typography>
                {completedReminders.map((reminder) => (
                  <ListItem
                    key={reminder.id}
                    sx={{
                      borderRadius: 1,
                      mb: 1,
                      bgcolor: 'action.disabledBackground',
                      border: '1px solid',
                      borderColor: 'divider',
                      opacity: 0.7,
                    }}
                  >
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        checked={reminder.is_completed}
                        onChange={() => handleToggleComplete(reminder)}
                      />
                    </ListItemIcon>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Typography variant="h6">
                        {REMINDER_TYPE_ICONS[reminder.reminder_type] || '📝'}
                      </Typography>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography
                          variant="body1"
                          sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
                        >
                          {reminder.title}
                        </Typography>
                      }
                      secondary={formatReminderDueDate(reminder)}
                    />
                    <ListItemSecondaryAction>
                      <Tooltip title="Löschen">
                        <IconButton size="small" color="error" onClick={() => handleDelete(reminder.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </>
            )}
          </List>
        )}
      </Collapse>

      {/* Dialog für neue/bearbeitete Wiedervorlage */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingReminder ? 'Wiedervorlage bearbeiten' : 'Neue Wiedervorlage'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Titel *"
            value={form.title || ''}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            margin="normal"
            autoFocus
          />
          <TextField
            fullWidth
            label="Beschreibung"
            value={form.description || ''}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            margin="normal"
            multiline
            rows={2}
          />
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Typ</InputLabel>
              <Select
                value={form.reminder_type || 'Wiedervorlage'}
                label="Typ"
                onChange={(e) => setForm({ ...form, reminder_type: e.target.value })}
              >
                {REMINDER_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {REMINDER_TYPE_ICONS[type]} {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Priorität</InputLabel>
              <Select
                value={form.priority || 'normal'}
                label="Priorität"
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                {REMINDER_PRIORITIES.map((p) => (
                  <MenuItem key={p.value} value={p.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: p.color,
                        }}
                      />
                      {p.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Fällig am *"
              type="date"
              value={form.due_date || ''}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Uhrzeit"
              type="time"
              value={form.due_time || ''}
              onChange={(e) => setForm({ ...form, due_time: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
          <Box sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.notify_email !== false}
                  onChange={(e) => setForm({ ...form, notify_email: e.target.checked })}
                />
              }
              label="E-Mail Benachrichtigung"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.notify_push !== false}
                  onChange={(e) => setForm({ ...form, notify_push: e.target.checked })}
                />
              }
              label="Push-Benachrichtigung"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Abbrechen</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={!form.title || !form.due_date}
          >
            {editingReminder ? 'Speichern' : 'Erstellen'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}









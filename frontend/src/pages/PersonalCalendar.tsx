import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TodayIcon from '@mui/icons-material/Today';
import AddIcon from '@mui/icons-material/Add';
import { format, startOfWeek, addDays, addWeeks, startOfMonth, addMonths, isSameDay, isSameMonth } from 'date-fns';
import { de } from 'date-fns/locale';

interface CalendarEvent {
  id: number;
  title: string;
  description?: string;
  start_time: Date;
  end_time: Date;
  type: 'personal' | 'meeting' | 'task';
}

export default function PersonalCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    type: 'personal' as 'personal' | 'meeting' | 'task',
  });

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const monthStart = startOfMonth(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const monthDays = Array.from({ length: 42 }, (_, i) => {
    const day = addDays(monthStart, i - monthStart.getDay() + 1);
    return day;
  });

  const handlePrevious = () => {
    if (view === 'month') {
      setCurrentDate(addMonths(currentDate, -1));
    } else if (view === 'week') {
      setCurrentDate(addWeeks(currentDate, -1));
    } else {
      setCurrentDate(addDays(currentDate, -1));
    }
  };

  const handleNext = () => {
    if (view === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (view === 'week') {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const dateStr = format(date, "yyyy-MM-dd'T'HH:mm");
    setNewEvent({
      ...newEvent,
      start_time: dateStr,
      end_time: format(addDays(date, 0), "yyyy-MM-dd'T'HH:mm"),
    });
    setEventDialogOpen(true);
  };

  const handleCreateEvent = () => {
    if (!selectedDate || !newEvent.title || !newEvent.start_time) return;

    const event: CalendarEvent = {
      id: Date.now(),
      title: newEvent.title,
      description: newEvent.description,
      start_time: new Date(newEvent.start_time),
      end_time: new Date(newEvent.end_time || newEvent.start_time),
      type: newEvent.type,
    };

    setEvents([...events, event]);
    setEventDialogOpen(false);
    setNewEvent({
      title: '',
      description: '',
      start_time: '',
      end_time: '',
      type: 'personal',
    });
  };

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => isSameDay(event.start_time, date));
  };

  const renderMonthView = () => {
    return (
      <Grid container spacing={0.5}>
        {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((day) => (
          <Grid item xs={12 / 7} key={day}>
            <Paper
              sx={{
                p: 1,
                textAlign: 'center',
                backgroundColor: '#FAFAFA',
                fontWeight: 600,
                fontSize: '0.875rem',
              }}
            >
              {day}
            </Paper>
          </Grid>
        ))}
        {monthDays.map((day, idx) => {
          const dayEvents = getEventsForDate(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, new Date());

          return (
            <Grid item xs={12 / 7} key={idx}>
              <Paper
                onClick={() => handleDateClick(day)}
                sx={{
                  p: 1,
                  minHeight: 100,
                  cursor: 'pointer',
                  backgroundColor: isToday ? 'rgba(255, 193, 7, 0.1)' : '#FFFFFF',
                  border: isToday ? '2px solid #FFC107' : '1px solid rgba(0,0,0,0.08)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 193, 7, 0.05)',
                  },
                  opacity: isCurrentMonth ? 1 : 0.5,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: isToday ? 700 : 400,
                    color: isCurrentMonth ? '#000000' : '#757575',
                    mb: 0.5,
                  }}
                >
                  {format(day, 'd')}
                </Typography>
                {dayEvents.slice(0, 3).map((event) => (
                  <Box
                    key={event.id}
                    sx={{
                      backgroundColor:
                        event.type === 'personal'
                          ? '#FFC107'
                          : event.type === 'meeting'
                          ? '#1976D2'
                          : '#4CAF50',
                      color: '#000000',
                      p: 0.25,
                      mb: 0.25,
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {format(event.start_time, 'HH:mm')} {event.title}
                  </Box>
                ))}
                {dayEvents.length > 3 && (
                  <Typography variant="caption" sx={{ color: '#757575' }}>
                    +{dayEvents.length - 3} weitere
                  </Typography>
                )}
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    );
  };

  const renderWeekView = () => {
    return (
      <Box>
        <Grid container spacing={0.5}>
          {weekDays.map((day) => {
            const dayEvents = getEventsForDate(day);
            const isToday = isSameDay(day, new Date());

            return (
              <Grid item xs={12 / 7} key={day.toISOString()}>
                <Paper
                  sx={{
                    p: 1,
                    minHeight: 400,
                    backgroundColor: isToday ? 'rgba(255, 193, 7, 0.05)' : '#FFFFFF',
                    border: isToday ? '2px solid #FFC107' : '1px solid rgba(0,0,0,0.08)',
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: isToday ? 700 : 500,
                      mb: 1,
                      textAlign: 'center',
                    }}
                  >
                    {format(day, 'EEE d.M.', { locale: de })}
                  </Typography>
                  {dayEvents.map((event) => (
                    <Card
                      key={event.id}
                      sx={{
                        mb: 0.5,
                        backgroundColor:
                          event.type === 'personal'
                            ? '#FFC107'
                            : event.type === 'meeting'
                            ? '#1976D2'
                            : '#4CAF50',
                        color: '#000000',
                      }}
                    >
                      <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {format(event.start_time, 'HH:mm')} - {format(event.end_time, 'HH:mm')}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {event.title}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Persönlicher Kalender</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Ansicht</InputLabel>
            <Select value={view} label="Ansicht" onChange={(e) => setView(e.target.value as any)}>
              <MenuItem value="day">Tag</MenuItem>
              <MenuItem value="week">Woche</MenuItem>
              <MenuItem value="month">Monat</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" startIcon={<ChevronLeftIcon />} onClick={handlePrevious}>
            Zurück
          </Button>
          <Button variant="outlined" startIcon={<TodayIcon />} onClick={handleToday}>
            Heute
          </Button>
          <Button variant="outlined" endIcon={<ChevronRightIcon />} onClick={handleNext}>
            Vor
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setEventDialogOpen(true)}>
            Neuer Termin
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
          {view === 'month'
            ? format(currentDate, 'MMMM yyyy', { locale: de })
            : view === 'week'
            ? `${format(weekDays[0], 'd. MMM', { locale: de })} - ${format(weekDays[6], 'd. MMM yyyy', { locale: de })}`
            : format(currentDate, 'EEEE, d. MMMM yyyy', { locale: de })}
        </Typography>
        {view === 'month' && renderMonthView()}
        {view === 'week' && renderWeekView()}
        {view === 'day' && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {format(currentDate, 'EEEE, d. MMMM yyyy', { locale: de })}
            </Typography>
            {getEventsForDate(currentDate).map((event) => (
              <Card key={event.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6">{event.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {format(event.start_time, 'HH:mm')} - {format(event.end_time, 'HH:mm')}
                  </Typography>
                  {event.description && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {event.description}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Paper>

      <Dialog open={eventDialogOpen} onClose={() => setEventDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Neuer Termin</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Titel *"
            value={newEvent.title}
            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Beschreibung"
            value={newEvent.description}
            onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Typ</InputLabel>
            <Select
              value={newEvent.type}
              label="Typ"
              onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as any })}
            >
              <MenuItem value="personal">Persönlich</MenuItem>
              <MenuItem value="meeting">Meeting</MenuItem>
              <MenuItem value="task">Aufgabe</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            type="datetime-local"
            label="Startzeit *"
            value={newEvent.start_time}
            onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            required
          />
          <TextField
            fullWidth
            type="datetime-local"
            label="Endzeit"
            value={newEvent.end_time}
            onChange={(e) => setNewEvent({ ...newEvent, end_time: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEventDialogOpen(false)}>Abbrechen</Button>
          <Button variant="contained" onClick={handleCreateEvent} disabled={!newEvent.title || !newEvent.start_time}>
            Erstellen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}









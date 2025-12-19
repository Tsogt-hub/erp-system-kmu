import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Drawer,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { format, startOfWeek, addDays, addWeeks, startOfDay, isSameDay, parseISO, differenceInMinutes, addMinutes, startOfMonth, endOfMonth, eachDayOfInterval, getWeek } from 'date-fns';
import { de } from 'date-fns/locale';
import { projectsApi, Project } from '../services/api/projects';
import { calendarEventsApi, CalendarEvent as ApiCalendarEvent } from '../services/api/calendarEvents';
import { usersApi, User } from '../services/api/users';
import Alert from '@mui/material/Alert';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Chip from '@mui/material/Chip';
import Autocomplete from '@mui/material/Autocomplete';
import EditIcon from '@mui/icons-material/Edit';
import CategoryIcon from '@mui/icons-material/Category';
import WorkIcon from '@mui/icons-material/Work';
import SettingsIcon from '@mui/icons-material/Settings';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import Tooltip from '@mui/material/Tooltip';
import Badge from '@mui/material/Badge';
import Snackbar from '@mui/material/Snackbar';

interface CalendarEvent extends ApiCalendarEvent {
  resource_name?: string;
}

// Konflikt-Interface
interface Conflict {
  eventId: number;
  conflictingEventId: number;
  resourceId: number;
  type: 'overlap' | 'double_booking';
  message: string;
}

// Kapazität pro Ressource (Stunden pro Tag)
interface ResourceCapacity {
  resourceId: number;
  maxHoursPerDay: number;
  currentHours: number;
  isOverloaded: boolean;
}

interface Resource {
  id: number;
  name: string;
  type: string;
  category?: string;
}

interface ResourceCategory {
  id: string;
  name: string;
  resources: Resource[];
  expanded: boolean;
  color: string;
}

// Farbcodierung für Ressourcen-Kategorien
const CATEGORY_COLORS: Record<string, string> = {
  general: '#2196F3',      // Blue
  construction: '#FF9800', // Orange
  service: '#F44336',     // Red
  employees: '#4CAF50',    // Green
  vehicles: '#9C27B0',    // Purple
  tools: '#00BCD4',        // Cyan
};

const DEFAULT_EVENT_COLOR = '#1976D2';
const ROW_HEIGHT = 40; // Exakt wie Hero ERP - einheitliche Zeilenhöhe
const MIN_COLUMN_WIDTH = 180; // Minimum Breite pro Tag-Spalte
const WORK_DAY_START = 6; // 6:00 Uhr
const WORK_DAY_END = 22; // 22:00 Uhr

// View-Typ Definitionen
type ViewType = 'day' | '3days' | '7days' | 'week' | '14days' | '4weeks' | 'month';

export default function PlanningScheduler() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<ViewType>('week');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    project_id: '',
    start_time: '',
    end_time: '',
    resource_id: 0,
    resource_type: 'employee',
    employee_ids: [] as number[],
    notes: '',
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [newEventDialogOpen, setNewEventDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  
  // Neue States für Kapazitätsplanung & Konflikt-Erkennung
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [resourceCapacities, setResourceCapacities] = useState<ResourceCapacity[]>([]);
  const [showConflictWarnings, setShowConflictWarnings] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [quickActionsAnchor, setQuickActionsAnchor] = useState<{ event: CalendarEvent; x: number; y: number } | null>(null);

  // Resource-Kategorien mit Farbcodierung
  const [resourceCategories, setResourceCategories] = useState<ResourceCategory[]>([
    {
      id: 'general',
      name: 'Allgemein',
      expanded: true,
      color: CATEGORY_COLORS.general,
      resources: [
        { id: 1, name: 'Projekte terminiert', type: 'project', category: 'general' },
      ],
    },
    {
      id: 'construction',
      name: 'Bauplanung',
      expanded: true,
      color: CATEGORY_COLORS.construction,
      resources: [
        { id: 2, name: 'Baupipeline 1', type: 'pipeline', category: 'construction' },
        { id: 3, name: 'Baupipeline 2', type: 'pipeline', category: 'construction' },
        { id: 4, name: 'Baupipeline 3', type: 'pipeline', category: 'construction' },
      ],
    },
    {
      id: 'service',
      name: 'Servicefälle',
      expanded: true,
      color: CATEGORY_COLORS.service,
      resources: [
        { id: 5, name: 'Problemfälle', type: 'service', category: 'service' },
      ],
    },
    {
      id: 'employees',
      name: 'Mitarbeiter',
      expanded: true,
      color: CATEGORY_COLORS.employees,
      resources: [
        { id: 6, name: 'Levin Schober', type: 'employee', category: 'employees' },
        { id: 7, name: 'Elite PV Team', type: 'employee', category: 'employees' },
      ],
    },
    {
      id: 'vehicles',
      name: 'Fahrzeug',
      expanded: true,
      color: CATEGORY_COLORS.vehicles,
      resources: [
        { id: 8, name: 'VW Crafter', type: 'vehicle', category: 'vehicles' },
        { id: 9, name: 'Mercedes Sprinter', type: 'vehicle', category: 'vehicles' },
        { id: 10, name: 'Mercedes Vito', type: 'vehicle', category: 'vehicles' },
        { id: 11, name: 'Maxus Delivery', type: 'vehicle', category: 'vehicles' },
        { id: 12, name: 'Toyota Proace', type: 'vehicle', category: 'vehicles' },
        { id: 13, name: 'Anhänger klein', type: 'vehicle', category: 'vehicles' },
        { id: 14, name: 'Anhänger Groß', type: 'vehicle', category: 'vehicles' },
      ],
    },
    {
      id: 'tools',
      name: 'Werkzeug',
      expanded: true,
      color: CATEGORY_COLORS.tools,
      resources: [
        { id: 15, name: 'Messgerät Benning PV2', type: 'tool', category: 'tools' },
      ],
    },
  ]);

  // ============ KONFLIKT-ERKENNUNG ============
  const detectConflicts = (eventList: CalendarEvent[]): Conflict[] => {
    const foundConflicts: Conflict[] = [];
    
    for (let i = 0; i < eventList.length; i++) {
      for (let j = i + 1; j < eventList.length; j++) {
        const event1 = eventList[i];
        const event2 = eventList[j];
        
        // Nur gleiche Ressource prüfen
        if (event1.resource_id !== event2.resource_id) continue;
        
        const start1 = parseISO(event1.start_time);
        const end1 = parseISO(event1.end_time);
        const start2 = parseISO(event2.start_time);
        const end2 = parseISO(event2.end_time);
        
        // Überschneidung prüfen
        if (start1 < end2 && start2 < end1) {
          foundConflicts.push({
            eventId: event1.id,
            conflictingEventId: event2.id,
            resourceId: event1.resource_id,
            type: 'overlap',
            message: `Überschneidung: "${event1.title || 'Termin'}" und "${event2.title || 'Termin'}"`,
          });
        }
      }
    }
    
    return foundConflicts;
  };

  // ============ KAPAZITÄTSBERECHNUNG ============
  const calculateResourceCapacity = (resourceId: number, day: Date): ResourceCapacity => {
    const MAX_HOURS = 8; // Standard 8-Stunden-Tag
    
    const dayEvents = events.filter(event => {
      if (event.resource_id !== resourceId) return false;
      const eventStart = parseISO(event.start_time);
      return isSameDay(eventStart, day);
    });
    
    const totalMinutes = dayEvents.reduce((sum, event) => {
      const start = parseISO(event.start_time);
      const end = parseISO(event.end_time);
      return sum + differenceInMinutes(end, start);
    }, 0);
    
    const currentHours = totalMinutes / 60;
    
    return {
      resourceId,
      maxHoursPerDay: MAX_HOURS,
      currentHours,
      isOverloaded: currentHours > MAX_HOURS,
    };
  };

  // ============ QUICK ACTIONS ============
  const handleDuplicateEvent = async (event: CalendarEvent) => {
    try {
      const startTime = parseISO(event.start_time);
      const endTime = parseISO(event.end_time);
      
      // Nächster Tag
      const newStart = addDays(startTime, 1);
      const newEnd = addDays(endTime, 1);
      
      const newEvent = await calendarEventsApi.create({
        title: `${event.title} (Kopie)`,
        project_id: event.project_id,
        start_time: newStart.toISOString(),
        end_time: newEnd.toISOString(),
        resource_id: event.resource_id,
        resource_type: event.resource_type,
        notes: event.notes,
      });
      
      setEvents([...events, newEvent]);
      setSnackbarMessage('Termin dupliziert');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Error duplicating event:', err);
      setError('Fehler beim Duplizieren');
    }
    setQuickActionsAnchor(null);
  };

  const handleDeleteEvent = async (event: CalendarEvent) => {
    if (!window.confirm('Termin wirklich löschen?')) return;
    
    try {
      await calendarEventsApi.delete(event.id);
      setEvents(events.filter(e => e.id !== event.id));
      setSnackbarMessage('Termin gelöscht');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Error deleting event:', err);
      setError('Fehler beim Löschen');
    }
    setQuickActionsAnchor(null);
  };

  // Konflikt-Check bei Events-Änderung
  useEffect(() => {
    const foundConflicts = detectConflicts(events);
    setConflicts(foundConflicts);
  }, [events]);

  // Dynamische Tage-Berechnung basierend auf ViewType
  const getVisibleDays = () => {
    switch (viewType) {
      case 'day':
        return [startOfDay(currentDate)];
      case '3days':
        return Array.from({ length: 3 }, (_, i) => addDays(startOfDay(currentDate), i));
      case '7days':
        return Array.from({ length: 7 }, (_, i) => addDays(startOfDay(currentDate), i));
      case 'week':
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
      case '14days':
        return Array.from({ length: 14 }, (_, i) => addDays(startOfDay(currentDate), i));
      case '4weeks':
        const fourWeeksStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        return Array.from({ length: 28 }, (_, i) => addDays(fourWeeksStart, i));
      case 'month':
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        return eachDayOfInterval({ start: monthStart, end: monthEnd });
      default:
        return Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), i));
    }
  };

  const visibleDays = getVisibleDays();

  // Dynamische Spaltenbreite je nach View
  const getColumnWidth = () => {
    switch (viewType) {
      case 'day':
        return 800;
      case '3days':
        return 300;
      case '7days':
      case 'week':
        return 160;
      case '14days':
        return 80;
      case '4weeks':
        return 50;
      case 'month':
        return 45;
      default:
        return MIN_COLUMN_WIDTH;
    }
  };

  const columnWidth = getColumnWidth();

  // Gruppiere Tage nach Kalenderwochen (für Monatsansicht)
  const getDaysByWeek = () => {
    if (!['month', '4weeks'].includes(viewType)) return [];
    
    const weeks: { weekNumber: number; days: Date[] }[] = [];
    let currentWeek: Date[] = [];
    let currentWeekNum = 0;
    
    visibleDays.forEach((day) => {
      const weekNum = getWeek(day, { weekStartsOn: 1, firstWeekContainsDate: 4 });
      
      if (currentWeekNum === 0) {
        currentWeekNum = weekNum;
      }
      
      if (weekNum !== currentWeekNum) {
        weeks.push({ weekNumber: currentWeekNum, days: currentWeek });
        currentWeek = [day];
        currentWeekNum = weekNum;
      } else {
        currentWeek.push(day);
      }
    });
    
    if (currentWeek.length > 0) {
      weeks.push({ weekNumber: currentWeekNum, days: currentWeek });
    }
    
    return weeks;
  };

  const weekGroups = getDaysByWeek();

  // Dynamische Stunden-Anzeige (nur bei Tag-/Wochen-Ansichten)
  const showHourlyView = ['day', '3days', '7days', 'week'].includes(viewType);
  const hourMarkers = showHourlyView ? [6, 9, 12, 15] : [];

  // Bei Monats-/4-Wochen-Ansicht: Sidebar ausblenden für mehr Platz
  const showResourceSidebar = !['month', '4weeks'].includes(viewType);

  // Timeline-Einstellungen (Hero ERP Style: Nur ausgewählte Stunden anzeigen)
  const WORK_DAY_START = 6; // 06:00
  const WORK_DAY_END = 22; // 22:00

  // Helper: Handle cell click to create new event
  const handleCellClick = (resourceId: number, day: Date, clickX: number, cellWidth: number) => {
    // Berechne die Stunde basierend auf der Klick-Position
    const percentageClicked = clickX / cellWidth;
    const hourOffset = percentageClicked * 16; // 16 Stunden Arbeitstag (6-22)
    const clickedHour = Math.floor(WORK_DAY_START + hourOffset);

    const startTime = new Date(day);
    startTime.setHours(clickedHour, 0, 0, 0);
    const endTime = new Date(startTime);
    endTime.setHours(clickedHour + 1, 0, 0, 0);

    setEventForm({
      title: '',
      project_id: '',
      start_time: startTime.toISOString().slice(0, 16),
      end_time: endTime.toISOString().slice(0, 16),
      resource_id: resourceId,
      resource_type: 'employee',
      employee_ids: [],
      notes: '',
    });
    setNewEventDialogOpen(true);
  };

  // Helper: Toggle category expansion
  const toggleCategory = (categoryId: string) => {
    setResourceCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId ? { ...cat, expanded: !cat.expanded } : cat
      )
    );
  };

  // Navigation handlers
  const goToPrevious = () => {
    switch (viewType) {
      case 'day':
      case '3days':
      case '7days':
      case '14days':
        setCurrentDate(addDays(currentDate, -1));
        break;
      case 'week':
        setCurrentDate(addWeeks(currentDate, -1));
        break;
      case '4weeks':
        setCurrentDate(addWeeks(currentDate, -4));
        break;
      case 'month':
        setCurrentDate(addDays(currentDate, -30));
        break;
    }
  };

  const goToNext = () => {
    switch (viewType) {
      case 'day':
      case '3days':
      case '7days':
      case '14days':
        setCurrentDate(addDays(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(addWeeks(currentDate, 1));
        break;
      case '4weeks':
        setCurrentDate(addWeeks(currentDate, 4));
        break;
      case 'month':
        setCurrentDate(addDays(currentDate, 30));
        break;
    }
  };

  const goToToday = () => setCurrentDate(new Date());

  // Formatierte Datumsanzeige
  const getDateRangeLabel = () => {
    if (visibleDays.length === 1) {
      return format(visibleDays[0], 'd. MMM. yyyy', { locale: de });
    } else if (visibleDays.length <= 7) {
      return `${format(visibleDays[0], 'd', { locale: de })} – ${format(visibleDays[visibleDays.length - 1], 'd. MMM. yyyy', { locale: de })} KW${format(currentDate, 'I')}`;
    } else if (viewType === 'month') {
      return format(currentDate, 'MMMM yyyy', { locale: de });
    } else {
      return `${format(visibleDays[0], 'd', { locale: de })} – ${format(visibleDays[visibleDays.length - 1], 'd. MMM. yyyy', { locale: de })} KW${format(currentDate, 'I')}`;
    }
  };

  // Get events for a specific resource and day
  const getEventsForResourceAndDay = (resourceId: number, day: Date): CalendarEvent[] => {
    return events.filter(event => {
      if (event.resource_id !== resourceId) return false;
      const eventStart = parseISO(event.start_time);
      return isSameDay(eventStart, day);
    });
  };

  // Calculate event position (as percentage of day)
  const calculateEventPosition = (event: CalendarEvent) => {
    const start = parseISO(event.start_time);
    const end = parseISO(event.end_time);
    const startHour = start.getHours() + start.getMinutes() / 60;
    const endHour = end.getHours() + end.getMinutes() / 60;

    // Position relative to work day (6-22 = 16 hours)
    const left = ((startHour - WORK_DAY_START) / 16) * 100;
    const width = ((endHour - startHour) / 16) * 100;

    return { left: `${left}%`, width: `${width}%` };
  };

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, event: CalendarEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('eventId', event.id.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, resourceId: number, day: Date) => {
    e.preventDefault();
    const eventId = parseInt(e.dataTransfer.getData('eventId'));
    const event = events.find(ev => ev.id === eventId);

    if (!event) return;

    // Calculate new times
    const newStartTime = startOfDay(day);
    newStartTime.setHours(WORK_DAY_START);

    const duration = differenceInMinutes(parseISO(event.end_time), parseISO(event.start_time));
    const newEndTime = addMinutes(newStartTime, duration);

    // Update event
    const updatedEvent = {
      ...event,
      resource_id: resourceId,
      start_time: newStartTime.toISOString(),
      end_time: newEndTime.toISOString(),
    };

    try {
      // API Update
      await calendarEventsApi.update(eventId, {
        title: updatedEvent.title,
        project_id: updatedEvent.project_id,
        start_time: updatedEvent.start_time,
        end_time: updatedEvent.end_time,
        resource_id: updatedEvent.resource_id,
        resource_type: updatedEvent.resource_type,
        notes: updatedEvent.notes,
      });

      setEvents(prev =>
        prev.map(ev => (ev.id === eventId ? updatedEvent : ev))
      );

      // TODO: Mitarbeiter-Benachrichtigung
      console.log('Termin verschoben - Mitarbeiter sollten benachrichtigt werden:', {
        eventId,
        resourceId,
        newStartTime: updatedEvent.start_time,
      });
    } catch (error) {
      console.error('Fehler beim Verschieben des Termins:', error);
      setError('Fehler beim Verschieben des Termins');
    }
  };

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [projectsData, employeesData, eventsData] = await Promise.all([
          projectsApi.getAll(),
          usersApi.getAll(),
          calendarEventsApi.getAll(),
        ]);
        setProjects(projectsData);
        setEmployees(employeesData);
        setEvents(eventsData);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Fehler beim Laden der Daten');
      }
    };
    loadData();
  }, []);

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f5f5f5' }}>
      {/* HEADER */}
      <Box sx={{ p: 2, bgcolor: 'white', borderBottom: '1px solid #e0e0e0' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          {/* Navigation */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Ansicht</InputLabel>
              <Select
                value={viewType}
                label="Ansicht"
                onChange={(e) => setViewType(e.target.value as ViewType)}
              >
                <MenuItem value="day">Tag</MenuItem>
                <MenuItem value="3days">3 Tage</MenuItem>
                <MenuItem value="7days">7 Tage</MenuItem>
                <MenuItem value="week">Kalenderwoche</MenuItem>
                <MenuItem value="14days">14 Tage</MenuItem>
                <MenuItem value="4weeks">4 Wochen</MenuItem>
                <MenuItem value="month">Monat</MenuItem>
              </Select>
            </FormControl>
            <IconButton onClick={goToPrevious} size="small">
              <ChevronLeftIcon />
            </IconButton>
            <Button onClick={goToToday} variant="outlined" size="small">
              Heute
            </Button>
            <IconButton onClick={goToNext} size="small">
              <ChevronRightIcon />
            </IconButton>
            <Typography sx={{ ml: 2 }}>›</Typography>
            <Typography>Datum</Typography>
          </Box>

          {/* Date Display */}
          <Typography variant="h6" sx={{ fontWeight: 400, fontSize: '1.1rem' }}>
            {getDateRangeLabel()}
          </Typography>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button startIcon={<CategoryIcon />} variant="outlined" size="small">
              Kategorie
            </Button>
            <Button startIcon={<WorkIcon />} variant="outlined" size="small">
              Gewerk
            </Button>
            {/* Konflikt-Badge */}
            {conflicts.length > 0 && (
              <Tooltip title={`${conflicts.length} Konflikte erkannt`}>
                <Badge badgeContent={conflicts.length} color="error">
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<WarningAmberIcon />}
                    onClick={() => setShowConflictWarnings(true)}
                  >
                    Konflikte
                  </Button>
                </Badge>
              </Tooltip>
            )}
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              size="small"
              onClick={() => setNewEventDialogOpen(true)}
            >
              Neuer Termin
            </Button>
            <Button
              startIcon={<FileDownloadIcon />}
              endIcon={<ExpandMoreIcon />}
              variant="outlined"
              size="small"
            >
              Import/Export
            </Button>
            <IconButton size="small" onClick={() => setSettingsOpen(true)}>
              <SettingsIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* MAIN CONTENT */}
      <Box sx={{ flex: 1, overflow: 'hidden', p: 2 }}>
        <Paper sx={{ height: '100%', overflow: 'hidden', display: 'flex' }}>
          {/* RESOURCES SIDEBAR - Nur bei detaillierten Ansichten */}
          {showResourceSidebar && (
            <Box
              sx={{
                width: 220,
                minWidth: 220,
                maxWidth: 220,
                borderRight: '1px solid #e0e0e0',
                overflow: 'auto',
                bgcolor: 'white',
              }}
            >
              {/* Sidebar Header - Höhe 50px (gleich wie Timeline-Header erste Zeile) */}
              <Box
                sx={{
                  height: 50,
                  minHeight: 50,
                  maxHeight: 50,
                  display: 'flex',
                  alignItems: 'center',
                  px: 2,
                  fontWeight: 600,
                  borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                  bgcolor: 'rgba(245, 245, 247, 0.95)',
                  boxSizing: 'border-box',
                }}
              >
                Ressourcen
              </Box>

              {/* Spacer für Stunden-Zeile - Höhe 32px (gleich wie Timeline-Uhrzeiten) + 2px Border */}
              {showHourlyView && (
                <Box sx={{ 
                  height: 34, 
                  minHeight: 34,
                  maxHeight: 34,
                  borderBottom: '2px solid rgba(0, 0, 0, 0.08)', 
                  bgcolor: 'rgba(245, 245, 247, 0.95)',
                  boxSizing: 'border-box',
                }} />
              )}

              {/* Categories & Resources */}
              {resourceCategories.map((category) => (
                <Box key={category.id}>
                  {/* Category Header */}
                  <Box
                    onClick={() => toggleCategory(category.id)}
                    sx={{
                      height: ROW_HEIGHT,
                      minHeight: ROW_HEIGHT,
                      maxHeight: ROW_HEIGHT,
                      display: 'flex',
                      alignItems: 'center',
                      paddingLeft: 2,
                      paddingRight: 2,
                      paddingTop: 0,
                      paddingBottom: 0,
                      cursor: 'pointer',
                      bgcolor: 'rgba(250, 250, 250, 0.8)',
                      borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                      margin: 0,
                      '&:hover': { bgcolor: 'rgba(245, 245, 245, 0.95)' },
                    }}
                  >
                    <Typography sx={{ flex: 1, fontWeight: 600, fontSize: '0.875rem', color: 'rgba(0, 0, 0, 0.87)' }}>
                      {category.name}
                    </Typography>
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); }}>
                      <EditIcon fontSize="small" sx={{ fontSize: '1rem' }} />
                    </IconButton>
                    <IconButton size="small">
                      {category.expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                    </IconButton>
                  </Box>

                  {/* Resources */}
                  {category.expanded && category.resources.map((resource) => (
                    <Box
                      key={resource.id}
                      sx={{
                        height: ROW_HEIGHT,
                        minHeight: ROW_HEIGHT,
                        maxHeight: ROW_HEIGHT,
                        display: 'flex',
                        alignItems: 'center',
                        paddingLeft: 3,
                        paddingRight: 3,
                        paddingTop: 0,
                        paddingBottom: 0,
                        borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                        bgcolor: 'white',
                        margin: 0,
                        boxSizing: 'border-box',
                        '&:hover': { bgcolor: 'rgba(0, 122, 255, 0.02)' },
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: '0.8125rem',
                          color: 'rgba(0, 0, 0, 0.87)',
                          lineHeight: 1.2,
                          margin: 0,
                          padding: 0,
                          display: 'block',
                        }}
                      >
                        {resource.name}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ))}
            </Box>
          )}

          {/* TIMELINE */}
          <Box sx={{ flex: 1, overflowX: 'auto', overflowY: 'auto', bgcolor: 'white' }}>
            {/* Bei Monats-/4-Wochen-Ansicht: Kalenderwochen-Header */}
            {!showResourceSidebar && weekGroups.length > 0 && (
              <Box sx={{
                display: 'flex',
                height: 32,
                borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                position: 'sticky',
                top: 40,
                left: 0,
                zIndex: 9,
                bgcolor: 'rgba(245, 245, 247, 0.95)',
              }}>
                <Box sx={{
                  width: 150,
                  borderRight: '1px solid rgba(0, 0, 0, 0.08)',
                  position: 'sticky',
                  left: 0,
                  bgcolor: 'rgba(245, 245, 247, 0.95)',
                  zIndex: 10,
                }} />
                {weekGroups.map((week, idx) => (
                  <Box key={week.weekNumber} sx={{
                    width: `${week.days.length * columnWidth}px`,
                    minWidth: `${week.days.length * columnWidth}px`,
                    maxWidth: `${week.days.length * columnWidth}px`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRight: idx < weekGroups.length - 1 ? '2px solid rgba(0, 0, 0, 0.12)' : 'none',
                  }}>
                    <Typography sx={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'rgba(0, 0, 0, 0.7)',
                    }}>
                      KW {week.weekNumber}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}

            {/* Tages-Header - WICHTIG: Höhe muss mit Sidebar übereinstimmen */}
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              borderBottom: '2px solid rgba(0, 0, 0, 0.08)',
              position: 'sticky',
              top: !showResourceSidebar ? 72 : 0,
              zIndex: 8,
              bgcolor: 'rgba(245, 245, 247, 0.95)',
            }}>
              {/* Erste Zeile: Tag und Datum - Höhe 50px wie Sidebar-Header */}
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: !showResourceSidebar
                  ? `150px repeat(${visibleDays.length}, ${columnWidth}px)`
                  : `repeat(${visibleDays.length}, ${columnWidth}px)`,
                height: 50,
                alignItems: 'center',
              }}>
                {!showResourceSidebar && (
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRight: '1px solid rgba(0, 0, 0, 0.08)',
                    position: 'sticky',
                    left: 0,
                    bgcolor: 'rgba(245, 245, 247, 0.95)',
                    zIndex: 10,
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    height: '100%',
                  }}>
                    Ressourcen
                  </Box>
                )}
                {visibleDays.map((day) => {
                  const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                  return (
                    <Box key={day.toISOString()} sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: 0.5,
                      borderRight: '1px solid rgba(0, 0, 0, 0.08)',
                      bgcolor: isSameDay(day, new Date()) ? '#FFF9C4' : (isWeekend ? 'rgba(0, 0, 0, 0.04)' : 'transparent'),
                      '&:last-child': { borderRight: 'none' },
                      width: `${columnWidth}px`,
                      minWidth: `${columnWidth}px`,
                      maxWidth: `${columnWidth}px`,
                      height: '100%',
                    }}>
                      {!showResourceSidebar ? (
                        <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                          {format(day, 'd.', { locale: de })}
                        </Typography>
                      ) : (
                        <>
                          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                            {format(day, 'EEE', { locale: de })},
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'rgba(0, 0, 0, 0.6)' }}>
                            {format(day, 'd.M.', { locale: de })}
                          </Typography>
                        </>
                      )}
                    </Box>
                  );
                })}
              </Box>

              {/* Zweite Zeile: Uhrzeiten - Höhe 32px wie Sidebar-Spacer */}
              {showHourlyView && (
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${visibleDays.length}, ${columnWidth}px)`,
                  height: 32,
                  borderTop: '1px solid rgba(0, 0, 0, 0.08)',
                }}>
                  {visibleDays.map((day) => {
                    const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                    return (
                      <Box key={day.toISOString()} sx={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${hourMarkers.length}, 1fr)`,
                        borderRight: '1px solid rgba(0, 0, 0, 0.08)',
                        bgcolor: isSameDay(day, new Date()) ? '#FFF9C4' : (isWeekend ? 'rgba(0, 0, 0, 0.04)' : 'transparent'),
                        '&:last-child': { borderRight: 'none' },
                      }}>
                        {hourMarkers.map((hour, idx) => (
                          <Box key={hour} sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRight: idx < hourMarkers.length - 1 ? '1px solid rgba(0, 0, 0, 0.08)' : 'none',
                          }}>
                            <Typography sx={{
                              fontSize: '0.6875rem',
                              fontWeight: 500,
                              color: 'rgba(0, 0, 0, 0.5)',
                            }}>
                              {hour.toString().padStart(2, '0')}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Box>

            {/* Timeline-Zeilen */}
            {resourceCategories.map((category) => (
              <React.Fragment key={category.id}>
                {/* Category Header Row */}
                {showResourceSidebar ? (
                  <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${visibleDays.length}, ${columnWidth}px)`,
                    height: ROW_HEIGHT,
                    minHeight: ROW_HEIGHT,
                    maxHeight: ROW_HEIGHT,
                    borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                    bgcolor: 'rgba(250, 250, 250, 0.8)',
                    margin: 0,
                    padding: 0,
                    boxSizing: 'border-box',
                  }}>
                    {visibleDays.map((day) => (
                      <Box
                        key={day.toISOString()}
                        sx={{
                          borderRight: '1px solid rgba(0, 0, 0, 0.08)',
                          '&:last-child': { borderRight: 'none' },
                          width: `${columnWidth}px`,
                          minWidth: `${columnWidth}px`,
                          maxWidth: `${columnWidth}px`,
                        }}
                      />
                    ))}
                  </Box>
                ) : (
                  // Bei Monats-/4-Wochen-Ansicht: Kategorie-Header mit Namen
                  <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: `150px repeat(${visibleDays.length}, ${columnWidth}px)`,
                    height: ROW_HEIGHT,
                    minHeight: ROW_HEIGHT,
                    maxHeight: ROW_HEIGHT,
                    borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                    bgcolor: 'rgba(250, 250, 250, 0.8)',
                    margin: 0,
                    padding: 0,
                    boxSizing: 'border-box',
                  }}>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      px: 2,
                      borderRight: '1px solid rgba(0, 0, 0, 0.08)',
                      position: 'sticky',
                      left: 0,
                      bgcolor: 'rgba(250, 250, 250, 0.8)',
                      zIndex: 5,
                    }}>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.8rem', color: 'rgba(0, 0, 0, 0.87)' }}>
                        {category.name}
                      </Typography>
                    </Box>
                    {visibleDays.map((day) => (
                      <Box
                        key={day.toISOString()}
                        sx={{
                          borderRight: '1px solid rgba(0, 0, 0, 0.08)',
                          '&:last-child': { borderRight: 'none' },
                          width: `${columnWidth}px`,
                          minWidth: `${columnWidth}px`,
                          maxWidth: `${columnWidth}px`,
                        }}
                      />
                    ))}
                  </Box>
                )}

                {/* Resource Rows */}
                {category.expanded && category.resources.map((resource) => {
                  const resourceColor = category?.color || DEFAULT_EVENT_COLOR;

                  return (
                    <Box key={resource.id} sx={{
                      display: 'grid',
                      gridTemplateColumns: !showResourceSidebar
                        ? `150px repeat(${visibleDays.length}, ${columnWidth}px)`
                        : `repeat(${visibleDays.length}, ${columnWidth}px)`,
                      height: ROW_HEIGHT,
                      minHeight: ROW_HEIGHT,
                      maxHeight: ROW_HEIGHT,
                      borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                      margin: 0,
                      padding: 0,
                      boxSizing: 'border-box',
                    }}>
                      {/* Ressourcen-Name bei Monats-/4-Wochen-Ansicht */}
                      {!showResourceSidebar && (
                        <Box sx={{
                          display: 'flex',
                          alignItems: 'center',
                          px: 2,
                          borderRight: '1px solid rgba(0, 0, 0, 0.08)',
                          position: 'sticky',
                          left: 0,
                          bgcolor: 'white',
                          zIndex: 5,
                          '&:hover': { bgcolor: 'rgba(0, 122, 255, 0.02)' },
                        }}>
                          <Typography sx={{ fontSize: '0.75rem', color: 'rgba(0, 0, 0, 0.87)' }}>
                            {resource.name}
                          </Typography>
                        </Box>
                      )}
                      {visibleDays.map((day) => {
                        const dayEvents = getEventsForResourceAndDay(resource.id, day);
                        const isWeekend = day.getDay() === 0 || day.getDay() === 6;

                        return (
                          <Box
                            key={day.toISOString()}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, resource.id, day)}
                            onClick={(e) => {
                              // Nur öffnen wenn nicht auf Event geklickt wurde
                              if ((e.target as HTMLElement).closest('[draggable="true"]')) return;

                              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                              const clickX = e.clientX - rect.left;
                              const cellWidth = rect.width;

                              handleCellClick(resource.id, day, clickX, cellWidth);
                            }}
                            sx={{
                              borderRight: '1px solid rgba(0, 0, 0, 0.08)',
                              position: 'relative',
                              bgcolor: isSameDay(day, new Date()) ? '#FFFDE7' : (isWeekend ? 'rgba(0, 0, 0, 0.04)' : 'white'),
                              '&:last-child': { borderRight: 'none' },
                              '&:hover': {
                                bgcolor: isSameDay(day, new Date()) ? '#FFF9C4' : (isWeekend ? 'rgba(0, 0, 0, 0.08)' : 'rgba(0, 122, 255, 0.02)'),
                                cursor: 'pointer',
                              },
                              width: `${columnWidth}px`,
                              minWidth: `${columnWidth}px`,
                              maxWidth: `${columnWidth}px`,
                            }}
                          >
                            {/* Grid-Linien - nur bei detaillierten Ansichten (bei den Hauptuhrzeiten) */}
                            {showHourlyView && (
                              <Box sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                display: 'grid',
                                gridTemplateColumns: `repeat(${hourMarkers.length}, 1fr)`,
                                pointerEvents: 'none',
                                zIndex: 1,
                              }}>
                                {hourMarkers.map((_, idx) => (
                                  <Box key={idx} sx={{
                                    borderRight: idx < hourMarkers.length - 1 ? '1px solid rgba(0, 0, 0, 0.08)' : 'none',
                                  }} />
                                ))}
                              </Box>
                            )}

                            {/* Events */}
                            {dayEvents.map((event) => {
                              const position = calculateEventPosition(event);
                              const project = projects.find(p => p.id === event.project_id);
                              
                              // Konflikt-Check
                              const hasConflict = conflicts.some(
                                c => c.eventId === event.id || c.conflictingEventId === event.id
                              );
                              
                              // Kapazitäts-Check
                              const capacity = calculateResourceCapacity(resource.id, day);
                              
                              // Kompakte Darstellung für Monatsansicht
                              const isMonthView = !showResourceSidebar;

                              return (
                                <Box
                                  key={event.id}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, event)}
                                  onContextMenu={(e) => {
                                    e.preventDefault();
                                    setQuickActionsAnchor({ event, x: e.clientX, y: e.clientY });
                                  }}
                                  onClick={() => {
                                    setEditingEvent(event);
                                    setEventForm({
                                      title: event.title || '',
                                      project_id: event.project_id?.toString() || '',
                                      start_time: event.start_time,
                                      end_time: event.end_time,
                                      resource_id: event.resource_id,
                                      resource_type: event.resource_type || 'employee',
                                      employee_ids: [],
                                      notes: event.notes || '',
                                    });
                                    setNewEventDialogOpen(true);
                                  }}
                                  sx={{
                                    position: 'absolute',
                                    left: isMonthView ? 2 : position.left,
                                    width: isMonthView ? 'calc(100% - 4px)' : position.width,
                                    top: isMonthView ? 2 : 4,
                                    height: isMonthView ? 16 : 'auto',
                                    bottom: isMonthView ? 'auto' : 4,
                                    bgcolor: hasConflict ? '#FF5252' : resourceColor,
                                    borderRadius: isMonthView ? '3px' : '6px',
                                    px: isMonthView ? 0.5 : 1,
                                    py: isMonthView ? 0.25 : 0.5,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    cursor: 'grab',
                                    overflow: 'hidden',
                                    boxShadow: hasConflict 
                                      ? '0 0 0 2px #FF1744, 0 2px 8px rgba(255,23,68,0.4)' 
                                      : (isMonthView ? '0 1px 2px rgba(0,0,0,0.1)' : '0 2px 4px rgba(0,0,0,0.1)'),
                                    border: hasConflict ? '2px solid #FF1744' : '1px solid rgba(255,255,255,0.2)',
                                    animation: hasConflict ? 'conflictPulse 2s infinite' : 'none',
                                    '@keyframes conflictPulse': {
                                      '0%, 100%': { boxShadow: '0 0 0 2px #FF1744, 0 2px 8px rgba(255,23,68,0.4)' },
                                      '50%': { boxShadow: '0 0 0 4px #FF1744, 0 4px 16px rgba(255,23,68,0.6)' },
                                    },
                                    '&:hover': {
                                      boxShadow: isMonthView ? '0 2px 4px rgba(0,0,0,0.15)' : '0 4px 8px rgba(0,0,0,0.2)',
                                      transform: 'translateY(-1px)',
                                      zIndex: 10,
                                    },
                                    '&:active': {
                                      cursor: 'grabbing',
                                    },
                                  }}
                                >
                                  {isMonthView ? (
                                    // Kompakte Monatsansicht: Nur Titel
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: 'white',
                                        fontWeight: 600,
                                        fontSize: '0.625rem',
                                        lineHeight: 1,
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                      }}
                                    >
                                      {project?.name || event.title || 'Termin'}
                                    </Typography>
                                  ) : (
                                    <>
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          color: 'white',
                                          fontWeight: 600,
                                          fontSize: '0.75rem',
                                          whiteSpace: 'nowrap',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          mb: 0.25,
                                        }}
                                      >
                                        {project?.name || event.title}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          color: 'rgba(255,255,255,0.9)',
                                          fontSize: '0.65rem',
                                          whiteSpace: 'nowrap',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                        }}
                                      >
                                        {format(parseISO(event.start_time), 'HH:mm', { locale: de })} - {format(parseISO(event.end_time), 'HH:mm', { locale: de })}
                                      </Typography>
                                    </>
                                  )}
                                </Box>
                              );
                            })}
                          </Box>
                        );
                      })}
                    </Box>
                  );
                })}
              </React.Fragment>
            ))}
          </Box>
        </Paper>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ position: 'fixed', top: 80, right: 20, zIndex: 9999 }}>
          {error}
        </Alert>
      )}

      {/* Konflikt-Warnungen */}
      {showConflictWarnings && conflicts.length > 0 && (
        <Alert 
          severity="warning" 
          onClose={() => setShowConflictWarnings(false)}
          icon={<WarningAmberIcon />}
          sx={{ 
            position: 'fixed', 
            top: 80, 
            left: '50%', 
            transform: 'translateX(-50%)',
            zIndex: 9999,
            maxWidth: 500,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {conflicts.length} Konflikt(e) erkannt
          </Typography>
          {conflicts.slice(0, 3).map((conflict, idx) => (
            <Typography key={idx} variant="body2" sx={{ fontSize: '0.8rem' }}>
              • {conflict.message}
            </Typography>
          ))}
          {conflicts.length > 3 && (
            <Typography variant="body2" sx={{ fontSize: '0.8rem', fontStyle: 'italic' }}>
              ...und {conflicts.length - 3} weitere
            </Typography>
          )}
        </Alert>
      )}

      {/* Quick Actions Popup */}
      {quickActionsAnchor && (
        <Paper
          sx={{
            position: 'fixed',
            left: quickActionsAnchor.x,
            top: quickActionsAnchor.y,
            zIndex: 10000,
            p: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
            minWidth: 150,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          }}
          onMouseLeave={() => setQuickActionsAnchor(null)}
        >
          <Button
            size="small"
            startIcon={<ContentCopyIcon />}
            onClick={() => handleDuplicateEvent(quickActionsAnchor.event)}
            sx={{ justifyContent: 'flex-start' }}
          >
            Duplizieren
          </Button>
          <Button
            size="small"
            startIcon={<EditIcon />}
            onClick={() => {
              setEditingEvent(quickActionsAnchor.event);
              setEventForm({
                title: quickActionsAnchor.event.title || '',
                project_id: quickActionsAnchor.event.project_id?.toString() || '',
                start_time: quickActionsAnchor.event.start_time,
                end_time: quickActionsAnchor.event.end_time,
                resource_id: quickActionsAnchor.event.resource_id,
                resource_type: quickActionsAnchor.event.resource_type || 'employee',
                employee_ids: [],
                notes: quickActionsAnchor.event.notes || '',
              });
              setNewEventDialogOpen(true);
              setQuickActionsAnchor(null);
            }}
            sx={{ justifyContent: 'flex-start' }}
          >
            Bearbeiten
          </Button>
          <Button
            size="small"
            startIcon={<DeleteOutlineIcon />}
            color="error"
            onClick={() => handleDeleteEvent(quickActionsAnchor.event)}
            sx={{ justifyContent: 'flex-start' }}
          >
            Löschen
          </Button>
        </Paper>
      )}

      {/* Snackbar für Benachrichtigungen */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />

      {/* Neuer Termin Dialog - Zentriert und etwas tiefer */}
      <Drawer
        anchor="right"
        open={newEventDialogOpen}
        onClose={() => setNewEventDialogOpen(false)}
        PaperProps={{
          sx: {
            width: 700,
            maxWidth: '100%',
            margin: 'auto',
            height: 'fit-content',
            maxHeight: '80vh',
            top: '15%',
            position: 'absolute',
            left: '50%',
            marginLeft: '-350px',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          }
        }}
        sx={{
          '& .MuiBackdrop-root': {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 500 }}>
              Termin erstellen
            </Typography>
            <IconButton onClick={() => setNewEventDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Kategorie */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Kategorie</InputLabel>
                <Select
                  value={eventForm.resource_type}
                  label="Kategorie"
                  onChange={(e) => setEventForm({ ...eventForm, resource_type: e.target.value })}
                >
                  <MenuItem value="project">AC/DC</MenuItem>
                  <MenuItem value="service">Service</MenuItem>
                  <MenuItem value="construction">Bau</MenuItem>
                </Select>
              </FormControl>

              {/* Titel */}
              <TextField
                fullWidth
                label="Titel"
                value={eventForm.title}
                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
              />
            </Box>

            {/* Projekt / Kontakt */}
            <FormControl fullWidth>
              <InputLabel>Projekt / Kontakt</InputLabel>
              <Select
                value={eventForm.project_id}
                label="Projekt / Kontakt"
                onChange={(e) => setEventForm({ ...eventForm, project_id: e.target.value })}
              >
                <MenuItem value="">Bitte auswählen</MenuItem>
                {projects.map(project => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Start & Ende */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Start"
                type="datetime-local"
                value={eventForm.start_time}
                onChange={(e) => setEventForm({ ...eventForm, start_time: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="Ende"
                type="datetime-local"
                value={eventForm.end_time}
                onChange={(e) => setEventForm({ ...eventForm, end_time: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            {/* Mitarbeiter und Ressourcen zuweisen */}
            <Autocomplete
              multiple
              options={employees}
              getOptionLabel={(option) => option.email || ''}
              value={employees.filter(e => eventForm.employee_ids.includes(e.id))}
              onChange={(_, newValue) => {
                setEventForm({
                  ...eventForm,
                  employee_ids: newValue.map(e => e.id)
                });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Mitarbeiter und Ressourcen zuweisen"
                  placeholder="Mitarbeiter auswählen..."
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option.email}
                    {...getTagProps({ index })}
                    size="small"
                  />
                ))
              }
            />

            {/* Beschreibung */}
            <TextField
              fullWidth
              label="Beschreibung"
              multiline
              rows={6}
              value={eventForm.notes}
              onChange={(e) => setEventForm({ ...eventForm, notes: e.target.value })}
            />

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mt: 2 }}>
              {/* Löschen Button links - nur bei bestehenden Terminen */}
              {editingEvent && (
                <Button
                  variant="outlined"
                  color="error"
                  size="large"
                  onClick={async () => {
                    if (!editingEvent) return;
                    if (window.confirm('Möchten Sie diesen Termin wirklich löschen?')) {
                      try {
                        await calendarEventsApi.delete(editingEvent.id);
                        setEvents(events.filter(e => e.id !== editingEvent.id));
                        setNewEventDialogOpen(false);
                        setEditingEvent(null);
                      } catch (err) {
                        console.error('Error deleting event:', err);
                        setError('Fehler beim Löschen des Termins');
                      }
                    }
                  }}
                >
                  Löschen
                </Button>
              )}

              {/* Rechte Buttons */}
              <Box sx={{ display: 'flex', gap: 2, ml: 'auto' }}>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => {
                    setNewEventDialogOpen(false);
                    setEditingEvent(null);
                  }}
                >
                  Abbrechen
                </Button>
                <Button
                  variant="contained"
                  size="large"
                  onClick={async () => {
                    try {
                      if (editingEvent) {
                        // Update existing event
                        await calendarEventsApi.update(editingEvent.id, {
                          title: eventForm.title,
                          project_id: parseInt(eventForm.project_id),
                          start_time: eventForm.start_time,
                          end_time: eventForm.end_time,
                          resource_id: eventForm.resource_id || 1,
                          resource_type: eventForm.resource_type || 'employee',
                          notes: eventForm.notes,
                        });
                        setEvents(events.map(e => e.id === editingEvent.id ? {
                          ...editingEvent,
                          title: eventForm.title,
                          project_id: parseInt(eventForm.project_id),
                          start_time: eventForm.start_time,
                          end_time: eventForm.end_time,
                          notes: eventForm.notes,
                        } : e));
                      } else {
                        // Create new event
                        const newEvent = await calendarEventsApi.create({
                          title: eventForm.title,
                          project_id: parseInt(eventForm.project_id),
                          start_time: eventForm.start_time,
                          end_time: eventForm.end_time,
                          resource_id: eventForm.resource_id || 1,
                          resource_type: eventForm.resource_type || 'employee',
                          notes: eventForm.notes,
                        });
                        setEvents([...events, newEvent]);
                      }
                      setNewEventDialogOpen(false);
                      setEditingEvent(null);
                      setEventForm({
                        title: '',
                        project_id: '',
                        start_time: '',
                        end_time: '',
                        resource_id: 0,
                        resource_type: 'employee',
                        employee_ids: [],
                        notes: '',
                      });
                    } catch (err) {
                      console.error('Error saving event:', err);
                      setError('Fehler beim Speichern des Termins');
                    }
                  }}
                >
                  Übernehmen
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Drawer>

      {/* Einstellungen Dialog - Nach Hero ERP Screenshots */}
      <Drawer
        anchor="right"
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        PaperProps={{
          sx: {
            width: 600,
            maxWidth: '100%',
          }
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 500 }}>
              Einstellungen bearbeiten
            </Typography>
            <IconButton onClick={() => setSettingsOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Planungszeitraum */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Planungszeitraum beim Öffnen der Plantafel
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Ansicht</InputLabel>
                <Select value="week" label="Ansicht">
                  <MenuItem value="week">Kalenderwoche</MenuItem>
                  <MenuItem value="month">Monat</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Tageszeiten */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Tageszeiten
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Von"
                  type="time"
                  defaultValue="06:00"
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  fullWidth
                  label="Bis"
                  type="time"
                  defaultValue="16:00"
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            </Box>

            {/* Sichtbare Wochentage */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Sichtbare Wochentage
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'].map((day) => (
                  <FormControlLabel
                    key={day}
                    control={<Checkbox defaultChecked />}
                    label={day}
                    sx={{ minWidth: '45%' }}
                  />
                ))}
              </Box>
            </Box>

            {/* Farben zuweisen nach */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Farben zuweisen nach
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Farbschema</InputLabel>
                <Select defaultValue="category" label="Farbschema">
                  <MenuItem value="category">Kategorie</MenuItem>
                  <MenuItem value="project">Projekt</MenuItem>
                  <MenuItem value="priority">Priorität</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Ressourcen - Reihenfolge */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Ressourcen
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ flex: 1, fontWeight: 500 }}>
                  Reihenfolge
                </Typography>
              </Box>

              {/* Ressourcen-Liste */}
              {resourceCategories.map((category, index) => (
                <Box key={category.id} sx={{ mb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
                    <Typography variant="body2">{category.name}</Typography>
                    <TextField
                      type="number"
                      size="small"
                      value={index + 1}
                      sx={{ width: 80 }}
                    />
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                size="large"
                onClick={() => setSettingsOpen(false)}
              >
                Abbrechen
              </Button>
              <Button
                variant="contained"
                size="large"
                onClick={() => {
                  // Einstellungen speichern
                  setSettingsOpen(false);
                }}
              >
                Übernehmen
              </Button>
            </Box>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
}

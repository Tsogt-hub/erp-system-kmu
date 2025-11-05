import { useState, useEffect } from 'react';
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
  Collapse,
  Drawer,
  IconButton,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TodayIcon from '@mui/icons-material/Today';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import RepeatIcon from '@mui/icons-material/Repeat';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import NoteIcon from '@mui/icons-material/Note';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import Tooltip from '@mui/material/Tooltip';
import { format, startOfWeek, addDays, addWeeks, startOfMonth, addMonths, startOfDay, isSameDay, parseISO, endOfDay, differenceInMinutes, addMinutes } from 'date-fns';
import { de } from 'date-fns/locale';
// Removed react-beautiful-dnd - using native HTML5 drag & drop instead
import { projectsApi, Project } from '../services/api/projects';
import { calendarEventsApi, CalendarEvent as ApiCalendarEvent, CreateCalendarEventData } from '../services/api/calendarEvents';
import { usersApi, User } from '../services/api/users';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import DownloadIcon from '@mui/icons-material/Download';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Menu from '@mui/material/Menu';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputAdornment from '@mui/material/InputAdornment';
import Chip from '@mui/material/Chip';
import Autocomplete from '@mui/material/Autocomplete';
import PeopleIcon from '@mui/icons-material/People';
import EditIcon from '@mui/icons-material/Edit';
import CategoryIcon from '@mui/icons-material/Category';
import WorkIcon from '@mui/icons-material/Work';
import SettingsIcon from '@mui/icons-material/Settings';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

interface CalendarEvent extends ApiCalendarEvent {
  resource_name?: string;
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

export default function PlanningScheduler() {
  const [currentDate, setCurrentDate] = useState(new Date());
  // Plantafel wird immer in Wochenansicht angezeigt
  const viewType: 'week' = 'week';
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [eventPanelOpen, setEventPanelOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [, setSelectedSlot] = useState<{ resourceId: number; day: Date; hour: number } | null>(null);
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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null);
  const [filters, setFilters] = useState({
    resourceTypes: [] as string[],
    projects: [] as number[],
    statuses: [] as string[],
    priorities: [] as string[],
  });
  const [showConflicts, setShowConflicts] = useState(true);
  const [showCapacity, setShowCapacity] = useState(true);

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
      ],
    },
    {
      id: 'tools',
      name: 'Werkzeug',
      expanded: true,
      color: CATEGORY_COLORS.tools,
      resources: [
        { id: 10, name: 'Messgerät Benning PV2', type: 'tool', category: 'tools' },
      ],
    },
  ]);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  // Immer 7 Tage (Woche) anzeigen
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Timeline-Einstellungen (Hero ERP Style: Nur ausgewählte Stunden anzeigen)
  const WORK_DAY_START = 6; // 06:00
  const WORK_DAY_END = 22; // 22:00
  const HOURS_PER_DAY = WORK_DAY_END - WORK_DAY_START;
  
  // Nur ausgewählte Stunden anzeigen wie bei Hero: 06, 09, 12, 15
  const displayedHours = [6, 9, 12, 15, 18];
  const timeSlots = displayedHours;

  useEffect(() => {
    loadProjects();
    loadEmployees();
  }, []);

  useEffect(() => {
    loadEvents();
  }, [currentDate]);

  const getDateRange = () => {
    const start = startOfDay(weekDays[0]);
    const end = endOfDay(weekDays[weekDays.length - 1]);
    return { start, end };
  };

  const loadProjects = async () => {
    try {
      const data = await projectsApi.getAll();
      setProjects(data);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const loadEmployees = async () => {
    try {
      const data = await usersApi.getAll();
      // Nur aktive Mitarbeiter laden
      setEmployees(data.filter(user => user.is_active));
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const { start, end } = getDateRange();
      
      const data = await calendarEventsApi.getAll({
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      });

      // Map events with resource names
      const eventsWithResourceNames = data.map((event) => ({
        ...event,
        resource_name: getAllResources().find((r) => r.id === event.resource_id)?.name || '',
      }));

      setEvents(eventsWithResourceNames);
    } catch (error: any) {
      console.error('Error loading events:', error);
      setError(error.response?.data?.error || 'Fehler beim Laden der Termine');
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    // Immer eine Woche zurück
    setCurrentDate(addWeeks(currentDate, -1));
  };

  const handleNext = () => {
    // Immer eine Woche vor
    setCurrentDate(addWeeks(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Kategorien sind jetzt immer erweitert - keine Toggle-Funktion mehr nötig

  const handleSlotClick = (resourceId: number, day: Date, hour: number) => {
    setSelectedSlot({ resourceId, day, hour });
    setEditingEvent(null);
    const resource = getAllResources().find((r) => r.id === resourceId);
    const dateStr = format(day, "yyyy-MM-dd'T'HH:mm");
    const endTime = new Date(day);
    endTime.setHours(hour + 3);
    setEventForm({
      title: '',
      project_id: '',
      start_time: dateStr,
      end_time: format(endTime, "yyyy-MM-dd'T'HH:mm"),
      resource_id: resourceId,
      resource_type: resource?.type || 'employee',
      notes: '',
      employee_ids: [],
    });
    setEventPanelOpen(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setEditingEvent(event);
    setSelectedSlot(null);
    setEventPanelOpen(true);
    setEventForm({
      title: event.title,
      project_id: event.project_id?.toString() || '',
      start_time: format(parseISO(event.start_time), "yyyy-MM-dd'T'HH:mm"),
      end_time: format(parseISO(event.end_time), "yyyy-MM-dd'T'HH:mm"),
      resource_id: event.resource_id,
      resource_type: event.resource_type,
      notes: event.notes || '',
      employee_ids: event.employees?.map(emp => emp.user_id) || [],
    });
    setEventPanelOpen(true);
  };

  const handleSaveEvent = async () => {
    if (!eventForm.title || !eventForm.start_time || !eventForm.end_time || !eventForm.resource_id) {
      setError('Bitte füllen Sie alle Pflichtfelder aus');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const eventData: CreateCalendarEventData = {
        title: eventForm.title,
        start_time: new Date(eventForm.start_time).toISOString(),
        end_time: new Date(eventForm.end_time).toISOString(),
        resource_id: eventForm.resource_id,
        resource_type: eventForm.resource_type,
        project_id: eventForm.project_id ? Number(eventForm.project_id) : undefined,
        notes: eventForm.notes || undefined,
        employee_ids: eventForm.employee_ids.length > 0 ? eventForm.employee_ids : undefined,
      };

      if (editingEvent) {
        await calendarEventsApi.update(editingEvent.id, eventData);
      } else {
        await calendarEventsApi.create(eventData);
      }

      await loadEvents();
      setEventPanelOpen(false);
      resetEventForm();
    } catch (error: any) {
      console.error('Error saving event:', error);
      setError(error.response?.data?.error || 'Fehler beim Speichern des Termins');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (!window.confirm('Möchten Sie diesen Termin wirklich löschen?')) {
      return;
    }

    try {
      setLoading(true);
      await calendarEventsApi.delete(eventId);
      await loadEvents();
    } catch (error: any) {
      console.error('Error deleting event:', error);
      setError(error.response?.data?.error || 'Fehler beim Löschen des Termins');
    } finally {
      setLoading(false);
    }
  };

  const resetEventForm = () => {
    setEventForm({
      title: '',
      project_id: '',
      start_time: '',
      end_time: '',
      resource_id: 0,
      resource_type: 'employee',
      notes: '',
      employee_ids: [],
    });
    setEditingEvent(null);
    setSelectedSlot(null);
  };

  const handleDragEnd = async (result: { draggableId: string; source: { droppableId: string; index: number }; destination: { droppableId: string; index: number } }) => {
    if (!result.destination) return;

    const eventId = parseInt(result.draggableId);
    const event = events.find((e) => e.id === eventId);
    if (!event) return;

    // Parse destination info from droppableId (format: "resource-{id}-day-{index}")
    const destParts = result.destination.droppableId.split('-');
    if (destParts.length < 4) return;
    
    const resourceId = parseInt(destParts[1]);
    const dayIndex = parseInt(destParts[3]);

    if (isNaN(resourceId) || isNaN(dayIndex)) return;

    const newDay = weekDays[dayIndex];
    const eventStart = parseISO(event.start_time);
    const eventEnd = parseISO(event.end_time);
    
    // Berechne die ursprüngliche Startzeit relativ zum Tag
    const originalDayStart = startOfDay(eventStart);
    const timeOffset = differenceInMinutes(eventStart, originalDayStart);
    
    // Neue Startzeit mit gleichem Zeitoffset
    const newStart = addMinutes(startOfDay(newDay), timeOffset);
    const duration = differenceInMinutes(eventEnd, eventStart);
    const newEnd = addMinutes(newStart, duration);
    
    // Wenn auf einen Zeitslot gezogen wird, berechne die genaue Zeit
    if (result.destination.index !== undefined && result.destination.index >= 0) {
      // Berechne die Zeit basierend auf der Drop-Position
      // Jeder Zeitslot ist 60 Minuten (1 Stunde)
      const hourSlot = WORK_DAY_START + result.destination.index;
      const newStartWithTime = addMinutes(startOfDay(newDay), hourSlot * 60);
      const newEndWithTime = addMinutes(newStartWithTime, duration);
      
      try {
        setLoading(true);
        await calendarEventsApi.update(eventId, {
          start_time: newStartWithTime.toISOString(),
          end_time: newEndWithTime.toISOString(),
          resource_id: resourceId,
        });
        await loadEvents();
      } catch (error: any) {
        console.error('Error updating event:', error);
        setError(error.response?.data?.error || 'Fehler beim Verschieben des Termins');
      } finally {
        setLoading(false);
      }
    } else {
      // Fallback: Verwende die ursprüngliche Zeitlogik
      try {
        setLoading(true);
        await calendarEventsApi.update(eventId, {
          start_time: newStart.toISOString(),
          end_time: newEnd.toISOString(),
          resource_id: resourceId,
        });
        await loadEvents();
      } catch (error: any) {
        console.error('Error updating event:', error);
        setError(error.response?.data?.error || 'Fehler beim Verschieben des Termins');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Titel', 'Beschreibung', 'Startzeit', 'Endzeit', 'Ressource', 'Projekt', 'Typ'].join(','),
      ...events.map((event) =>
        [
          `"${event.title}"`,
          `"${event.description || ''}"`,
          event.start_time,
          event.end_time,
          `"${event.resource_name || ''}"`,
          `"${event.project_name || ''}"`,
          event.resource_type,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `plantafel-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFilteredEvents = () => {
    let filtered = events;

    if (searchTerm) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.resourceTypes.length > 0) {
      filtered = filtered.filter((event) => filters.resourceTypes.includes(event.resource_type));
    }

    if (filters.projects.length > 0) {
      filtered = filtered.filter((event) => event.project_id && filters.projects.includes(event.project_id));
    }

    if (filters.statuses.length > 0) {
      filtered = filtered.filter((event) => event.status && filters.statuses.includes(event.status));
    }

    if (filters.priorities.length > 0) {
      filtered = filtered.filter((event) => event.priority && filters.priorities.includes(event.priority));
    }

    return filtered;
  };

  // Timeline Helper-Funktionen
  const getEventsForResourceAndDay = (resourceId: number, day: Date) => {
    const filteredEvents = getFilteredEvents();
    const dayStart = startOfDay(day);
    const dayEnd = endOfDay(day);
    
    return filteredEvents.filter((event) => {
      const eventStart = parseISO(event.start_time);
      const eventEnd = parseISO(event.end_time);
      return (
        event.resource_id === resourceId &&
        eventStart <= dayEnd &&
        eventEnd >= dayStart
      );
    });
  };

  // Berechnet die Position eines Events auf der Timeline (in Prozent)
  const getEventPosition = (eventStart: Date, day: Date) => {
    const dayStart = startOfDay(day);
    dayStart.setHours(WORK_DAY_START, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(WORK_DAY_END, 0, 0, 0);
    
    const totalMinutes = differenceInMinutes(dayEnd, dayStart);
    const eventMinutes = differenceInMinutes(eventStart, dayStart);
    
    return Math.max(0, Math.min(100, (eventMinutes / totalMinutes) * 100));
  };

  // Berechnet die Breite eines Events auf der Timeline (in Prozent)
  const getEventWidth = (eventStart: Date, eventEnd: Date, day: Date) => {
    const dayStart = startOfDay(day);
    dayStart.setHours(WORK_DAY_START, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(WORK_DAY_END, 0, 0, 0);
    
    const totalMinutes = differenceInMinutes(dayEnd, dayStart);
    const eventStartMinutes = Math.max(0, differenceInMinutes(eventStart, dayStart));
    const eventEndMinutes = Math.min(totalMinutes, differenceInMinutes(eventEnd, dayStart));
    const eventDuration = Math.max(0, eventEndMinutes - eventStartMinutes);
    
    return Math.max(2, (eventDuration / totalMinutes) * 100); // Min 2% für Sichtbarkeit
  };

  // Holt die Farbe für eine Ressource basierend auf ihrer Kategorie
  const getResourceColor = (resource: Resource) => {
    const category = resourceCategories.find((cat) => 
      cat.resources.some((r) => r.id === resource.id)
    );
    return category?.color || DEFAULT_EVENT_COLOR;
  };

  // Prüft ob ein Event wiederkehrend ist
  const isRecurringEvent = (event: CalendarEvent) => {
    return !!event.recurrence_rule && event.recurrence_rule.length > 0;
  };

  // Prüft ob ein Tag heute ist
  const isToday = (day: Date) => {
    return isSameDay(day, new Date());
  };

  // Konflikt-Erkennung: Prüft ob Events sich überschneiden
  const checkEventConflicts = (resourceId: number, day: Date) => {
    const dayEvents = getEventsForResourceAndDay(resourceId, day);
    const conflicts: Array<{ event1: CalendarEvent; event2: CalendarEvent }> = [];

    for (let i = 0; i < dayEvents.length; i++) {
      for (let j = i + 1; j < dayEvents.length; j++) {
        const event1 = dayEvents[i];
        const event2 = dayEvents[j];
        const start1 = parseISO(event1.start_time);
        const end1 = parseISO(event1.end_time);
        const start2 = parseISO(event2.start_time);
        const end2 = parseISO(event2.end_time);

        // Prüfe Überschneidung
        if (
          (start1 < end2 && end1 > start2) ||
          (start2 < end1 && end2 > start1)
        ) {
          conflicts.push({ event1, event2 });
        }
      }
    }

    return conflicts;
  };

  // Berechnet Kapazität für eine Ressource an einem Tag
  const getResourceCapacity = (resourceId: number, day: Date) => {
    const dayEvents = getEventsForResourceAndDay(resourceId, day);
    const dayStart = startOfDay(day);
    dayStart.setHours(WORK_DAY_START, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(WORK_DAY_END, 0, 0, 0);
    
    const totalMinutes = differenceInMinutes(dayEnd, dayStart);
    let bookedMinutes = 0;

    dayEvents.forEach((event) => {
      const eventStart = parseISO(event.start_time);
      const eventEnd = parseISO(event.end_time);
      const eventStartMinutes = Math.max(0, differenceInMinutes(eventStart, dayStart));
      const eventEndMinutes = Math.min(totalMinutes, differenceInMinutes(eventEnd, dayStart));
      bookedMinutes += Math.max(0, eventEndMinutes - eventStartMinutes);
    });

    const capacityPercent = (bookedMinutes / totalMinutes) * 100;
    return {
      booked: bookedMinutes,
      total: totalMinutes,
      free: totalMinutes - bookedMinutes,
      percent: capacityPercent,
      isOverloaded: capacityPercent > 100,
    };
  };

  // Prioritäts-Farben
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'critical': return '#D32F2F'; // Rot
      case 'high': return '#F57C00'; // Orange
      case 'medium': return '#1976D2'; // Blau
      case 'low': return '#388E3C'; // Grün
      default: return '#757575'; // Grau
    }
  };

  // Status-Farben
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed': return '#4CAF50'; // Grün
      case 'in_progress': return '#2196F3'; // Blau
      case 'cancelled': return '#757575'; // Grau
      case 'planned': return '#FF9800'; // Orange
      default: return '#757575'; // Grau
    }
  };

  // Status-Icons
  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon sx={{ fontSize: 14 }} />;
      case 'in_progress': return <PlayArrowIcon sx={{ fontSize: 14 }} />;
      case 'cancelled': return <CancelIcon sx={{ fontSize: 14 }} />;
      default: return null;
    }
  };

  const getAllResources = () => {
    return resourceCategories.flatMap((cat) => cat.resources);
  };

  const getDateHeader = () => {
    // Immer Wochenformat anzeigen
    return `${format(weekDays[0], 'd', { locale: de })} – ${format(weekDays[6], 'd. MMM yyyy', { locale: de })} KW${format(weekDays[0], 'w', { locale: de })}`;
  };

  return (
    <Box>
      {/* Hero ERP Style Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        {/* Navigation links */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button 
            size="small"
            startIcon={<ChevronLeftIcon />} 
            onClick={handlePrevious}
            sx={{ 
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.875rem',
              color: 'rgba(0, 0, 0, 0.7)',
              minWidth: 'auto',
            }}
          >
            Heute
          </Button>
          <Typography sx={{ fontSize: '0.875rem', color: 'rgba(0, 0, 0, 0.5)' }}>›</Typography>
          <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>Datum</Typography>
        </Box>
        
        {/* Center: Date Range */}
        <Typography variant="h6" sx={{ 
          fontWeight: 600,
          letterSpacing: '-0.02em',
          color: '#000000',
          fontSize: '1.125rem',
        }}>
          {getDateHeader()}
        </Typography>

        {/* Right: Action Buttons */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<CategoryIcon />}
            sx={{ 
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 500,
              borderColor: 'rgba(0, 0, 0, 0.12)',
              color: 'rgba(0, 0, 0, 0.7)',
              fontSize: '0.875rem',
              '&:hover': {
                borderColor: 'rgba(0, 122, 255, 0.3)',
                background: 'rgba(0, 122, 255, 0.04)',
              }
            }}
          >
            Kategorie
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<WorkIcon />}
            sx={{ 
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 500,
              borderColor: 'rgba(0, 0, 0, 0.12)',
              color: 'rgba(0, 0, 0, 0.7)',
              fontSize: '0.875rem',
              '&:hover': {
                borderColor: 'rgba(0, 122, 255, 0.3)',
                background: 'rgba(0, 122, 255, 0.04)',
              }
            }}
          >
            Gewerk
          </Button>
          <Button 
            variant="contained" 
            size="small"
            startIcon={<AddIcon />} 
            onClick={() => {
              resetEventForm();
              setEventPanelOpen(true);
            }}
            sx={{ 
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              background: '#007AFF',
              fontSize: '0.875rem',
              '&:hover': {
                background: '#0051D5',
              }
            }}
          >
            Neuer Termin
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<FileDownloadIcon />}
            endIcon={<FileUploadIcon />}
            onClick={handleExport}
            sx={{ 
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 500,
              borderColor: 'rgba(0, 0, 0, 0.12)',
              color: 'rgba(0, 0, 0, 0.7)',
              fontSize: '0.875rem',
              '&:hover': {
                borderColor: 'rgba(0, 122, 255, 0.3)',
                background: 'rgba(0, 122, 255, 0.04)',
              }
            }}
          >
            Import/Export
          </Button>
          <IconButton
            size="small"
            sx={{ 
              color: 'rgba(0, 0, 0, 0.6)',
              '&:hover': {
                color: '#007AFF',
                background: 'rgba(0, 122, 255, 0.08)',
              }
            }}
          >
            <SettingsIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <CircularProgress />
        </Box>
      )}

      <Paper sx={{ 
        p: 0,
        background: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid rgba(0, 0, 0, 0.08)',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden',
      }}>

        <Box sx={{ 
            display: 'flex', 
            border: '1px solid rgba(0, 0, 0, 0.08)', 
            borderRadius: '12px', 
            overflow: 'hidden',
            background: 'rgba(255, 255, 255, 0.5)',
          }}>
            {/* Linke Spalte: Ressourcen (Sticky) */}
            <Box
              sx={{
                width: 240,
                minWidth: 240,
                borderRight: '1px solid rgba(0, 0, 0, 0.08)',
                background: 'rgba(252, 252, 253, 0.88)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                position: 'sticky',
                left: 0,
                zIndex: 10,
                height: 'fit-content',
                maxHeight: 'calc(100vh - 300px)',
                overflowY: 'auto',
              }}
            >
              <Box
                sx={{
                  p: 1.5,
                  fontWeight: 600,
                  borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                  background: 'rgba(245, 245, 247, 0.9)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  position: 'sticky',
                  top: 0,
                  zIndex: 11,
                  letterSpacing: '-0.015em',
                  fontSize: '0.9375rem',
                }}
              >
                Ressourcen
              </Box>
              {resourceCategories.map((category) => (
                <Box key={category.id}>
                  <Box
                    sx={{
                      p: 1.5,
                      background: 'rgba(245, 245, 247, 0.95)',
                      borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 1,
                      fontWeight: 600,
                      fontSize: '0.8125rem',
                      letterSpacing: '-0.01em',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease-out',
                      '&:hover': {
                        background: 'rgba(240, 240, 242, 0.98)',
                        '& .edit-icon': {
                          opacity: 1,
                        }
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography sx={{ 
                        fontWeight: 600, 
                        fontSize: '0.8125rem',
                        color: 'rgba(0, 0, 0, 0.85)',
                      }}>
                        {category.name}
                      </Typography>
                    </Box>
                    <IconButton 
                      size="small" 
                      className="edit-icon"
                      sx={{ 
                        opacity: 0,
                        transition: 'all 0.2s ease-out',
                        padding: '4px',
                        '&:hover': {
                          background: 'rgba(0, 122, 255, 0.08)',
                          color: '#007AFF',
                        }
                      }}
                    >
                      <EditIcon sx={{ fontSize: '0.875rem' }} />
                    </IconButton>
                  </Box>
                  <Box>
                    {category.resources.map((resource) => {
                      return (
                        <Box
                          key={resource.id}
                          sx={{
                            p: 1.5,
                            pl: 4,
                            borderBottom: '1px solid rgba(0, 0, 0, 0.04)',
                            fontSize: '0.875rem',
                            background: 'rgba(255, 255, 255, 0.6)',
                            backdropFilter: 'blur(10px)',
                            WebkitBackdropFilter: 'blur(10px)',
                            transition: 'all 0.15s ease-out',
                            '&:hover': {
                              background: 'rgba(0, 122, 255, 0.06)',
                              transform: 'translateX(2px)',
                            },
                          }}
                        >
                          <Typography variant="body2" sx={{ 
                            fontWeight: 500,
                            letterSpacing: '-0.01em',
                          }}>
                            {resource.name}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Timeline-Bereich */}
            <Box sx={{ flex: 1, overflowX: 'auto', position: 'relative' }}>
              {/* Sticky Header: Zeit-Spalten */}
              <Box
                sx={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 9,
                  background: 'rgba(245, 245, 247, 0.95)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  borderBottom: '2px solid rgba(0, 0, 0, 0.08)',
                  display: 'flex',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                }}
              >
                {/* Spacer für Ressourcen-Spalte */}
                <Box sx={{ width: 0 }} />
                
                {/* Tage-Header */}
                {weekDays.map((day) => (
                  <Box
                    key={day.toISOString()}
                    sx={{
                      minWidth: 400, // Angepasst für Hero-Style (weniger Stunden)
                      flex: 1,
                      borderRight: '1px solid rgba(0, 0, 0, 0.08)',
                      p: 1,
                      background: 'transparent',
                      position: 'relative',
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="body2" sx={{ 
                      fontWeight: 600, 
                      textAlign: 'center',
                      letterSpacing: '-0.015em',
                      color: 'rgba(0, 0, 0, 0.85)',
                      fontSize: '0.8125rem',
                    }}>
                      {format(day, 'EEE.', { locale: de })}
                    </Typography>
                    <Typography variant="caption" sx={{ 
                      display: 'block', 
                      textAlign: 'center',
                      fontWeight: 400,
                      letterSpacing: '-0.01em',
                      color: 'rgba(0, 0, 0, 0.55)',
                      fontSize: '0.75rem',
                    }}>
                      {format(day, 'd.M.', { locale: de })}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Stunden-Markierungen (Sticky) */}
              <Box
                sx={{
                  position: 'sticky',
                  top: 50,
                  zIndex: 8,
                  background: 'rgba(255, 255, 255, 0.98)',
                  borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                  display: 'flex',
                  height: 28,
                }}
              >
                <Box sx={{ width: 0 }} />
                {weekDays.map((day) => (
                  <Box
                    key={day.toISOString()}
                    sx={{
                      minWidth: 400, // Konsistent mit Header
                      flex: 1,
                      borderRight: '1px solid rgba(0, 0, 0, 0.08)',
                      position: 'relative',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    {timeSlots.map((hour) => (
                      <Box
                        key={hour}
                        sx={{
                          flex: 1,
                          textAlign: 'center',
                          fontSize: '0.6875rem',
                          fontWeight: 500,
                          color: 'rgba(0, 0, 0, 0.5)',
                          pt: 0.5,
                          px: 0.5,
                          letterSpacing: '-0.01em',
                        }}
                      >
                        {hour.toString().padStart(2, '0')}
                      </Box>
                    ))}
                  </Box>
                ))}
              </Box>

              {/* Ressourcen-Zeilen mit Timeline */}
              {getAllResources().map((resource) => (
                <Box
                  key={resource.id}
                  sx={{
                    borderBottom: '1px solid rgba(0,0,0,0.08)',
                    minHeight: 80,
                    display: 'flex',
                  }}
                >
                  <Box sx={{ width: 0 }} />
                  
                  {weekDays.map((day, dayIndex) => {
                    const dayEvents = getEventsForResourceAndDay(resource.id, day);
                    const resourceColor = getResourceColor(resource);
                    const droppableId = `resource-${resource.id}-day-${dayIndex}`;

                    return (
                          <Box
                            key={day.toISOString()}
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.dataTransfer.dropEffect = 'move';
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              const data = e.dataTransfer.getData('application/json') || e.dataTransfer.getData('text/plain');
                              if (data) {
                                try {
                                  const dragData = JSON.parse(data);
                                  const eventId = dragData.eventId;
                                  const event = events.find((e) => e.id === eventId);
                                  if (event) {
                                    // Berechne neue Zeit basierend auf Drop-Position
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const x = e.clientX - rect.left;
                                    const percentage = (x / rect.width) * 100;
                                    const hourOffset = (percentage / 100) * HOURS_PER_DAY;
                                    const newHour = WORK_DAY_START + hourOffset;
                                    const newStart = new Date(day);
                                    newStart.setHours(Math.floor(newHour), (newHour % 1) * 60, 0, 0);
                                    const duration = differenceInMinutes(parseISO(event.end_time), parseISO(event.start_time));
                                    const newEnd = addMinutes(newStart, duration);
                                    
                                    handleDragEnd({
                                      draggableId: eventId.toString(),
                                      source: { droppableId: dragData.resourceId ? `resource-${dragData.resourceId}-day-${dragData.dayIndex}` : '', index: 0 },
                                      destination: { droppableId: droppableId, index: 0 },
                                    } as any);
                                  }
                                } catch (error) {
                                  console.error('Error parsing drag data:', error);
                                }
                              }
                            }}
                            sx={{
                              minWidth: 400, // Konsistent mit Header
                              flex: 1,
                              borderRight: '1px solid rgba(0,0,0,0.08)',
                              position: 'relative',
                              minHeight: 60,
                              backgroundColor: 'transparent',
                              cursor: 'pointer',
                              '&:hover': {
                                backgroundColor: 'rgba(0, 0, 0, 0.015)',
                              },
                            }}
                            onDoubleClick={() => {
                              const defaultHour = 9;
                              handleSlotClick(resource.id, day, defaultHour);
                            }}
                          >
                            {/* Beige Zeitabschnitte (z.B. Mittagspause) - Hero ERP Style */}
                            {dayIndex >= 2 && dayIndex <= 3 && (
                              <Box
                                sx={{
                                  position: 'absolute',
                                  left: '40%',
                                  right: 0,
                                  top: 0,
                                  bottom: 0,
                                  background: 'rgba(255, 248, 225, 0.8)',
                                  pointerEvents: 'none',
                                  zIndex: 0,
                                }}
                              />
                            )}
                            {/* Heute-Marker */}
                            {isToday(day) && (
                              <Box
                                sx={{
                                  position: 'absolute',
                                  left: 0,
                                  top: 0,
                                  bottom: 0,
                                  width: '2px',
                                  backgroundColor: '#2196F3',
                                  opacity: 0.5,
                                }}
                              />
                            )}

                            {/* Stunden-Grid-Linien - nur an angezeigten Stunden */}
                            {timeSlots.map((hour) => (
                              <Box
                                key={hour}
                                sx={{
                                  position: 'absolute',
                                  left: `${((hour - WORK_DAY_START) / HOURS_PER_DAY) * 100}%`,
                                  top: 0,
                                  bottom: 0,
                                  width: '1px',
                                  borderLeft: '1px solid rgba(0,0,0,0.06)',
                                  pointerEvents: 'none',
                                  zIndex: 1,
                                }}
                              />
                            ))}

                            {/* Konflikt-Warnungen */}
                            {showConflicts && (() => {
                              const conflicts = checkEventConflicts(resource.id, day);
                              return conflicts.length > 0 ? (
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: '3px',
                                    backgroundColor: '#F44336',
                                    zIndex: 100,
                                  }}
                                />
                              ) : null;
                            })()}

                            {/* Events - Proportional dargestellt */}
                            {dayEvents.map((event, eventIndex) => {
                              const eventStart = parseISO(event.start_time);
                              const eventEnd = parseISO(event.end_time);
                              const position = getEventPosition(eventStart, day);
                              const width = getEventWidth(eventStart, eventEnd, day);
                              const eventColor = event.color || resourceColor;
                              const isRecurring = isRecurringEvent(event);
                              const priorityColor = getPriorityColor(event.priority);
                              const statusColor = getStatusColor(event.status);
                              const statusIcon = getStatusIcon(event.status);
                              
                              // Prüfe ob Event in Konflikt steht
                              const conflicts = showConflicts ? checkEventConflicts(resource.id, day) : [];
                              const hasConflict = conflicts.some(
                                (c) => c.event1.id === event.id || c.event2.id === event.id
                              );

                              return (
                                <Box
                                  key={event.id}
                                  draggable
                                  onDragStart={(e) => {
                                    e.dataTransfer.effectAllowed = 'move';
                                    e.dataTransfer.setData('text/plain', JSON.stringify({
                                      eventId: event.id,
                                      resourceId: resource.id,
                                      dayIndex: dayIndex,
                                    }));
                                    e.dataTransfer.setData('application/json', JSON.stringify({
                                      eventId: event.id,
                                      resourceId: resource.id,
                                      dayIndex: dayIndex,
                                    }));
                                  }}
                                  onDoubleClick={(e) => {
                                    e.stopPropagation();
                                    handleEventClick(event);
                                  }}
                                  sx={{
                                    position: 'absolute',
                                    left: `${position}%`,
                                    width: `${width}%`,
                                    top: 4,
                                    bottom: 4,
                                    minWidth: '100px',
                                    backgroundColor: eventColor,
                                    color: '#FFFFFF',
                                    borderRadius: '4px',
                                    p: 0.75,
                                    cursor: 'grab',
                                    boxShadow: hasConflict
                                      ? '0 0 0 2px #F44336'
                                      : '0 2px 4px rgba(0,0,0,0.2)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    zIndex: hasConflict ? 5 : 1,
                                    borderLeft: event.priority === 'critical' || event.priority === 'high' 
                                      ? `3px solid ${priorityColor}`
                                      : 'none',
                                    '&:active': {
                                      cursor: 'grabbing',
                                      opacity: 0.7,
                                    },
                                    '&:hover': {
                                      boxShadow: hasConflict
                                        ? '0 0 0 3px #F44336'
                                        : '0 4px 8px rgba(0,0,0,0.3)',
                                      zIndex: 10,
                                    },
                                    userSelect: 'none',
                                    WebkitUserSelect: 'none',
                                    touchAction: 'none',
                                  }}
                                >
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, mb: 0.5 }}>
                                          {isRecurring && (
                                            <RepeatIcon sx={{ fontSize: 12, opacity: 0.9 }} />
                                          )}
                                          {statusIcon && (
                                            <Box sx={{ color: '#FFFFFF', display: 'flex', alignItems: 'center' }}>
                                              {statusIcon}
                                            </Box>
                                          )}
                                          {hasConflict && showConflicts && (
                                            <WarningIcon sx={{ fontSize: 12, color: '#FFFFFF' }} />
                                          )}
                                          <Typography
                                            variant="caption"
                                            sx={{
                                              fontWeight: 600,
                                              fontSize: '0.75rem',
                                              lineHeight: 1.2,
                                              flex: 1,
                                            }}
                                          >
                                            {event.title}
                                          </Typography>
                                          {event.priority === 'critical' && (
                                            <PriorityHighIcon sx={{ fontSize: 14, color: '#FFFFFF' }} />
                                          )}
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', mb: 0.5 }}>
                                          <Typography
                                            variant="caption"
                                            sx={{
                                              fontSize: '0.7rem',
                                              opacity: 0.9,
                                            }}
                                          >
                                            {format(eventStart, 'HH:mm')} - {format(eventEnd, 'HH:mm')}
                                          </Typography>
                                          {event.status && (
                                            <Chip
                                              label={event.status === 'planned' ? 'Geplant' : event.status === 'in_progress' ? 'Läuft' : event.status === 'completed' ? 'Fertig' : 'Storniert'}
                                              size="small"
                                              sx={{
                                                height: 16,
                                                fontSize: '0.65rem',
                                                backgroundColor: statusColor,
                                                color: '#FFFFFF',
                                                '& .MuiChip-label': {
                                                  px: 0.5,
                                                },
                                              }}
                                            />
                                          )}
                                          {event.priority && event.priority !== 'medium' && (
                                            <Chip
                                              label={event.priority === 'low' ? 'Niedrig' : event.priority === 'high' ? 'Hoch' : 'Kritisch'}
                                              size="small"
                                              sx={{
                                                height: 16,
                                                fontSize: '0.65rem',
                                                backgroundColor: priorityColor,
                                                color: '#FFFFFF',
                                                '& .MuiChip-label': {
                                                  px: 0.5,
                                                },
                                              }}
                                            />
                                          )}
                                        </Box>
                                        {event.project_name && (
                                          <Typography
                                            variant="caption"
                                            sx={{
                                              fontSize: '0.65rem',
                                              opacity: 0.8,
                                              overflow: 'hidden',
                                              textOverflow: 'ellipsis',
                                              whiteSpace: 'nowrap',
                                            }}
                                          >
                                            {event.project_name}
                                          </Typography>
                                        )}
                                        {event.travel_time && event.travel_time > 0 && (
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, mt: 0.25 }}>
                                            <AccessTimeIcon sx={{ fontSize: 10, opacity: 0.8 }} />
                                            <Typography variant="caption" sx={{ fontSize: '0.65rem', opacity: 0.8 }}>
                                              {event.travel_time} Min
                                            </Typography>
                                          </Box>
                                        )}
                                </Box>
                              );
                            })}
                          </Box>
                    );
                  })}
                </Box>
              ))}
            </Box>
          </Box>
      </Paper>

      {/* Event Sidebar Panel (Hero ERP Style) */}
      <Drawer
        anchor="right"
        open={eventPanelOpen}
        onClose={() => {
          setEventPanelOpen(false);
          resetEventForm();
        }}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 480 },
            maxWidth: '100vw',
          },
        }}
      >
        <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {editingEvent ? 'Termin bearbeiten' : 'Neuer Termin'}
            </Typography>
            <IconButton
              onClick={() => {
                setEventPanelOpen(false);
                resetEventForm();
              }}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          {/* Content - Hero ERP Style (vereinfacht) */}
          <Box sx={{ flex: 1, overflowY: 'auto', pr: 1 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {/* Titel */}
          <TextField
            fullWidth
            label="Titel *"
            value={eventForm.title}
            onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
            margin="normal"
            required
            sx={{ mb: 2 }}
          />
          
          {/* Ressource */}
          <FormControl fullWidth margin="normal">
            <InputLabel>Ressource *</InputLabel>
            <Select
              value={eventForm.resource_id}
              label="Ressource"
              onChange={(e) => {
                const resource = getAllResources().find((r) => r.id === Number(e.target.value));
                setEventForm({
                  ...eventForm,
                  resource_id: Number(e.target.value),
                  resource_type: resource?.type || 'employee',
                });
              }}
              required
            >
              {getAllResources().map((resource) => (
                <MenuItem key={resource.id} value={resource.id}>
                  {resource.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {/* Start- und Endzeit */}
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              type="datetime-local"
              label="Von *"
              value={eventForm.start_time}
              onChange={(e) => setEventForm({ ...eventForm, start_time: e.target.value })}
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              fullWidth
              type="datetime-local"
              label="Bis *"
              value={eventForm.end_time}
              onChange={(e) => setEventForm({ ...eventForm, end_time: e.target.value })}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Box>
          
          {/* Projekt */}
          <FormControl fullWidth margin="normal">
            <InputLabel>Projekt</InputLabel>
            <Select
              value={eventForm.project_id}
              label="Projekt"
              onChange={(e) => setEventForm({ ...eventForm, project_id: e.target.value })}
            >
              <MenuItem value="">Kein Projekt</MenuItem>
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id.toString()}>
                  {project.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {/* Mitarbeiter */}
          <FormControl fullWidth margin="normal">
            <Autocomplete
              multiple
              options={employees}
              getOptionLabel={(option) => `${option.first_name} ${option.last_name}`}
              value={employees.filter(emp => eventForm.employee_ids.includes(emp.id))}
              onChange={(_, newValue) => {
                setEventForm({
                  ...eventForm,
                  employee_ids: newValue.map(emp => emp.id),
                });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Mitarbeiter"
                  placeholder="Mitarbeiter auswählen..."
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <InputAdornment position="start">
                          <PeopleIcon />
                        </InputAdornment>
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option.id}
                    label={`${option.first_name} ${option.last_name}`}
                    size="small"
                  />
                ))
              }
            />
          </FormControl>
          
          {/* Notizen */}
          <TextField
            fullWidth
            label="Notizen"
            value={eventForm.notes}
            onChange={(e) => setEventForm({ ...eventForm, notes: e.target.value })}
            margin="normal"
            multiline
            rows={3}
            placeholder="Interne Notizen zum Termin..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <NoteIcon />
                </InputAdornment>
              ),
            }}
          />
          </Box>
          
          {/* Footer Actions */}
          <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid rgba(0,0,0,0.12)', display: 'flex', gap: 2, justifyContent: 'space-between' }}>
            <Box>
              {editingEvent && (
                <Button
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => {
                    handleDeleteEvent(editingEvent.id);
                    setEventPanelOpen(false);
                  }}
                  variant="outlined"
                >
                  Löschen
                </Button>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                onClick={() => {
                  setEventPanelOpen(false);
                  resetEventForm();
                }}
                variant="outlined"
              >
                Abbrechen
              </Button>
              <Button
                variant="contained"
                onClick={handleSaveEvent}
                disabled={!eventForm.title || !eventForm.start_time || !eventForm.end_time || !eventForm.resource_id || loading}
              >
                {editingEvent ? 'Speichern' : 'Erstellen'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
}

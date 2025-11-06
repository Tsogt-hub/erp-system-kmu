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
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Timeline-Einstellungen (Hero ERP Style: Nur ausgewählte Stunden anzeigen)
  const WORK_DAY_START = 6; // 06:00
  const WORK_DAY_END = 22; // 22:00
  const displayedHours = [6, 9, 12, 15];

  // Helper: Get all resources flattened
  const getAllResources = () => {
    return resourceCategories.flatMap(cat =>
      cat.expanded ? cat.resources : []
    );
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
  const goToPreviousWeek = () => setCurrentDate(addWeeks(currentDate, -1));
  const goToNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

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

  const handleDrop = (e: React.DragEvent, resourceId: number, day: Date) => {
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

    setEvents(prev =>
      prev.map(ev => (ev.id === eventId ? updatedEvent : ev))
    );
  };

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // ROW HEIGHT - Alle Zeilen müssen gleich hoch sein
  const ROW_HEIGHT = 48; // px

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f5f5f5' }}>
      {/* HEADER */}
      <Box sx={{ p: 2, bgcolor: 'white', borderBottom: '1px solid #e0e0e0' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          {/* Navigation */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Kalenderwoche</InputLabel>
              <Select value="week" label="Kalenderwoche">
                <MenuItem value="week">Kalenderwoche</MenuItem>
              </Select>
            </FormControl>
            <IconButton onClick={goToPreviousWeek} size="small">
              <ChevronLeftIcon />
            </IconButton>
            <Button onClick={goToToday} variant="outlined" size="small">
              Heute
            </Button>
            <IconButton onClick={goToNextWeek} size="small">
              <ChevronRightIcon />
            </IconButton>
            <Typography sx={{ ml: 2 }}>›</Typography>
            <Typography>Datum</Typography>
          </Box>

          {/* Week Display */}
          <Typography variant="h6">
            {format(weekDays[0], 'd', { locale: de })} – {format(weekDays[6], 'd. MMM. yyyy', { locale: de })} KW{format(currentDate, 'I')}
          </Typography>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button startIcon={<CategoryIcon />} variant="outlined" size="small">
              Kategorie
            </Button>
            <Button startIcon={<WorkIcon />} variant="outlined" size="small">
              Gewerk
            </Button>
            <Button startIcon={<AddIcon />} variant="contained" size="small">
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
            <IconButton size="small">
              <SettingsIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* MAIN CONTENT */}
      <Box sx={{ flex: 1, overflow: 'hidden', p: 2 }}>
        <Paper sx={{ height: '100%', overflow: 'visible', display: 'flex' }}>
          {/* RESOURCES SIDEBAR */}
          <Box
            sx={{
              width: 240,
              borderRight: '1px solid #e0e0e0',
              overflow: 'auto',
              bgcolor: 'white',
            }}
          >
            {/* Sidebar Header */}
            <Box
              sx={{
                height: ROW_HEIGHT,
                display: 'flex',
                alignItems: 'center',
                px: 2,
                fontWeight: 600,
                borderBottom: '1px solid #e0e0e0',
                bgcolor: '#fafafa',
              }}
            >
              Ressourcen
            </Box>

            {/* Categories & Resources */}
            {resourceCategories.map((category) => (
              <Box key={category.id}>
                {/* Category Header */}
                <Box
                  onClick={() => toggleCategory(category.id)}
                  sx={{
                    height: ROW_HEIGHT,
                    display: 'flex',
                    alignItems: 'center',
                    px: 2,
                    cursor: 'pointer',
                    bgcolor: '#fff',
                    borderBottom: '1px solid #e0e0e0',
                    '&:hover': { bgcolor: '#f5f5f5' },
                  }}
                >
                  <Typography sx={{ flex: 1, fontWeight: 500 }}>{category.name}</Typography>
                  <IconButton size="small">
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small">
                    {category.expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </Box>

                {/* Resources */}
                <Collapse in={category.expanded}>
                  {category.resources.map((resource) => (
                    <Box
                      key={resource.id}
                      sx={{
                        height: ROW_HEIGHT,
                        display: 'flex',
                        alignItems: 'center',
                        px: 3,
                        borderBottom: '1px solid #e0e0e0',
                        bgcolor: 'white',
                      }}
                    >
                      <Typography variant="body2">{resource.name}</Typography>
                    </Box>
                  ))}
                </Collapse>
              </Box>
            ))}
          </Box>

          {/* TIMELINE */}
          <Box sx={{ flex: 1, overflow: 'auto', bgcolor: 'yellow', p: 4 }}>
            <div style={{ background: 'red', color: 'white', padding: '40px', fontSize: '24px', fontWeight: 'bold' }}>
              🔴 TEST: IF YOU SEE THIS, THE TIMELINE CONTAINER WORKS!
            </div>
            
            <div style={{ background: 'blue', color: 'white', padding: '40px', fontSize: '24px', fontWeight: 'bold', marginTop: '20px' }}>
              🔵 TEST 2: SECOND BOX
            </div>
            
            <div style={{ background: 'green', color: 'white', padding: '40px', fontSize: '24px', fontWeight: 'bold', marginTop: '20px' }}>
              🟢 TEST 3: THIRD BOX
            </div>
          </Box>
        </Paper>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ position: 'fixed', top: 80, right: 20, zIndex: 9999 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
}

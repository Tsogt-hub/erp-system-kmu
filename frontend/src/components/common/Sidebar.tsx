import { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Box,
  Collapse,
  IconButton,
  Tooltip,
  Avatar,
  useTheme,
  alpha,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

// SF Symbols-Style Icons
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import SolarPowerOutlinedIcon from '@mui/icons-material/SolarPowerOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MenuIcon from '@mui/icons-material/Menu';
import ListAltIcon from '@mui/icons-material/ListAlt';
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import EuroOutlinedIcon from '@mui/icons-material/EuroOutlined';
import WarehouseOutlinedIcon from '@mui/icons-material/WarehouseOutlined';
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import IndeterminateCheckBoxOutlinedIcon from '@mui/icons-material/IndeterminateCheckBoxOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import TimelineOutlinedIcon from '@mui/icons-material/TimelineOutlined';
import ViewKanbanOutlinedIcon from '@mui/icons-material/ViewKanbanOutlined';

interface SidebarProps {
  drawerWidth: number;
  isOpen: boolean;
  onToggle: () => void;
}

interface MenuCategory {
  title: string;
  icon?: React.ReactNode;
  items: MenuItem[];
}

interface MenuItem {
  text: string;
  icon?: React.ReactNode;
  path?: string;
  badge?: number;
  children?: MenuItem[];
}

const menuCategories: MenuCategory[] = [
  {
    title: 'MEINE UMGEBUNG',
    icon: <DashboardOutlinedIcon />,
    items: [
      { text: 'Startseite', icon: <HomeOutlinedIcon />, path: '/' },
      { text: 'Aufgaben', icon: <CheckCircleOutlineIcon />, path: '/tasks' },
      { text: 'Kalender', icon: <CalendarMonthOutlinedIcon />, path: '/calendar' },
      { text: 'Meine Arbeitszeiten', icon: <AccessTimeOutlinedIcon />, path: '/time-tracking' },
      { text: 'Zeiterfassung', icon: <AccessTimeOutlinedIcon />, path: '/timesheets' },
      { text: 'Verkauf', icon: <TrendingUpOutlinedIcon />, path: '/sales' },
    ],
  },
  {
    title: 'PLANUNG',
    icon: <EventNoteOutlinedIcon />,
    items: [
      { text: 'Plantafel', icon: <EventNoteOutlinedIcon />, path: '/planning/scheduler' },
    ],
  },
  {
    title: 'CRM',
    icon: <PeopleAltOutlinedIcon />,
    items: [
      { text: 'Kontakte', icon: <PeopleAltOutlinedIcon />, path: '/crm?tab=contacts' },
      { text: 'Unternehmen', icon: <BusinessOutlinedIcon />, path: '/crm?tab=companies' },
    ],
  },
  {
    title: 'PROJEKTE',
    icon: <AccountTreeOutlinedIcon />,
    items: [
      { text: 'Übersicht', icon: <AccountTreeOutlinedIcon />, path: '/projects' },
      { text: 'Meine Projekte', icon: <FolderOpenOutlinedIcon />, path: '/projects?filter=my' },
      { text: '☀️ PV', icon: <SolarPowerOutlinedIcon />, path: '/kanban-boards/gewerk/pv' },
      { text: '🏢 Gewerbe', icon: <BusinessOutlinedIcon />, path: '/kanban-boards/gewerk/gewerbe' },
      { text: '🔁 Service', icon: <BuildOutlinedIcon />, path: '/kanban-boards/gewerk/service' },
    ],
  },
  {
    title: 'VERWALTUNG',
    icon: <ReceiptLongOutlinedIcon />,
    items: [
      { text: 'Angebote', icon: <DescriptionOutlinedIcon />, path: '/offers' },
      { text: 'Rechnungen', icon: <ReceiptLongOutlinedIcon />, path: '/invoices' },
      { text: 'Verkaufsaufträge', icon: <TrendingUpOutlinedIcon />, path: '/sales-orders' },
      { text: 'Einkaufsbestellungen', icon: <Inventory2OutlinedIcon />, path: '/purchase-orders' },
    ],
  },
  {
    title: 'ARTIKELSTAMM',
    icon: <ListAltIcon />,
    items: [
      { text: 'Artikel', icon: <InventoryOutlinedIcon />, path: '/articles' },
      { text: 'Leistungen', icon: <BuildOutlinedIcon />, path: '/services' },
      { text: 'Verkaufspreise', icon: <EuroOutlinedIcon />, path: '/sales-prices' },
    ],
  },
  {
    title: 'LAGER',
    icon: <WarehouseOutlinedIcon />,
    items: [
      { text: 'Lagerartikel', icon: <Inventory2OutlinedIcon />, path: '/inventory' },
      { text: 'Einbuchungen', icon: <AddBoxOutlinedIcon />, path: '/inventory/incoming' },
      { text: 'Ausbuchungen', icon: <IndeterminateCheckBoxOutlinedIcon />, path: '/inventory/outgoing' },
      { text: 'Lagerbuch', icon: <MenuBookOutlinedIcon />, path: '/inventory/log' },
      { text: 'Anlagenverwaltung', icon: <BusinessOutlinedIcon />, path: '/assets' },
    ],
  },
  {
    title: 'MANAGEMENT',
    icon: <SettingsOutlinedIcon />,
    items: [
      { text: 'Dashboard', icon: <DashboardOutlinedIcon />, path: '/' },
      { text: 'Benutzer', icon: <PersonOutlineIcon />, path: '/users' },
      { text: 'Einstellungen', icon: <SettingsOutlinedIcon />, path: '/settings' },
    ],
  },
  {
    title: 'GOVERNANCE',
    icon: <SecurityOutlinedIcon />,
    items: [
      { text: 'Data Quality', icon: <InsightsOutlinedIcon />, path: '/governance/data-quality' },
      { text: 'Audit Logs', icon: <TimelineOutlinedIcon />, path: '/governance/audit-logs' },
    ],
  },
];


export default function Sidebar({ drawerWidth, isOpen, onToggle }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    'MEINE UMGEBUNG': true,
    'PLANUNG': true,
    'CRM': false,
    'PROJEKTE': true,
    'VERWALTUNG': false,
    'ARTIKELSTAMM': false,
    'LAGER': false,
    'MANAGEMENT': false,
    'GOVERNANCE': true,
  });

  const handleCategoryClick = (categoryTitle: string) => {
    if (categoryTitle !== 'PLANUNG') {
      setOpenCategories((prev) => ({
        ...prev,
        [categoryTitle]: !prev[categoryTitle],
      }));
    }
  };

  const handleMenuClick = (item: MenuItem, categoryTitle: string) => {
    if (item.children) {
      const key = `${categoryTitle}-${item.text}`;
      setOpenMenus((prev) => ({
        ...prev,
        [key]: !prev[key],
      }));
    } else if (item.path) {
      navigate(item.path);
    }
  };

  const isMenuItemSelected = (item: MenuItem): boolean => {
    if (item.path) {
      const pathMatch = location.pathname === item.path;
      const queryMatch = item.path?.includes('?') && 
        location.pathname + location.search === item.path;
      return pathMatch || queryMatch;
    }
    if (item.children) {
      return item.children.some((child) => {
        const childPath = child.path?.split('?')[0];
        const pathMatch = location.pathname === childPath;
        const queryMatch = child.path?.includes('?') && 
          location.pathname + location.search === child.path;
        return pathMatch || queryMatch;
      });
    }
    return false;
  };

  const renderMenuItem = (item: MenuItem, categoryTitle: string, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isSelected = isMenuItemSelected(item);
    const menuKey = `${categoryTitle}-${item.text}`;
    const menuItemOpen = openMenus[menuKey] || false;

    const menuButton = (
      <ListItemButton
        onClick={() => handleMenuClick(item, categoryTitle)}
        selected={isSelected && !hasChildren}
        sx={{
          borderRadius: '10px',
          my: 0.3,
          mx: 0.75,
          px: isOpen ? 1.5 : 1,
          minHeight: 34,
          transition: 'all 0.2s cubic-bezier(0.32, 0.72, 0, 1)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            borderRadius: '10px',
            background: 'transparent',
            transition: 'background 0.2s ease',
          },
          '&.Mui-selected': {
            background: isDarkMode
              ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.25)} 0%, ${alpha(theme.palette.primary.main, 0.15)} 100%)`
              : 'linear-gradient(135deg, rgba(0, 122, 255, 0.15) 0%, rgba(0, 122, 255, 0.08) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: isDarkMode
              ? `0.5px solid ${alpha(theme.palette.primary.main, 0.4)}`
              : '0.5px solid rgba(0, 122, 255, 0.25)',
            color: theme.palette.primary.main,
            fontWeight: 600,
            boxShadow: isDarkMode
              ? `0 2px 8px ${alpha(theme.palette.primary.main, 0.25)}, inset 0 0.5px 0 rgba(255, 255, 255, 0.1)`
              : `0 2px 8px rgba(0, 122, 255, 0.15), inset 0 0.5px 0 rgba(255, 255, 255, 0.6), inset 0 -0.5px 0 rgba(0, 0, 0, 0.05)`,
            '&:hover': {
              background: isDarkMode
                ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.3)} 0%, ${alpha(theme.palette.primary.main, 0.2)} 100%)`
                : 'linear-gradient(135deg, rgba(0, 122, 255, 0.18) 0%, rgba(0, 122, 255, 0.10) 100%)',
              transform: 'translateX(2px)',
            },
            '&::before': {
              background: isDarkMode
                ? `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, transparent 100%)`
                : 'linear-gradient(90deg, rgba(0, 122, 255, 0.1) 0%, transparent 100%)',
            },
          },
          '&:hover': {
            background: isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
            transform: 'translateX(2px)',
            '&::before': {
              background: isDarkMode
                ? 'linear-gradient(90deg, rgba(255, 255, 255, 0.03) 0%, transparent 100%)'
                : 'linear-gradient(90deg, rgba(0, 0, 0, 0.02) 0%, transparent 100%)',
            },
          },
          '&:active': {
            transform: 'scale(0.98)',
            background: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
          },
          justifyContent: isOpen ? 'flex-start' : 'center',
        }}
      >
        {item.icon && (
          <ListItemIcon 
            sx={{ 
              color: isSelected 
                ? theme.palette.primary.main 
                : (isDarkMode ? 'rgba(248, 250, 252, 0.7)' : 'rgba(60, 60, 67, 0.7)'),
              minWidth: isOpen ? 30 : 'auto',
              justifyContent: 'center',
              '& .MuiSvgIcon-root': {
                fontSize: '1.1rem',
                strokeWidth: isSelected ? 1.5 : 1,
                transition: 'all 0.2s ease',
              }
            }}
          >
            {item.icon}
          </ListItemIcon>
        )}
        {isOpen && (
          <>
            <ListItemText 
              primary={item.text}
              sx={{ 
                ml: 0.5,
                '& .MuiTypography-root': { 
                  fontSize: '0.8125rem',
                  fontWeight: isSelected ? 600 : 500,
                  letterSpacing: '-0.01em',
                  color: isSelected 
                    ? theme.palette.primary.main 
                    : (isDarkMode ? 'rgba(248, 250, 252, 0.85)' : 'rgba(29, 29, 31, 0.85)'),
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                },
              }}
            />
            {hasChildren && (
              menuItemOpen 
                ? <ExpandLessIcon sx={{ fontSize: '0.95rem', color: isDarkMode ? 'rgba(248, 250, 252, 0.5)' : 'rgba(60, 60, 67, 0.5)' }} /> 
                : <ExpandMoreIcon sx={{ fontSize: '0.95rem', color: isDarkMode ? 'rgba(248, 250, 252, 0.5)' : 'rgba(60, 60, 67, 0.5)' }} />
            )}
          </>
        )}
      </ListItemButton>
    );

    return (
      <Box key={`${categoryTitle}-${item.text}`}>
        {isOpen ? (
          menuButton
        ) : (
          <Tooltip title={item.text} placement="right" arrow>
            {menuButton}
          </Tooltip>
        )}
        {hasChildren && isOpen && (
          <Collapse in={menuItemOpen} timeout={200} unmountOnExit>
            <List component="div" disablePadding sx={{ pl: 1.5 }}>
              {item.children!.map((child) => renderMenuItem(child, categoryTitle, level + 1))}
            </List>
          </Collapse>
        )}
      </Box>
    );
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          // Frosted Glass - Dark/Light Mode aware
          background: isDarkMode 
            ? 'linear-gradient(180deg, rgba(14, 14, 21, 0.98) 0%, rgba(10, 10, 15, 0.99) 100%)'
            : 'linear-gradient(180deg, rgba(255, 255, 255, 0.85) 0%, rgba(251, 251, 253, 0.78) 100%)',
          backdropFilter: 'blur(80px) saturate(200%)',
          WebkitBackdropFilter: 'blur(80px) saturate(200%)',
          border: 'none',
          borderRight: isDarkMode 
            ? '1px solid rgba(255, 255, 255, 0.06)'
            : '0.5px solid rgba(0, 0, 0, 0.08)',
          boxShadow: isDarkMode 
            ? '4px 0 24px rgba(0, 0, 0, 0.3)'
            : `inset -1px 0 0 rgba(255, 255, 255, 0.5), 6px 0 32px rgba(0, 0, 0, 0.04), 2px 0 8px rgba(0, 0, 0, 0.02)`,
          transition: 'width 0.4s cubic-bezier(0.32, 0.72, 0, 1)',
          overflowX: 'hidden',
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
            margin: '4px 0',
          },
          '&::-webkit-scrollbar-thumb': {
            background: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
            borderRadius: '3px',
            '&:hover': {
              background: isDarkMode ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.25)',
            },
          },
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: isOpen ? 'space-between' : 'center',
          minHeight: 64,
          background: isDarkMode
            ? 'linear-gradient(180deg, rgba(20, 20, 31, 0.95) 0%, rgba(14, 14, 21, 0.8) 100%)'
            : 'linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.8) 100%)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          borderBottom: isDarkMode
            ? '1px solid rgba(255, 255, 255, 0.06)'
            : '0.5px solid rgba(0, 0, 0, 0.06)',
          boxShadow: isDarkMode
            ? 'inset 0 -0.5px 0 rgba(255, 255, 255, 0.04)'
            : 'inset 0 -0.5px 0 rgba(0, 0, 0, 0.04)',
          position: 'relative',
        }}
      >
        {isOpen ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Avatar
                sx={{
                  width: 34,
                  height: 34,
                  background: 'linear-gradient(135deg, #0071E3 0%, #5AC8FA 100%)',
                  boxShadow: '0 2px 12px rgba(0, 113, 227, 0.35)',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                }}
              >
                E
              </Avatar>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontSize: '1.125rem',
                  letterSpacing: '-0.02em',
                  background: 'linear-gradient(135deg, #0071E3 0%, #5856D6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                }}
              >
                Elite ERP
              </Typography>
            </Box>
            <IconButton
              onClick={onToggle}
              size="small"
              sx={{
                width: 30,
                height: 30,
                background: isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: isDarkMode ? '0.5px solid rgba(255, 255, 255, 0.1)' : '0.5px solid rgba(0, 0, 0, 0.06)',
                '&:hover': {
                  background: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                  transform: 'scale(1.05)',
                },
                '&:active': {
                  transform: 'scale(0.95)',
                },
                transition: 'all 0.2s cubic-bezier(0.32, 0.72, 0, 1)',
              }}
            >
              <MenuIcon sx={{ fontSize: '1rem', color: isDarkMode ? 'rgba(248, 250, 252, 0.7)' : 'rgba(60, 60, 67, 0.7)' }} />
            </IconButton>
          </>
        ) : (
          <IconButton
            onClick={onToggle}
            size="small"
            sx={{
              width: 36,
              height: 36,
              background: isDarkMode 
                ? alpha(theme.palette.primary.main, 0.15) 
                : 'rgba(0, 113, 227, 0.08)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: isDarkMode
                ? `0.5px solid ${alpha(theme.palette.primary.main, 0.3)}`
                : '0.5px solid rgba(0, 113, 227, 0.15)',
              boxShadow: isDarkMode
                ? `0 1px 3px ${alpha(theme.palette.primary.main, 0.2)}`
                : '0 1px 3px rgba(0, 113, 227, 0.1)',
              '&:hover': {
                background: isDarkMode 
                  ? alpha(theme.palette.primary.main, 0.25)
                  : 'rgba(0, 113, 227, 0.14)',
                transform: 'scale(1.05)',
              },
              '&:active': {
                transform: 'scale(0.95)',
              },
              transition: 'all 0.2s cubic-bezier(0.32, 0.72, 0, 1)',
            }}
          >
            <MenuIcon sx={{ fontSize: '1rem', color: theme.palette.primary.main }} />
          </IconButton>
        )}
      </Box>

      {/* Menu Categories */}
      <List sx={{ px: 0.5, py: 1.5 }}>
        {menuCategories.map((category) => (
          <Box key={category.title}>
            {category.title !== 'PLANUNG' ? (
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleCategoryClick(category.title)}
                  sx={{
                    borderRadius: '8px',
                    my: 0.25,
                    mx: 0.75,
                    px: isOpen ? 1.5 : 1,
                    minHeight: 30,
                    background: 'transparent',
                    '&:hover': {
                      background: isDarkMode ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
                    },
                    '&:active': {
                      transform: 'scale(0.99)',
                    },
                    transition: 'all 0.15s ease',
                    justifyContent: isOpen ? 'flex-start' : 'center',
                  }}
                >
                  {category.icon && (
                    <ListItemIcon sx={{ 
                      minWidth: isOpen ? 28 : 'auto', 
                      color: isDarkMode ? alpha(theme.palette.primary.light, 0.9) : 'rgba(0, 122, 255, 0.8)', 
                      '& .MuiSvgIcon-root': {
                        fontSize: '0.95rem',
                      }
                    }}>
                      {category.icon}
                    </ListItemIcon>
                  )}
                  {isOpen && (
                    <>
                      <ListItemText
                        primary={category.title}
                        sx={{
                          ml: 0.25,
                          '& .MuiTypography-root': {
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            letterSpacing: '0.06em',
                            color: isDarkMode ? 'rgba(248, 250, 252, 0.55)' : 'rgba(60, 60, 67, 0.55)',
                            textTransform: 'uppercase',
                            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                          },
                        }}
                      />
                      {openCategories[category.title] ? (
                        <ExpandLessIcon sx={{ fontSize: '0.85rem', color: isDarkMode ? 'rgba(248, 250, 252, 0.35)' : 'rgba(60, 60, 67, 0.35)' }} />
                      ) : (
                        <ExpandMoreIcon sx={{ fontSize: '0.85rem', color: isDarkMode ? 'rgba(248, 250, 252, 0.35)' : 'rgba(60, 60, 67, 0.35)' }} />
                      )}
                    </>
                  )}
                </ListItemButton>
              </ListItem>
            ) : (
              <Box
                sx={{
                  px: isOpen ? 2.25 : 1.5,
                  py: 0.75,
                  mx: 0.75,
                  my: 0.25,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isOpen ? 'flex-start' : 'center',
                }}
              >
                {category.icon && (
                  <Box sx={{ 
                    color: isDarkMode ? alpha(theme.palette.primary.light, 0.9) : 'rgba(0, 122, 255, 0.8)', 
                    mr: isOpen ? 0.75 : 0, 
                    display: 'flex', 
                    '& .MuiSvgIcon-root': {
                      fontSize: '0.95rem',
                    }
                  }}>
                    {category.icon}
                  </Box>
                )}
                {isOpen && (
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      color: isDarkMode ? 'rgba(248, 250, 252, 0.55)' : 'rgba(60, 60, 67, 0.55)',
                      textTransform: 'uppercase',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                    }}
                  >
                    {category.title}
                  </Typography>
                )}
              </Box>
            )}

            <Collapse in={openCategories[category.title] || category.title === 'PLANUNG'} timeout={200} unmountOnExit>
              <List component="div" disablePadding>
                {category.items.map((item) => renderMenuItem(item, category.title))}
              </List>
            </Collapse>

            <Divider 
              sx={{ 
                my: 1.25, 
                mx: 2, 
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
              }} 
            />
          </Box>
        ))}
      </List>
    </Drawer>
  );
}

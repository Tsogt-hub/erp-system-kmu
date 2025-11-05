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
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

// SF Symbols-Style Icons (perfekte Apple-Ästhetik)
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
      { text: 'Alle Projekte', icon: <AccountTreeOutlinedIcon />, path: '/projects' },
      { text: 'Meine Projekte', icon: <FolderOpenOutlinedIcon />, path: '/projects?filter=my' },
      {
        text: 'PV',
        icon: <SolarPowerOutlinedIcon />,
        children: [
          { text: 'Alle PV-Projekte', path: '/pipelines/pv' },
          { text: 'Kanban Board', path: '/pipelines/pv/kanban?view=kanban' },
          { text: 'Neu - Erstkontakt', path: '/pipelines/pv/new_contact' },
          { text: 'Angebotserstellung', path: '/pipelines/pv/offer_creation' },
          { text: 'In Umsetzung', path: '/pipelines/pv/in_implementation' },
        ],
      },
      {
        text: '🆕 Leads',
        icon: <TrendingUpIcon />,
        children: [
          { text: 'Alle Leads', path: '/pipelines/leads' },
          { text: 'Kanban Board', path: '/pipelines/leads/kanban?view=kanban' },
        ],
      },
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
      { text: 'Dashboard', icon: <DashboardOutlinedIcon />, path: '/dashboard' },
      { text: 'Benutzer', icon: <PersonOutlineIcon />, path: '/users' },
      { text: 'Einstellungen', icon: <SettingsOutlinedIcon />, path: '/settings' },
    ],
  },
];

export default function Sidebar({ drawerWidth, isOpen, onToggle }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
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
          mx: 1.5,
          px: isOpen ? 1.5 : 1.2,
          minHeight: 40,
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          '&.Mui-selected': {
            background: 'linear-gradient(135deg, rgba(10, 132, 255, 0.14) 0%, rgba(10, 132, 255, 0.10) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '0.5px solid rgba(10, 132, 255, 0.25)',
            color: '#0A84FF',
            fontWeight: 600,
            boxShadow: '0 2px 12px rgba(0, 122, 255, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, rgba(10, 132, 255, 0.18) 0%, rgba(10, 132, 255, 0.14) 100%)',
              transform: 'translateX(3px)',
            },
          },
          '&:hover': {
            background: 'rgba(0, 0, 0, 0.04)',
            transform: 'translateX(2px)',
          },
          '&:active': {
            transform: 'scale(0.98)',
          },
          justifyContent: isOpen ? 'flex-start' : 'center',
        }}
      >
        {item.icon && (
          <ListItemIcon 
            sx={{ 
              color: isSelected ? '#0A84FF' : '#3C3C43',
              minWidth: isOpen ? 36 : 'auto',
              justifyContent: 'center',
              fontSize: '1.3rem',
              '& .MuiSvgIcon-root': {
                fontSize: '1.3rem',
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
                  fontSize: level === 0 ? '0.9375rem' : '0.875rem',
                  fontWeight: level === 0 && isSelected ? 600 : 500,
                  letterSpacing: '-0.01em',
                  color: isSelected ? '#0A84FF' : '#1D1D1F',
                },
              }}
            />
            {hasChildren && (
              menuItemOpen ? <ExpandLessIcon sx={{ fontSize: '1.1rem', color: '#3C3C43' }} /> : <ExpandMoreIcon sx={{ fontSize: '1.1rem', color: '#3C3C43' }} />
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
          <Collapse in={menuItemOpen} timeout="auto" unmountOnExit>
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
          background: 'rgba(252, 252, 253, 0.88)',
          backdropFilter: 'blur(50px) saturate(160%)',
          WebkitBackdropFilter: 'blur(50px) saturate(160%)',
          border: 'none',
          borderRight: '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: '0 0 0 0.5px rgba(255, 255, 255, 0.6) inset, 8px 0 32px rgba(0, 0, 0, 0.05)',
          transition: 'width 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          overflowX: 'hidden',
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(0, 0, 0, 0.18)',
            borderRadius: '10px',
            transition: 'background 0.2s',
            '&:hover': {
              background: 'rgba(0, 0, 0, 0.30)',
            },
          },
        },
      }}
    >
      {/* macOS Tahoe Header */}
      <Box
        sx={{
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: isOpen ? 'space-between' : 'center',
          minHeight: 72,
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.7) 0%, rgba(250, 250, 250, 0.6) 100%)',
          backdropFilter: 'blur(30px) saturate(150%)',
          WebkitBackdropFilter: 'blur(30px) saturate(150%)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: '0 1px 0 rgba(255, 255, 255, 0.6) inset',
        }}
      >
        {isOpen && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              sx={{
                width: 38,
                height: 38,
                background: 'linear-gradient(135deg, #0A84FF 0%, #64D2FF 100%)',
                boxShadow: '0 3px 10px rgba(10, 132, 255, 0.30)',
                fontSize: '1rem',
                fontWeight: 700,
              }}
            >
              E
            </Avatar>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: '1.25rem',
                letterSpacing: '-0.03em',
                background: 'linear-gradient(135deg, #0A84FF 0%, #BF5AF2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Elite ERP
            </Typography>
          </Box>
        )}
        <IconButton
          onClick={onToggle}
          size="small"
          sx={{
            width: 34,
            height: 34,
            background: 'linear-gradient(135deg, rgba(10, 132, 255, 0.12) 0%, rgba(10, 132, 255, 0.08) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(10, 132, 255, 0.20)',
            boxShadow: '0 2px 8px rgba(0, 122, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
            '&:hover': {
              background: 'linear-gradient(135deg, rgba(10, 132, 255, 0.18) 0%, rgba(10, 132, 255, 0.12) 100%)',
              transform: 'scale(1.06)',
              boxShadow: '0 4px 12px rgba(0, 122, 255, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
            },
            '&:active': {
              transform: 'scale(0.94)',
            },
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <MenuIcon sx={{ fontSize: '1.2rem', color: '#007AFF', fontWeight: 600 }} />
        </IconButton>
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
                    borderRadius: '10px',
                    my: 0.5,
                    mx: 1.5,
                    px: isOpen ? 1.5 : 1.2,
                    minHeight: 38,
                    background: 'rgba(0, 122, 255, 0.03)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(0, 122, 255, 0.08)',
                    '&:hover': {
                      background: 'rgba(0, 122, 255, 0.08)',
                      border: '1px solid rgba(0, 122, 255, 0.12)',
                      transform: 'translateX(2px)',
                    },
                    '&:active': {
                      transform: 'scale(0.98)',
                    },
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    justifyContent: isOpen ? 'flex-start' : 'center',
                  }}
                >
                  {category.icon && (
                    <ListItemIcon sx={{ 
                      minWidth: isOpen ? 36 : 'auto', 
                      color: '#007AFF', 
                      fontSize: '1.2rem',
                      '& .MuiSvgIcon-root': {
                        fontSize: '1.2rem',
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
                          ml: 0.5,
                          '& .MuiTypography-root': {
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            letterSpacing: '0.05em',
                            color: '#6E6E73',
                            textTransform: 'uppercase',
                          },
                        }}
                      />
                      {openCategories[category.title] ? (
                        <ExpandLessIcon sx={{ fontSize: '1rem', color: '#007AFF' }} />
                      ) : (
                        <ExpandMoreIcon sx={{ fontSize: '1rem', color: '#007AFF' }} />
                      )}
                    </>
                  )}
                </ListItemButton>
              </ListItem>
            ) : (
              <Box
                sx={{
                  px: isOpen ? 2.5 : 1.5,
                  py: 1.5,
                  mx: 1.5,
                  my: 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isOpen ? 'flex-start' : 'center',
                  background: 'rgba(0, 122, 255, 0.03)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '8px',
                  border: '1px solid rgba(0, 122, 255, 0.08)',
                }}
              >
                {category.icon && (
                  <Box sx={{ 
                    color: '#007AFF', 
                    mr: isOpen ? 1.5 : 0, 
                    display: 'flex', 
                    fontSize: '1.2rem',
                    '& .MuiSvgIcon-root': {
                      fontSize: '1.2rem',
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
                      letterSpacing: '0.05em',
                      color: '#6E6E73',
                      textTransform: 'uppercase',
                    }}
                  >
                    {category.title}
                  </Typography>
                )}
              </Box>
            )}

            <Collapse in={openCategories[category.title] || category.title === 'PLANUNG'} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {category.items.map((item) => renderMenuItem(item, category.title))}
              </List>
            </Collapse>

            <Divider 
              sx={{ 
                my: 1.8, 
                mx: 2.5, 
                borderColor: 'rgba(0, 0, 0, 0.08)',
                boxShadow: '0 1px 0 rgba(255, 255, 255, 0.6)',
              }} 
            />
          </Box>
        ))}
      </List>
    </Drawer>
  );
}

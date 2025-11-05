import { useState, useEffect } from 'react';
import {
  IconButton,
  Badge,
  Popover,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  Button,
  Chip,
} from '@mui/material';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { notificationsApi, Notification } from '../../services/api/notifications';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export default function NotificationBell() {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const open = Boolean(anchorEl);

  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
    
    // Polling alle 30 Sekunden
    const interval = setInterval(() => {
      loadUnreadCount();
      if (open) {
        loadNotifications();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [open]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationsApi.getAll(true);
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const count = await notificationsApi.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    loadNotifications();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await notificationsApi.markAsRead(notification.id);
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n))
      );
    }

    // Navigiere basierend auf related_type
    if (notification.related_type === 'project' && notification.related_id) {
      navigate(`/projects/${notification.related_id}`);
    }

    handleClose();
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationsApi.delete(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (notifications.find((n) => n.id === id && !n.is_read)) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
      >
        <Badge 
          badgeContent={unreadCount} 
          sx={{
            '& .MuiBadge-badge': {
              background: 'linear-gradient(135deg, #FF3B30 0%, #FF453A 100%)',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.625rem',
            }
          }}
        >
          <NotificationsRoundedIcon sx={{ color: '#0A84FF' }} />
        </Badge>
      </IconButton>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: { 
            width: 400, 
            maxHeight: 600,
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(40px) saturate(180%)',
            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            borderRadius: 3,
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 20px 80px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.5) inset',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.125rem', letterSpacing: '-0.022em' }}>
              Benachrichtigungen
            </Typography>
            {unreadCount > 0 && (
              <Button 
                size="small" 
                onClick={handleMarkAllAsRead}
                sx={{
                  color: '#0A84FF',
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  '&:hover': {
                    background: 'rgba(10, 132, 255, 0.08)',
                  }
                }}
              >
                Alle als gelesen
              </Button>
            )}
          </Box>
          <Divider sx={{ mb: 1 }} />
          {loading ? (
            <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
              Lädt...
            </Typography>
          ) : notifications.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
              Keine Benachrichtigungen
            </Typography>
          ) : (
            <List sx={{ maxHeight: 500, overflow: 'auto' }}>
              {notifications.map((notification) => (
                <ListItemButton
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    backgroundColor: notification.is_read ? 'transparent' : 'rgba(10, 132, 255, 0.08)',
                    borderRadius: 2,
                    '&:hover': {
                      backgroundColor: notification.is_read
                        ? 'rgba(0, 0, 0, 0.04)'
                        : 'rgba(10, 132, 255, 0.12)',
                    },
                    mb: 0.5,
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: notification.is_read ? 400 : 600 }}>
                          {notification.title}
                        </Typography>
                        {!notification.is_read && (
                          <Chip
                            label="Neu"
                            size="small"
                            sx={{ 
                              height: 18, 
                              fontSize: '0.65rem', 
                              ml: 1,
                              background: 'linear-gradient(135deg, #0A84FF 0%, #64D2FF 100%)',
                              color: '#FFFFFF',
                              fontWeight: 700,
                            }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                          {format(new Date(notification.created_at), 'dd.MM.yyyy HH:mm')}
                        </Typography>
                      </>
                    }
                  />
                </ListItemButton>
              ))}
            </List>
          )}
        </Box>
      </Popover>
    </>
  );
}






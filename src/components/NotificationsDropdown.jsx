import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { extractDataFromResponse } from '@/lib/apiHelper';
import { useLanguage } from '@/contexts/LanguageContext';
import { Bell, Check, CheckCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

export default function NotificationsDropdown() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    let interval = null;

    const fetchData = async () => {
      if (!isMounted) return;
      
      try {
        await Promise.all([
          fetchNotifications(),
          fetchUnreadCount()
        ]);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    // Initial fetch
    fetchData();

    // Poll for new notifications every 90 seconds (reduced frequency to prevent 429 errors)
    interval = setInterval(() => {
      if (!isMounted) return;
      
      fetchUnreadCount();
      if (isOpen) {
        fetchNotifications();
      }
    }, 90000); // 90 seconds

    return () => {
      isMounted = false;
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isOpen]); // Only re-run when isOpen changes

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // Use profile notifications endpoint to get user's personal notifications
      const response = await api.get('/notifications?limit=10');
      const data = extractDataFromResponse(response);
      
      // Backend returns: { success: true, data: { notifications: [...], unreadCount: 5 } }
      let notificationsList = [];
      let unreadCountFromResponse = 0;
      
      // Handle response structure: { success: true, data: { notifications: [], unreadCount: 5 } }
      if (data?.data) {
        if (data.data.notifications && Array.isArray(data.data.notifications)) {
          notificationsList = data.data.notifications;
          unreadCountFromResponse = data.data.unreadCount || 0;
        } else if (Array.isArray(data.data)) {
          notificationsList = data.data;
        }
      } else if (data?.notifications && Array.isArray(data.notifications)) {
        notificationsList = data.notifications;
        unreadCountFromResponse = data.unreadCount || 0;
      } else if (Array.isArray(data)) {
        notificationsList = data;
      }
      
      setNotifications(notificationsList);
      
      // Use unreadCount from response if available, otherwise calculate
      if (unreadCountFromResponse > 0 || (data?.data?.unreadCount !== undefined)) {
        setUnreadCount(data?.data?.unreadCount || unreadCountFromResponse);
      } else {
        // Calculate unread count - check recipients[0]?.read for profile notifications
        const unread = notificationsList.filter(n => {
          const recipient = n.recipients?.[0];
          return !recipient?.read && !n.read && !n.is_read;
        }).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      // Use lightweight unread count endpoint for polling
      const response = await api.get('/notifications/unread-count');
      const data = extractDataFromResponse(response);
      
      // Backend returns: { success: true, data: { unreadCount: 5 } }
      if (data?.data?.unreadCount !== undefined) {
        setUnreadCount(data.data.unreadCount);
      } else if (data?.unreadCount !== undefined) {
        setUnreadCount(data.unreadCount);
      } else {
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
      setUnreadCount(0); // Set to 0 on error
    }
  };

  const handleMarkAsRead = async (notificationId, e) => {
    e.stopPropagation();
    try {
      await api.post(`/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(notif => {
          if (notif.id === notificationId) {
            // Update recipients array if it exists
            const updatedRecipients = notif.recipients?.map(r => ({ ...r, read: true })) || [];
            return { 
              ...notif, 
              is_read: true, 
              read: true,
              recipients: updatedRecipients.length > 0 ? updatedRecipients : notif.recipients
            };
          }
          return notif;
        })
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async (e) => {
    e.stopPropagation();
    try {
      // Backend uses POST for read-all
      await api.post('/notifications/read-all');
      setNotifications(prev =>
        prev.map(notif => {
          // Update recipients array if it exists
          const updatedRecipients = notif.recipients?.map(r => ({ ...r, read: true })) || [];
          return { 
            ...notif, 
            is_read: true, 
            read: true,
            recipients: updatedRecipients.length > 0 ? updatedRecipients : notif.recipients
          };
        })
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    if (notification.action_url || notification.courseId) {
      const url = notification.action_url || (notification.courseId ? `/admin/courses/${notification.courseId}` : null);
      if (url) {
        navigate(url);
        setIsOpen(false);
      }
    }
    if (!notification.recipients?.[0]?.read && !notification.read && !notification.is_read) {
      handleMarkAsRead(notification.id, { stopPropagation: () => {} });
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order':
        return '📦';
      case 'prescription':
        return '💊';
      case 'booking':
        return '📅';
      case 'message':
        return '💬';
      default:
        return '🔔';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            fetchNotifications();
          }
        }}
        className="relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full text-xs flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black/20"
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`absolute ${language === 'ar' ? 'left-0' : 'right-0'} top-full mt-2 w-80 md:w-96 bg-card border rounded-lg shadow-xl z-50 max-h-[500px] flex flex-col backdrop-blur-sm`}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold">
                  {language === 'ar' ? 'الإشعارات' : 'Notifications'}
                </h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleMarkAllAsRead}
                      className="text-xs"
                    >
                      <CheckCheck className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Notifications List */}
              <div className="overflow-y-auto flex-1">
                {loading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>{language === 'ar' ? 'لا توجد إشعارات' : 'No notifications'}</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    <AnimatePresence>
                      {notifications.map((notification, index) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: language === 'ar' ? 20 : -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: language === 'ar' ? 20 : -20 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => handleNotificationClick(notification)}
                          className={`p-4 cursor-pointer transition-colors hover:bg-accent ${
                            !notification.recipients?.[0]?.read && !notification.read && !notification.is_read ? 'bg-primary/5' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="text-2xl flex-shrink-0">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className={`font-medium text-sm ${!notification.recipients?.[0]?.read && !notification.read && !notification.is_read ? 'font-bold' : ''}`}>
                                  {language === 'ar' 
                                    ? (notification.titleAr || notification.title || notification.messageAr || notification.message)
                                    : (notification.titleEn || notification.title || notification.messageEn || notification.message)}
                                </p>
                                {!notification.recipients?.[0]?.read && !notification.read && !notification.is_read && (
                                  <button
                                    onClick={(e) => handleMarkAsRead(notification.id, e)}
                                    className="flex-shrink-0 p-1 hover:bg-accent rounded"
                                  >
                                    <Check className="w-3 h-3 text-muted-foreground" />
                                  </button>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {language === 'ar'
                                  ? (notification.messageAr || notification.message || notification.descriptionAr || notification.description || '')
                                  : (notification.messageEn || notification.message || notification.descriptionEn || notification.description || '')}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {notification.createdAt
                                  ? format(new Date(notification.createdAt), 'PPp')
                                  : notification.created_at
                                  ? format(new Date(notification.created_at), 'PPp')
                                  : ''}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      navigate('/admin/notifications');
                      setIsOpen(false);
                    }}
                  >
                    {language === 'ar' ? 'عرض جميع الإشعارات' : 'View All Notifications'}
                  </Button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}




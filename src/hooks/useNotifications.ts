import { useCallback, useEffect, useState } from 'react';

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported('Notification' in window);
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported) return false;
    
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }, [isSupported]);

  const sendNotification = useCallback(({ title, body, icon, tag }: NotificationOptions) => {
    if (!isSupported || permission !== 'granted') {
      // Fallback: use mock notification sound or toast
      console.log('Notification:', title, body);
      return null;
    }

    try {
      const notification = new Notification(title, {
        body,
        icon: icon || '/favicon.ico',
        tag,
        badge: '/favicon.ico',
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto-close after 5 seconds
      setTimeout(() => notification.close(), 5000);

      return notification;
    } catch (error) {
      console.error('Failed to send notification:', error);
      return null;
    }
  }, [isSupported, permission]);

  const notifyNewMessage = useCallback((senderName: string, messagePreview: string) => {
    sendNotification({
      title: `New message from ${senderName}`,
      body: messagePreview.slice(0, 100) + (messagePreview.length > 100 ? '...' : ''),
      tag: 'new-message',
    });
  }, [sendNotification]);

  const notifyIncomingCall = useCallback((callerName: string, isVideo: boolean) => {
    sendNotification({
      title: `Incoming ${isVideo ? 'video' : 'voice'} call`,
      body: `${callerName} is calling you`,
      tag: 'incoming-call',
    });
  }, [sendNotification]);

  return {
    isSupported,
    permission,
    requestPermission,
    sendNotification,
    notifyNewMessage,
    notifyIncomingCall,
  };
}

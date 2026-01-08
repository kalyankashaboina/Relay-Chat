import { Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { useTranslate } from '@/hooks/useTranslate';

export function NetworkStatusBar() {
  const { translate } = useTranslate('en');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-4 py-2 text-sm font-medium',
        isOnline
          ? 'bg-status-online/10 text-status-online'
          : 'bg-status-offline/10 text-status-offline',
      )}
    >
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4" />
          <span>{translate('status.online')}</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          <span>{translate('status.offline')}</span>
        </>
      )}
    </div>
  );
}

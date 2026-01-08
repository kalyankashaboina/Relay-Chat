import { MessageStatus } from '@/types/chat';
import { cn } from '@/lib/utils';
import { Check, CheckCheck, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface MessageStatusIndicatorProps {
  status: MessageStatus;
  translate: (key: string) => string;
}

export function MessageStatusIndicator({ status, translate }: MessageStatusIndicatorProps) {
  const config: Record<
    MessageStatus,
    { icon: typeof Check; color: string; animate: boolean; tooltip: string }
  > = {
    pending: {
      icon: Loader2,
      color: 'text-muted-foreground',
      animate: true,
      tooltip: translate('status.pending'),
    },
    sent: {
      icon: Check,
      color: 'text-muted-foreground',
      animate: false,
      tooltip: translate('status.sent'),
    },
    delivered: {
      icon: CheckCheck,
      color: 'text-muted-foreground',
      animate: false,
      tooltip: translate('status.delivered'),
    },
    read: {
      icon: CheckCheck,
      color: 'text-primary',
      animate: false,
      tooltip: translate('status.read'),
    },
    failed: {
      icon: AlertCircle,
      color: 'text-destructive',
      animate: false,
      tooltip: translate('status.failed'),
    },
  };

  const { icon: Icon, color, animate, tooltip } = config[status];

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn('flex items-center', color)}>
            <Icon className={cn('h-3.5 w-3.5', animate && 'animate-spin')} />
          </div>
        </TooltipTrigger>
        <TooltipContent side="left" className="text-xs">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

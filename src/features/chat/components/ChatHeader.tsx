import { useCallback } from 'react';
import {
  Phone,
  Video,
  LogOut,
  Users,
  ArrowLeft,
  Search,
  MoreVertical,
  Timer,
  Shield,
  Image,
  Star,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EncryptionIndicator } from './EncryptionIndicator';
import { OnlineStatusBadge } from './OnlineStatusIndicator';
import { VanishModeToggle } from './VanishModeToggle';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSelector } from './LanguageSelector';
import { getInitials, getAvatarColor } from '@/shared/lib/chatUtils';
import { cn } from '@/lib/utils';
import type { Conversation } from '@/features/chat/types';

interface ChatHeaderProps {
  conversation: Conversation;
  isOnline: boolean;
  typingNames: string[];
  onBack: () => void;
  onSearch: () => void;
  onVanishToggle: (enabled: boolean, timer: number) => void;
  onAudioCall: () => void;
  onVideoCall: () => void;
  onViewContact: () => void;
  onViewStarred: () => void;
  onToggleEncryption: () => void;
  onOpenMediaGallery?: () => void;
  onMuteToggle: () => void;
  onArchiveToggle: () => void;
  onLogout: () => void;
  translate: (key: string) => string;
}

function ConversationAvatar({ conversation }: { conversation: Conversation }) {
  const displayName = conversation.isGroup ? conversation.groupName : conversation.user?.name;
  if (conversation.isGroup) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 text-sm font-semibold text-primary-foreground">
        <Users className="h-5 w-5" />
      </div>
    );
  }
  return (
    <div
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white',
        getAvatarColor(displayName || '')
      )}
    >
      {getInitials(displayName || '')}
    </div>
  );
}

function OnlineDot({ isOnline }: { isOnline: boolean }) {
  return (
    <span
      className={cn(
        'absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card',
        isOnline ? 'bg-green-500' : 'bg-muted'
      )}
    />
  );
}

function ConversationStatus({
  conversation,
  typingNames,
  translate,
}: {
  conversation: Conversation;
  typingNames: string[];
  translate: (k: string) => string;
}) {
  const isGroup = conversation.isGroup;
  const isUserOnline = isGroup
    ? conversation.users?.some((u) => u.isOnline)
    : conversation.user?.isOnline;
  const memberCount = isGroup ? conversation.users?.length : undefined;

  if (typingNames.length > 0) {
    const label =
      typingNames.length === 1
        ? `${typingNames[0]} ${translate('typing.indicator')}`
        : `${typingNames.join(', ')} ${translate('typing.multiple')}`;
    return <p className="truncate text-xs text-primary">{label}</p>;
  }
  if (isGroup)
    return (
      <p className="truncate text-xs text-muted-foreground">
        {memberCount} {translate('group.members')}
      </p>
    );
  return (
    <p
      className={cn('truncate text-xs', isUserOnline ? 'text-green-500' : 'text-muted-foreground')}
    >
      {isUserOnline ? translate('status.online') : translate('status.offline')}
    </p>
  );
}

export function ChatHeader({
  conversation,
  isOnline,
  typingNames,
  onBack,
  onSearch,
  onVanishToggle,
  onAudioCall,
  onVideoCall,
  onViewContact,
  onViewStarred,
  onToggleEncryption,
  onOpenMediaGallery,
  onLogout,
  translate,
}: ChatHeaderProps) {
  const isGroup = conversation.isGroup;
  const displayName = isGroup ? conversation.groupName : conversation.user?.name;
  const isUserOnline = isGroup
    ? conversation.users?.some((u) => u.isOnline)
    : conversation.user?.isOnline;

  const handleVanishOff = useCallback(
    () => onVanishToggle(!conversation.isVanishMode, 60),
    [conversation.isVanishMode, onVanishToggle]
  );

  return (
    <div className="safe-top flex flex-shrink-0 items-center justify-between border-b border-border bg-card px-2 py-3 sm:px-4">
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="touch-target flex-shrink-0 text-muted-foreground hover:text-foreground md:hidden"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="relative flex-shrink-0">
          <ConversationAvatar conversation={conversation} />
          {!isGroup && <OnlineDot isOnline={!!isUserOnline} />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-semibold text-foreground">{displayName}</h3>
            <EncryptionIndicator isEncrypted compact translate={translate} />
          </div>
          <ConversationStatus
            conversation={conversation}
            typingNames={typingNames}
            translate={translate}
          />
        </div>
      </div>

      <div className="flex flex-shrink-0 items-center gap-1">
        <div className="hidden sm:block">
          <OnlineStatusBadge isOnline={isOnline} />
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onSearch}
          className="hidden text-muted-foreground hover:text-foreground sm:flex"
          title={translate('action.search')}
        >
          <Search className="h-5 w-5" />
        </Button>
        <div className="hidden sm:block">
          <VanishModeToggle
            isEnabled={conversation.isVanishMode || false}
            timer={conversation.vanishTimer || 60}
            onToggle={onVanishToggle}
            translate={translate}
          />
        </div>
        {!isGroup && (
          <div className="hidden items-center gap-1 md:flex">
            <Button
              variant="ghost"
              size="icon"
              onClick={onAudioCall}
              className="touch-target text-muted-foreground hover:text-foreground"
              title={translate('action.call')}
            >
              <Phone className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onVideoCall}
              className="touch-target text-muted-foreground hover:text-foreground"
              title={translate('action.videoCall')}
            >
              <Video className="h-5 w-5" />
            </Button>
          </div>
        )}
        <div className="hidden sm:block">
          <ThemeToggle />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="touch-target text-muted-foreground hover:text-foreground"
            >
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="z-50 w-48 bg-popover">
            <DropdownMenuItem onClick={onSearch} className="sm:hidden">
              <Search className="mr-2 h-4 w-4" />
              {translate('action.search')}
            </DropdownMenuItem>
            {!isGroup && (
              <DropdownMenuItem onClick={onViewContact}>
                <User className="mr-2 h-4 w-4" />
                View Contact
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={onViewStarred}>
              <Star className="mr-2 h-4 w-4" />
              {translate('starred.title')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onToggleEncryption}>
              <Shield className="mr-2 h-4 w-4" />
              {translate('encryption.info')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleVanishOff}>
              <Timer className="mr-2 h-4 w-4" />
              {conversation.isVanishMode ? translate('vanish.turnOff') : translate('vanish.off')}
            </DropdownMenuItem>
            {onOpenMediaGallery && (
              <DropdownMenuItem onClick={onOpenMediaGallery}>
                <Image className="mr-2 h-4 w-4" />
                {translate('media.gallery')}
              </DropdownMenuItem>
            )}
            {!isGroup && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onAudioCall} className="md:hidden">
                  <Phone className="mr-2 h-4 w-4" />
                  {translate('action.call')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onVideoCall} className="md:hidden">
                  <Video className="mr-2 h-4 w-4" />
                  {translate('action.videoCall')}
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              {translate('action.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="hidden lg:block">
          <LanguageSelector />
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onLogout}
          className="touch-target hidden text-muted-foreground hover:text-destructive md:flex"
          title={translate('action.logout')}
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

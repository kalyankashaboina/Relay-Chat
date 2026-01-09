import { X, Mail, User as UserIcon, Camera, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

import { useAppSelector } from '@/store/hooks';

interface ProfileDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function ProfileDrawer({ open, onClose }: ProfileDrawerProps) {
  /**
   * SINGLE SOURCE OF TRUTH
   */
  const user = useAppSelector((state) => state.auth.user);

  // Safety: drawer should not explode during logout / refresh
  if (!user) {
    return (
      <Drawer open={open} onOpenChange={(v) => !v && onClose()}>
        <DrawerContent className="h-[50dvh] flex items-center justify-center">
          <p className="text-sm text-muted-foreground">User information unavailable</p>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Drawer open={open} onOpenChange={(v) => !v && onClose()}>
      <DrawerContent className="h-[90dvh]">
        {/* HEADER */}
        <DrawerHeader className="flex items-center justify-between">
          <DrawerTitle className="text-lg font-semibold">Profile</DrawerTitle>

          <button
            onClick={onClose}
            aria-label="Close profile"
            className="p-2 rounded-md hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </DrawerHeader>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-6">
          {/* AVATAR + NAME */}
          <section className="flex flex-col items-center text-center space-y-3">
            <div className="relative">
              <div
                className={cn(
                  'h-24 w-24 rounded-full flex items-center justify-center',
                  user.avatarUrl ? 'bg-muted' : 'bg-primary/10',
                )}
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.username}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <UserIcon className="h-10 w-10 text-primary" />
                )}
              </div>

              {/* Avatar change placeholder */}
              <button
                aria-label="Change avatar"
                disabled
                className={cn(
                  'absolute bottom-0 right-0 h-8 w-8 rounded-full',
                  'bg-muted text-muted-foreground flex items-center justify-center',
                  'cursor-not-allowed',
                )}
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>

            <div>
              <p className="text-base font-semibold">{user.username}</p>
              <p className="text-sm text-muted-foreground">Logged in user</p>
            </div>
          </section>

          <Separator />

          {/* ACCOUNT DETAILS */}
          <section className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Account details</h3>

            <div className="flex items-center gap-3 rounded-lg border p-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">Email</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border p-3">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">User ID</p>
                <p className="text-xs text-muted-foreground break-all">{user.id}</p>
              </div>
            </div>
          </section>

          <Separator />

          {/* ACTIONS (INTENTIONALLY DISABLED) */}
          <section className="space-y-3">
            <Button variant="outline" className="w-full" disabled>
              Edit profile (coming soon)
            </Button>

            <Button variant="outline" className="w-full" disabled>
              Change password (coming soon)
            </Button>
          </section>

          <p className="text-xs text-muted-foreground text-center">
            Profile editing will be enabled in a future update.
          </p>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

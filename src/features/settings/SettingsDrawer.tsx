import { X, Bell, Moon, Lock, LogOut, User } from 'lucide-react';
import { cn } from '@/lib/utils';

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';

import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface SettingsDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsDrawer({ open, onClose }: SettingsDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={(v) => !v && onClose()}>
      <DrawerContent className="h-[90dvh]">
        {/* HEADER */}
        <DrawerHeader className="flex items-center justify-between">
          <DrawerTitle className="text-lg font-semibold">Settings</DrawerTitle>
          <button
            onClick={onClose}
            aria-label="Close settings"
            className="p-2 rounded-md hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-6">
          {/* ACCOUNT */}
          <section className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Account</h3>

            <div className="flex items-center gap-3 rounded-lg border p-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">John Doe</p>
                <p className="text-xs text-muted-foreground">john@example.com</p>
              </div>
            </div>
          </section>

          <Separator />

          {/* NOTIFICATIONS */}
          <section className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Notifications</h3>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">Message alerts</span>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">Group mentions</span>
              </div>
              <Switch />
            </div>
          </section>

          <Separator />

          {/* APPEARANCE */}
          <section className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Appearance</h3>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Moon className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">Dark mode</span>
              </div>
              <Switch />
            </div>
          </section>

          <Separator />

          {/* SECURITY */}
          <section className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Security</h3>

            <button
              className={cn(
                'w-full flex items-center gap-3 rounded-lg border p-3 text-sm',
                'hover:bg-muted transition',
              )}
            >
              <Lock className="h-5 w-5 text-muted-foreground" />
              Change password
            </button>
          </section>

          <Separator />

          {/* LOGOUT (OPTIONAL SHORTCUT) */}
          <section>
            <Button
              variant="destructive"
              className="w-full gap-2"
              onClick={() => {
                // You can wire this later to real logout
                console.log('Logout clicked');
              }}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </section>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

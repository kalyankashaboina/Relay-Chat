import { ArrowLeft, Bell, Moon, Lock, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/auth/auth.thunks';

export default function SettingsPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex h-full w-full justify-center overflow-y-auto">
      <div className="w-full max-w-2xl px-6 py-8">
        {/* HEADER */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Settings</h1>
        </div>

        {/* CARD */}
        <div className="rounded-xl border bg-card p-6 space-y-6">
          {/* NOTIFICATIONS */}
          <section className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Notifications</h3>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">Message notifications</span>
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

            <Button variant="outline" className="w-full gap-2" disabled>
              <Lock className="h-4 w-4" />
              Change password (coming soon)
            </Button>
          </section>

          <Separator />

          {/* LOGOUT */}
          <Button variant="destructive" className="w-full gap-2" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}

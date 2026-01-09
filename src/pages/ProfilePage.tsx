import { ArrowLeft, Mail, User as UserIcon, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useAppSelector } from '@/store/hooks';

export default function ProfilePage() {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        User not available
      </div>
    );
  }

  return (
    <div className="flex h-full w-full justify-center overflow-y-auto">
      <div className="w-full max-w-2xl px-6 py-8">
        {/* HEADER */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Profile</h1>
        </div>

        {/* CARD */}
        <div className="rounded-xl border bg-card p-6 space-y-6">
          {/* AVATAR */}
          <div className="flex flex-col items-center text-center space-y-3">
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

            <div>
              <p className="text-lg font-semibold">{user.username}</p>
              <p className="text-sm text-muted-foreground">Logged-in account</p>
            </div>
          </div>

          <Separator />

          {/* DETAILS */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg border p-4">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border p-4">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">User ID</p>
                <p className="text-xs text-muted-foreground break-all">{user.id}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* ACTIONS (DISABLED FOR NOW) */}
          <div className="space-y-3">
            <Button className="w-full" variant="outline" disabled>
              Edit profile (coming soon)
            </Button>
            <Button className="w-full" variant="outline" disabled>
              Change password (coming soon)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

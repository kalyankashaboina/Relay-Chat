import { useGoogleLogin } from '@react-oauth/google';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { GOOGLE_CLIENT_ID } from '@/config';
import { useAppDispatch } from '@/store';
import { api } from '@/shared/api/client';
import { setUser } from '@/features/auth/authSlice';
import type { AuthUser } from '@/features/chat/types';

interface GoogleAuthResponse {
  success: boolean;
  data: AuthUser;
}
interface Props {
  label?: string;
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

// Separate component that uses the hook — only rendered when client ID exists
function GoogleLoginInner({ label }: { label: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleToken = async (token: string) => {
    setIsLoading(true);
    try {
      const res = await api.post<GoogleAuthResponse>('/auth/google', { idToken: token });
      dispatch(setUser(res.data));
      navigate('/');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e?.response?.data?.message ?? 'Google sign-in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const login = useGoogleLogin({
    onSuccess: (r) => {
      void handleToken(r.access_token);
    },
    onError: (err) => {
      if (err.error !== 'access_denied') toast.error('Google sign-in failed.');
      setIsLoading(false);
    },
    flow: 'implicit',
    scope: 'openid email profile',
  });

  return (
    <button
      type="button"
      onClick={() => {
        setIsLoading(true);
        login();
      }}
      disabled={isLoading}
      className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
      {isLoading ? 'Signing in…' : label}
    </button>
  );
}

// Shows "Coming soon" badge when Google OAuth is not configured — no crash, no broken layout
export function GoogleLoginButton({ label = 'Continue with Google' }: Props) {
  if (!GOOGLE_CLIENT_ID) {
    return (
      <div className="relative">
        <button
          type="button"
          disabled
          className="flex w-full cursor-not-allowed items-center justify-center gap-3 rounded-lg border border-border bg-card/50 px-4 py-2.5 text-sm font-medium text-muted-foreground opacity-60"
        >
          <GoogleIcon />
          {label}
        </button>
        <span className="absolute -right-1 -top-2 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground ring-1 ring-border">
          Coming soon
        </span>
      </div>
    );
  }
  // Only renders GoogleLoginInner (which calls useGoogleLogin) when clientId is set
  return <GoogleLoginInner label={label} />;
}

import { AuthUser } from '@/types/chat';

// Mock user database
const mockUsers: Record<string, { password: string; user: AuthUser }> = {
  'demo@example.com': {
    password: 'password123',
    user: {
      id: 'user-demo',
      email: 'demo@example.com',
      name: 'Demo User',
      avatar: '',
    },
  },
};

interface AuthResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

// Simulate login
export function mockLogin(email: string, password: string): Promise<AuthResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const record = mockUsers[email.toLowerCase()];
      
      if (!record) {
        resolve({ success: false, error: 'error.invalidCredentials' });
        return;
      }
      
      if (record.password !== password) {
        resolve({ success: false, error: 'error.invalidCredentials' });
        return;
      }
      
      resolve({ success: true, user: record.user });
    }, 800 + Math.random() * 700);
  });
}

// Simulate registration
export function mockRegister(
  name: string,
  email: string,
  password: string
): Promise<AuthResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (mockUsers[email.toLowerCase()]) {
        resolve({ success: false, error: 'error.emailExists' });
        return;
      }
      
      if (password.length < 8) {
        resolve({ success: false, error: 'error.weakPassword' });
        return;
      }
      
      const newUser: AuthUser = {
        id: `user-${Date.now()}`,
        email: email.toLowerCase(),
        name,
        avatar: '',
      };
      
      mockUsers[email.toLowerCase()] = { password, user: newUser };
      
      resolve({ success: true, user: newUser });
    }, 1000 + Math.random() * 500);
  });
}

// Simulate forgot password
export function mockForgotPassword(email: string): Promise<AuthResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Always succeed (in real app, would check if email exists)
      resolve({ success: true });
    }, 1200 + Math.random() * 800);
  });
}

// Simulate typing indicator
export function mockTypingIndicator(
  onTypingStart: () => void,
  onTypingEnd: () => void
): () => void {
  let timeout: NodeJS.Timeout;
  
  const startTyping = () => {
    // Random delay before "other user" starts typing
    timeout = setTimeout(() => {
      onTypingStart();
      
      // Type for 1-3 seconds
      timeout = setTimeout(() => {
        onTypingEnd();
      }, 1000 + Math.random() * 2000);
    }, 500 + Math.random() * 1000);
  };
  
  startTyping();
  
  return () => clearTimeout(timeout);
}

// Simulate call connection
export interface CallResult {
  success: boolean;
  error?: string;
}

export function mockInitiateCall(type: 'audio' | 'video'): Promise<CallResult> {
  return new Promise((resolve) => {
    // Simulate connection delay
    setTimeout(() => {
      // 90% success rate
      if (Math.random() > 0.1) {
        resolve({ success: true });
      } else {
        resolve({ success: false, error: 'Call failed. Please try again.' });
      }
    }, 2000 + Math.random() * 1000);
  });
}

export function mockEndCall(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 300);
  });
}

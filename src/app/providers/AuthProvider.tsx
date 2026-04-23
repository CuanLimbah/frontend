import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { api, type LoginPayload, type RegisterPayload } from '../lib/api';
import type { AuthResponse, User } from '../types';

const STORAGE_KEY = 'cuanlimbah.session';

interface StoredSession {
  accessToken: string;
  user: User;
}

interface AuthContextValue {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<AuthResponse>;
  register: (payload: RegisterPayload) => Promise<AuthResponse>;
  completeOAuthSession: (accessToken: string) => Promise<User>;
  refreshUser: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredSession(): StoredSession | null {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredSession;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function persistSession(session: StoredSession | null) {
  if (!session) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const storedSession = readStoredSession();
  const [user, setUser] = useState<User | null>(storedSession?.user ?? null);
  const [accessToken, setAccessToken] = useState<string | null>(
    storedSession?.accessToken ?? null,
  );
  const [isLoading, setIsLoading] = useState(true);

  const setSession = useCallback((session: StoredSession | null) => {
    setUser(session?.user ?? null);
    setAccessToken(session?.accessToken ?? null);
    persistSession(session);
  }, []);

  const logout = useCallback(() => {
    setSession(null);
  }, [setSession]);

  const refreshUser = useCallback(async () => {
    if (!accessToken) {
      return;
    }

    try {
      const currentUser = await api.getCurrentUser(accessToken);
      setSession({ accessToken, user: currentUser });
    } catch {
      setSession(null);
    }
  }, [accessToken, setSession]);

  const applyAuthResponse = useCallback(
    (response: AuthResponse) => {
      setSession({
        accessToken: response.accessToken,
        user: response.user,
      });

      return response;
    },
    [setSession],
  );

  const login = useCallback(
    async (payload: LoginPayload) => {
      const response = await api.login(payload);
      return applyAuthResponse(response);
    },
    [applyAuthResponse],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const response = await api.register(payload);
      return applyAuthResponse(response);
    },
    [applyAuthResponse],
  );

  const completeOAuthSession = useCallback(
    async (oauthAccessToken: string) => {
      const currentUser = await api.getCurrentUser(oauthAccessToken);
      setSession({
        accessToken: oauthAccessToken,
        user: currentUser,
      });
      return currentUser;
    },
    [setSession],
  );

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      if (!storedSession?.accessToken) {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const currentUser = await api.getCurrentUser(storedSession.accessToken);

        if (isMounted) {
          setSession({
            accessToken: storedSession.accessToken,
            user: currentUser,
          });
        }
      } catch {
        if (isMounted) {
          setSession(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void bootstrap();

    return () => {
      isMounted = false;
    };
  }, [setSession, storedSession?.accessToken]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      isLoading,
      isAuthenticated: Boolean(user && accessToken),
      login,
      register,
      completeOAuthSession,
      refreshUser,
      logout,
    }),
    [
      accessToken,
      completeOAuthSession,
      isLoading,
      login,
      logout,
      refreshUser,
      register,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth harus dipakai di dalam AuthProvider');
  }

  return context;
}

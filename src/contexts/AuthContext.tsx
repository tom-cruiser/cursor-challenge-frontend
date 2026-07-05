import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getDemoCredentials,
  isUsingMockAuth,
  login,
  loginWithOtp,
  logout,
  register,
  registerWithOtp,
  restoreSession,
  sendPhoneOtp,
} from "@/services/auth.service";
import type { AuthUser, LoginInput, PhoneLoginInput, RegisterInput, UserRole } from "@/types/auth";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  sessionReady: boolean;
  sessionError: string | null;
  useMockAuth: boolean;
  login: (input: LoginInput, role: UserRole) => Promise<AuthUser>;
  loginWithPhone: (input: PhoneLoginInput, role: UserRole) => Promise<AuthUser>;
  register: (input: RegisterInput, role: UserRole) => Promise<AuthUser>;
  registerWithPhone: (input: RegisterInput, role: UserRole, otp: string) => Promise<AuthUser>;
  sendOtp: (phone: string) => Promise<void>;
  logout: () => void;
  getDemoCredentials: typeof getDemoCredentials;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const useMockAuth = isUsingMockAuth();

  useEffect(() => {
    let cancelled = false;

    void restoreSession()
      .then((session) => {
        if (!cancelled) {
          setUser(session);
          setSessionError(null);
        }
      })
      .catch((err) => {
        console.error("Failed to restore auth session:", err);
        if (!cancelled) {
          setUser(null);
          setSessionError(
            err instanceof Error ? err.message : "Failed to restore session.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setSessionReady(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [useMockAuth]);

  const handleLogin = useCallback(async (input: LoginInput, role: UserRole) => {
    const authUser = await login(input, role);
    setUser(authUser);
    return authUser;
  }, []);

  const handleLoginWithPhone = useCallback(async (input: PhoneLoginInput, role: UserRole) => {
    const authUser = await loginWithOtp(input.phone, input.otp, role);
    setUser(authUser);
    return authUser;
  }, []);

  const handleRegister = useCallback(async (input: RegisterInput, role: UserRole) => {
    const authUser = await register(input, role);
    setUser(authUser);
    return authUser;
  }, []);

  const handleRegisterWithPhone = useCallback(
    async (input: RegisterInput, role: UserRole, otp: string) => {
      const authUser = await registerWithOtp(input, role, otp);
      setUser(authUser);
      return authUser;
    },
    [],
  );

  const handleLogout = useCallback(() => {
    logout();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      sessionReady,
      sessionError,
      useMockAuth,
      login: handleLogin,
      loginWithPhone: handleLoginWithPhone,
      register: handleRegister,
      registerWithPhone: handleRegisterWithPhone,
      sendOtp: sendPhoneOtp,
      logout: handleLogout,
      getDemoCredentials,
    }),
    [
      user,
      sessionReady,
      sessionError,
      useMockAuth,
      handleLogin,
      handleLoginWithPhone,
      handleRegister,
      handleRegisterWithPhone,
      handleLogout,
    ],
  );

  if (!sessionReady) {
    return (
      <AuthContext.Provider value={value}>
        <div className="flex min-h-screen items-center justify-center bg-health-canvas text-sm text-health-text-muted">
          Restoring session…
        </div>
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {sessionError && (
        <div
          className="border-b border-danger-bright/30 bg-danger-bright/10 px-4 py-2 text-center text-sm text-danger-bright"
          role="alert"
        >
          {sessionError}
        </div>
      )}
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

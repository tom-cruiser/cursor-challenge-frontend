import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthShell } from "@/components/auth";
import { Button, Input } from "@/components/ui";
import { cn } from "@/lib/cn";
import { useAuth } from "@/contexts";
import type { UserRole } from "@/types/auth";

interface LoginPageProps {
  role: UserRole;
}

type AuthStep = "credentials" | "otp";

export function LoginPage({ role }: LoginPageProps) {
  const { login, loginWithPhone, sendOtp, getDemoCredentials, useMockAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    (location.state as { from?: string } | null)?.from ??
    (role === "parent" ? "/parent/dashboard" : "/admin/dashboard");

  const demo = getDemoCredentials(role);
  const [step, setStep] = useState<AuthStep>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleMockSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login({ email, password }, role);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSendOtp(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await sendOtp(phone);
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send verification code.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerifyOtp(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await loginWithPhone({ phone, otp }, role);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setIsLoading(false);
    }
  }

  function fillDemo() {
    setEmail(demo.email);
    setPassword(demo.password);
    setError(null);
  }

  const isParent = role === "parent";

  return (
    <AuthShell
      role={role}
      title={isParent ? "Parent sign in" : "Hospital admin sign in"}
      subtitle={
        useMockAuth
          ? isParent
            ? "Access your children's vaccination dashboard."
            : "Access the hospital administration console."
          : isParent
            ? "Sign in with your phone number to access your dashboard."
            : "Sign in with your hospital operator phone number."
      }
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link
            to={`/auth/${role}/register`}
            className={cn(
              "font-medium hover:underline",
              isParent ? "text-teal" : "text-navy",
            )}
          >
            Create one
          </Link>
        </>
      }
    >
      {useMockAuth ? (
        <form onSubmit={handleMockSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={demo.email}
            required
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <p className="text-sm text-danger-bright" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Sign in
          </Button>

          <Button type="button" variant="outline" className="w-full" onClick={fillDemo}>
            Use demo account
          </Button>
        </form>
      ) : step === "credentials" ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <Input
            label="Phone number"
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+250788123456"
            hint="We'll send a one-time verification code via SMS"
            required
          />

          {error && (
            <p className="text-sm text-danger-bright" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Send verification code
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <p className="text-sm text-health-text-muted">
            Enter the code sent to <span className="font-medium text-health-text">{phone}</span>
          </p>
          <Input
            label="Verification code"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="123456"
            required
          />

          {error && (
            <p className="text-sm text-danger-bright" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Verify and sign in
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              setStep("credentials");
              setOtp("");
              setError(null);
            }}
          >
            Use a different number
          </Button>
        </form>
      )}
    </AuthShell>
  );
}

import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthShell } from "@/components/auth";
import { Button, Input } from "@/components/ui";
import { cn } from "@/lib/cn";
import { config } from "@/lib/config";
import { useAuth } from "@/contexts";
import { DEFAULT_REMINDER_CHANNELS, type ReminderChannels, type UserRole } from "@/types/auth";

interface RegisterPageProps {
  role: UserRole;
}

type RegisterStep = "details" | "otp";

const CHANNEL_OPTIONS: Array<{
  key: keyof ReminderChannels;
  label: string;
  description: string;
}> = [
  {
    key: "sms",
    label: "SMS",
    description: "Text message reminders to your phone",
  },
  {
    key: "email",
    label: "Email",
    description: "Reminder emails to your registered address",
  },
  {
    key: "inApp",
    label: "In-app",
    description: "Alerts inside the website notification drawer",
  },
];

export function RegisterPage({ role }: RegisterPageProps) {
  const { register, registerWithPhone, sendOtp, useMockAuth } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<RegisterStep>("details");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState<string>(config.defaultCountry);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [organization, setOrganization] = useState("");
  const [reminderChannels, setReminderChannels] = useState<ReminderChannels>(
    DEFAULT_REMINDER_CHANNELS,
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState("");

  function toggleChannel(key: keyof ReminderChannels) {
    setReminderChannels((current) => ({ ...current, [key]: !current[key] }));
  }

  function buildRegisterInput() {
    return {
      name,
      email,
      password,
      confirmPassword,
      organization: role === "admin" ? organization : undefined,
      phone: role === "parent" || !useMockAuth ? phone : undefined,
      country,
      reminderChannels: role === "parent" ? reminderChannels : undefined,
    };
  }

  async function handleMockSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await register(buildRegisterInput(), role);
      navigate(role === "parent" ? "/parent/dashboard" : "/admin/dashboard", {
        replace: true,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSendOtp(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!phone.trim()) {
        throw new Error("Phone number is required.");
      }
      await sendOtp(phone);
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send verification code.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerifyAndRegister(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await registerWithPhone(buildRegisterInput(), role, otp);
      navigate(role === "parent" ? "/parent/dashboard" : "/admin/dashboard", {
        replace: true,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setIsLoading(false);
    }
  }

  const isParent = role === "parent";

  return (
    <AuthShell
      role={role}
      title={isParent ? "Create parent account" : "Register hospital"}
      subtitle={
        useMockAuth
          ? isParent
            ? "Register with your contact details to receive SMS, email, and in-app reminders."
            : "Register for platform administration access."
          : isParent
            ? "Verify your phone number to create a parent account linked to the backend."
            : "Verify your phone and register your hospital with the platform."
      }
      footer={
        <>
          Already have an account?{" "}
          <Link
            to={`/auth/${role}/login`}
            className={cn(
              "font-medium hover:underline",
              isParent ? "text-teal" : "text-navy",
            )}
          >
            Sign in
          </Link>
        </>
      }
    >
      {useMockAuth ? (
        <form onSubmit={handleMockSubmit} className="space-y-4">
          <RegistrationFields
            isParent={isParent}
            name={name}
            setName={setName}
            email={email}
            setEmail={setEmail}
            phone={phone}
            setPhone={setPhone}
            organization={organization}
            setOrganization={setOrganization}
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            reminderChannels={reminderChannels}
            toggleChannel={toggleChannel}
          />

          {error && (
            <p className="text-sm text-danger-bright" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Create account
          </Button>
        </form>
      ) : step === "details" ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <RegistrationFields
            isParent={isParent}
            name={name}
            setName={setName}
            email={email}
            setEmail={setEmail}
            phone={phone}
            setPhone={setPhone}
            organization={organization}
            setOrganization={setOrganization}
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            reminderChannels={reminderChannels}
            toggleChannel={toggleChannel}
            showPasswordFields={false}
            country={country}
            setCountry={setCountry}
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
        <form onSubmit={handleVerifyAndRegister} className="space-y-4">
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
            Verify and create account
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              setStep("details");
              setOtp("");
              setError(null);
            }}
          >
            Back to details
          </Button>
        </form>
      )}
    </AuthShell>
  );
}

interface RegistrationFieldsProps {
  isParent: boolean;
  name: string;
  setName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  organization: string;
  setOrganization: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  reminderChannels: ReminderChannels;
  toggleChannel: (key: keyof ReminderChannels) => void;
  showPasswordFields?: boolean;
  country?: string;
  setCountry?: (value: string) => void;
}

function RegistrationFields({
  isParent,
  name,
  setName,
  email,
  setEmail,
  phone,
  setPhone,
  organization,
  setOrganization,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  reminderChannels,
  toggleChannel,
  showPasswordFields = true,
  country,
  setCountry,
}: RegistrationFieldsProps) {
  return (
    <>
      <Input
        label="Full name"
        autoComplete="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={isParent ? "Sarah Chen" : "Dr. Marcus Webb"}
        required
      />
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        hint={isParent ? "Used for email vaccination reminders" : undefined}
        required={isParent}
      />

      <Input
        label="Phone number"
        type="tel"
        autoComplete="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="+250788123456"
        hint={isParent ? "Required for SMS reminders and sign-in" : "Hospital operator phone for sign-in"}
        required
      />

      {setCountry && (
        <Input
          label="Country"
          value={country ?? ""}
          onChange={(e) => setCountry(e.target.value)}
          placeholder="Rwanda"
          required
        />
      )}

      {isParent && (
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-health-text">
            Reminder delivery methods
          </legend>
          <div className="space-y-2">
            {CHANNEL_OPTIONS.map(({ key, label, description }) => (
              <label
                key={key}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-3 transition-all",
                  reminderChannels[key]
                    ? "border-accent/30 bg-accent-glow/10"
                    : "border-border-subtle bg-surface-muted/30",
                )}
              >
                <input
                  type="checkbox"
                  checked={reminderChannels[key]}
                  onChange={() => toggleChannel(key)}
                  className="mt-0.5 h-4 w-4 rounded border-border-strong accent-accent"
                />
                <span>
                  <span className="block text-sm font-medium text-health-text">{label}</span>
                  <span className="block text-xs text-health-text-muted">{description}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {!isParent && (
        <Input
          label="Hospital name"
          value={organization}
          onChange={(e) => setOrganization(e.target.value)}
          placeholder="Kigali Health Center"
          required
        />
      )}

      {showPasswordFields && (
        <>
          <Input
            label="Password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            hint="Minimum 8 characters"
            required
          />
          <Input
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </>
      )}
    </>
  );
}

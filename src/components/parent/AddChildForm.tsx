import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from "@/components/ui";
import { sexLabels } from "@/lib/child-labels";
import { useParentContext } from "@/contexts";
import { cn } from "@/lib/cn";
import type { ChildSex } from "@/types/user";

interface AddChildFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface FormState {
  name: string;
  dateOfBirth: string;
  sex: ChildSex;
}

interface FormErrors {
  name?: string;
  dateOfBirth?: string;
}

const initialFormState: FormState = {
  name: "",
  dateOfBirth: "",
  sex: "female",
};

export function AddChildForm({ onSuccess, onCancel }: AddChildFormProps) {
  const { addChild } = useParentContext();
  const [form, setForm] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(values: FormState): FormErrors {
    const nextErrors: FormErrors = {};

    if (!values.name.trim()) {
      nextErrors.name = "Name is required.";
    }

    if (!values.dateOfBirth) {
      nextErrors.dateOfBirth = "Date of birth is required.";
    } else {
      const dob = new Date(`${values.dateOfBirth}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (dob > today) {
        nextErrors.dateOfBirth = "Date of birth cannot be in the future.";
      }
    }

    return nextErrors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);

    const nextErrors = validate(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await addChild({
        name: form.name,
        dateOfBirth: form.dateOfBirth,
        sex: form.sex,
      });

      setForm(initialFormState);
      setErrors({});
      onSuccess?.();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to create child profile.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>Add Child Profile</CardTitle>
            <CardDescription>
              A vaccination timeline will be generated once a preferred hospital is selected.
            </CardDescription>
          </div>
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
              aria-label="Close add child form"
              disabled={isSubmitting}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
          <Input
            label="Full name"
            name="name"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="e.g. Emma Chen"
            error={errors.name}
            autoComplete="name"
            disabled={isSubmitting}
          />

          <Input
            label="Date of birth"
            name="dateOfBirth"
            type="date"
            value={form.dateOfBirth}
            onChange={(event) =>
              setForm((current) => ({ ...current, dateOfBirth: event.target.value }))
            }
            error={errors.dateOfBirth}
            max={new Date().toISOString().split("T")[0]}
            disabled={isSubmitting}
          />

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-health-text">Sex</legend>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(sexLabels) as ChildSex[]).map((sex) => (
                <label
                  key={sex}
                  className={cn(
                    "cursor-pointer rounded-lg px-4 py-2 text-sm font-medium ring-1 transition-all",
                    form.sex === sex
                      ? "bg-teal-glow text-navy ring-teal/30"
                      : "bg-surface-muted text-health-text-muted ring-border-subtle hover:text-health-text",
                    isSubmitting && "pointer-events-none opacity-60",
                  )}
                >
                  <input
                    type="radio"
                    name="sex"
                    value={sex}
                    checked={form.sex === sex}
                    onChange={() => setForm((current) => ({ ...current, sex }))}
                    className="sr-only"
                    disabled={isSubmitting}
                  />
                  {sexLabels[sex]}
                </label>
              ))}
            </div>
          </fieldset>

          {submitError && (
            <p className="text-sm text-danger-bright" role="alert">
              {submitError}
            </p>
          )}

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                Cancel
              </Button>
            )}
            <Button type="submit" isLoading={isSubmitting}>
              Create Profile
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

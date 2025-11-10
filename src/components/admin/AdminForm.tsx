import { FormEvent, useState } from "react";
import type { AdminPayload } from "../../services/admin-service";
import { cn } from "../../lib/utils";

interface AdminFormProps {
  initialValues?: Partial<AdminPayload>;
  onSubmit: (values: AdminPayload) => Promise<void> | void;
  isSubmitting?: boolean;
  submitLabel?: string;
  showPasswordFields?: boolean;
  availablePermissions?: { label: string; value: string }[];
  requirePermissions?: boolean;
}

const DEFAULT_VALUES: AdminPayload = {
  name: "",
  email: "",
  phone: "",
  password: "",
  password_confirmation: "",
  status: "active",
  permissions: [],
};

export const AdminForm = ({
  initialValues,
  onSubmit,
  isSubmitting,
  submitLabel = "Save",
  showPasswordFields = true,
  availablePermissions,
  requirePermissions = false,
}: AdminFormProps) => {
  const [values, setValues] = useState<AdminPayload>(() => {
    const base = {
      ...DEFAULT_VALUES,
      ...initialValues,
    };
    const normalizedPermissions = Array.isArray(base.permissions)
      ? base.permissions.map((permission) => String(permission))
      : [];
    return {
      ...base,
      permissions: normalizedPermissions,
    };
  });
  const [formError, setFormError] = useState<string | null>(null);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const togglePermission = (permission: string) => {
    setValues((prev) => {
      const current = prev.permissions ?? [];
      const exists = current.includes(permission);
      return {
        ...prev,
        permissions: exists
          ? current.filter((item) => item !== permission)
          : [...current, permission],
      };
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (showPasswordFields) {
      if (!values.password) {
        setFormError("Password is required.");
        return;
      }
      if (values.password !== values.password_confirmation) {
        setFormError("Passwords do not match.");
        return;
      }
    }

    if (availablePermissions && requirePermissions) {
      if (!values.permissions || values.permissions.length === 0) {
        setFormError("Select at least one permission.");
        return;
      }
    }

    const payload: AdminPayload = { ...values };
    if (!showPasswordFields) {
      delete payload.password;
      delete payload.password_confirmation;
    }
    if (!availablePermissions) {
      delete payload.permissions;
    } else if (!values.permissions || values.permissions.length === 0) {
      if (!requirePermissions) {
        delete payload.permissions;
      }
    }
    if (payload.permissions) {
      payload.permissions = payload.permissions
        .map((permission) =>
          typeof permission === "string" ? Number(permission) : permission
        )
        .filter((permission) => !Number.isNaN(Number(permission)));
    }

    await onSubmit(payload);
  };

  return (
    <form
      className="space-y-6 rounded-3xl border border-white/10 bg-gradient-to-br from-[#173468]/18 via-white/12 to-[#C7A46A]/12 p-6 shadow-[0_28px_60px_-30px_rgba(23,52,104,0.65)] backdrop-blur-2xl"
      onSubmit={handleSubmit}
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground" htmlFor="name">
            Full Name
          </label>
          <input
            id="name"
            name="name"
            value={values.name}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-[#173468]/30 bg-white/5 px-4 py-3 text-sm text-foreground outline-none transition focus:border-[#C7A46A]/60 focus:ring-2 focus:ring-[#C7A46A]/40"
            placeholder="Enter full name"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-[#173468]/30 bg-white/5 px-4 py-3 text-sm text-foreground outline-none transition focus:border-[#C7A46A]/60 focus:ring-2 focus:ring-[#C7A46A]/40"
            placeholder="admin@egtiaz.com"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground" htmlFor="phone">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            value={values.phone ?? ""}
            onChange={handleChange}
            className="w-full rounded-xl border border-[#173468]/30 bg-white/5 px-4 py-3 text-sm text-foreground outline-none transition focus:border-[#C7A46A]/60 focus:ring-2 focus:ring-[#C7A46A]/40"
            placeholder="+966512345678"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground" htmlFor="status">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={values.status}
            onChange={handleChange}
            className="w-full rounded-xl border border-[#173468]/30 bg-white/5 px-4 py-3 text-sm text-foreground outline-none transition focus:border-[#C7A46A]/60 focus:ring-2 focus:ring-[#C7A46A]/40"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        {showPasswordFields ? (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={values.password ?? ""}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full rounded-xl border border-[#173468]/30 bg-white/5 px-4 py-3 text-sm text-foreground outline-none transition focus:border-[#C7A46A]/60 focus:ring-2 focus:ring-[#C7A46A]/40"
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-medium text-muted-foreground"
                htmlFor="password_confirmation"
              >
                Confirm Password
              </label>
              <input
                id="password_confirmation"
                name="password_confirmation"
                type="password"
                value={values.password_confirmation ?? ""}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full rounded-xl border border-[#173468]/30 bg-white/5 px-4 py-3 text-sm text-foreground outline-none transition focus:border-[#C7A46A]/60 focus:ring-2 focus:ring-[#C7A46A]/40"
                placeholder="••••••••"
              />
            </div>
          </>
        ) : null}
      </div>

      {availablePermissions ? (
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">
              Permissions
            </h3>
            <p className="text-xs text-muted-foreground/80">
              {requirePermissions
                ? "Choose the modules this administrator can access."
                : "Select modules this administrator can access (optional)."}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {availablePermissions.map(({ label, value }) => {
              const isSelected = values.permissions?.includes(value);
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => togglePermission(value)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-xs font-semibold transition backdrop-blur",
                    isSelected
                      ? "border-[#C7A46A]/60 bg-gradient-to-r from-[#173468] via-[#1f4b8f] to-[#C7A46A] text-white shadow"
                      : "border-white/20 bg-white/10 text-muted-foreground hover:border-white/40 hover:bg-white/15"
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {formError ? (
        <div className="rounded-xl border border-destructive/60 bg-destructive/25 px-4 py-3 text-sm text-destructive-foreground shadow">
          {formError}
        </div>
      ) : null}

      <div className="flex justify-end gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-gradient-to-r from-[#173468] via-[#1f4b8f] to-[#C7A46A] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
};


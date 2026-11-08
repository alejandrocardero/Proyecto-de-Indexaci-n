import { cn } from "@/lib/utils";
import { ReactNode, useId, useState } from "react";

interface InputProps {
  type?: "text" | "password" | "email";
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  label?: ReactNode;
  helper?: ReactNode;
  error?: string;
  disabled?: boolean;
  showPassword?: boolean;
  className?: string;
  leftIcon?: ReactNode;
}

export const Input = ({
  type = "text",
  placeholder,
  value,
  onChange,
  label,
  helper,
  error,
  disabled = false,
  showPassword = false,
  className,
  leftIcon,
}: InputProps) => {
  const inputId = useId();
  const [passwordVisible, setPasswordVisible] = useState(false);

  const classes = cn(
    "w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    className,
  );

  const typeAttr = showPassword && type === "password"
    ? (passwordVisible ? "text" : "password")
    : type;

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-text-secondary block mb-1 transition-colors hover:text-text-primary"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 inset-y-0 flex items-center pointer-events-none">
            {leftIcon}
          </span>
        )}
        <input
          type={typeAttr}
          id={inputId}
          placeholder={placeholder}
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            onChange?.(e.target.value);
          }}
          className={classes}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? "input-error" : undefined}
        />
        {showPassword && type === "password" && (
          <button
            type="button"
            onClick={() => setPasswordVisible(!passwordVisible)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-text-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={passwordVisible ? "Mostrar contraseña" : "Ocultar contraseña"}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              {passwordVisible ? (
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5M12 17c-2.5 0-4-1.5-4-3s1.5-3 4-3 4 1.5 4 3-1.5 3-4 3zM12 9c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
              ) : (
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5M12 17c-2.5 0-4-1.5-4-3s1.5-3 4-3 4 1.5 4 3-1.5 3-4 3zM12 9c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
              )}
            </svg>
          </button>
        )}
        {error && (
          <p className="text-destructive text-xs mt-1" id="input-error">
            {error}
          </p>
        )}
        {helper && (
          <p className="text-text-secondary text-xs mt-1" id="input-helper">
            {helper}
          </p>
        )}
      </div>
    </div>
  );
};
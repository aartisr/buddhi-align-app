"use client";

type InputTone = "primary" | "accent" | "emerald" | "rose" | "gold" | "indigo";

const TONE_CLASS: Record<InputTone, string> = {
  primary: "border-primary focus:ring-primary",
  accent: "border-accent focus:ring-emerald",
  emerald: "border-emerald focus:ring-emerald",
  rose: "border-rose focus:ring-rose",
  gold: "border-gold focus:ring-primary",
  indigo: "border-indigo focus:ring-indigo",
};

const BASE_CLASS =
  "app-form-input border-2 bg-surface rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-2 text-lg shadow-sm";

interface BaseInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  tone: InputTone;
  required?: boolean;
  placeholder?: string;
}

export function ModuleDateInput({ id, value, onChange, ariaLabel, tone, required = false }: Omit<BaseInputProps, "placeholder">) {
  return (
    <input
      id={id}
      type="date"
      className={`${BASE_CLASS} ${TONE_CLASS[tone]}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      aria-label={ariaLabel}
    />
  );
}

export function ModuleTextInput({
  id,
  value,
  onChange,
  ariaLabel,
  tone,
  required = false,
  placeholder,
}: BaseInputProps) {
  return (
    <input
      id={id}
      type="text"
      className={`${BASE_CLASS} ${TONE_CLASS[tone]}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      placeholder={placeholder}
      aria-label={ariaLabel}
    />
  );
}

interface NumberInputProps {
  id: string;
  value: number | "";
  onChange: (value: number) => void;
  ariaLabel: string;
  tone: InputTone;
  required?: boolean;
  min?: number;
  placeholder?: string;
}

export function ModuleNumberInput({
  id,
  value,
  onChange,
  ariaLabel,
  tone,
  required = false,
  min,
  placeholder,
}: NumberInputProps) {
  return (
    <input
      id={id}
      type="number"
      className={`${BASE_CLASS} ${TONE_CLASS[tone]}`}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      required={required}
      min={min}
      placeholder={placeholder}
      aria-label={ariaLabel}
    />
  );
}

export type ModuleFieldConfig =
  | {
      key: string;
      kind: "date";
      tone: InputTone;
      value: string;
      ariaLabel: string;
      required?: boolean;
    }
  | {
      key: string;
      kind: "text";
      tone: InputTone;
      value: string;
      ariaLabel: string;
      required?: boolean;
      placeholder?: string;
    }
  | {
      key: string;
      kind: "number";
      tone: InputTone;
      value: number | "";
      ariaLabel: string;
      required?: boolean;
      min?: number;
      placeholder?: string;
    };

export function ModuleFormField({
  field,
  onValueChange,
}: {
  field: ModuleFieldConfig;
  onValueChange: (key: string, value: string | number) => void;
}) {
  const inputId = `module-field-${field.key}`;

  if (field.kind === "date") {
    return (
      <label htmlFor={inputId} className="app-form-field">
        <span className="app-form-label">{field.ariaLabel}</span>
        <ModuleDateInput
          id={inputId}
          tone={field.tone}
          value={field.value}
          onChange={(value) => onValueChange(field.key, value)}
          ariaLabel={field.ariaLabel}
          required={field.required}
        />
      </label>
    );
  }

  if (field.kind === "number") {
    return (
      <label htmlFor={inputId} className="app-form-field">
        <span className="app-form-label">{field.ariaLabel}</span>
        <ModuleNumberInput
          id={inputId}
          tone={field.tone}
          value={field.value}
          onChange={(value) => onValueChange(field.key, value)}
          ariaLabel={field.ariaLabel}
          required={field.required}
          min={field.min}
          placeholder={field.placeholder}
        />
      </label>
    );
  }

  return (
    <label htmlFor={inputId} className="app-form-field">
      <span className="app-form-label">{field.ariaLabel}</span>
      <ModuleTextInput
        id={inputId}
        tone={field.tone}
        value={field.value}
        onChange={(value) => onValueChange(field.key, value)}
        ariaLabel={field.ariaLabel}
        required={field.required}
        placeholder={field.placeholder}
      />
    </label>
  );
}

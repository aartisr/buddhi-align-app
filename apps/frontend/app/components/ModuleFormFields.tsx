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
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  tone: InputTone;
  required?: boolean;
  placeholder?: string;
}

export function ModuleDateInput({ value, onChange, ariaLabel, tone, required = false }: Omit<BaseInputProps, "placeholder">) {
  return (
    <input
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
  value,
  onChange,
  ariaLabel,
  tone,
  required = false,
  placeholder,
}: BaseInputProps) {
  return (
    <input
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
  value: number | "";
  onChange: (value: number) => void;
  ariaLabel: string;
  tone: InputTone;
  required?: boolean;
  min?: number;
  placeholder?: string;
}

export function ModuleNumberInput({
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
  if (field.kind === "date") {
    return (
      <ModuleDateInput
        tone={field.tone}
        value={field.value}
        onChange={(value) => onValueChange(field.key, value)}
        ariaLabel={field.ariaLabel}
        required={field.required}
      />
    );
  }

  if (field.kind === "number") {
    return (
      <ModuleNumberInput
        tone={field.tone}
        value={field.value}
        onChange={(value) => onValueChange(field.key, value)}
        ariaLabel={field.ariaLabel}
        required={field.required}
        min={field.min}
        placeholder={field.placeholder}
      />
    );
  }

  return (
    <ModuleTextInput
      tone={field.tone}
      value={field.value}
      onChange={(value) => onValueChange(field.key, value)}
      ariaLabel={field.ariaLabel}
      required={field.required}
      placeholder={field.placeholder}
    />
  );
}

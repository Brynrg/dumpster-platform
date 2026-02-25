import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export default function Input({ label, id, error, className, ...props }: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <label htmlFor={inputId} className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <input
        id={inputId}
        className={`w-full rounded-md border border-black/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-black dark:border-white/25 dark:focus:border-white ${className ?? ""}`.trim()}
        {...props}
      />
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
    </label>
  );
}

import { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export function FormField({ error, icon: Icon, id, label, className = "", labelAction, suffix, ...inputProps }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3 px-0.5">
        <label className="text-[13px] font-semibold text-text-secondary" htmlFor={id}>
          {label}
        </label>
        {labelAction}
      </div>
      <div className="relative">
        {Icon ? <Icon aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-text-muted" /> : null}
        <input
          id={id}
          aria-describedby={error ? `${id}-error` : undefined}
          aria-invalid={error ? true : undefined}
          className={`h-10 w-full rounded-xl border bg-white px-3 text-sm text-text-primary shadow-none outline-none ring-0 transition-colors placeholder:text-text-muted focus:bg-white focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:bg-gray-100 ${
            Icon ? "pl-10" : ""
          } ${
            suffix ? "pr-10" : ""
          } ${
            error ? "border-red-200 focus:border-red-500" : "border-border-form focus:border-brand-500"
          } ${className}`}
          {...inputProps}
        />
        {suffix ? (
          <div className="absolute right-3.5 top-1/2 z-10 -translate-y-1/2 flex items-center">
            {suffix}
          </div>
        ) : null}
      </div>
      {error ? (
        <p className="px-1 text-[11px] font-semibold text-red-500" id={`${id}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}


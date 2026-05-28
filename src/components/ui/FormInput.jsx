import React from "react";

export const FormInput = React.forwardRef(({ label, error, endContent, ...props }, ref) => {
  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="block px-1 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          className={`h-12 w-full rounded-xl border px-6 text-[14px] font-normal transition-all outline-none placeholder:text-text-muted ${
            props.disabled || props.readOnly
              ? "bg-surface-hover text-text-tertiary border-border-default cursor-not-allowed"
              : "bg-white text-text-primary"
          } ${error
              ? "border-red-500 focus:border-red-600"
              : "border-gray-300 focus:border-brand-500"
            } ${props.className || ""}`}
          {...props}
        />
        {endContent && (
          <div className="absolute right-5 top-1/2 -translate-y-1/2">
            {endContent}
          </div>
        )}
      </div>
      {error && (
        <p className="px-1 text-[10px] font-bold text-red-500">{error}</p>
      )}
    </div>
  );
});

FormInput.displayName = "FormInput";

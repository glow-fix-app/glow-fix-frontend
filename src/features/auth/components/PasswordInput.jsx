import { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { FormField } from "./FormField";

export function PasswordInput({ error, icon, id, label, className = "", ...inputProps }) {
  const [visible, setVisible] = useState(false);
  const { type: _type, ...rest } = inputProps;

  return (
    <FormField
      id={id}
      label={label}
      icon={icon}
      error={error}
      type={visible ? "text" : "password"}
      className={className}
      suffix={
        <button
          type="button"
          className="text-text-muted transition-colors hover:text-text-secondary focus:outline-none flex items-center justify-center p-1"
          onClick={() => setVisible((show) => !show)}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? (
            <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
          ) : (
            <EyeIcon className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      }
      {...rest}
    />
  );
}

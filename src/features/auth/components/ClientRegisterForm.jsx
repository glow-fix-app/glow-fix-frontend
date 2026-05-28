import { UserIcon, EnvelopeIcon, PhoneIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { FormField } from "./FormField";
import { PasswordInput } from "./PasswordInput";

export function ClientRegisterForm({ register, errors }) {
  return (
    <div className="space-y-4">
      <FormField
        error={errors.name?.message}
        icon={UserIcon}
        id="name"
        label="Full name"
        {...register("name")}
      />
      <FormField
        error={errors.email?.message}
        icon={EnvelopeIcon}
        id="email"
        label="Email address"
        type="email"
        {...register("email")}
      />
      <FormField
        error={errors.phone?.message}
        icon={PhoneIcon}
        id="phone"
        label="Phone number"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        {...register("phone")}
      />
      <PasswordInput
        error={errors.password?.message}
        icon={LockClosedIcon}
        id="password"
        label="Password"
        autoComplete="new-password"
        {...register("password")}
      />
      <PasswordInput
        error={errors.confirmPassword?.message}
        icon={LockClosedIcon}
        id="confirmPassword"
        label="Confirm password"
        autoComplete="new-password"
        {...register("confirmPassword")}
      />
    </div>
  );
}

import { Controller } from "react-hook-form";
import {
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  LockClosedIcon,
  BuildingStorefrontIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { FormField } from "./FormField";
import { PasswordInput } from "./PasswordInput";
import { FileUploadField } from "./FileUploadField";
import BranchLocationPicker from "./BranchLocationPicker";

export function ProviderDetailsStep({ register, errors }) {
  return (
    <div className="space-y-4">
      <FormField
        error={errors.name?.message}
        icon={UserIcon}
        id="name"
        label="Owner name"
        {...register("name")}
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
      <FormField
        error={errors.email?.message}
        icon={EnvelopeIcon}
        id="email"
        label="Login email"
        type="email"
        {...register("email")}
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

export function ProviderBranchStep({ register, errors, control }) {
  return (
    <div className="space-y-4">
      <FormField
        error={errors.businessName?.message}
        icon={BuildingStorefrontIcon}
        id="businessName"
        label="Place name"
        {...register("businessName")}
      />
      <FormField
        error={errors.address?.message}
        icon={MapPinIcon}
        id="address"
        label="Address"
        {...register("address")}
      />
      <Controller
        control={control}
        name="branchLocation"
        render={({ field }) => (
          <BranchLocationPicker
            error={errors.branchLocation?.message}
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
    </div>
  );
}

export function ProviderDocsStep({ register, errors, files }) {
  const { businessRegistration, ownerID, insuranceCertificate, serviceLicense } = files;
  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <FileUploadField
          error={errors.businessRegistration?.message}
          id="businessRegistration"
          label="Business Registration"
          register={register}
          fileName={businessRegistration?.[0]?.name}
        />
        <FileUploadField
          error={errors.ownerID?.message}
          id="ownerID"
          label="Owner ID"
          register={register}
          fileName={ownerID?.[0]?.name}
        />
        <FileUploadField
          error={errors.insuranceCertificate?.message}
          id="insuranceCertificate"
          label="Insurance Certificate"
          register={register}
          fileName={insuranceCertificate?.[0]?.name}
        />
        <FileUploadField
          error={errors.serviceLicense?.message}
          id="serviceLicense"
          label="Service License"
          register={register}
          fileName={serviceLicense?.[0]?.name}
        />
      </div>
      <p className="text-center text-[11px] font-medium italic text-text-tertiary">
        Your provider account will be marked as under review after submission.
      </p>
    </div>
  );
}

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const MAX_EMAIL = 255;
const MAX_PASSWORD = 128;
const MAX_NAME = 100;
const MAX_PHONE = 20;
const MAX_BUSINESS_NAME = 200;
const MAX_ADDRESS = 500;
const MAX_URL = 2048;

const MAX_FILE_BYTES = 5 * 1024 * 1024;

const ALLOWED_UPLOAD_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

/** Trimmed non-empty string helper */
function requiredText(message, { min = 1, max = 500 } = {}) {
  return z
    .string({ required_error: message, invalid_type_error: message })
    .trim()
    .min(min, message)
    .max(max, `Must be at most ${max} characters.`);
}

export const emailSchema = requiredText("Email is required.", { min: 1, max: MAX_EMAIL })
  .email("Enter a valid email address.")
  .refine((value) => !/\s/.test(value), "Email cannot contain spaces.");

export const loginPasswordSchema = requiredText("Enter your password.", { min: 1, max: MAX_PASSWORD });

const PASSWORD_HINT =
  "Use at least 8 characters with uppercase, lowercase, a number, and a special character (e.g. ! @ #).";

export const registerPasswordSchema = z
  .string({ required_error: "Enter a password.", invalid_type_error: "Enter a password." })
  .trim()
  .min(1, "Enter a password.")
  .superRefine((value, ctx) => {
    if (value.length < 8) {
      ctx.addIssue({ code: "custom", message: PASSWORD_HINT });
      return;
    }
    if (value.length > MAX_PASSWORD) {
      ctx.addIssue({
        code: "custom",
        message: `Password is too long (maximum ${MAX_PASSWORD} characters).`,
      });
      return;
    }

    const missing = [];
    if (!/[a-z]/.test(value)) missing.push("lowercase letter");
    if (!/[A-Z]/.test(value)) missing.push("uppercase letter");
    if (!/[0-9]/.test(value)) missing.push("number");
    if (!/[\W_]/.test(value)) missing.push("special character");

    if (missing.length > 0) {
      const list =
        missing.length === 1
          ? missing[0]
          : `${missing.slice(0, -1).join(", ")} and ${missing[missing.length - 1]}`;
      ctx.addIssue({
        code: "custom",
        message: `Add a ${list}. ${PASSWORD_HINT}`,
      });
    }
  });

export const confirmPasswordSchema = z
  .string({ required_error: "Confirm your password.", invalid_type_error: "Confirm your password." })
  .trim()
  .min(1, "Please confirm your password.")
  .min(8, PASSWORD_HINT);

export const personNameSchema = requiredText("Name is required.", { min: 2, max: MAX_NAME }).refine(
  (value) => /^[\p{L}\s'.-]+$/u.test(value),
  "Name can only contain letters, spaces, hyphens, and apostrophes.",
);

export const phoneSchema = z
  .string({ required_error: "Phone number is required.", invalid_type_error: "Phone number is required." })
  .trim()
  .min(1, "Phone number is required.")
  .max(MAX_PHONE, "Phone number is too long.")
  .superRefine((value, ctx) => {
    const cleaned = value.replace(/[\s\-().]/g, "");

    if (!/^\+?\d+$/.test(cleaned)) {
      ctx.addIssue({
        code: "custom",
        message: "Use digits only, optionally starting with +.",
      });
      return;
    }

    if (cleaned.length < 7) {
      ctx.addIssue({
        code: "custom",
        message: "Enter a valid phone number with at least 7 digits.",
      });
      return;
    }

    if (!/^\+?[1-9]\d{7,14}$/.test(cleaned)) {
      ctx.addIssue({
        code: "custom",
        message: "Invalid phone number format (e.g. use +201... instead of 01...).",
      });
    }
  });

export const branchLocationSchema = z
  .object({
    lat: z.number({ invalid_type_error: "Set your branch location on the map." }),
    lng: z.number({ invalid_type_error: "Set your branch location on the map." }),
  })
  .refine(
    (value) =>
      Number.isFinite(value.lat) &&
      Number.isFinite(value.lng) &&
      value.lat >= -90 &&
      value.lat <= 90 &&
      value.lng >= -180 &&
      value.lng <= 180,
    "Set your branch location on the map.",
  );

function requiredFileUpload(label) {
  return z
    .any()
    .refine((value) => value instanceof FileList && value.length > 0, `${label} is required.`)
    .refine((value) => !value || !value[0] || value[0].size <= MAX_FILE_BYTES, `${label} must be 5 MB or smaller.`)
    .refine(
      (value) => !value || !value[0] || ALLOWED_UPLOAD_TYPES.has(value[0].type),
      `${label}: use PDF, JPG, PNG, or WebP.`,
    );
}

export const loginSchema = z.object({
  email: emailSchema,
  password: loginPasswordSchema,
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const passwordResetCodeSchema = z.object({
  otp: z
    .string({ required_error: "Enter the code from your email." })
    .trim()
    .regex(/^\d{6}$/, "Enter the 6-digit code from your email."),
});

export const resetPasswordSchema = z
  .object({
    password: registerPasswordSchema,
    confirmPassword: confirmPasswordSchema,
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match. Enter the same password in both fields.",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().optional().or(z.literal("")),
    newPassword: registerPasswordSchema,
    confirmPassword: confirmPasswordSchema,
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Passwords do not match. Enter the same password in both fields.",
    path: ["confirmPassword"],
  });

const accountFieldsSchema = z.object({
  name: personNameSchema,
  email: emailSchema,
  phone: phoneSchema,
  password: registerPasswordSchema,
  confirmPassword: confirmPasswordSchema,
});

function withPasswordMatch(schema) {
  return schema.refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match. Enter the same password in both fields.",
    path: ["confirmPassword"],
  });
}

/** Client sign-up — no provider-only fields. */
export const clientRegisterSchema = withPasswordMatch(
  accountFieldsSchema.extend({
    role: z.literal("client"),
  }),
);

/** Provider wizard: step 0 = owner account, 1 = branch, 2 = documents. */
export const providerStep0Schema = withPasswordMatch(accountFieldsSchema);

export const providerStep1Schema = z.object({
  businessName: requiredText("Service place name is required.", { min: 2, max: MAX_BUSINESS_NAME }),
  address: requiredText("Address is required.", { min: 5, max: MAX_ADDRESS }),
  branchLocation: branchLocationSchema,
});

export const providerStep2Schema = z.object({
  businessRegistration: requiredFileUpload("Business Registration"),
  ownerID: requiredFileUpload("Owner ID"),
  insuranceCertificate: requiredFileUpload("Insurance Certificate"),
  serviceLicense: requiredFileUpload("Service License"),
});

export const providerStepSchemas = [providerStep0Schema, providerStep1Schema, providerStep2Schema];

/** Field groups per provider wizard step (keep in sync with RegisterPage). */
export const providerWizardSteps = [
  { fields: ["name", "email", "phone", "password", "confirmPassword"] },
  { fields: ["businessName", "address", "branchLocation"] },
  { fields: ["businessRegistration", "ownerID", "insuranceCertificate", "serviceLicense"] },
];

/**
 * Provider: validate only the current wizard step on blur/field change.
 * Full schema runs on final submit. Client always uses clientRegisterSchema.
 */
export function createProviderRegisterResolver(getProviderStep) {
  return async (values, context, options) => {
    if (values.role !== "manager") {
      return zodResolver(clientRegisterSchema)(values, context, options);
    }

    const names = options.names;
    const isFieldLevel = Array.isArray(names) && names.length > 0;

    if (isFieldLevel) {
      const step = getProviderStep();
      const fields = providerWizardSteps[step]?.fields ?? [];
      const stepValues = Object.fromEntries(fields.map((field) => [field, values[field]]));
      return zodResolver(providerStepSchemas[step])(stepValues, context, options);
    }

    return zodResolver(providerRegisterSchema)(values, context, options);
  };
}

/** Full provider sign-up (final submit). */
export const providerRegisterSchema = withPasswordMatch(
  accountFieldsSchema.extend({
    role: z.literal("manager"),
    businessName: requiredText("Service place name is required.", { min: 2, max: MAX_BUSINESS_NAME }),
    address: requiredText("Address is required.", { min: 5, max: MAX_ADDRESS }),
    branchLocation: branchLocationSchema,
    businessRegistration: requiredFileUpload("Business Registration"),
    ownerID: requiredFileUpload("Owner ID"),
    insuranceCertificate: requiredFileUpload("Insurance Certificate"),
    serviceLicense: requiredFileUpload("Service License"),
  }),
);

/** @deprecated Use clientRegisterSchema or providerRegisterSchema */
export const registerSchema = clientRegisterSchema;

/** Apply Zod issues to react-hook-form (used for provider step "Continue"). */
export function applyZodIssues(setError, issues) {
  for (const issue of issues) {
    const field = issue.path[0];
    if (typeof field === "string") {
      setError(field, { type: "manual", message: issue.message });
    }
  }
}

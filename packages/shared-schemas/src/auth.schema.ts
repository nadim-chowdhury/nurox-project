import { z } from "zod";

export const registerSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(100, "First name must be 100 characters or fewer")
    .trim(),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(100, "Last name must be 100 characters or fewer")
    .trim(),
  email: z
    .string()
    .email("Invalid email address")
    .max(255, "Email must be 255 characters or fewer")
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be 128 characters or fewer")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/,
      "Password must include uppercase, lowercase, number, and special character",
    ),
  organizationName: z
    .string()
    .min(1, "Organization name is required")
    .max(200, "Organization name must be 200 characters or fewer")
    .trim()
    .optional(),
  token: z.string().optional(),
});

export type RegisterDto = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z.string().min(1, "Password is required"),
});

export type LoginDto = z.infer<typeof loginSchema>;

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export type RefreshTokenDto = z.infer<typeof refreshTokenSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters")
    .max(128, "Password must be 128 characters or fewer")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/,
      "Password must include uppercase, lowercase, number, and special character",
    ),
});

export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
});

export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  token: z.string().min(1, "Reset token is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be 128 characters or fewer")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/,
      "Password must include uppercase, lowercase, number, and special character",
    ),
});

export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;

export const verify2FASchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  token: z.string().length(6, "2FA token must be 6 digits"),
});

export type Verify2FADto = z.infer<typeof verify2FASchema>;

export const enable2FASchema = z.object({
  token: z.string().length(6, "2FA token must be 6 digits"),
});

export type Enable2FADto = z.infer<typeof enable2FASchema>;

export const tokenPairSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
});

export type TokenPairDto = z.infer<typeof tokenPairSchema>;

export const authResponseSchema = z.object({
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
    role: z.string(),
  }),
  tokens: tokenPairSchema,
});

export type AuthResponseDto = z.infer<typeof authResponseSchema>;

export const userSessionSchema = z.object({
  id: z.string().uuid(),
  userAgent: z.string().nullable(),
  ipAddress: z.string().nullable(),
  deviceType: z.string().nullable(),
  lastActiveAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
  isCurrent: z.boolean().optional(),
});

export type UserSessionDto = z.infer<typeof userSessionSchema>;

export const revokeSessionSchema = z.object({
  sessionId: z.string().uuid("Invalid session ID"),
});

export type RevokeSessionDto = z.infer<typeof revokeSessionSchema>;

export const magicLinkRequestSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
});

export type MagicLinkRequestDto = z.infer<typeof magicLinkRequestSchema>;

export const magicLinkLoginSchema = z.object({
  token: z.string().min(1, "Magic link token is required"),
});

export type MagicLinkLoginDto = z.infer<typeof magicLinkLoginSchema>;

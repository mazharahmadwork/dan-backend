/** Login request: id can be user id (UUID) or email */
export interface LoginDTO {
  id: string;
  password: string;
}

/**
 * Register (user POST) request body.
 * POST /api/auth/register
 */
export interface RegisterDTO {
  email: string;
  password: string;
  full_name: string;
  date_of_birth: string;
  age?: number;
  country_id: string;
  verification_status?: string;
}

/** Payload stored in the JWT (stateless – no server session) */
export interface JwtPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

/** Successful login response */
export interface LoginResponse {
  token: string;
  expiresIn: string;
  user: {
    id: string;
    email: string;
    full_name: string;
    verification_status: string;
    kyc_status: string;
    country_id: string;
    country_iso: string | null;
  };
}

/** POST /api/auth/forgot-password */
export interface ForgotPasswordDTO {
  email: string;
}

/** POST /api/auth/verify-otp */
export interface VerifyOtpDTO {
  email: string;
  otp: string;
}

/** POST /api/auth/reset-password (after OTP verified, use resetToken) */
export interface ResetPasswordDTO {
  resetToken: string;
  newPassword: string;
}

/** JWT payload for password-reset flow (short-lived) */
export interface ResetTokenPayload {
  purpose: "password_reset";
  email: string;
  iat?: number;
  exp?: number;
}

/** POST /api/auth/signup/send-otp */
export interface SignupSendOtpDTO {
  email: string;
}

/** POST /api/auth/signup/verify-otp */
export interface SignupVerifyOtpDTO {
  email: string;
  otp: string;
}

/** JWT payload for signup flow (short-lived); email is verified. */
export interface SignupTokenPayload {
  purpose: "signup";
  email: string;
  iat?: number;
  exp?: number;
}

/** POST /api/auth/signup – after OTP verified; email comes from signupToken. */
export interface SignupCreateDTO {
  signupToken: string;
  password: string;
  full_name: string;
  date_of_birth: string;
  age?: number;
  country_id: string;
  verification_status?: string;
}

import "dotenv/config";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { UserModel } from "../users/user.model";
import { UserService } from "../users/user.service";
import type {
  LoginDTO,
  JwtPayload,
  LoginResponse,
  ForgotPasswordDTO,
  VerifyOtpDTO,
  ResetPasswordDTO,
  ResetTokenPayload,
  SignupSendOtpDTO,
  SignupVerifyOtpDTO,
  SignupTokenPayload,
  SignupCreateDTO,
} from "./auth.types";

const JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret-change-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const RESET_TOKEN_EXPIRES_IN = process.env.RESET_TOKEN_EXPIRES_IN || "15m";
const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const OTP_LENGTH = 6;

/** In-memory OTP store for password-reset: email -> { otp, expiresAt } */
const otpStore = new Map<
  string,
  { otp: string; expiresAt: number }
>();

/** In-memory OTP store for signup: email -> { otp, expiresAt } */
const signupOtpStore = new Map<
  string,
  { otp: string; expiresAt: number }
>();

/**
 * Stateless JWT login. Supports multi-device / multi-session:
 * each login issues a new token; previous tokens stay valid until they expire.
 */
export async function login(data: LoginDTO): Promise<LoginResponse | null> {
  const { id, password } = data;
  if (!id?.trim() || !password) return null;

  const user = await findUserByIdentifier(id.trim());
  if (!user) return null;

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) return null;

  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
  };

  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  return {
    token,
    expiresIn: JWT_EXPIRES_IN,
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      verification_status: user.verification_status,
      kyc_status: user.verification_status,
    },
  };
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Find user by id (UUID) or email */
async function findUserByIdentifier(id: string) {
  if (id.includes("@")) {
    return UserModel.findByEmail(id);
  }
  if (UUID_REGEX.test(id)) {
    const byId = await UserModel.findById(id);
    if (byId) return byId;
  }
  return UserModel.findByEmail(id);
}

/** Verify a JWT and return payload (for use in auth middleware) */
export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch {
    return null;
  }
}

/** Generate a numeric OTP */
function generateOtp(): string {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < OTP_LENGTH; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}

type OtpEmailKind = "password_reset" | "signup";

/** Send OTP email via SMTP (Gmail or other) */
async function sendOtpEmail(
  to: string,
  otp: string,
  kind: OtpEmailKind = "password_reset"
): Promise<void> {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    throw new Error(
      "SMTP not configured. Set SMTP_USER and SMTP_PASS (use Gmail App Password for Gmail)."
    );
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  const isSignup = kind === "signup";
  const subject = isSignup
    ? "Your sign-up verification OTP"
    : "Your password reset OTP";
  const text = isSignup
    ? `Your OTP for sign-up is: ${otp}. It expires in 10 minutes. Do not share it.`
    : `Your OTP for password reset is: ${otp}. It expires in 10 minutes. Do not share it.`;
  const html = isSignup
    ? `<p>Your OTP for sign-up is: <strong>${otp}</strong>.</p><p>It expires in 10 minutes. Do not share it.</p>`
    : `<p>Your OTP for password reset is: <strong>${otp}</strong>.</p><p>It expires in 10 minutes. Do not share it.</p>`;

  await transporter.sendMail({
    from: user,
    to,
    subject,
    text,
    html,
  });
}

/**
 * Forgot password: find user by email, generate OTP, store it, send email.
 * Returns true if email was sent (we don't reveal whether email exists).
 */
export async function forgotPassword(data: ForgotPasswordDTO): Promise<boolean> {
  const email = data.email?.trim().toLowerCase();
  if (!email) return false;

  const user = await UserModel.findByEmail(email);
  if (!user) return true; // Same response so we don't leak existence

  const otp = generateOtp();
  otpStore.set(email, {
    otp,
    expiresAt: Date.now() + OTP_EXPIRY_MS,
  });

  await sendOtpEmail(email, otp);
  return true;
}

/**
 * Verify OTP: check stored OTP for email. If valid, issue short-lived reset token and clear OTP.
 */
export async function verifyOtp(data: VerifyOtpDTO): Promise<string | null> {
  const email = data.email?.trim().toLowerCase();
  const otp = String(data.otp ?? "").trim();
  if (!email || !otp) return null;

  const stored = otpStore.get(email);
  if (!stored) return null;
  if (stored.expiresAt < Date.now()) {
    otpStore.delete(email);
    return null;
  }
  if (stored.otp !== otp) return null;

  otpStore.delete(email);

  const payload: ResetTokenPayload = { purpose: "password_reset", email };
  const resetToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: RESET_TOKEN_EXPIRES_IN,
  });
  return resetToken;
}

/** Verify reset token (JWT with purpose password_reset) */
export function verifyResetToken(token: string): ResetTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as ResetTokenPayload;
    if (decoded.purpose !== "password_reset") return null;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Reset password: verify reset token, then update user password.
 */
export async function resetPassword(data: ResetPasswordDTO): Promise<boolean> {
  const payload = verifyResetToken(data.resetToken);
  if (!payload) return false;

  const newPassword = data.newPassword?.trim();
  if (!newPassword || newPassword.length < 6) return false;

  const user = await UserModel.findByEmail(payload.email);
  if (!user) return false;

  await UserService.updateUser(user.id, { password: newPassword });
  return true;
}

// ---------- Signup (send OTP → verify OTP → create user) ----------

/**
 * Signup: send OTP to email. Fails if email is already registered.
 * Returns true if OTP was sent, false if email already in use.
 */
export async function sendSignupOtp(data: SignupSendOtpDTO): Promise<boolean> {
  const email = data.email?.trim().toLowerCase();
  if (!email) return false;

  const existing = await UserModel.findByEmail(email);
  if (existing) return false; // Email already registered

  const otp = generateOtp();
  signupOtpStore.set(email, {
    otp,
    expiresAt: Date.now() + OTP_EXPIRY_MS,
  });

  await sendOtpEmail(email, otp, "signup");
  return true;
}

/**
 * Verify signup OTP: check stored OTP for email. If valid, issue short-lived signup token and clear OTP.
 */
export async function verifySignupOtp(
  data: SignupVerifyOtpDTO
): Promise<string | null> {
  const email = data.email?.trim().toLowerCase();
  const otp = String(data.otp ?? "").trim();
  if (!email || !otp) return null;

  const stored = signupOtpStore.get(email);
  if (!stored) return null;
  if (stored.expiresAt < Date.now()) {
    signupOtpStore.delete(email);
    return null;
  }
  if (stored.otp !== otp) return null;

  signupOtpStore.delete(email);

  const payload: SignupTokenPayload = { purpose: "signup", email };
  const signupToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: RESET_TOKEN_EXPIRES_IN,
  });
  return signupToken;
}

/** Verify signup token (JWT with purpose signup) */
export function verifySignupToken(token: string): SignupTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as SignupTokenPayload;
    if (decoded.purpose !== "signup") return null;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Create user after signup OTP verified: verify signupToken, then create user with email from token + body.
 */
export async function createUserAfterSignup(
  data: SignupCreateDTO
): Promise<{ id: string; email: string; full_name: string } | null> {
  const payload = verifySignupToken(data.signupToken);
  if (!payload) return null;

  const email = payload.email;
  const password = data.password?.trim();
  if (!password || password.length < 6) return null;
  if (!data.full_name?.trim() || !data.date_of_birth || !data.country_id)
    return null;

  try {
    const user = await UserService.createUser({
      email,
      password,
      full_name: data.full_name.trim(),
      date_of_birth: data.date_of_birth,
      country_id: data.country_id,
      verification_status: data.verification_status,
    });
    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
    };
  } catch (err) {
    if (err instanceof Error && err.message === "INVALID_COUNTRY") throw err;
    if (err instanceof Error && err.message === "EMAIL_IN_USE") throw err;
    return null;
  }
}

// ---------- KYC approval ----------

/**
 * Mark the current user's KYC as approved by setting verification_status = "verified".
 * Returns the updated user, or null if the user does not exist.
 */
export async function approveKyc(userId: string) {
  const updated = await UserService.updateUser(userId, {
    verification_status: "verified",
  });
  return updated;
}

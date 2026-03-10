import { Router } from "express";
import {
  loginHandler,
  forgotPasswordHandler,
  verifyOtpHandler,
  resetPasswordHandler,
  sendSignupOtpHandler,
  verifySignupOtpHandler,
  signupHandler,
  approveKycHandler,
} from "./auth.controller";
import { requireAuth } from "./auth.middleware";

const router = Router();

/** POST /api/auth/login – body: { id, password }. id = user id (UUID) or email. */
router.post("/login", loginHandler);

/** POST /api/auth/forgot-password – body: { email }. Sends OTP via Gmail SMTP. */
router.post("/forgot-password", forgotPasswordHandler);

/** POST /api/auth/verify-otp – body: { email, otp }. Returns resetToken. */
router.post("/verify-otp", verifyOtpHandler);

/** POST /api/auth/reset-password – body: { resetToken, newPassword }. */
router.post("/reset-password", resetPasswordHandler);

// ---------- Signup (send OTP → verify OTP → create user) ----------

/** POST /api/auth/signup/send-otp – body: { email }. Sends OTP for sign-up. */
router.post("/signup/send-otp", sendSignupOtpHandler);

/** POST /api/auth/signup/verify-otp – body: { email, otp }. Returns signupToken. */
router.post("/signup/verify-otp", verifySignupOtpHandler);

/** POST /api/auth/signup – body: { signupToken, password, full_name, date_of_birth, country_id }. Creates user after OTP verified. */
router.post("/signup", signupHandler);

/** POST /api/auth/kyc-approve – header: Authorization: Bearer <token>. Marks current user's KYC as verified. */
router.post("/kyc-approve", requireAuth, approveKycHandler);

export default router;

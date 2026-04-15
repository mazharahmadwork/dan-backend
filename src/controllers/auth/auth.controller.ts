import { Request, Response } from "express";
import {
  login,
  forgotPassword,
  verifyOtp,
  resetPassword,
  sendSignupOtp,
  verifySignupOtp,
  createUserAfterSignup,
  approveKyc,
} from "./auth.service";

export async function loginHandler(req: Request, res: Response) {
  try {
    const { id, password } = req.body;

    if (!id || !password) {
      res.status(400).json({
        success: false,
        message: "id and password are required",
      });
      return;
    }

    const result = await login({ id: String(id).trim(), password });

    if (!result) {
      res.status(401).json({
        success: false,
        message: "Invalid id or password",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while signing in. Please try again.",
    });
  }
}

/** POST /api/auth/kyc-approve – header: Authorization: Bearer <token>. Marks current user's KYC as verified. */
export async function approveKycHandler(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authorization token required",
      });
      return;
    }

    const updated = await approveKyc(userId);
    if (!updated) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const { password_hash: _pw, ...safeUser } = updated;

    res.status(200).json({
      success: true,
      message: "KYC approved successfully.",
      data: safeUser,
    });
  } catch (error) {
    console.error("Error during KYC approval:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve KYC. Please try again.",
    });
  }
}

/** POST /api/auth/forgot-password – body: { email }. Sends OTP via SMTP (Gmail). */
export async function forgotPasswordHandler(req: Request, res: Response) {
  try {
    const { email } = req.body;
    if (!email || typeof email !== "string" || !email.trim()) {
      res.status(400).json({
        success: false,
        message: "email is required",
      });
      return;
    }

    await forgotPassword({ email: email.trim().toLowerCase() });
    res.status(200).json({
      success: true,
      message:
        "If an account exists with this email, an OTP has been sent. Check your inbox.",
    });
  } catch (error) {
    console.error("Error during forgot-password:", error);
    res.status(500).json({
      success: false,
      message:
        error instanceof Error && error.message.includes("SMTP")
          ? error.message
          : "Failed to send OTP. Please try again.",
    });
  }
}

/** POST /api/auth/verify-otp – body: { email, otp }. Returns resetToken on success. */
export async function verifyOtpHandler(req: Request, res: Response) {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      res.status(400).json({
        success: false,
        message: "email and otp are required",
      });
      return;
    }

    const resetToken = await verifyOtp({
      email: String(email).trim(),
      otp: String(otp).trim(),
    });

    if (!resetToken) {
      res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "OTP verified. Use resetToken to reset your password.",
      data: { resetToken },
    });
  } catch (error) {
    console.error("Error during verify-otp:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify OTP. Please try again.",
    });
  }
}

/** POST /api/auth/reset-password – body: { resetToken, newPassword }. Updates password after OTP flow. */
export async function resetPasswordHandler(req: Request, res: Response) {
  try {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword) {
      res.status(400).json({
        success: false,
        message: "resetToken and newPassword are required",
      });
      return;
    }

    if (String(newPassword).trim().length < 6) {
      res.status(400).json({
        success: false,
        message: "newPassword must be at least 6 characters",
      });
      return;
    }

    const updated = await resetPassword({
      resetToken: String(resetToken),
      newPassword: String(newPassword).trim(),
    });

    if (!updated) {
      res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Password updated successfully. You can now log in.",
    });
  } catch (error) {
    console.error("Error during reset-password:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update password. Please try again.",
    });
  }
}

/** POST /api/auth/signup/send-otp – body: { email }. Sends OTP for sign-up. */
export async function sendSignupOtpHandler(req: Request, res: Response) {
  try {
    const { email } = req.body;
    if (!email || typeof email !== "string" || !email.trim()) {
      res.status(400).json({
        success: false,
        message: "email is required",
      });
      return;
    }

    const sent = await sendSignupOtp({ email: email.trim().toLowerCase() });
    if (!sent) {
      res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "OTP sent to your email. Use it to verify and complete sign-up.",
    });
  } catch (error) {
    console.error("Error during signup send-otp:", error);
    res.status(500).json({
      success: false,
      message:
        error instanceof Error && error.message.includes("SMTP")
          ? error.message
          : "Failed to send OTP. Please try again.",
    });
  }
}

/** POST /api/auth/signup/verify-otp – body: { email, otp }. Returns signupToken. */
export async function verifySignupOtpHandler(req: Request, res: Response) {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      res.status(400).json({
        success: false,
        message: "email and otp are required",
      });
      return;
    }

    const signupToken = await verifySignupOtp({
      email: String(email).trim(),
      otp: String(otp).trim(),
    });

    if (!signupToken) {
      res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "OTP verified. Use signupToken to complete registration.",
      data: { signupToken },
    });
  } catch (error) {
    console.error("Error during signup verify-otp:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify OTP. Please try again.",
    });
  }
}

/** POST /api/auth/signup – body: { signupToken, password, full_name, date_of_birth, country_id }. Creates user after OTP verified. */
export async function signupHandler(req: Request, res: Response) {
  try {
    const {
      signupToken,
      password,
      full_name,
      date_of_birth,
      age,
      country_id,
      verification_status,
    } = req.body;

    if (!signupToken || !password || !full_name || !date_of_birth || !country_id) {
      res.status(400).json({
        success: false,
        message:
          "signupToken, password, full_name, date_of_birth and country_id are required",
      });
      return;
    }

    if (String(password).trim().length < 6) {
      res.status(400).json({
        success: false,
        message: "password must be at least 6 characters",
      });
      return;
    }

    if (age !== undefined) {
      const parsedAge = Number(age);
      if (!Number.isInteger(parsedAge) || parsedAge < 0) {
        res.status(400).json({
          success: false,
          message: "age must be a non-negative integer",
        });
        return;
      }
    }

    let user: { id: string; email: string; full_name: string } | null = null;
    try {
      user = await createUserAfterSignup({
        signupToken: String(signupToken),
        password: String(password).trim(),
        full_name: String(full_name).trim(),
        date_of_birth: String(date_of_birth),
        age: age !== undefined ? Number(age) : undefined,
        country_id: String(country_id),
        verification_status: verification_status
          ? String(verification_status)
          : undefined,
      });
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === "INVALID_COUNTRY") {
          res.status(400).json({
            success: false,
            message: "Invalid country_id. Country does not exist.",
          });
          return;
        }
        if (err.message === "EMAIL_IN_USE") {
          res.status(409).json({
            success: false,
            message: "An account with this email already exists.",
          });
          return;
        }
      }
      throw err;
    }

    if (!user) {
      res.status(400).json({
        success: false,
        message: "Invalid or expired signup token.",
      });
      return;
    }

    res.status(201).json({
      success: true,
      message: "Account created successfully. You can now log in.",
      data: user,
    });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create account. Please try again.",
    });
  }
}

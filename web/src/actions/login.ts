"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { safeAdminCallbackUrl } from "@/lib/adminAuth";

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const callbackUrl = safeAdminCallbackUrl(
    String(formData.get("callbackUrl") ?? "/admin"),
  );

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  try {
    // On success Auth.js throws a NEXT_REDIRECT — must not be swallowed.
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl,
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return { error: "Invalid email or password." };
      }
      return {
        error: "Sign-in failed. Check AUTH_SECRET and database configuration.",
      };
    }
    throw error;
  }
}

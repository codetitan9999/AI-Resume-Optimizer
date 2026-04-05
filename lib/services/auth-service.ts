import { AuthUser } from "@/types/auth";
import { LoginInput, SignupInput } from "@/utils/auth-schemas";

export const AUTH_SESSION_CHANGED_EVENT = "airo:auth-session-changed";

type SessionResponse = {
  authenticated: boolean;
  user: AuthUser | null;
  expiresAt?: number;
};

type AuthResponse = {
  user: AuthUser;
};

function emitAuthSessionChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT));
  }
}

async function parseJson<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as T & { message?: string };

  if (!response.ok) {
    const fallback = "Request failed.";
    throw new Error((payload as { message?: string }).message ?? fallback);
  }

  return payload;
}

export const authService = {
  async signup(input: SignupInput) {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(input)
    });

    const data = await parseJson<AuthResponse>(response);
    emitAuthSessionChanged();
    return data;
  },

  async login(input: LoginInput) {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(input)
    });

    const data = await parseJson<AuthResponse>(response);
    emitAuthSessionChanged();
    return data;
  },

  async logout() {
    const response = await fetch("/api/auth/logout", {
      method: "POST"
    });

    const data = await parseJson<{ success: boolean }>(response);
    emitAuthSessionChanged();
    return data;
  },

  async session() {
    const response = await fetch("/api/auth/session", {
      method: "GET",
      cache: "no-store"
    });

    return parseJson<SessionResponse>(response);
  }
};

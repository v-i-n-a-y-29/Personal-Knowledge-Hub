const TOKEN_KEY = "pkh_token";

export function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(TOKEN_KEY);
}

export function saveAuth(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuth() {
  window.localStorage.removeItem(TOKEN_KEY);
}

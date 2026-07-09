/**
 * Retrieves the auth token from whichever storage holds it.
 *
 * - "Remember Me" login  → stored in localStorage  (key: "token")
 * - Normal login         → stored in sessionStorage (key: "token")
 *
 * Always use this function instead of calling sessionStorage.getItem("token")
 * directly so that remembered sessions are honoured app-wide.
 */
export function getToken(): string | null {
    return sessionStorage.getItem("token") ?? localStorage.getItem("token");
}

/**
 * Retrieves the MODERATOR auth token.
 *
 * - Mod "Remember Me" login → stored in localStorage (key: "modToken")
 * - Mod normal login        → stored in sessionStorage (key: "token")
 *
 * Use this in mod-only pages instead of getToken() to correctly distinguish
 * between user and moderator sessions.
 */
export function getModToken(): string | null {
    return sessionStorage.getItem("token") ?? localStorage.getItem("modToken");
}

/**
 * Removes the token from both storages and clears the remembered email.
 * Call this on logout.
 */
export function clearToken(): void {
    sessionStorage.removeItem("token");
    localStorage.removeItem("token");
    localStorage.removeItem("rememberedEmail");
    // Also clear moderator keys if present
    localStorage.removeItem("modToken");
    localStorage.removeItem("modRememberedEmail");
}

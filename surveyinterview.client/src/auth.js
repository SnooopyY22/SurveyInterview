const TOKEN_KEY = 'survey_token';
const USER_KEY = 'survey_admin';
const ROLE_KEY = 'survey_role';
const EMAIL_KEY = 'survey_email';

export function getToken() {
    try {
        return localStorage.getItem(TOKEN_KEY);
    } catch {
        return null;
    }
}

export function getUsername() {
    try {
        return localStorage.getItem(USER_KEY);
    } catch {
        return null;
    }
}

export function getEmail() {
    try {
        return localStorage.getItem(EMAIL_KEY);
    } catch {
        return null;
    }
}

export function getRole() {
    try {
        return localStorage.getItem(ROLE_KEY);
    } catch {
        return null;
    }
}

export function isAdmin() {
    return getRole() === 'Admin';
}

export function setSession({ token, username, role, email }) {
    try {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, username);
        localStorage.setItem(ROLE_KEY, role || 'Respondent');
        if (email) {
            localStorage.setItem(EMAIL_KEY, email);
        } else {
            localStorage.removeItem(EMAIL_KEY);
        }
    } catch {
        // localStorage tidak tersedia (private mode) — abaikan
    }
}

export function clearSession() {
    try {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(ROLE_KEY);
        localStorage.removeItem(EMAIL_KEY);
    } catch {
        // abaikan
    }
}

export function authHeaders() {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

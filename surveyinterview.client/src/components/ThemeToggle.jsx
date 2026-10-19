import { useState } from 'react';

function currentTheme() {
    return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    try {
        localStorage.setItem('surveyTheme', theme);
    } catch {
        /* ignore */
    }
}

function SunIcon() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden="true"
        >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
    );
}

function MoonIcon() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
    );
}

export function ThemeToggle({ className = '' }) {
    const [theme, setTheme] = useState(currentTheme);
    const isDark = theme === 'dark';

    function toggle() {
        const next = isDark ? 'light' : 'dark';
        applyTheme(next);
        setTheme(next);
    }

    return (
        <button
            type="button"
            className={`theme-toggle ${className}`.trim()}
            onClick={toggle}
            aria-label={isDark ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
            title={isDark ? 'Mode terang' : 'Mode gelap'}
        >
            {isDark ? <SunIcon /> : <MoonIcon />}
            <span>{isDark ? 'Mode Terang' : 'Mode Gelap'}</span>
        </button>
    );
}
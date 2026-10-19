import { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { surveyApi } from '../api/SurveyApi';
import { setSession } from '../auth';
import { ThemeToggle } from './ThemeToggle';

function IconEye({ hidden }) {
    return (
        <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
            {!hidden && <line x1="1" y1="1" x2="23" y2="23" />}
        </svg>
    );
}

export function Login() {
    const [mode, setMode] = useState('login');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [capsLock, setCapsLock] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [shake, setShake] = useState(false);
    const shakeTimer = useRef(null);

    const navigate = useNavigate();
    const location = useLocation();

    const isRegister = mode === 'register';

    function triggerError(message) {
        setError(message);
        setShake(true);
        clearTimeout(shakeTimer.current);
        shakeTimer.current = setTimeout(() => setShake(false), 550);
    }

    function switchMode(nextMode) {
        if (loading || nextMode === mode) return;
        setMode(nextMode);
        setError('');
        setPassword('');
        setConfirmPassword('');
        setShowPassword(false);
    }

    function homeFor(role) {
        if (location.state?.from) return location.state.from;
        return role === 'Admin' ? '/' : '/fill';
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (!username.trim() || !password) {
            triggerError('Isi username dan password terlebih dahulu.');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const result = isRegister
                ? await surveyApi.register({
                    username: username.trim(),
                    email: email.trim(),
                    password,
                    confirmPassword,
                })
                : await surveyApi.login(username.trim(), password);

            setSession(result);

            if (isRegister) {
                toast.success(`Akun berhasil dibuat. Selamat datang, ${result.username}!`);
            } else {
                toast.success(`Selamat datang, ${result.username}!`);
            }

            navigate(homeFor(result.role), { replace: true });
        } catch (err) {
            triggerError(err.message || 'Login gagal. Coba lagi.');
        } finally {
            setLoading(false);
        }
    }

    function trackCapsLock(event) {
        if (typeof event.getModifierState === 'function') {
            setCapsLock(event.getModifierState('CapsLock'));
        }
    }

    return (
        <div className="login-page">
            <header className="public-topbar">
                <div className="brand">
                    <div className="brand-mark">IS</div>
                    <strong>Interview Kerja</strong>
                </div>

                <ThemeToggle />

                <div className="login-switch" role="tablist" aria-label="Mode akun">
                    <button
                        type="button"
                        role="tab"
                        aria-selected={!isRegister}
                        className={isRegister ? '' : 'active'}
                        onClick={() => switchMode('login')}
                        disabled={loading}
                    >
                        Masuk
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={isRegister}
                        className={isRegister ? 'active' : ''}
                        onClick={() => switchMode('register')}
                        disabled={loading}
                    >
                        Daftar
                    </button>
                </div>
            </header>

            <main className="login-main">
                <div className="login-sheet">
                    <div className="content-header">
                        <span className="eyebrow">
                            {isRegister ? 'Daftar responden' : 'Masuk'}
                        </span>
                        <h1>
                            {isRegister
                                ? 'Buat akun responden kamu'
                                : 'Selamat datang kembali'}
                        </h1>
                        <p>
                            {isRegister
                                ? 'Akun dipakai untuk menyimpan identitas saat mengisi survey.'
                                : 'Masuk untuk mengelola survey dan membaca hasil interview.'}
                        </p>
                    </div>

                    {error && (
                        <div className="alert alert-error" role="alert">
                            {error}
                        </div>
                    )}

                    <form
                        className={`content-card login-card${shake ? ' shake' : ''}`}
                        onSubmit={handleSubmit}
                        noValidate
                    >
                        <div className="fill-section">
                            <div className="fill-section-header">
                                <span>
                                    {isRegister
                                        ? 'Formulir pendaftaran'
                                        : 'Formulir login'}
                                </span>
                                <h2>
                                    {isRegister
                                        ? 'Data akun responden'
                                        : 'Identitas pengguna'}
                                </h2>
                            </div>

                            <div className="fill-question-list">
                                <div className="fill-question">
                                    <label htmlFor="login-username">
                                        <strong>1. Username</strong>
                                    </label>
                                    <input
                                        id="login-username"
                                        type="text"
                                        placeholder="cth. budi"
                                        value={username}
                                        onChange={(event) =>
                                            setUsername(event.target.value)
                                        }
                                        autoComplete="username"
                                        autoFocus
                                        disabled={loading}
                                    />
                                </div>

                                {isRegister && (
                                    <div className="fill-question">
                                        <label htmlFor="login-email">
                                            <strong>2. Email</strong>
                                        </label>
                                        <input
                                            id="login-email"
                                            type="email"
                                            placeholder="nama@email.com"
                                            value={email}
                                            onChange={(event) =>
                                                setEmail(event.target.value)
                                            }
                                            autoComplete="email"
                                            disabled={loading}
                                        />
                                    </div>
                                )}

                                <div className="fill-question">
                                    <label htmlFor="login-password">
                                        <strong>
                                            {isRegister ? '3. Password' : '2. Password'}
                                        </strong>
                                    </label>
                                    <div className="login-pw">
                                        <input
                                            id="login-password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder={
                                                isRegister ? 'Minimal 6 karakter' : '••••••••'
                                            }
                                            value={password}
                                            onChange={(event) =>
                                                setPassword(event.target.value)
                                            }
                                            onKeyUp={trackCapsLock}
                                            onKeyDown={trackCapsLock}
                                            onBlur={() => setCapsLock(false)}
                                            autoComplete={
                                                isRegister ? 'new-password' : 'current-password'
                                            }
                                            disabled={loading}
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={() => setShowPassword((value) => !value)}
                                            aria-label={
                                                showPassword
                                                    ? 'Sembunyikan password'
                                                    : 'Tampilkan password'
                                            }
                                            tabIndex={-1}
                                        >
                                            <IconEye hidden={showPassword} />
                                        </button>
                                    </div>
                                    {capsLock && (
                                        <div className="caps-warn" role="status">
                                            Caps Lock sedang menyala
                                        </div>
                                    )}
                                </div>

                                {isRegister && (
                                    <div className="fill-question">
                                        <label htmlFor="login-confirm-password">
                                            <strong>4. Ulangi password</strong>
                                        </label>
                                        <input
                                            id="login-confirm-password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Ketik ulang password"
                                            value={confirmPassword}
                                            onChange={(event) =>
                                                setConfirmPassword(event.target.value)
                                            }
                                            autoComplete="new-password"
                                            disabled={loading}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="form-actions">
                            <button
                                type="submit"
                                className="button button-primary"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner" />{' '}
                                        {isRegister ? 'Mendaftar...' : 'Memverifikasi...'}
                                    </>
                                ) : (
                                    <>
                                        {isRegister ? 'Daftar akun' : 'Masuk'}
                                        <svg
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            aria-hidden="true"
                                        >
                                            <line x1="5" y1="12" x2="19" y2="12" />
                                            <polyline points="12 5 19 12 12 19" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <p className="login-note">
                        {isRegister
                            ? 'Sudah punya akun? Pilih "Masuk" di kanan atas.'
                            : 'Belum punya akun responden? Pilih "Daftar" di kanan atas.'}
                    </p>
                </div>
            </main>
        </div>
    );
}

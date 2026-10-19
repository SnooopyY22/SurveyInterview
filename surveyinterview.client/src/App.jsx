import { useEffect, useState } from 'react';
import {
    Link,
    Navigate,
    Outlet,
    Route,
    Routes,
    useLocation,
    useNavigate,
    useParams,
} from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import './App.css';

import { clearSession, getRole, getToken, getUsername, isAdmin } from './auth';

import { useSurveys } from './hooks/useSurveys';
import { useResponses } from './hooks/useResponses';
import { useSurveyBuilder } from './hooks/useSurveyBuilder';

import { surveyService } from './services/SurveyService';
import { isOpen } from './deadline';

import { Sidebar } from './components/Sidebar';
import { ThemeToggle } from './components/ThemeToggle';
import { Login } from './components/Login';
import { SurveyList } from './components/SurveyList';
import { CreateSurvey } from './components/CreateSurvey';
import { EditSurvey } from './components/EditSurvey';
import { SurveyBuilder } from './components/SurveyBuilder';
import { FillSurvey } from './components/FillSurvey';
import { ResponseList } from './components/ResponseList';
import { ResponseDetail } from './components/ResponseDetail';
import { ResultPage } from './components/ResultPage';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';

// =========================
// Guard / Layout
// =========================

function RequireAuth({ children, role }) {
    const location = useLocation();

    if (!getToken()) {
        return (
            <Navigate to="/login" state={{ from: location.pathname }} replace />
        );
    }

    // Session lama tidak menyimpan role — diperlakukan sebagai admin.
    const currentRole = getRole() || 'Admin';

    if (role && currentRole !== role) {
        return <Navigate to="/fill" replace />;
    }

    return children;
}

function AdminLayout({ onLogout }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const username = getUsername();

    return (
        <div className="app-shell">
            <header className="mobile-topbar">
                <button
                    type="button"
                    className="hamburger"
                    onClick={() => setMenuOpen(true)}
                    aria-label="Buka menu"
                >
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                    >
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <line x1="3" y1="12" x2="21" y2="12" />
                        <line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                </button>
                <div className="brand mobile-brand">
                    <div className="brand-mark">IS</div>
                    <strong>Interview Kerja</strong>
                </div>
            </header>

            <Sidebar
                open={menuOpen}
                onClose={() => setMenuOpen(false)}
                username={username}
                onLogout={onLogout}
            />

            <main className="main-content">
                <div className="content-container">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

function PublicShell({ onLogout }) {
    const loggedIn = !!getToken();
    const username = getUsername();

    return (
        <div className="public-shell">
            <header className="public-topbar">
                <div className="brand">
                    <div className="brand-mark">IS</div>
                    <strong>Interview Kerja</strong>
                </div>

                <ThemeToggle />

                {loggedIn ? (
                    <div className="public-account">
                        <span className="public-user">{username}</span>
                        <button
                            type="button"
                            className="public-login-link"
                            onClick={onLogout}
                        >
                            Keluar
                        </button>
                    </div>
                ) : (
                    <Link to="/login" className="public-login-link">
                        Login Admin
                    </Link>
                )}
            </header>
            <main className="public-main">
                <div className="content-container">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

// =========================
// Route Pages (Admin)
// =========================

function SurveyListPage({
    surveys,
    loading,
    error,
    createError,
    onCreate,
    onManage,
    onDelete,
    onFill,
    onAnalytics,
    onUpdateSurvey,
    submitting,
}) {
    const [editingSurvey, setEditingSurvey] = useState(null);

    async function handleUpdate(payload) {
        const ok = await onUpdateSurvey(editingSurvey.id, payload);
        if (ok) setEditingSurvey(null);
    }

    return (
        <>
            <SurveyList
                surveys={surveys}
                loading={loading}
                error={error || createError}
                onCreate={onCreate}
                onEdit={(survey) => setEditingSurvey(survey)}
                onManage={onManage}
                onDelete={onDelete}
                onFill={onFill}
                onAnalytics={onAnalytics}
            />

            {editingSurvey && (
                <div
                    className="modal-overlay"
                    role="presentation"
                    onClick={() => {
                        if (!submitting) setEditingSurvey(null);
                    }}
                >
                    <div
                        className="modal-dialog modal-dialog-lg"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="edit-survey-title"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h3 id="edit-survey-title">Edit Survey</h3>
                            <button
                                className="icon-button icon-button-sm"
                                type="button"
                                disabled={submitting}
                                onClick={() => setEditingSurvey(null)}
                            >
                                Tutup
                            </button>
                        </div>
                        <EditSurvey
                            survey={editingSurvey}
                            saving={submitting}
                            error={createError}
                            embedded
                            onSubmit={handleUpdate}
                            onCancel={() => setEditingSurvey(null)}
                        />
                    </div>
                </div>
            )}
        </>
    );
}

function CreateSurveyPage({ saving, error, onSubmit, onCancel }) {
    return (
        <CreateSurvey
            saving={saving}
            error={error}
            onSubmit={onSubmit}
            onCancel={onCancel}
        />
    );
}

function EditSurveyPage({ surveys, loading, saving, error, onSubmit, onCancel }) {
    const { id } = useParams();
    const surveyId = Number(id);
    const survey = surveys.find((item) => item.id === surveyId);
    const navigate = useNavigate();

    if (loading) {
        return <div className="empty-state">Memuat data survey...</div>;
    }

    if (!survey) {
        return (
            <div className="empty-state">
                Survey tidak ditemukan.
                <div className="form-actions">
                    <button
                        type="button"
                        className="button"
                        onClick={() => navigate('/')}
                    >
                        Kembali
                    </button>
                </div>
            </div>
        );
    }

    return (
        <EditSurvey
            survey={survey}
            saving={saving}
            error={error}
            onSubmit={(payload) => onSubmit(surveyId, payload)}
            onCancel={onCancel}
        />
    );
}

function ManageSurveyPage({ builder, onToggleStatus, onSave }) {
    const { id } = useParams();
    const surveyId = Number(id);
    const { loadDetail } = builder;

    useEffect(() => {
        loadDetail(surveyId);
    }, [surveyId, loadDetail]);

    const loading =
        !builder.survey || builder.survey.id !== surveyId;

    if (loading && !builder.error) {
        return <div className="empty-state">Memuat survey...</div>;
    }

    if (builder.error && !builder.survey) {
        return (
            <div className="empty-state">
                {builder.error}
                <div className="form-actions">
                    <button
                        type="button"
                        className="button"
                        onClick={() => window.history.back()}
                    >
                        Kembali
                    </button>
                </div>
            </div>
        );
    }

    return (
        <SurveyBuilder
            survey={builder.survey}
            saving={builder.saving}
            error={builder.error}
            message={builder.message}
            onAddSection={builder.addSection}
            onAddQuestion={builder.addQuestion}
            onUpdateQuestion={builder.updateQuestion}
            onRemoveSection={builder.removeSection}
            onRemoveQuestion={builder.removeQuestion}
            onToggleMandatory={builder.toggleSectionMandatory}
            onToggleStatus={onToggleStatus}
            onSave={onSave}
            onBack={() => window.history.back()}
        />
    );
}

function ResponseListPage({
    responses,
    loading,
    error,
    loadAll,
    onDetail,
}) {
    useEffect(() => {
        loadAll();
    }, [loadAll]);

    return (
        <ResponseList
            responses={responses}
            loading={loading}
            error={error}
            onRefresh={loadAll}
            onDetail={onDetail}
        />
    );
}

function ResponseDetailPage({
    selectedResponse,
    detailLoading,
    error,
    loadDetail,
    onBack,
}) {
    const { id } = useParams();

    useEffect(() => {
        loadDetail(Number(id));
    }, [id, loadDetail]);

    return (
        <ResponseDetail
            response={selectedResponse}
            loading={detailLoading}
            error={error}
            onBack={onBack}
        />
    );
}

function AnalyticsPage({ surveys, onBack }) {
    const { id } = useParams();
    const surveyId = Number(id);
    const survey = surveys.find((item) => item.id === surveyId);

    return (
        <AnalyticsDashboard
            surveyId={surveyId}
            surveyTitle={survey?.title}
            onBack={onBack}
        />
    );
}

// =========================
// Route Pages (Publik)
// =========================

function FillSurveyListPage({ surveys, loading, error, onFill }) {
    const navigate = useNavigate();
    const [completedIds, setCompletedIds] = useState([]);

    useEffect(() => {
        let active = true;

        surveyService
            .loadCompletedIds()
            .then((ids) => {
                if (active && Array.isArray(ids)) setCompletedIds(ids);
            })
            .catch(() => {
                // abaikan; kalau gagal, daftar tampil semua
            });

        return () => {
            active = false;
        };
    }, []);

    const availableSurveys = surveys.filter(
        (item) => isOpen(item) && !completedIds.includes(item.id)
    );

    return (
        <SurveyList
            surveys={availableSurveys}
            loading={loading}
            error={error}
            onFill={onFill}
            showActions={false}
            onBack={isAdmin() ? () => navigate('/') : undefined}
        />
    );
}

function FillSurveyPage({ onSubmitSuccess }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [survey, setSurvey] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        (async () => {
            try {
                setLoading(true);
                setError('');
                const data = await surveyService.loadDetail(id);
                if (active) setSurvey(data);
            } catch (err) {
                if (active) setError(err.message);
            } finally {
                if (active) setLoading(false);
            }
        })();

        return () => {
            active = false;
        };
    }, [id]);

    if (loading) {
        return <div className="empty-state">Memuat survey...</div>;
    }

    if (error) {
        return (
            <div className="empty-state">
                {error}
                <div className="form-actions">
                    <button
                        type="button"
                        className="button"
                        onClick={() => navigate('/fill')}
                    >
                        Kembali ke daftar survey
                    </button>
                </div>
            </div>
        );
    }

    return (
        <FillSurvey
            survey={survey}
            error=""
            onCancel={() => navigate('/fill')}
            onSubmitSuccess={onSubmitSuccess}
        />
    );
}

function ResultPageRoute() {
    const navigate = useNavigate();
    return <ResultPage onBack={() => navigate('/fill')} />;
}

// =========================
// App
// =========================

function App() {
    const [creatingSurvey, setCreatingSurvey] = useState(false);
    const [createError, setCreateError] = useState('');

    const navigate = useNavigate();

    const {
        surveys,
        loading: surveysLoading,
        error: surveysError,
        reload: reloadSurveys,
        addSurvey,
    } = useSurveys();

    const {
        responses,
        selectedResponse,
        loading: responsesLoading,
        detailLoading,
        error: responsesError,
        loadAll: loadAllResponses,
        loadDetail: loadResponseDetail,
    } = useResponses();

    const builder = useSurveyBuilder();

    // =========================
    // Handlers: Survey CRUD
    // =========================

    async function handleCreateSurvey(payload) {
        try {
            setCreatingSurvey(true);
            setCreateError('');
            const newSurvey = await surveyService.create(payload);
            addSurvey(newSurvey);
            toast.success('Survey berhasil dibuat.');
            navigate('/');
        } catch (err) {
            setCreateError(err.message);
        } finally {
            setCreatingSurvey(false);
        }
    }

    async function handleUpdateSurvey(surveyId, payload) {
        try {
            setCreatingSurvey(true);
            setCreateError('');
            await surveyService.update(surveyId, payload);
            toast.success('Survey berhasil diperbarui.');
            await reloadSurveys();
            navigate('/');
            return true;
        } catch (err) {
            setCreateError(err.message);
            return false;
        } finally {
            setCreatingSurvey(false);
        }
    }

    async function handleDeleteSurvey(surveyId) {
        if (
            !window.confirm(
                'Hapus survey ini? Tindakan ini tidak bisa dibatalkan. Jika survey sudah memiliki responden, penghapusan akan ditolak.'
            )
        ) {
            return;
        }
        try {
            await surveyService.removeSurvey(surveyId);
            await reloadSurveys();
            toast.success('Survey berhasil dihapus.');
        } catch (err) {
            setCreateError(err.message);
            toast.error(err.message);
        }
    }

    async function handleToggleStatus(surveyId, currentStatus) {
        try {
            await surveyService.toggleStatus(surveyId, !currentStatus);
            await reloadSurveys();
            if (builder.survey?.id === surveyId) {
                await builder.loadDetail(surveyId);
            }
            toast.success(
                `Survey sekarang ${
                    !currentStatus ? 'aktif' : 'nonaktif'
                }.`
            );
        } catch (err) {
            setCreateError(err.message);
            toast.error(err.message);
        }
    }

    async function handleSaveBuilder() {
        if (!builder.survey) return;
        const data = await builder.loadDetail(builder.survey.id);
        if (data) {
            toast.success('Semua perubahan tersimpan.');
        }
    }

    // =========================
    // Handlers: Response
    // =========================

    function handleLogout() {
        clearSession();
        toast.success('Anda telah keluar.');
        navigate('/login', { replace: true });
    }

    // =========================
    // Render
    // =========================

    return (
        <>
            <Toaster
                position="top-center"
                toastOptions={{
                    duration: 4000,
                    success: { duration: 3000 },
                    error: { duration: 5000 },
                }}
            />

            <Routes>
                {/* Login (publik) */}
                <Route
                    path="/login"
                    element={
                        getToken() ? (
                            <Navigate
                                to={getRole() === 'Respondent' ? '/fill' : '/'}
                                replace
                            />
                        ) : (
                            <Login />
                        )
                    }
                />

                {/* Shell publik: halaman responden */}
                <Route
                    element={<PublicShell onLogout={handleLogout} />}
                >
                    <Route
                        path="/fill"
                        element={
                            <FillSurveyListPage
                                surveys={surveys}
                                loading={surveysLoading}
                                error={surveysError}
                                onFill={(surveyId) =>
                                    navigate(`/fill/${surveyId}`)
                                }
                            />
                        }
                    />
                    <Route
                        path="/fill/:id"
                        element={
                            <FillSurveyPage
                                onSubmitSuccess={() => navigate('/result')}
                            />
                        }
                    />
                    <Route
                        path="/result"
                        element={<ResultPageRoute />}
                    />
                </Route>

                {/* Shell admin: wajib login */}
                <Route
                    element={
                        <RequireAuth role="Admin">
                            <AdminLayout onLogout={handleLogout} />
                        </RequireAuth>
                    }
                >
                    <Route
                        path="/"
                        element={
                            <SurveyListPage
                                surveys={surveys}
                                loading={surveysLoading}
                                error={surveysError}
                                createError={createError}
                                onCreate={() => navigate('/survey/new')}
                                onManage={(surveyId) =>
                                    navigate(`/survey/${surveyId}/manage`)
                                }
                                onDelete={handleDeleteSurvey}
                                onFill={(surveyId) =>
                                    navigate(`/fill/${surveyId}`)
                                }
                                onAnalytics={(surveyId) =>
                                    navigate(`/analytics/${surveyId}`)
                                }
                                onUpdateSurvey={handleUpdateSurvey}
                                submitting={creatingSurvey}
                            />
                        }
                    />
                    <Route
                        path="/survey/new"
                        element={
                            <CreateSurveyPage
                                saving={creatingSurvey}
                                error={createError}
                                onSubmit={handleCreateSurvey}
                                onCancel={() => navigate('/')}
                            />
                        }
                    />
                    <Route
                        path="/survey/:id/edit"
                        element={
                            <EditSurveyPage
                                surveys={surveys}
                                loading={surveysLoading}
                                saving={creatingSurvey}
                                error={createError}
                                onSubmit={handleUpdateSurvey}
                                onCancel={() => navigate('/')}
                            />
                        }
                    />
                    <Route
                        path="/survey/:id/manage"
                        element={
                            <ManageSurveyPage
                                builder={builder}
                                onToggleStatus={handleToggleStatus}
                                onSave={handleSaveBuilder}
                            />
                        }
                    />
                    <Route
                        path="/responses"
                        element={
                            <ResponseListPage
                                responses={responses}
                                loading={responsesLoading}
                                error={responsesError}
                                loadAll={loadAllResponses}
                                onDetail={(responseId) =>
                                    navigate(`/responses/${responseId}`)
                                }
                            />
                        }
                    />
                    <Route
                        path="/responses/:id"
                        element={
                            <ResponseDetailPage
                                selectedResponse={selectedResponse}
                                detailLoading={detailLoading}
                                error={responsesError}
                                loadDetail={loadResponseDetail}
                                onBack={() => navigate('/responses')}
                            />
                        }
                    />
                    <Route
                        path="/analytics/:id"
                        element={
                            <AnalyticsPage
                                surveys={surveys}
                                onBack={() => navigate('/')}
                            />
                        }
                    />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
    );
}

export default App;
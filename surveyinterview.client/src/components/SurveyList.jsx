import { Header } from './Header';
import { formatDeadline, isExpired, isOpen } from '../deadline';

function statusOf(survey) {
    if (isExpired(survey)) return { label: 'Lewat tenggat', tone: 'is-expired' };
    if (!survey.isActive) return { label: 'Nonaktif', tone: 'is-off' };
    return { label: 'Aktif', tone: 'is-on' };
}

export function SurveyList({
    surveys,
    loading,
    error,
    message,
    onCreate,
    onEdit,
    onManage,
    onDelete,
    onFill,
    onAnalytics,
    onBack,
    showActions = true,
}) {
    return (
        <>
            <Header
                title={showActions ? "Daftar Form / Survey" : "Daftar Survey Tersedia"}
                description={showActions ? "Kelola seluruh form interview dan survey yang sudah dibuat." : "Pilih survey yang ingin diisi."}
                onBack={onBack}
            />

            {error && <div className="alert alert-error">{error}</div>}
            {message && (
                <div className="alert alert-success">{message}</div>
            )}

            <section className="content-card">
                <div className="section-top">
                    <div>
                        <h2>{showActions ? "Survey yang Dibuat" : "Survey Aktif"}</h2>
                        <p>{surveys.length} survey tersedia.</p>
                    </div>
                    {showActions && (
                        <button
                            className="button button-primary"
                            type="button"
                            onClick={onCreate}
                        >
                            Buat Survey
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="empty-state">Memuat data survey...</div>
                ) : surveys.length === 0 ? (
                    <div className="empty-state">Belum ada survey.</div>
                ) : (
                    <div className="survey-list">
                        {surveys.map((survey) => {
                            const status = statusOf(survey);
                            const open = isOpen(survey);

                            return (
                            <div className="survey-item" key={survey.id}>
                                <div className="survey-main">
                                    <div className="survey-title-row">
                                        <h3>{survey.title}</h3>
                                        {showActions && (
                                            <span className={`status ${status.tone}`}>
                                                {status.label}
                                            </span>
                                        )}
                                        {survey.deadlineAt && (
                                            <span className="deadline-chip">
                                                Tutup {formatDeadline(survey.deadlineAt)}
                                            </span>
                                        )}
                                    </div>
                                    <p>
                                        {survey.description ||
                                            'Tidak ada deskripsi.'}
                                    </p>
                                </div>

                                 <div className="survey-actions">
                                     {showActions ? (
                                         <>
                                             <button
                                                 className="button button-primary"
                                                 type="button"
                                                 disabled={!open}
                                                 onClick={() => onFill(survey.id)}
                                             >
                                                 Isi Survey
                                             </button>
                                             <button
                                                 className="button button-secondary"
                                                 type="button"
                                                 onClick={() => onAnalytics(survey.id, survey.title)}
                                             >
                                                 Analytics
                                             </button>
                                             <button
                                                 className="button button-secondary"
                                                 type="button"
                                                 onClick={() => onManage(survey.id)}
                                             >
                                                 Kelola
                                             </button>
                                             <button
                                                 className="button button-secondary"
                                                 type="button"
                                                 onClick={() => onEdit(survey)}
                                             >
                                                 Edit
                                             </button>
                                             <button
                                                 className="button icon-button icon-button-danger"
                                                 type="button"
                                                 onClick={() => onDelete(survey.id)}
                                                 title="Hapus"
                                             >
                                                 Hapus
                                             </button>
                                         </>
                                     ) : (
                                          <button
                                              className="button button-primary"
                                              type="button"
                                              disabled={!open}
                                              onClick={() => onFill(survey.id)}
                                          >
                                              Isi Sekarang
                                          </button>
                                      )}
                                  </div>
                            </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </>
    );
}

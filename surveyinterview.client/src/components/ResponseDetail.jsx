import { Header } from './Header';

function ArrowLeftIcon() {
    return (
        <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
        </svg>
    );
}

export function ResponseDetail({
    response,
    loading,
    error,
    onBack,
}) {
    if (loading) {
        return (
            <>
                <Header
                    title="Detail Responden"
                    description="Memuat data jawaban responden."
                />
                <section className="content-card loading-state">
                    Memuat detail responden...
                </section>
            </>
        );
    }

    if (!response) {
        return (
            <>
                <Header
                    title="Detail Responden"
                    description="Data responden tidak ditemukan."
                />
                {error && (
                    <div className="alert alert-error">{error}</div>
                )}
                <button
                    className="button button-secondary"
                    type="button"
                    onClick={onBack}
                >
                    <ArrowLeftIcon /> Kembali
                </button>
            </>
        );
    }

    // Kelompokkan jawaban berdasarkan section
    const groupedAnswers = response.answers.reduce((acc, answer) => {
        const sectionKey = answer.sectionTitle || 'Section Umum';
        if (!acc[sectionKey]) acc[sectionKey] = [];
        acc[sectionKey].push(answer);
        return acc;
    }, {});

    const sortedSections = Object.entries(groupedAnswers).sort(
        (a, b) => (a[1][0].sectionOrder || 0) - (b[1][0].sectionOrder || 0)
    );

    return (
        <>
            <Header
                title="Detail Responden"
                description="Hasil pengisian survey dan jawaban responden."
            />

            {error && <div className="alert alert-error">{error}</div>}

            <button
                className="back-link"
                type="button"
                onClick={onBack}
            >
                <ArrowLeftIcon /> Kembali ke Daftar Responden
            </button>

            <section className="content-card response-profile">
                <div className="response-profile-avatar">
                    {response.initial}
                </div>

                <div className="response-profile-info">
                    <span>RESPONDEN</span>
                    <h2>{response.candidateName}</h2>
                    <p>{response.candidateEmail}</p>
                </div>

                <div className="response-profile-survey">
                    <span>SURVEY</span>
                    <strong>{response.surveyTitle}</strong>
                    <small>{response.formattedDateTime}</small>
                </div>
            </section>

            <section className="content-card answer-detail-card">
                <div className="answer-detail-header">
                    <div>
                        <h2>Jawaban Responden</h2>
                        <p>
                            Seluruh jawaban yang diberikan pada survey, dikelompokkan berdasarkan section.
                        </p>
                    </div>

                    <span>{response.answers.length} Jawaban</span>
                </div>

                <div className="answer-detail-list">
                    {response.answers.length === 0 ? (
                        <div className="empty-state">
                            Tidak ada jawaban.
                        </div>
                    ) : (
                        sortedSections.map(([sectionTitle, answers], sIdx) => (
                            <div className="response-section-group" key={sIdx} style={{ 
                                marginBottom: '2.5rem',
                                padding: '1.5rem',
                                background: 'var(--bg)',
                                borderRadius: '1rem',
                                border: '1px solid var(--border)'
                            }}>
                                <h3 className="response-section-title" style={{ 
                                    fontSize: '1.2rem', 
                                    color: 'var(--accent)', 
                                    borderBottom: '2px solid var(--border)',
                                    paddingBottom: '0.5rem',
                                    marginBottom: '1rem' 
                                }}>
                                    {sectionTitle}
                                </h3>

                                {answers.map((answer, index) => (
                                    <div
                                        className="answer-detail-item"
                                        key={`${answer.questionId}-${index}`}
                                        style={{ marginBottom: '1rem' }}
                                    >
                                        <div className="answer-number">
                                            {String(index + 1).padStart(2, '0')}
                                        </div>

                                        <div className="answer-content">
                                            <span>PERTANYAAN</span>
                                            <h3>{answer.questionText}</h3>
                                            <div className="answer-value">
                                                {answer.answerText?.trim()
                                                    ? answer.answerText
                                                    : 'Tidak ada jawaban'}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))
                    )}
                </div>
            </section>
        </>
    );
}

import { useState } from 'react';
import { Header } from './Header';

export function ResponseList({
    responses,
    loading,
    error,
    onRefresh,
    onDetail,
}) {
    const [selectedCategory, setSelectedCategory] = useState('ALL');

    // Mengambil daftar kategori unik dari data respon yang ada
    const categories = Array.from(
        new Set(responses.map((r) => r.surveyCategory).filter(Boolean))
    );

    // Memfilter data berdasarkan kategori yang dipilih
    const filteredResponses =
        selectedCategory === 'ALL'
            ? responses
            : responses.filter((r) => r.surveyCategory === selectedCategory);
    return (
        <>
            <Header
                title="Daftar Responden"
                description="Lihat siapa saja yang sudah mengisi survey dan kapan survey dikirim."
            />

            {error && <div className="alert alert-error">{error}</div>}

            <section className="content-card response-table-card">
                <div className="response-table-header">
                    <div>
                        <h2>Riwayat Pengisian</h2>
                        <p>{filteredResponses.length} respon ditampilkan.</p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            style={{
                                padding: '8px 12px',
                                borderRadius: '6px',
                                border: '1px solid #ccc',
                                background: '#fff',
                            }}
                        >
                            <option value="ALL">Semua Kategori</option>
                            {categories.map((cat, idx) => (
                                <option key={idx} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>

                        <button
                            className="button button-secondary"
                            type="button"
                            onClick={onRefresh}
                            disabled={loading}
                        >
                            {loading ? 'Memuat...' : (
                                <>
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
                                        <path d="M21 12a9 9 0 1 1-2.64-6.36" />
                                        <path d="M21 3v6h-6" />
                                    </svg>
                                    Refresh
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="empty-state">
                        Memuat data responden...
                    </div>
                ) : responses.length === 0 ? (
                    <div className="empty-state">
                        Belum ada responden.
                    </div>
                ) : (
                    <div className="response-table-wrapper">
                        <table className="response-table">
                            <thead>
                                <tr>
                                    <th>Responden</th>
                                    <th>Survey</th>
                                    <th>Kategori</th>
                                    <th>Jawaban</th>
                                    <th>Dikirim</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredResponses.map((response) => (
                                    <tr key={response.id}>
                                        <td>
                                            <div className="respondent-cell">
                                                <div className="respondent-avatar">
                                                    {response.initial}
                                                </div>
                                                <div>
                                                    <strong>
                                                        {
                                                            response.candidateName
                                                        }
                                                    </strong>
                                                    <span>
                                                        {
                                                            response.candidateEmail
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        <td>
                                            <span className="survey-name">
                                                {response.surveyTitle}
                                            </span>
                                        </td>

                                        <td>
                                            <span className="survey-category">
                                                {response.surveyCategory}
                                            </span>
                                        </td>

                                        <td>
                                            <span className="answer-count">
                                                {response.answerCount} jawaban
                                            </span>
                                        </td>

                                        <td>
                                            <div className="submitted-cell">
                                                <strong>
                                                    {response.formattedDate}
                                                </strong>
                                                <span>
                                                    {response.formattedTime}
                                                </span>
                                            </div>
                                        </td>

                                        <td>
                                            <button
                                                className="table-detail-button"
                                                type="button"
                                                onClick={() =>
                                                    onDetail(response.id)
                                                }
                                            >
                                                Detail
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </>
    );
}
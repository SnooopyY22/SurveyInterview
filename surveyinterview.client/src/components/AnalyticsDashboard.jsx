import { useEffect, useState } from 'react';
import { PieChart, Pie, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Header } from './Header';
import { surveyApi } from '../api/SurveyApi';
import toast from 'react-hot-toast';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658', '#ff7c7c'];

export function AnalyticsDashboard({ surveyId, surveyTitle, onBack }) {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        loadAnalytics();
    }, [surveyId]);

    async function loadAnalytics() {
        try {
            setLoading(true);
            setError('');
            const data = await surveyApi.getSurveyAnalytics(surveyId);
            setAnalytics(data);
        } catch (err) {
            setError(err.message);
            toast.error('Gagal memuat analytics');
        } finally {
            setLoading(false);
        }
    }

    async function handleExport(format) {
        try {
            setExporting(true);
            await surveyApi.exportSurveyData(surveyId, format);
            toast.success(`Export ${format.toUpperCase()} berhasil!`);
        } catch (err) {
            toast.error(err.message || 'Export gagal');
        } finally {
            setExporting(false);
        }
    }

    if (loading) {
        return (
            <>
                <Header title="Analytics" description="Visualisasi hasil survey dan respon." />
                <section className="content-card">
                    <div className="empty-state">Memuat data analytics...</div>
                </section>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Header title="Analytics" description="Visualisasi hasil survey dan respon." />
                <section className="content-card">
                    <div className="alert alert-error">{error}</div>
                    <button className="button button-secondary" onClick={loadAnalytics}>
                        Coba Lagi
                    </button>
                </section>
            </>
        );
    }

    if (!analytics) {
        return (
            <>
                <Header title="Analytics" description="Visualisasi hasil survey dan respon." />
                <section className="content-card">
                    <div className="empty-state">Tidak ada data analytics.</div>
                </section>
            </>
        );
    }

    return (
        <>
            <Header
                title={`Analytics - ${surveyTitle}`}
                description="Visualisasi hasil survey dan respon."
            />

            <section className="content-card">
                <div className="analytics-header">
                    <div>
                        <h2>Ringkasan Survey</h2>
                        <p>Total Responden: <strong>{analytics.totalResponses}</strong></p>
                    </div>
                    <div className="export-buttons">
                        <button
                            className="button button-secondary"
                            onClick={() => handleExport('excel')}
                            disabled={exporting}
                        >
                            📊 Export Excel
                        </button>
                        <button
                            className="button button-secondary"
                            onClick={() => handleExport('csv')}
                            disabled={exporting}
                        >
                            📄 Export CSV
                        </button>
                        <button
                            className="button button-secondary"
                            onClick={onBack}
                        >
                            Kembali
                        </button>
                    </div>
                </div>

                {analytics.questions.length === 0 ? (
                    <div className="empty-state">Belum ada pertanyaan dalam survey ini.</div>
                ) : (
                    <div className="analytics-grid">
                        {analytics.questions.map((question) => (
                            <div key={question.questionId} className="analytics-item">
                                <h3>{question.questionText}</h3>
                                <p className="section-label">Bagian: {question.sectionTitle}</p>

                                {question.optionCounts && question.optionCounts.length > 0 ? (
                                    <div className="chart-container">
                                        <ResponsiveContainer width="100%" height={300}>
                                            <PieChart>
                                                <Pie
                                                    data={question.optionCounts}
                                                    dataKey="count"
                                                    nameKey="option"
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={80}
                                                    label
                                                >
                                                    {question.optionCounts.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={(value, name) => name === 'count' ? `${value} responden` : value} />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>

                                        <div className="option-details">
                                            {question.optionCounts.map((option, idx) => (
                                                <div key={idx} className="option-stat">
                                                    <span className="option-name">{option.option}</span>
                                                    <span className="option-count">{option.count} ({option.percentage.toFixed(1)}%)</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : question.textAnswers && question.textAnswers.length > 0 ? (
                                    <div className="text-answers">
                                        <p className="text-label">Jawaban Teks ({question.textAnswers.length}):</p>
                                        <ul className="answers-list">
                                            {question.textAnswers.slice(0, 5).map((answer, idx) => (
                                                <li key={idx}>{answer}</li>
                                            ))}
                                            {question.textAnswers.length > 5 && (
                                                <li>... dan {question.textAnswers.length - 5} jawaban lainnya</li>
                                            )}
                                        </ul>
                                    </div>
                                ) : (
                                    <div className="empty-state">Belum ada responden untuk pertanyaan ini.</div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </>
    );
}

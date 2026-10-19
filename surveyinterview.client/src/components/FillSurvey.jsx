import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Header } from './Header';
import { responseService } from '../services/ResponseService';
import { getEmail, getRole, getUsername } from '../auth';
import { deadlineMs, formatDeadline, formatRemaining, isExpired } from '../deadline';

function QuestionInput({ question, value, disabled, onChange }) {
    switch (question.questionType) {
        case 'Dropdown':
            return (
                <select
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                >
                    <option value="">Pilih jawaban</option>
                    {question.options.map((opt, i) => (
                        <option key={i} value={opt}>
                            {opt}
                        </option>
                    ))}
                </select>
            );

        case 'RadioButton':
            return (
                <div className="choice-list">
                    {question.options.map((opt, i) => (
                        <label className="choice-item" key={i}>
                            <input
                                type="radio"
                                name={`question-${question.id}`}
                                value={opt}
                                checked={value === opt}
                                onChange={() => onChange(opt)}
                                disabled={disabled}
                            />
                            <span>{opt}</span>
                        </label>
                    ))}
                </div>
            );

        case 'Checkbox': {
            const selected = Array.isArray(value) ? value : [];
            return (
                <div className="choice-list">
                    {question.options.map((opt, i) => {
                        const checked = selected.includes(opt);
                        return (
                            <label className="choice-item" key={i}>
                                <input
                                    type="checkbox"
                                    value={opt}
                                    checked={checked}
                                    onChange={() => {
                                        const updated = checked
                                            ? selected.filter(
                                                (s) => s !== opt
                                            )
                                            : [...selected, opt];
                                        onChange(updated);
                                    }}
                                    disabled={disabled}
                                />
                                <span>{opt}</span>
                            </label>
                        );
                    })}
                </div>
            );
        }

        default:
            return (
                <input
                    type="text"
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Masukkan jawaban..."
                    disabled={disabled}
                />
            );
    }
}

export function FillSurvey({
    survey,
    error,
    onCancel,
    onSubmitSuccess,
}) {
    const [answers, setAnswers] = useState({});
    const [saving, setSaving] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [activeSectionIndex, setActiveSectionIndex] = useState(0);
    const [now, setNow] = useState(() => Date.now());

    const deadline = deadlineMs(survey);

    // Hitung mundur agar form terkunci tepat saat tenggat lewat,
    // tanpa harus menunggu muat ulang halaman.
    useEffect(() => {
        if (deadline === null) return undefined;

        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, [deadline]);

    if (!survey) return null;

    const currentSection = survey.sections?.[activeSectionIndex];

    const expired = isExpired(survey, now);
    const locked = expired && getRole() !== 'Admin';
    const remaining = deadline === null ? null : deadline - now;

    function setAnswer(questionId, value) {
        setAnswers((current) => ({
            ...current,
            [questionId]: value,
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (locked) {
            toast.error('Tenggat waktu sudah berakhir. Survey tidak bisa dikirim.');
            return;
        }

        if (activeSectionIndex < survey.sections.length - 1) {
            setActiveSectionIndex(activeSectionIndex + 1);
            return;
        }

        // Validasi SEMUA section dan pertanyaan saat submit akhir
        for (const section of (survey.sections || [])) {
            for (const question of (section.questions || [])) {
                // Sekarang property isMandatory sudah ada di objek question dari backend
                if (question.isMandatory) {
                    const ans = answers[question.id];
                    if (ans === undefined || ans === null || (typeof ans === 'string' && !ans.trim()) || (Array.isArray(ans) && ans.length === 0)) {
                        toast.error(`Pertanyaan "${question.questionText}" wajib diisi.`);
                        return;
                    }
                }
            }
        }

        setShowConfirm(true);
    }

    async function confirmSubmit() {
        setShowConfirm(false);

        try {
            setSaving(true);

            const sessionEmail = getEmail();
            const sessionName = getUsername();
            const fallbackEmail = `responden-${Date.now()}-${Math.random()
                .toString(36)
                .slice(2, 10)}@responden.local`;

            await responseService.submit(
                survey,
                {
                    name: sessionName || 'Responden',
                    email: sessionEmail || fallbackEmail,
                },
                answers
            );
            onSubmitSuccess();
        } catch (err) {
            toast.error(err.message || 'Gagal mengirim survey.');
        } finally {
            setSaving(false);
        }
    }

    return (
        <>
            <Header
                title={survey.title}
                description={
                    survey.description || 'Silakan isi survey berikut.'
                }
                onBack={onCancel}
            />

            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}

            {locked ? (
                <div className="alert alert-error" role="alert">
                    <strong>Tenggat waktu sudah terlewati.</strong> Form ini
                    sudah terkunci dan jawaban tidak bisa dikirim lagi.
                </div>
            ) : expired ? (
                <div className="alert alert-warning" role="status">
                    Tenggat {formatDeadline(survey.deadlineAt)} sudah lewat.
                    Anda masuk sebagai admin sehingga survey tetap bisa diisi.
                </div>
            ) : (
                remaining !== null && (
                    <div className="alert alert-warning" role="status">
                        Tutup {formatDeadline(survey.deadlineAt)} —{' '}
                        {formatRemaining(remaining)}
                    </div>
                )
            )}

            <form className="content-card" onSubmit={handleSubmit}>
                <div className="fill-survey">
                    {currentSection && (
                        <section className="fill-section" key={currentSection.id}>
                            <div className="fill-section-header">
                                <span>Section {currentSection.orderIndex} dari {survey.sections.length}</span>
                                <h2>{currentSection.title}</h2>
                            </div>

                            <div className="fill-question-list">
                                {currentSection.questions?.map((question, index) => (
                                    <div className="fill-question" key={question.id}>
                                        <label>
                                            <strong>{index + 1}. {question.questionText}</strong>
                                        </label>
                                        <QuestionInput
                                            question={question}
                                            value={answers[question.id]}
                                            disabled={saving || locked}
                                            onChange={(value) => setAnswer(question.id, value)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                <div className="form-actions">
                    <button
                        className="button button-secondary"
                        type="button"
                        disabled={locked && activeSectionIndex > 0}
                        onClick={activeSectionIndex > 0 ? () => setActiveSectionIndex(activeSectionIndex - 1) : onCancel}
                    >
                        {activeSectionIndex > 0 ? 'Sebelumnya' : 'Batal'}
                    </button>
                    <button
                        className="button button-primary"
                        type="submit"
                        disabled={saving || locked}
                    >
                        {activeSectionIndex < survey.sections.length - 1 ? 'Selanjutnya' : (saving ? 'Mengirim...' : 'Kirim Survey')}
                    </button>
                </div>
            </form>

            {showConfirm && (
                <div
                    className="modal-overlay"
                    role="presentation"
                    onClick={() => {
                        if (!saving) setShowConfirm(false);
                    }}
                >
                    <div
                        className="modal-dialog"
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="confirm-submit-title"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 id="confirm-submit-title">Konfirmasi Pengiriman</h3>
                        <p>Apakah Anda sudah yakin dengan jawaban Anda?</p>
                        <div className="modal-actions">
                            <button
                                className="button button-secondary"
                                type="button"
                                disabled={saving}
                                onClick={() => setShowConfirm(false)}
                            >
                                Batal
                            </button>
                            <button
                                className="button button-primary"
                                type="button"
                                disabled={saving}
                                onClick={confirmSubmit}
                            >
                                {saving ? 'Mengirim...' : 'Ya, Kirim'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
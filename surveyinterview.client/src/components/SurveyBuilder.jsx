import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Header } from './Header';
import { QUESTION_TYPES } from '../constants';

function QuestionForm({ disabled, onSubmit, initialData, onCancel }) {
    const [text, setText] = useState(initialData?.questionText || '');
    const [type, setType] = useState(initialData?.questionType || 'ShortText');
    const [optionsText, setOptionsText] = useState(
        initialData?.options ? initialData.options.join('\n') : ''
    );
    const [isMandatory, setIsMandatory] = useState(initialData?.isMandatory ?? false);

    useEffect(() => {
        if (initialData) {
            setText(initialData.questionText || '');
            setType(initialData.questionType || 'ShortText');
            setOptionsText(initialData.options ? initialData.options.join('\n') : '');
            setIsMandatory(initialData.isMandatory ?? false);
        } else {
            setText('');
            setType('ShortText');
            setOptionsText('');
            setIsMandatory(false);
        }
    }, [initialData]);

    const needsOptions = [
        'Dropdown',
        'Checkbox',
        'RadioButton',
    ].includes(type);

    function handleSubmit(event) {
        event.preventDefault();
        
        if (!text.trim()) {
            toast.error('Pertanyaan harus diisi!');
            return;
        }
        
        const options = needsOptions
            ? optionsText
                .split('\n')
                .map((o) => o.trim())
                .filter(Boolean)
            : null;

        if (needsOptions && (!options || options.length < 2)) {
            toast.error('Minimal harus ada 2 pilihan!');
            return;
        }

        const payload = { questionText: text, questionType: type, options, isMandatory };
        onSubmit(payload);

        if (!initialData) {
            setText('');
            setType('ShortText');
            setOptionsText('');
            setIsMandatory(false);
        }
    }

    return (
        <form className="question-form" onSubmit={handleSubmit}>
            <div className="form-group">
                <label>{initialData ? 'Edit Pertanyaan' : 'Pertanyaan'}</label>
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Contoh: Berapa tahun pengalaman Anda menggunakan React?"
                    disabled={disabled}
                />
            </div>

            <div className="question-form-row">
                <div className="form-group">
                    <label>Tipe Pertanyaan</label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        disabled={disabled}
                    >
                        {QUESTION_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>
                                {t.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group" style={{ display: 'flex', alignItems: 'center', marginTop: '24px' }}>
                    <label className="toggle-label" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                            type="checkbox"
                            checked={isMandatory}
                            onChange={(e) => setIsMandatory(e.target.checked)}
                            disabled={disabled}
                            style={{ width: 'auto', minHeight: 'auto' }}
                        />
                        Wajib Diisi (Mandatory)
                    </label>
                </div>
            </div>

            {needsOptions && (
                <div className="form-group options-field">
                    <label>Pilihan</label>
                    <textarea
                        value={optionsText}
                        onChange={(e) =>
                            setOptionsText(e.target.value)
                        }
                        placeholder={
                            'Satu pilihan per baris.\nContoh:\nJunior\nMiddle\nSenior'
                        }
                        rows="4"
                        disabled={disabled}
                    />
                    <small>Minimal 2 pilihan.</small>
                </div>
            )}

            <div className="question-form-actions">
                {initialData && (
                    <button
                        className="button button-outline"
                        type="button"
                        onClick={onCancel}
                        disabled={disabled}
                    >
                        Batal
                    </button>
                )}
                <button
                    className="button button-primary"
                    type="submit"
                    disabled={disabled}
                >
                    {disabled ? 'Menyimpan...' : initialData ? 'Simpan Perubahan' : 'Tambah Pertanyaan'}
                </button>
            </div>
        </form>
    );
}

export function SurveyBuilder({
    survey,
    saving,
    error,
    message,
    onAddSection,
    onAddQuestion,
    onUpdateQuestion,
    onRemoveSection,
    onRemoveQuestion,
    onToggleMandatory,
    onToggleStatus,
    onBack,
    onSave,
}) {
    const [sectionTitle, setSectionTitle] = useState('');
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [addingQuestionTo, setAddingQuestionTo] = useState(null);

    if (!survey) return null;

    function handleAddSection(event) {
        event.preventDefault();
        if (!sectionTitle.trim()) {
            toast.error('Judul section tidak boleh kosong!');
            return;
        }
        onAddSection(sectionTitle);
        setSectionTitle('');
    }

    return (
        <>
            <Header
                title="Kelola Form"
                description="Atur struktur survey, section, dan pertanyaan interview."
            />

            {error && <div className="alert alert-error">{error}</div>}
            {message && (
                <div className="alert alert-success">{message}</div>
            )}

            <section className="content-card survey-builder-header">
                <div className="builder-title">
                    <div className="builder-icon">{survey.initial}</div>
                    <div>
                        <span className="builder-label">
                            FORM / SURVEY
                        </span>
                        <h2>{survey.title}</h2>
                        <p>
                            {survey.description ||
                                'Tidak ada deskripsi survey.'}
                        </p>
                    </div>
                </div>

                <div className="builder-stats">
                    <div className="builder-stat">
                        <strong>{survey.sectionCount}</strong>
                        <span>Section</span>
                    </div>
                    <div className="builder-stat">
                        <strong>{survey.totalQuestions}</strong>
                        <span>Pertanyaan</span>
                    </div>
                    <div className="builder-stat">
                        <button
                            className={`button ${
                                survey.isActive ? 'button-outline' : 'button-primary'
                            }`}
                            type="button"
                            onClick={() => onToggleStatus(survey.id, survey.isActive)}
                        >
                            {survey.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                    </div>
                </div>
            </section>

            <section className="builder-toolbar">
                <div>
                    <h2>Struktur Form</h2>
                    <p>
                        Susun pertanyaan berdasarkan section yang
                        dibutuhkan.
                    </p>
                </div>
                <button
                    className="button button-secondary"
                    type="button"
                    onClick={onSave}
                    disabled={saving}
                >
                    {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
                <button
                    className="button button-secondary"
                    type="button"
                    onClick={onBack}
                >
                    Kembali
                </button>
            </section>

            <section className="content-card add-section-card">
                <div className="add-section-icon">+</div>
                <div className="add-section-content">
                    <h3>Tambah Section</h3>
                    <p>
                        Gunakan section untuk mengelompokkan pertanyaan.
                    </p>
                </div>
                <form
                    className="add-section-form"
                    onSubmit={handleAddSection}
                >
                    <input
                        type="text"
                        value={sectionTitle}
                        onChange={(e) =>
                            setSectionTitle(e.target.value)
                        }
                        placeholder="Contoh: Data Pribadi"
                        disabled={saving}
                    />
                    <button
                        className="button button-primary"
                        type="submit"
                        disabled={saving}
                    >
                        {saving ? 'Menyimpan...' : 'Section'}
                    </button>
                </form>
            </section>

            {survey.sections.length === 0 ? (
                <section className="content-card builder-empty">
                    <div className="builder-empty-icon">+</div>
                    <h3>Belum ada section</h3>
                    <p>
                        Mulai dengan membuat section pertama untuk survey
                        ini.
                    </p>
                </section>
            ) : (
                <div className="builder-sections">
                    {survey.sections.map((section, sectionIndex) => (
                        <section
                            className="builder-section"
                            key={section.id}
                        >
                            <div className="builder-section-header">
                                <div className="section-heading">
                                    <div className="section-index">
                                        {String(sectionIndex + 1).padStart(
                                            2,
                                            '0'
                                        )}
                                    </div>
                                    <div>
                                        <span>
                                            SECTION {section.orderIndex}
                                        </span>
                                        <h3>{section.title}</h3>
                                    </div>
                                </div>

                                <div className="section-header-actions">
                                    <div className="section-meta">
                                        {section.questionCount} Pertanyaan
                                    </div>
                                    <label className="toggle-label">
                                        <input
                                            type="checkbox"
                                            checked={section.isMandatory}
                                            onChange={() =>
                                                onToggleMandatory(section)
                                            }
                                        />
                                        Wajib diisi
                                    </label>
                                    <button
                                        className="icon-button icon-button-danger"
                                        type="button"
                                        title="Hapus section"
                                        disabled={saving}
                                        onClick={() =>
                                            onRemoveSection(section.id)
                                        }
                                    >
                                        Del
                                    </button>
                                </div>
                            </div>

                            <div className="builder-question-list">
                                {section.questions.length === 0 ? (
                                    <div className="question-empty">
                                        Belum ada pertanyaan di section
                                        ini.
                                    </div>
                                ) : (
                                    section.questions.map(
                                        (question, qIndex) => {
                                            const type =
                                                QUESTION_TYPES.find(
                                                    (t) =>
                                                        t.value ===
                                                        question.questionType
                                                );
                                            return (
                                                <div
                                                    className="builder-question"
                                                    key={question.id}
                                                >
                                                        <>
                                                            <div className="question-index">
                                                                {String(
                                                                    qIndex + 1
                                                                ).padStart(
                                                                    2,
                                                                    '0'
                                                                )}
                                                            </div>
                                                            <div className="question-content">
                                                                <div className="question-top">
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                    <span className="question-type">
                                                                        {type?.label ||
                                                                            question.questionType}
                                                                    </span>
                                                                    {question.isMandatory && (
                                                                        <span className="status" style={{ fontSize: '10px', padding: '2px 8px', minHeight: 'auto', background: '#fee2e2', color: '#dc2626' }}>
                                                                            Wajib
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                    <div>
                                                                        <button
                                                                            className="icon-button icon-button-primary icon-button-sm"
                                                                            type="button"
                                                                            title="Edit pertanyaan"
                                                                            disabled={saving}
                                                                            onClick={() => setEditingQuestion(question)}
                                                                            style={{ marginRight: '6px' }}
                                                                        >
                                                                            Edit
                                                                        </button>
                                                                        <button
                                                                            className="icon-button icon-button-danger icon-button-sm"
                                                                            type="button"
                                                                            title="Hapus pertanyaan"
                                                                            disabled={
                                                                                saving
                                                                            }
                                                                            onClick={() =>
                                                                                onRemoveQuestion(
                                                                                    question.id
                                                                                )
                                                                            }
                                                                        >
                                                                            Del
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                                <h4>
                                                                    {
                                                                        question.questionText
                                                                    }
                                                                </h4>
                                                                {question.options
                                                                    .length > 0 && (
                                                                        <div className="question-options">
                                                                            {question.options.map(
                                                                                (
                                                                                    opt,
                                                                                    i
                                                                                ) => (
                                                                                    <span
                                                                                        key={
                                                                                            i
                                                                                        }
                                                                                    >
                                                                                        {
                                                                                            opt
                                                                                        }
                                                                                    </span>
                                                                                )
                                                                            )}
                                                                        </div>
                                                                    )}
                                                            </div>
                                                        </>
                                                </div>
                                            );
                                        }
                                    )
                                )}
                            </div>

                            <div className="builder-add-question">
                                <div className="add-question-heading">
                                    <span className="add-question-icon">
                                        +
                                    </span>
                                    <div>
                                        <h4>Tambah Pertanyaan</h4>
                                        <p>
                                            Tambahkan pertanyaan baru ke
                                            section ini.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    className="button button-primary"
                                    type="button"
                                    disabled={saving}
                                    onClick={() =>
                                        setAddingQuestionTo(section.id)
                                    }
                                >
                                    Tambah Pertanyaan
                                </button>
                            </div>

                            {addingQuestionTo === section.id && (
                                <div
                                    className="modal-overlay"
                                    role="presentation"
                                    onClick={() => setAddingQuestionTo(null)}
                                >
                                    <div
                                        className="modal-dialog modal-dialog-lg"
                                        role="dialog"
                                        aria-modal="true"
                                        aria-labelledby={`add-question-title-${section.id}`}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="modal-header">
                                            <h3 id={`add-question-title-${section.id}`}>
                                                Tambah Pertanyaan
                                            </h3>
                                            <button
                                                className="icon-button icon-button-sm"
                                                type="button"
                                                onClick={() =>
                                                    setAddingQuestionTo(null)
                                                }
                                            >
                                                Tutup
                                            </button>
                                        </div>
                                        <QuestionForm
                                            disabled={saving}
                                            onSubmit={(payload) => {
                                                onAddQuestion(
                                                    section.id,
                                                    payload
                                                );
                                                setAddingQuestionTo(null);
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </section>
                    ))}
                </div>
            )}

            {editingQuestion && (
                <div
                    className="modal-overlay"
                    role="presentation"
                    onClick={() => setEditingQuestion(null)}
                >
                    <div
                        className="modal-dialog modal-dialog-lg"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="edit-question-title"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h3 id="edit-question-title">Edit Pertanyaan</h3>
                            <button
                                className="icon-button icon-button-sm"
                                type="button"
                                onClick={() => setEditingQuestion(null)}
                            >
                                Tutup
                            </button>
                        </div>
                        <QuestionForm
                            disabled={saving}
                            initialData={editingQuestion}
                            onCancel={() => setEditingQuestion(null)}
                            onSubmit={(payload) => {
                                onUpdateQuestion(editingQuestion.id, payload);
                                setEditingQuestion(null);
                            }}
                        />
                    </div>
                </div>
            )}
        </>
    );
}

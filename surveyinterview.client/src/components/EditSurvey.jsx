import { useState } from 'react';
import toast from 'react-hot-toast';
import { Header } from './Header';
import { deadlineToInputs, hasPassed, inputsToDeadline, isExpired } from '../deadline';

export function EditSurvey({ survey, saving, error, onSubmit, onCancel, embedded = false }) {
    const initialDeadline = deadlineToInputs(survey.deadlineAt);

    const [title, setTitle] = useState(survey.title || '');
    const [description, setDescription] = useState(survey.description || '');
    const [category, setCategory] = useState(survey.category || '');
    const [deadlineDate, setDeadlineDate] = useState(initialDeadline.date);
    const [deadlineTime, setDeadlineTime] = useState(initialDeadline.time);

    const categories = JSON.parse(localStorage.getItem('surveyCategories') || '[]');

    const isDirty =
        title !== survey.title ||
        description !== survey.description ||
        category !== survey.category ||
        deadlineDate !== initialDeadline.date ||
        deadlineTime !== initialDeadline.time;

    const deadlinePassed = isExpired(survey);

    function handleSubmit(event) {
        event.preventDefault();

        if (title.length < 3 || title.length > 100) {
            toast.error('Judul harus antara 3-100 karakter.');
            return;
        }
        if (description.length < 10 || description.length > 500) {
            toast.error('Deskripsi harus antara 10-500 karakter.');
            return;
        }
        if (!category.trim()) {
            toast.error('Kategori harus diisi.');
            return;
        }
        if (Boolean(deadlineDate) !== Boolean(deadlineTime)) {
            toast.error('Lengkapi tanggal dan jam tenggat, atau kosongkan keduanya.');
            return;
        }

        const deadlineAt = inputsToDeadline(deadlineDate, deadlineTime);

        if (hasPassed(deadlineAt)) {
            toast.error('Tenggat waktu harus berada di masa depan.');
            return;
        }

        const updatedCategories = Array.from(new Set([category.trim(), ...categories])).slice(0, 10);
        localStorage.setItem('surveyCategories', JSON.stringify(updatedCategories));

        onSubmit({
            title,
            description,
            category,
            isActive: survey.isActive,
            deadlineAt,
        });
    }

    return (
        <>
            {!embedded && (
                <Header
                    title="Edit Survey"
                    description="Ubah informasi dasar survey Anda."
                />
            )}

            {error && <div className="alert alert-error">{error}</div>}

            {deadlinePassed && (
                <div className="alert alert-warning" role="status">
                    Tenggat waktu sudah terlewati, sehingga survey dinonaktifkan
                    otomatis. Ubah tenggat ke waktu mendatang, lalu aktifkan
                    kembali lewat menu <strong>Kelola</strong>.
                </div>
            )}

            <section className="content-card form-card">
                <form className="form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Judul Survey</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={saving}
                        />
                    </div>

                    <div className="form-group">
                        <label>Deskripsi</label>
                        <textarea
                            value={description}
                            onChange={(e) =>
                                setDescription(e.target.value)
                            }
                            rows="5"
                            disabled={saving}
                        />
                    </div>

                    <div className="form-group">
                        <label>Kategori</label>
                        <input
                            type="text"
                            list="category-list"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            disabled={saving}
                        />
                        <datalist id="category-list">
                            {categories.map((cat, idx) => (
                                <option key={idx} value={cat} />
                            ))}
                        </datalist>
                    </div>

                    <div className="form-group">
                        <label>Tenggat Waktu (opsional)</label>
                        <div className="deadline-inputs">
                            <input
                                type="date"
                                value={deadlineDate}
                                onChange={(e) => setDeadlineDate(e.target.value)}
                                disabled={saving}
                                aria-label="Tanggal tenggat"
                            />
                            <input
                                type="time"
                                value={deadlineTime}
                                onChange={(e) => setDeadlineTime(e.target.value)}
                                disabled={saving}
                                aria-label="Jam tenggat"
                            />
                        </div>
                        <small>
                            Kosongkan jika survey tanpa batas waktu. Waktu
                            mengikuti zona waktu perangkat Anda.
                        </small>
                    </div>

                    <div className="form-actions">
                        <button
                            className="button button-secondary"
                            type="button"
                            onClick={onCancel}
                        >
                            Batal
                        </button>
                        <button
                            className="button button-primary"
                            type="submit"
                            disabled={saving || !isDirty}
                        >
                            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </form>
            </section>
        </>
    );
}

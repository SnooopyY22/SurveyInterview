import { useState } from 'react';
import toast from 'react-hot-toast';
import { Header } from './Header';
import { hasPassed, inputsToDeadline } from '../deadline';

export function CreateSurvey({ saving, error, onSubmit, onCancel }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [deadlineDate, setDeadlineDate] = useState('');
    const [deadlineTime, setDeadlineTime] = useState('');

    // Mengambil riwayat kategori dari localStorage
    const categories = JSON.parse(localStorage.getItem('surveyCategories') || '[]');

    function handleSubmit(event) {
        event.preventDefault();
        if (!title.trim() || !description.trim() || !category.trim()) {
            toast.error('Harap isi semua field!');
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

        // Simpan kategori ke localStorage untuk saran di masa depan
        const updatedCategories = Array.from(new Set([category.trim(), ...categories])).slice(0, 10);
        localStorage.setItem('surveyCategories', JSON.stringify(updatedCategories));

        onSubmit({ title, description, category, deadlineAt });
    }

    return (
        <>
            <Header
                title="Buat Form / Survey Baru"
                description="Buat template survey baru untuk kebutuhan interview."
            />

            {error && <div className="alert alert-error">{error}</div>}

            <section className="content-card form-card">
                <div className="form-intro">
                    <span className="form-icon"></span>
                    <div>
                        <h2>Informasi Survey</h2>
                        <p>
                            Masukkan informasi dasar sebelum menambahkan
                            section dan pertanyaan.
                        </p>
                    </div>
                </div>

                <form className="form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Judul Survey</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Contoh: Interview Frontend Developer"
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
                            placeholder="Jelaskan tujuan atau penggunaan survey ini..."
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
                            placeholder="Contoh: IT, HR, Marketing"
                            disabled={saving}
                        />
                        <datalist id="category-list">
                            {categories.map((cat, idx) => (
                                <option key={idx} value={cat} />
                            ))}
                        </datalist>
                        <small>Ketik bebas atau pilih dari riwayat.</small>
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
                            Survey otomatis berakhir dan dinonaktifkan setelah
                            waktu ini. Kosongkan jika tanpa batas waktu.
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
                            disabled={saving}
                        >
                            {saving ? 'Menyimpan...' : 'Buat Survey'}
                        </button>
                    </div>
                </form>
            </section>
        </>
    );
}
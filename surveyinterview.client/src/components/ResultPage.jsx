export function ResultPage({ onBack }) {
    return (
        <section className="content-card result-card">
            <div className="result-icon">
                <svg
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <path d="M20 6 9 17l-5-5" />
                </svg>
            </div>
            <h1>Survey Berhasil Dikirim</h1>
            <p>Jawaban berhasil disimpan ke sistem.</p>
            <button
                className="button button-primary"
                type="button"
                onClick={onBack}
            >
                Kembali ke Survey
            </button>
        </section>
    );
}
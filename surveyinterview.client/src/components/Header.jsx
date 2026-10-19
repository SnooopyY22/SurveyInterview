function ArrowLeftIcon() {
    return (
        <svg
            width="16"
            height="16"
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

export function Header({ title, description, onBack }) {
    return (
        <header className="content-header">
            {onBack && (
                <button
                    type="button"
                    className="button button-secondary header-back"
                    onClick={onBack}
                >
                    <ArrowLeftIcon /> Kembali
                </button>
            )}
            <div>
                <span className="eyebrow">INTERVIEW SURVEY</span>
                <h1>{title}</h1>
                <p>{description}</p>
            </div>
        </header>
    );
}

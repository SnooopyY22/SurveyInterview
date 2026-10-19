import { NavLink } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';

const MENU = [
    {
        label: 'MASTER DATA',
        items: [
            {
                to: '/',
                end: true,
                icon: '■',
                text: 'Daftar Form / Survey',
            },
            {
                to: '/survey/new',
                icon: '+',
                text: 'Buat Form Baru',
            },
        ],
    },
    {
        label: 'TRANSAKSI',
        items: [
            {
                to: '/fill',
                end: true,
                icon: '✓',
                text: 'Isi Survey',
            },
            {
                to: '/responses',
                icon: '◆',
                text: 'Daftar Responden',
            },
        ],
    },
];

export function Sidebar({ open, onClose, username, onLogout }) {
    return (
        <>
            <div
                className={`sidebar-backdrop${open ? ' show' : ''}`}
                onClick={onClose}
                aria-hidden="true"
            />
            <aside className={`sidebar${open ? ' open' : ''}`}>
                <div className="brand">
                    <div className="brand-mark">IS</div>
                    <div>
                        <strong>Interview Kerja</strong>
                        <span>Survey Management</span>
                    </div>
                    <button
                        type="button"
                        className="sidebar-close"
                        onClick={onClose}
                        aria-label="Tutup menu"
                    >
                        ×
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {MENU.map((group) => (
                        <div className="nav-group" key={group.label}>
                            <span className="nav-label">{group.label}</span>
                            {group.items.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    end={item.end}
                                    className={({ isActive }) =>
                                        isActive
                                            ? 'nav-item active'
                                            : 'nav-item'
                                    }
                                    onClick={onClose}
                                >
                                    <span className="nav-icon">
                                        {item.icon}
                                    </span>
                                    {item.text}
                                </NavLink>
                            ))}
                        </div>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <ThemeToggle />
                    <div className="sidebar-user">
                        <span>{username || 'admin'}</span>
                        <small>Administrator</small>
                    </div>
                    <button
                        type="button"
                        className="nav-item logout"
                        onClick={onLogout}
                    >
                        <span className="nav-icon">⏻</span>
                        Keluar
                    </button>
                </div>
            </aside>
        </>
    );
}

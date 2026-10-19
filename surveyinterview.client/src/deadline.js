function parseDeadline(deadlineAt) {
    if (!deadlineAt) return null;

    const raw = String(deadlineAt);
    const hasZone = /(Z|[+-]\d{2}:?\d{2})$/.test(raw);
    const value = new Date(hasZone ? raw : `${raw}Z`);

    return Number.isNaN(value.getTime()) ? null : value;
}

export function inputsToDeadline(date, time) {
    if (!date || !time) return null;
    const value = new Date(`${date}T${time}`);
    if (Number.isNaN(value.getTime())) return null;
    return value.toISOString();
}

export function deadlineToInputs(deadlineAt) {
    const value = parseDeadline(deadlineAt);
    if (!value) return { date: '', time: '' };

    const pad = (n) => String(n).padStart(2, '0');
    return {
        date: `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`,
        time: `${pad(value.getHours())}:${pad(value.getMinutes())}`,
    };
}

export function deadlineMs(survey) {
    const value = parseDeadline(survey?.deadlineAt);
    return value ? value.getTime() : null;
}

export function isExpired(survey, now = Date.now()) {
    const ms = deadlineMs(survey);
    return ms !== null && ms <= now;
}

export function hasPassed(deadlineAt, now = Date.now()) {
    const value = parseDeadline(deadlineAt);
    return value !== null && value.getTime() <= now;
}

export function isOpen(survey, now = Date.now()) {
    return !!survey?.isActive && !isExpired(survey, now);
}

export function formatDeadline(deadlineAt) {
    const value = parseDeadline(deadlineAt);
    if (!value) return null;

    return value.toLocaleString('id-ID', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function formatRemaining(ms) {
    if (ms <= 0) return 'waktu habis';

    const totalMinutes = Math.floor(ms / 60000);
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;

    if (days > 0) return `${days} hari ${hours} jam lagi`;
    if (hours > 0) return `${hours} jam ${minutes} menit lagi`;
    if (minutes > 0) return `${minutes} menit lagi`;
    return 'kurang dari 1 menit lagi';
}

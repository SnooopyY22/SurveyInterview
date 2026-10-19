export const API_URL = import.meta.env.VITE_API_URL || '/api';

export const QUESTION_TYPES = [
    { value: 'ShortText', label: 'Short Text' },
    { value: 'Dropdown', label: 'Dropdown' },
    { value: 'Checkbox', label: 'Checkbox' },
    { value: 'RadioButton', label: 'Radio Button' },
];
import { API_URL } from '../constants';
import { authHeaders, clearSession, getToken } from '../auth';

export class SurveyApi {
    constructor(baseUrl = API_URL) {
        this.baseUrl = baseUrl;
    }

    async request(path, options = {}) {
        const response = await fetch(`${this.baseUrl}${path}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...authHeaders(),
                ...(options.headers || {}),
            },
        });

        const text = await response.text();
        const data = text ? JSON.parse(text) : null;

        if (response.status === 401) {
            const message =
                data?.message || 'Tidak memiliki akses. Silakan login.';
            if (!path.startsWith('/auth/')) {
                const hadToken = !!getToken();
                clearSession();
                if (hadToken) {
                    window.location.assign('/login');
                }
            }
            throw new Error(message);
        }

        if (!response.ok) {
            throw new Error(data?.message || 'Request gagal.');
        }

        return data;
    }

    login(username, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });
    }

    register(payload) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }

    getAllSurveys() {
        return this.request('/survey');
    }

    getCompletedSurveyIds() {
        return this.request('/survey/completed');
    }

    getSurveyDetail(surveyId) {
        return this.request(`/survey/${surveyId}`);
    }

    createSurvey(payload) {
        return this.request('/survey', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }

    updateSurvey(surveyId, payload) {
        return this.request(`/survey/${surveyId}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
        });
    }

    updateSection(sectionId, payload) {
        return this.request(`/section/${sectionId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
    }

    createSection(surveyId, payload) {
        return this.request(`/section`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...payload, surveyId }),
        });
    }

    createQuestion(sectionId, payload) {
        return this.request(`/question`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...payload, sectionId }),
        });
    }

    submitResponse(surveyId, payload) {
        return this.request(`/survey/${surveyId}/responses`, {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }

    getAllResponses() {
        return this.request('/survey/responses');
    }

    getResponseDetail(responseId) {
        return this.request(`/survey/responses/${responseId}`);
    }

    async updateQuestion(questionId, payload) {
        return this.request(`/question/${questionId}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
        });
    }

    async deleteSurvey(surveyId) {
        return this.request(`/survey/${surveyId}`, {
            method: 'DELETE',
        });
    }

    async toggleSurveyStatus(surveyId, isActive) {
        return this.request(`/survey/${surveyId}/status`, {
            method: 'PATCH',
            body: JSON.stringify(isActive),
        });
    }

    async deleteSection(sectionId) {
        const response = await fetch(`${this.baseUrl}/section/${sectionId}`, {
            method: 'DELETE',
            headers: authHeaders(),
        });

        if (!response.ok && response.status !== 204) {
            const text = await response.text();
            const data = text ? JSON.parse(text) : null;
            throw new Error(data?.message || 'Gagal menghapus section.');
        }

        return null;
    }

    async deleteQuestion(questionId) {
        const response = await fetch(`${this.baseUrl}/question/${questionId}`, {
            method: 'DELETE',
            headers: authHeaders(),
        });

        if (!response.ok && response.status !== 204) {
            const text = await response.text();
            const data = text ? JSON.parse(text) : null;
            throw new Error(data?.message || 'Gagal menghapus pertanyaan.');
        }

        return null;
    }

    getSurveyAnalytics(surveyId) {
        return this.request(`/survey/${surveyId}/analytics`);
    }

    async exportSurveyData(surveyId, format = 'excel') {
        const response = await fetch(
            `${this.baseUrl}/survey/${surveyId}/export?format=${format}`,
            { headers: authHeaders() }
        );

        if (response.status === 401) {
            const hadToken = !!getToken();
            clearSession();
            if (hadToken) {
                window.location.assign('/login');
            }
            throw new Error('Sesi Anda berakhir. Silakan login kembali.');
        }

        if (!response.ok) {
            throw new Error('Export gagal.');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `survey-${surveyId}-responses.${format === 'csv' ? 'csv' : 'xlsx'}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }
}



export const surveyApi = new SurveyApi();
export class ResponseModel {
    constructor(data = {}) {
        this.id = data.id;
        this.candidateName = data.candidateName || '';
        this.candidateEmail = data.candidateEmail || '';
        this.surveyTitle = data.surveyTitle || '';
        this.surveyCategory = data.surveyCategory || 'Umum';
        this.answerCount = data.answerCount ?? 0;
        this.submittedAt = data.submittedAt;
        this.answers = data.answers || [];
    }

    get initial() {
        return this.candidateName?.charAt(0)?.toUpperCase() || '?';
    }

    get submittedDate() {
        return new Date(this.submittedAt);
    }

    get formattedDate() {
        return this.submittedDate.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    }

    get formattedTime() {
        return this.submittedDate.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    get formattedDateTime() {
        return this.submittedDate.toLocaleString('id-ID');
    }

    static fromArray(list = []) {
        return list.map((item) => new ResponseModel(item));
    }
}
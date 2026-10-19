import { Question } from './Question';

export class Section {
    constructor(data = {}) {
        this.id = data.id;
        this.title = data.title || '';
        this.orderIndex = data.orderIndex ?? 0;
        this.isMandatory = data.isMandatory ?? false;
        this.questions = (data.questions || []).map(
            (q) => new Question(q)
        );
    }

    get questionCount() {
        return this.questions.length;
    }
}

export class Survey {
    constructor(data = {}) {
        this.id = data.id;
        this.title = data.title || '';
        this.description = data.description || '';
        this.category = data.category || 'Umum';
        this.isActive = data.isActive ?? true;
        this.deadlineAt = data.deadlineAt ?? null;
        this.isExpired = data.isExpired ?? false;
        this.sections = (data.sections || []).map(
            (s) => new Section(s)
        );
    }

    get sectionCount() {
        return this.sections.length;
    }

    get totalQuestions() {
        return this.sections.reduce(
            (sum, s) => sum + s.questionCount,
            0
        );
    }

    get initial() {
        return this.title?.charAt(0)?.toUpperCase() || 'S';
    }

    get allQuestions() {
        return this.sections.flatMap((s) => s.questions);
    }

    static fromArray(list = []) {
        return list.map((item) => new Survey(item));
    }
}
export class Question {
    constructor(data = {}) {
        this.id = data.id;
        this.questionText = data.questionText || '';
        this.questionType = data.questionType || 'ShortText';
        this.optionsJson = data.optionsJson;
        this.orderIndex = data.orderIndex ?? 0;
        this.isMandatory = data.isMandatory ?? false;
    }

    get options() {
        if (!this.optionsJson) return [];
        try {
            const parsed = JSON.parse(this.optionsJson);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }

    get needsOptions() {
        return ['Dropdown', 'Checkbox', 'RadioButton'].includes(
            this.questionType
        );
    }

    formatAnswer(answer) {
        if (this.questionType === 'Checkbox') {
            return Array.isArray(answer) ? answer.join(', ') : '';
        }
        return answer ?? '';
    }
}
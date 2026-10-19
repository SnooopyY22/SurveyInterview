import { surveyApi } from '../api/SurveyApi';
import { Survey } from '../models/Survey';

export class SurveyService {
    constructor(api = surveyApi) {
        this.api = api;
    }

    async loadAll() {
        const data = await this.api.getAllSurveys();
        return Survey.fromArray(data);
    }

    async loadDetail(surveyId) {
        const data = await this.api.getSurveyDetail(surveyId);
        return new Survey(data);
    }

    async loadCompletedIds() {
        return this.api.getCompletedSurveyIds();
    }

    async create(payload) {
        const data = await this.api.createSurvey(payload);
        return new Survey(data);
    }

    async update(surveyId, { title, description, category, isActive, deadlineAt }) {
        const data = await this.api.updateSurvey(surveyId, {
            title: title.trim(),
            description: description?.trim() || null,
            category: category?.trim() || 'Umum',
            isActive,
            deadlineAt: deadlineAt || null,
        });
        return new Survey(data);
    }

    async addSection(surveyId, title) {
        return this.api.createSection(surveyId, {
            title: title.trim(),
        });
    }

    async updateSection(sectionId, { title, isMandatory }) {
        return this.api.updateSection(sectionId, {
            title: title.trim(),
            isMandatory: !!isMandatory,
        });
    }

    async addQuestion(sectionId, question) {
        const options = question.needsOptions
            ? question.options
            : null;

        return this.api.createQuestion(sectionId, {
            questionText: question.questionText.trim(),
            questionType: question.questionType,
            options,
            isMandatory: !!question.isMandatory,
        });
    }
    async updateQuestion(questionId, question) {
        const options = question.needsOptions
            ? question.options
            : null;

        return this.api.updateQuestion(questionId, {
            questionText: question.questionText.trim(),
            questionType: question.questionType,
            options,
            orderIndex: question.orderIndex ?? null,
            isMandatory: !!question.isMandatory,
        });
    }

    async removeSection(sectionId) {
        return this.api.deleteSection(sectionId);
    }

    async removeQuestion(questionId) {
        return this.api.deleteQuestion(questionId);
    }

    async removeSurvey(surveyId) {
        return this.api.deleteSurvey(surveyId);
    }

    async toggleStatus(surveyId, isActive) {
        return this.api.toggleSurveyStatus(surveyId, isActive);
    }
}

export const surveyService = new SurveyService();
import { surveyApi } from '../api/SurveyApi';
import { ResponseModel } from '../models/ResponseModel';

export class ResponseService {
    constructor(api = surveyApi) {
        this.api = api;
    }

    async loadAll() {
        const data = await this.api.getAllResponses();
        return ResponseModel.fromArray(data);
    }

    async loadDetail(responseId) {
        const data = await this.api.getResponseDetail(responseId);
        return new ResponseModel(data);
    }

    async submit(survey, candidate, answers) {
        const questions = survey.allQuestions;

        const formattedAnswers = questions.map((q) => ({
            questionId: q.id,
            answerText: q.formatAnswer(answers[q.id]),
        }));

        return this.api.submitResponse(survey.id, {
            candidateName: candidate.name.trim(),
            candidateEmail: candidate.email.trim(),
            answers: formattedAnswers,
        });
    }
}

export const responseService = new ResponseService();
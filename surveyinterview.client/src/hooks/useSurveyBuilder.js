import { useCallback, useState } from 'react';
import { surveyService } from '../services/SurveyService';
import { Question } from '../models/Question';

export function useSurveyBuilder() {
    const [survey, setSurvey] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const loadDetail = useCallback(async (surveyId) => {
        try {
            setError('');
            setMessage('');
            const data = await surveyService.loadDetail(surveyId);
            setSurvey(data);
            return data;
        } catch (err) {
            setError(err.message);
            return null;
        }
    }, []);

    const addSection = useCallback(
        async (title) => {
            if (!survey) return;
            if (!title.trim()) {
                setError('Nama section wajib diisi.');
                return;
            }

            try {
                setSaving(true);
                setError('');
                setMessage('');
                await surveyService.addSection(survey.id, title);
                setMessage('Section berhasil ditambahkan.');
                await loadDetail(survey.id);
            } catch (err) {
                setError(err.message);
            } finally {
                setSaving(false);
            }
        },
        [survey, loadDetail]
    );

    const removeSection = useCallback(
        async (sectionId) => {
            if (!survey) return;

            const confirmed = window.confirm(
                'Hapus section ini? Semua pertanyaan di dalamnya akan ikut terhapus.'
            );
            if (!confirmed) return;

            try {
                setSaving(true);
                setError('');
                setMessage('');
                await surveyService.removeSection(sectionId);
                setMessage('Section berhasil dihapus.');
                await loadDetail(survey.id);
            } catch (err) {
                setError(err.message);
            } finally {
                setSaving(false);
            }
        },
        [survey, loadDetail]
    );

    const removeQuestion = useCallback(
        async (questionId) => {
            if (!survey) return;

            const confirmed = window.confirm('Hapus pertanyaan ini?');
            if (!confirmed) return;

            try {
                setSaving(true);
                setError('');
                setMessage('');
                await surveyService.removeQuestion(questionId);
                setMessage('Pertanyaan berhasil dihapus.');
                await loadDetail(survey.id);
            } catch (err) {
                setError(err.message);
            } finally {
                setSaving(false);
            }
        },
        [survey, loadDetail]
    );

    const addQuestion = useCallback(
        async (sectionId, payload) => {
            if (!survey) return;

            const question = new Question({
                questionText: payload.questionText,
                questionType: payload.questionType,
                isMandatory: payload.isMandatory,
                optionsJson: payload.options
                    ? JSON.stringify(payload.options)
                    : null,
            });

            if (!question.questionText.trim()) {
                setError('Pertanyaan wajib diisi.');
                return;
            }

            if (question.needsOptions && question.options.length < 2) {
                setError('Masukkan minimal 2 pilihan.');
                return;
            }

            try {
                setSaving(true);
                setError('');
                setMessage('');
                await surveyService.addQuestion(sectionId, question);
                setMessage('Pertanyaan berhasil ditambahkan.');
                await loadDetail(survey.id);
            } catch (err) {
                setError(err.message);
            } finally {
                setSaving(false);
            }
        },
        [survey, loadDetail]
    );

    const updateQuestion = useCallback(
        async (questionId, payload) => {
            if (!survey) return;

            const question = new Question({
                questionText: payload.questionText,
                questionType: payload.questionType,
                isMandatory: payload.isMandatory,
                optionsJson: payload.options
                    ? JSON.stringify(payload.options)
                    : null,
            });

            if (!question.questionText.trim()) {
                setError('Pertanyaan wajib diisi.');
                return;
            }

            if (question.needsOptions && question.options.length < 2) {
                setError('Masukkan minimal 2 pilihan.');
                return;
            }

            try {
                setSaving(true);
                setError('');
                setMessage('');
                await surveyService.updateQuestion(questionId, question);
                setMessage('Pertanyaan berhasil diperbarui.');
                await loadDetail(survey.id);
            } catch (err) {
                setError(err.message);
            } finally {
                setSaving(false);
            }
        },
        [survey, loadDetail]
    );

    const toggleSectionMandatory = useCallback(
        async (section) => {
            if (!survey) return;

            try {
                setSaving(true);
                setError('');
                setMessage('');
                await surveyService.updateSection(section.id, {
                    title: section.title,
                    isMandatory: !section.isMandatory,
                });
                setMessage(
                    `Section sekarang ${
                        !section.isMandatory ? 'wajib' : 'tidak wajib'
                    } diisi.`
                );
                await loadDetail(survey.id);
            } catch (err) {
                setError(err.message);
            } finally {
                setSaving(false);
            }
        },
        [survey, loadDetail]
    );

    const clear = useCallback(() => {
        setSurvey(null);
        setError('');
        setMessage('');
    }, []);

    return {
        survey,
        saving,
        error,
        message,
        removeSection,   
        removeQuestion,
        setError,
        setMessage,
        loadDetail,
        addSection,
        addQuestion,
        updateQuestion,
        toggleSectionMandatory,
        clear,
    };
}
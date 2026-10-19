import { useCallback, useEffect, useState } from 'react';
import { surveyService } from '../services/SurveyService';

export function useSurveys() {
    const [surveys, setSurveys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadSurveys = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const list = await surveyService.loadAll();
            setSurveys(list);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSurveys();
    }, [loadSurveys]);

    const addSurvey = useCallback((survey) => {
        setSurveys((current) => [survey, ...current]);
    }, []);

    return {
        surveys,
        loading,
        error,
        setError,
        reload: loadSurveys,
        addSurvey,
    };
}
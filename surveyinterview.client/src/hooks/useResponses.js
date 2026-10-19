import { useCallback, useState } from 'react';
import { responseService } from '../services/ResponseService';

export function useResponses() {
    const [responses, setResponses] = useState([]);
    const [selectedResponse, setSelectedResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [error, setError] = useState('');

    const loadAll = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const list = await responseService.loadAll();
            setResponses(list);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadDetail = useCallback(async (responseId) => {
        try {
            setDetailLoading(true);
            setError('');
            setSelectedResponse(null);
            const data = await responseService.loadDetail(responseId);
            setSelectedResponse(data);
            return data;
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setDetailLoading(false);
        }
    }, []);

    const clearDetail = useCallback(() => {
        setSelectedResponse(null);
    }, []);

    return {
        responses,
        selectedResponse,
        loading,
        detailLoading,
        error,
        setError,
        loadAll,
        loadDetail,
        clearDetail,
    };
}
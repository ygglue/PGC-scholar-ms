import { useState, useEffect } from 'react';
import apiClient from '../config/api';
import { useNavigate } from 'react-router-dom';

const globalCache = {};

export const clearCache = () => {
    for (let key in globalCache) delete globalCache[key];
};

export const useApiCache = (key, url) => {
    const [data, setData] = useState(globalCache[key] || null);
    const [loading, setLoading] = useState(!globalCache[key]);
    const navigate = useNavigate();

    const fetcher = async () => {
        try {
            const res = await apiClient.get(url);
            globalCache[key] = res.data;
            setData(res.data);
            setLoading(false);
            return res.data;
        } catch(err) {
            if (err.response?.status === 401) {
                clearCache();
                navigate('/login');
            }
        }
    };

    const mutate = (newData) => {
        globalCache[key] = newData;
        setData(newData);
    };

    useEffect(() => {
        if (!globalCache[key]) {
            fetcher();
        } else {
            setData(globalCache[key]);
            setLoading(false);
        }
    }, [key, url, navigate]);

    return { data, loading, fetcher, mutate };
};
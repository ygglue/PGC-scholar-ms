import { useState, useEffect } from 'react';
import axios from 'axios';
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
            const token = localStorage.getItem('token');
            if (!token) return;
            const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
            globalCache[key] = res.data;
            setData(res.data);
            setLoading(false);
            return res.data;
        } catch(err) {
            if (err.response?.status === 401) {
                localStorage.removeItem('token');
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

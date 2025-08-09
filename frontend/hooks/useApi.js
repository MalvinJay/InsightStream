import useSWR from 'swr';
import api from '../lib/api';

const fetcher = (url) => api.get(url).then(res => res.data);

export const useContent = (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const { data, error, mutate } = useSWR(`/content?${queryString}`, fetcher, {
        refreshInterval: 30000 // Refresh every 30 seconds
    });

    return {
        content: data?.content || [],
        pagination: data?.pagination || {},
        loading: !error && !data,
        error,
        mutate
    };
};

export const useAnalytics = () => {
    const { data, error } = useSWR('/analytics/metrics', fetcher, {
        refreshInterval: 5000 // Refresh every 5 seconds
    });

    return {
        metrics: data || {},
        loading: !error && !data,
        error
    };
};

export const useStreams = (streamKey) => {
    const { data, error } = useSWR(streamKey ? `/streams/${streamKey}` : null, fetcher, {
        refreshInterval: 2000 // Refresh every 2 seconds
    });

    return {
        events: data?.events || [],
        streamInfo: data?.info || {},
        loading: !error && !data,
        error
    };
};

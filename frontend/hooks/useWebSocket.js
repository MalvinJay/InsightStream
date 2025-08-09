import { useEffect, useState } from 'react';
import { socketService } from '../lib/socket';

export const useWebSocket = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [events, setEvents] = useState([]);

    useEffect(() => {
        const socket = socketService.connect();

        socket.on('connect', () => setIsConnected(true));
        socket.on('disconnect', () => setIsConnected(false));

        // Listen to stream events
        socket.on('stream_events', (data) => {
            setEvents(prev => [data, ...prev.slice(0, 49)]); // Keep last 50 events
        });

        socket.on('content_updates', (data) => {
            setEvents(prev => [{ type: 'content_update', ...data }, ...prev.slice(0, 49)]);
        });

        socket.on('analytics_updates', (data) => {
            setEvents(prev => [{ type: 'analytics_update', ...data }, ...prev.slice(0, 49)]);
        });

        return () => {
            socketService.disconnect();
        };
    }, []);

    return { isConnected, events, socket: socketService.socket };
};

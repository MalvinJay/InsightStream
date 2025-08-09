const { Server } = require('socket.io');
const { subClient } = require('../config/redis');

class SocketService {

    init(server) {
        this.io = new Server(server, {
            cors: {
                origin: process.env.FRONTEND_URL || 'http://localhost:3000',
                methods: ['GET', 'POST']
            }
        });

        this.setupEventHandlers();
        this.subscribeToRedis();
    }

    setupEventHandlers() {
        this.io.on('connection', (socket) => {
            console.log(`✅ Client connected: ${socket.id}`);

            socket.on('join_room', (room) => {
                socket.join(room);
                console.log(`Client ${socket.id} joined room: ${room}`);
            });

            socket.on('disconnect', () => {
                console.log(`❌ Client disconnected: ${socket.id}`);
            });
        });
    }

    subscribeToRedis() {
        subClient.subscribe('stream_events', 'content_updates', 'analytics_updates');

        subClient.on('message', (channel, message) => {
            try {
                const data = JSON.parse(message);
                this.io.emit(channel, data);
                console.log(`📡 Broadcasted ${channel} event`);
            } catch (error) {
                console.error('Failed to broadcast Redis message:', error);
            }
        });
    }

    broadcast(event, data) {
        this.io.emit(event, data);
    }
}

module.exports = new SocketService();

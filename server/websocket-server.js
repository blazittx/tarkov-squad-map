import { WebSocketServer } from 'ws';
import express from 'express';
import { parse } from 'url';

const PORT_WS = 8001;

// Configure WebSocket server with proper options
const wss = new WebSocketServer({
    port: PORT_WS,
    host: '0.0.0.0',
    clientTracking: true,
    perMessageDeflate: false,
    maxPayload: 1024 * 1024,
});

// Store connected clients and their data
const clients = new Map();
const viewers = new Map(); // Separate storage for viewers (read-only)
const playerData = new Map();

// Generate unique client ID
function generateClientId() {
    return Math.random().toString(36).substr(2, 9);
}

// Broadcast data to all connected clients except sender
function broadcastToOthers(senderId, data) {
    const message = JSON.stringify(data);

    clients.forEach((ws, clientId) => {
        if (clientId !== senderId && ws.readyState === ws.OPEN) {
            ws.send(message);
        }
    });

    // Also broadcast to all viewers
    viewers.forEach((ws) => {
        if (ws.readyState === ws.OPEN) {
            ws.send(message);
        }
    });
}

// Broadcast to all clients including sender
function broadcastToAll(data) {
    const message = JSON.stringify(data);

    clients.forEach((ws) => {
        if (ws.readyState === ws.OPEN) {
            ws.send(message);
        }
    });

    // Also broadcast to all viewers
    viewers.forEach((ws) => {
        if (ws.readyState === ws.OPEN) {
            ws.send(message);
        }
    });
}

// Handle WebSocket connections
wss.on('connection', (ws, req) => {
    const clientId = generateClientId();
    const url = parse(req.url, true);
    const mapId = url.query.mapId || 'default';
    const isViewer = url.query.viewer === 'true';

    if (isViewer) {
        console.log(`Viewer ${clientId} connected to map: ${mapId}`);
        // Store viewer connection (read-only)
        viewers.set(clientId, ws);
    } else {
        console.log(`Client ${clientId} connected to map: ${mapId}`);
        // Store client connection (can send player data)
        clients.set(clientId, ws);
    }

    // Send initial data to new client
    const initialData = {
        type: 'initial_data',
        players: Array.from(playerData.entries()).map(([id, data]) => ({
            id,
            ...data,
        })),
    };

    ws.send(JSON.stringify(initialData));

    // Handle incoming messages
    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data.toString());

            // Only allow clients (not viewers) to send player data
            if (isViewer) {
                console.log(
                    `Viewer ${clientId} attempted to send message type: ${message.type} - ignored`,
                );
                return;
            }

            switch (message.type) {
                case 'player_update':
                    // Store player data
                    playerData.set(clientId, {
                        mapId: mapId,
                        position: message.position,
                        rotation: message.rotation,
                        playerName: message.playerName || `Player ${clientId}`,
                        visible: message.visible !== false,
                        timestamp: Date.now(),
                    });

                    // Broadcast to other clients
                    broadcastToOthers(clientId, {
                        type: 'player_update',
                        playerId: clientId,
                        mapId: mapId,
                        position: message.position,
                        rotation: message.rotation,
                        playerName: message.playerName || `Player ${clientId}`,
                        visible: message.visible !== false,
                        timestamp: Date.now(),
                    });
                    break;

                case 'player_disconnect':
                    // Remove player data
                    playerData.delete(clientId);

                    // Notify other clients
                    broadcastToOthers(clientId, {
                        type: 'player_disconnect',
                        playerId: clientId,
                    });
                    break;

                default:
                    console.log(`Unknown message type: ${message.type}`);
            }
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    });

    // Handle client disconnect
    ws.on('close', () => {
        if (isViewer) {
            console.log(`Viewer ${clientId} disconnected`);
            viewers.delete(clientId);
        } else {
            console.log(`Client ${clientId} disconnected`);

            // Remove client and player data
            clients.delete(clientId);
            playerData.delete(clientId);

            // Notify other clients and viewers
            broadcastToOthers(clientId, {
                type: 'player_disconnect',
                playerId: clientId,
            });
        }
    });

    // Handle errors
    ws.on('error', (error) => {
        console.error(`WebSocket error for client ${clientId}:`, error);
    });
});

// WebSocket server is already started with the WebSocketServer constructor
console.log(`WebSocket server running on port ${PORT_WS}`);
console.log(`WebSocket endpoint: ws://localhost:${PORT_WS}`);

// Clean up inactive players (older than 5 minutes)
setInterval(() => {
    const now = Date.now();
    const inactiveThreshold = 5 * 60 * 1000; // 5 minutes

    playerData.forEach((data, playerId) => {
        if (now - data.timestamp > inactiveThreshold) {
            console.log(`Removing inactive player: ${playerId}`);
            playerData.delete(playerId);

            // Notify clients about inactive player removal
            broadcastToAll({
                type: 'player_disconnect',
                playerId: playerId,
            });
        }
    });
}, 60000); // Check every minute

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down servers...');
    wss.close(() => {
        console.log('WebSocket server closed');
        process.exit(0);
    });
});

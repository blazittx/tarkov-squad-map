#!/usr/bin/env node

import { spawn } from 'child_process';
import process from 'process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { parse } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting Tarkov Squad Map Production Server...\n');

// Create Express app for serving static files
const app = express();
const PORT = process.env.PORT || 8000;
const WEBSOCKET_PORT = process.env.WEBSOCKET_PORT || 8001;

// Serve static files from build directory
app.use(express.static(join(__dirname, 'build')));

// Handle React Router (SPA) - serve index.html for all routes
app.get('*', (req, res) => {
    res.sendFile(join(__dirname, 'build', 'index.html'));
});

// Create HTTP server
const server = createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ 
    server,
    path: '/ws'
});

// Store connected clients and their data
const clients = new Map();
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
}

// Broadcast to all clients including sender
function broadcastToAll(data) {
    const message = JSON.stringify(data);
    
    clients.forEach((ws) => {
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
    
    console.log(`Client ${clientId} connected to map: ${mapId}`);
    
    // Store client connection
    clients.set(clientId, ws);
    
    // Send initial data to new client
    const initialData = {
        type: 'initial_data',
        players: Array.from(playerData.entries()).map(([id, data]) => ({
            id,
            ...data
        }))
    };
    
    ws.send(JSON.stringify(initialData));
    
    // Handle incoming messages
    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data.toString());
            
            switch (message.type) {
                case 'player_update':
                    // Store player data
                    playerData.set(clientId, {
                        mapId: mapId,
                        position: message.position,
                        rotation: message.rotation,
                        playerName: message.playerName || `Player ${clientId}`,
                        visible: message.visible !== false,
                        timestamp: Date.now()
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
                        timestamp: Date.now()
                    });
                    break;
                    
                case 'player_disconnect':
                    // Remove player data
                    playerData.delete(clientId);
                    
                    // Notify other clients
                    broadcastToOthers(clientId, {
                        type: 'player_disconnect',
                        playerId: clientId
                    });
                    break;
                    
                case 'ping':
                    // Respond to ping with pong
                    ws.send(JSON.stringify({ type: 'pong' }));
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
        console.log(`Client ${clientId} disconnected`);
        
        // Remove client and player data
        clients.delete(clientId);
        playerData.delete(clientId);
        
        // Notify other clients
        broadcastToOthers(clientId, {
            type: 'player_disconnect',
            playerId: clientId
        });
    });
    
    // Handle errors
    ws.on('error', (error) => {
        console.error(`WebSocket error for client ${clientId}:`, error);
    });
});

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
                playerId: playerId
            });
        }
    });
}, 60000); // Check every minute

// Start the server
server.listen(PORT, () => {
    console.log(`✅ Production server running on port ${PORT}`);
    console.log(`📡 WebSocket server running on port ${WEBSOCKET_PORT}`);
    console.log(`🌐 Website: http://localhost:${PORT}`);
    console.log(`📡 WebSocket: ws://localhost:${WEBSOCKET_PORT}/ws`);
    console.log('\nPress Ctrl+C to stop the server\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down production server...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down production server...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

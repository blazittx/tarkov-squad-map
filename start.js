#!/usr/bin/env node

import { spawn } from 'child_process';
import process from 'process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting Tarkov Squad Map WebSocket Server...\n');

// Start WebSocket server on port 8001
console.log('📡 Starting WebSocket server on port 8001...');
const wsServer = spawn('node', ['server/websocket-server.js'], {
    env: { ...process.env, WEBSOCKET_PORT: '8001' },
    stdio: 'inherit',
    cwd: __dirname,
});

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down WebSocket server...');
    wsServer.kill('SIGINT');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down WebSocket server...');
    wsServer.kill('SIGTERM');
    process.exit(0);
});

// Handle child process errors
wsServer.on('error', (error) => {
    console.error('❌ Failed to start WebSocket server:', error.message);
    process.exit(1);
});

// Handle child process exits
wsServer.on('exit', (code) => {
    if (code !== 0) {
        console.error('❌ WebSocket server exited with code', code);
        process.exit(1);
    }
});

console.log('✅ WebSocket server started successfully!');
console.log('📡 WebSocket: ws://localhost:8001/ws');
console.log('\nPress Ctrl+C to stop the server\n');

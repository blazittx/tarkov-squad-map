#!/usr/bin/env node

import { spawn } from 'child_process';
import process from 'process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting Tarkov Squad Map...\n');

// Start WebSocket server on port 8001
console.log('📡 Starting WebSocket server on port 8001...');
const wsServer = spawn('node', ['server/websocket-server.js'], {
    env: { ...process.env, WEBSOCKET_PORT: '8001' },
    stdio: 'inherit',
    cwd: __dirname
});

// Start React app on port 8000
console.log('🌐 Starting React app on port 8000...');
const reactApp = spawn('npx', ['react-scripts', 'start'], {
    env: { ...process.env, PORT: '8000' },
    stdio: 'inherit',
    cwd: __dirname,
    shell: true
});

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down servers...');
    wsServer.kill('SIGINT');
    reactApp.kill('SIGINT');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down servers...');
    wsServer.kill('SIGTERM');
    reactApp.kill('SIGTERM');
    process.exit(0);
});

// Handle child process errors
wsServer.on('error', (error) => {
    console.error('❌ Failed to start WebSocket server:', error.message);
    process.exit(1);
});

reactApp.on('error', (error) => {
    console.error('❌ Failed to start React app:', error.message);
    process.exit(1);
});

// Handle child process exits
wsServer.on('exit', (code) => {
    if (code !== 0) {
        console.error('❌ WebSocket server exited with code', code);
        process.exit(1);
    }
});

reactApp.on('exit', (code) => {
    if (code !== 0) {
        console.error('❌ React app exited with code', code);
        process.exit(1);
    }
});

console.log('✅ Both servers started successfully!');
console.log('📡 WebSocket: ws://localhost:8001/ws');
console.log('🌐 Website: http://localhost:8000');
console.log('\nPress Ctrl+C to stop both servers\n');

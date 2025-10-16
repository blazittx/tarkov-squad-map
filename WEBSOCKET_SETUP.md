# Tarkov Squad Map - WebSocket Integration

This project now includes real-time multiplayer functionality using WebSockets, allowing multiple users to see each other's player locations and rotations on Tarkov maps.

## Features

- **Real-time player sharing**: See other players' locations and rotations in real-time
- **Visual differentiation**: Local player (green glow) vs other players (orange glow)
- **Connection status**: Visual indicator showing WebSocket connection status
- **Player count**: Shows how many other players are currently connected
- **Automatic reconnection**: Automatically reconnects if connection is lost
- **Map-specific rooms**: Players are grouped by map (each map has its own WebSocket room)

## Setup and Running

### Prerequisites
- Node.js >= 20
- npm

### Installation
```bash
npm install
```

### Running the Application

#### Option 1: Single Entry Point (Recommended)
```bash
npm run start-all
```

This will start both servers automatically:
- **WebSocket Server**: `ws://localhost:8001/ws`
- **React App**: `http://localhost:8000`

#### Option 2: Run both servers together
```bash
npm run dev
```
This will start both the WebSocket server (port 8001) and the React development server (port 8000).

#### Option 3: Run servers separately
```bash
# Terminal 1: Start WebSocket server
npm run websocket-server

# Terminal 2: Start React development server
npm start
```

### Testing Multiplayer Functionality

1. **Start the servers** using one of the methods above
2. **Open multiple browser tabs/windows** to the same map URL (e.g., `http://localhost:8000/map/customs`)
3. **Set different player names** in each tab using the Player Controls panel
4. **Move players** by adjusting position/rotation values
5. **Observe real-time updates** - you should see other players' icons appear and move in real-time

### WebSocket Server Details

- **Port**: 8000 (configurable via `WEBSOCKET_PORT` environment variable)
- **Endpoint**: `ws://localhost:8000/ws?mapId=<map_name>`
- **Protocol**: JSON messages over WebSocket

#### Message Types

**Client to Server:**
- `player_update`: Send player position/rotation data
- `player_disconnect`: Notify server of disconnection
- `ping`: Keep connection alive

**Server to Client:**
- `initial_data`: Send existing players when client connects
- `player_update`: Broadcast player updates to other clients
- `player_disconnect`: Notify clients when a player disconnects
- `pong`: Response to ping

### Production Deployment

For production deployment, you'll need to:

1. **Build the React app**: `npm run build`
2. **Configure WebSocket server** to use HTTPS/WSS in production
3. **Update WebSocket URL** in `src/hooks/useWebSocket.jsx` for production
4. **Deploy both** the built React app and the WebSocket server

### Troubleshooting

- **Connection issues**: Check that the WebSocket server is running on port 8000
- **No other players visible**: Ensure both tabs are on the same map
- **Players not updating**: Check browser console for WebSocket errors
- **Port conflicts**: Change `WEBSOCKET_PORT` environment variable if port 8000 is in use

### File Structure

```
├── server/
│   └── websocket-server.js    # WebSocket server implementation
├── src/
│   ├── hooks/
│   │   └── useWebSocket.jsx   # React hook for WebSocket functionality
│   ├── components/
│   │   ├── player-icon/       # Player icon component (updated)
│   │   └── player-controls/   # Player controls component (updated)
│   └── pages/
│       └── map/
│           └── index.js       # Main map component (updated)
```

### Technical Notes

- **Map-specific rooms**: Each map creates its own WebSocket room using the map ID
- **Automatic cleanup**: Inactive players (no updates for 5+ minutes) are automatically removed
- **Connection persistence**: WebSocket connections automatically reconnect on failure
- **Data synchronization**: Player data is synchronized in real-time across all connected clients

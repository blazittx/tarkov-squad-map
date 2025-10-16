import { useEffect, useRef, useCallback, useState } from 'react';

// WebSocket hook for managing real-time player data
export function useWebSocket(mapId = 'default') {
    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState(null);
    const [otherPlayers, setOtherPlayers] = useState(new Map());
    
    // WebSocket server URL
    const wsUrl = process.env.NODE_ENV === 'production' 
        ? `wss://${window.location.host}?mapId=${mapId}`
        : `ws://localhost:8001?mapId=${mapId}`;
    
    // Connect to WebSocket server
    const connect = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            return;
        }
        
        try {
            console.log(`Connecting to WebSocket: ${wsUrl}`);
            wsRef.current = new WebSocket(wsUrl);
            
            wsRef.current.onopen = () => {
                console.log('WebSocket connected');
                setIsConnected(true);
                setConnectionError(null);
                
                // Clear any pending reconnection
                if (reconnectTimeoutRef.current) {
                    clearTimeout(reconnectTimeoutRef.current);
                    reconnectTimeoutRef.current = null;
                }
            };
            
            wsRef.current.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    
                    switch (data.type) {
                        case 'initial_data':
                            // Initialize with existing players
                            const playersMap = new Map();
                            data.players.forEach(player => {
                                playersMap.set(player.id, {
                                    position: player.position,
                                    rotation: player.rotation,
                                    playerName: player.playerName,
                                    visible: player.visible,
                                    timestamp: player.timestamp
                                });
                            });
                            setOtherPlayers(playersMap);
                            break;
                            
                        case 'player_update':
                            // Update player data
                            setOtherPlayers(prev => {
                                const newMap = new Map(prev);
                                newMap.set(data.playerId, {
                                    position: data.position,
                                    rotation: data.rotation,
                                    playerName: data.playerName,
                                    visible: data.visible,
                                    timestamp: data.timestamp
                                });
                                return newMap;
                            });
                            break;
                            
                        case 'player_disconnect':
                            // Remove player
                            setOtherPlayers(prev => {
                                const newMap = new Map(prev);
                                newMap.delete(data.playerId);
                                return newMap;
                            });
                            break;
                            
                        case 'pong':
                            // Handle pong response
                            break;
                            
                        default:
                            console.log('Unknown WebSocket message type:', data.type);
                    }
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };
            
            wsRef.current.onclose = (event) => {
                console.log('WebSocket disconnected:', event.code, event.reason);
                setIsConnected(false);
                
                // Attempt to reconnect after 3 seconds
                if (!reconnectTimeoutRef.current) {
                    reconnectTimeoutRef.current = setTimeout(() => {
                        console.log('Attempting to reconnect...');
                        connect();
                    }, 3000);
                }
            };
            
            wsRef.current.onerror = (error) => {
                console.error('WebSocket error:', error);
                setConnectionError('Failed to connect to server');
                setIsConnected(false);
            };
            
        } catch (error) {
            console.error('Error creating WebSocket connection:', error);
            setConnectionError('Failed to create WebSocket connection');
        }
    }, [wsUrl]);
    
    // Disconnect from WebSocket server
    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
        
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
        
        setIsConnected(false);
        setOtherPlayers(new Map());
    }, []);
    
    // Send player update to server
    const sendPlayerUpdate = useCallback((playerData) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            const message = {
                type: 'player_update',
                ...playerData
            };
            wsRef.current.send(JSON.stringify(message));
        } else {
            console.warn('WebSocket not connected, cannot send player update');
        }
    }, []);
    
    // Send player disconnect notification
    const sendPlayerDisconnect = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            const message = {
                type: 'player_disconnect'
            };
            wsRef.current.send(JSON.stringify(message));
        }
    }, []);
    
    // Send ping to keep connection alive
    const ping = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'ping' }));
        }
    }, []);
    
    // Connect on mount and disconnect on unmount
    useEffect(() => {
        connect();
        
        return () => {
            disconnect();
        };
    }, [connect, disconnect]);
    
    // Send ping every 30 seconds to keep connection alive
    useEffect(() => {
        if (!isConnected) return;
        
        const pingInterval = setInterval(ping, 30000);
        
        return () => {
            clearInterval(pingInterval);
        };
    }, [isConnected, ping]);
    
    return {
        isConnected,
        connectionError,
        otherPlayers,
        sendPlayerUpdate,
        sendPlayerDisconnect,
        reconnect: connect
    };
}

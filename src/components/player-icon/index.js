import React from 'react';
import L from 'leaflet';
import './index.css';

// Create a custom player icon with rotation support
function createPlayerIcon(rotation = 0, size = 48) {
    // Use both player.svg (body) and rotation.svg (rotation indicator)
    const playerUrl = `${process.env.PUBLIC_URL}/player.svg`;
    const rotationUrl = `${process.env.PUBLIC_URL}/rotation.svg`;
    
    return { playerUrl, rotationUrl };
}

// Player Icon Component
function PlayerIcon({ position, rotation = 0, map, visible = true, playerName = "Player" }) {
    const markerRef = React.useRef(null);
    const nameMarkerRef = React.useRef(null);
    
    React.useEffect(() => {
        if (!map || !position || !visible) {
            if (markerRef.current) {
                map.removeLayer(markerRef.current);
                markerRef.current = null;
            }
            if (nameMarkerRef.current) {
                map.removeLayer(nameMarkerRef.current);
                nameMarkerRef.current = null;
            }
            return;
        }
        
        // Create icon with both player body and rotation indicator
        const { playerUrl, rotationUrl } = createPlayerIcon(rotation);
        
        const playerIcon = L.divIcon({
            html: `<div class="player-icon-container">
                <!-- Player body (never rotates) -->
                <img src="${playerUrl}" alt="Player Body" class="player-body" style="width: 24px; height: 24px; position: absolute; top: 12px; left: 12px;" />
                <!-- Rotation indicator (rotates around body) -->
                <img src="${rotationUrl}" alt="Rotation" class="player-rotation" style="width: 56px; height: 56px; position: absolute; top: -4px; left: -4px; transform: rotate(${rotation}deg);" />
            </div>`,
            className: 'player-icon-marker',
            iconSize: [48, 48],
            iconAnchor: [24, 24]
        });
        
        // Create marker
        const marker = L.marker([position.z, position.x], {
            icon: playerIcon,
            zIndexOffset: 1000 // Ensure player icon is always on top
        });
        
        // Add popup with player info
        marker.bindPopup(`
            <div class="player-popup">
                <strong>${playerName}</strong><br>
                X: ${position.x.toFixed(2)}<br>
                Z: ${position.z.toFixed(2)}<br>
                Y: ${position.y?.toFixed(2) || 'N/A'}<br>
                Rotation: ${rotation.toFixed(1)}°
            </div>
        `);
        
        // Add to map
        marker.addTo(map);
        markerRef.current = marker;
        
        // Create name label above the player
        const nameDiv = L.divIcon({
            html: `<div class="player-name-label">${playerName}</div>`,
            className: 'player-name-marker',
            iconSize: [120, 30],
            iconAnchor: [60, 35] // Position the name further above the player icon
        });
        
        const nameMarker = L.marker([position.z, position.x], {
            icon: nameDiv,
            zIndexOffset: 1001 // Above the player icon
        });
        
        nameMarker.addTo(map);
        nameMarkerRef.current = nameMarker;
        
        // Cleanup function
        return () => {
            if (markerRef.current) {
                map.removeLayer(markerRef.current);
                markerRef.current = null;
            }
            if (nameMarkerRef.current) {
                map.removeLayer(nameMarkerRef.current);
                nameMarkerRef.current = null;
            }
        };
    }, [map, position, rotation, visible, playerName]);
    
    // Update marker when position or rotation changes
    React.useEffect(() => {
        if (markerRef.current && position && visible) {
            // Update position
            markerRef.current.setLatLng([position.z, position.x]);
            if (nameMarkerRef.current) {
                nameMarkerRef.current.setLatLng([position.z, position.x]);
            }
            
            // Update rotation by recreating the icon with new rotation
            const { playerUrl, rotationUrl } = createPlayerIcon(rotation);
            const newIcon = L.divIcon({
                html: `<div class="player-icon-container">
                    <!-- Player body (never rotates) -->
                    <img src="${playerUrl}" alt="Player Body" class="player-body" style="width: 24px; height: 24px; position: absolute; top: 12px; left: 12px;" />
                    <!-- Rotation indicator (rotates around body) -->
                    <img src="${rotationUrl}" alt="Rotation" class="player-rotation" style="width: 56px; height: 56px; position: absolute; top: -4px; left: -4px; transform: rotate(${rotation}deg);" />
                </div>`,
                className: 'player-icon-marker',
                iconSize: [48, 48],
                iconAnchor: [24, 24]
            });
            markerRef.current.setIcon(newIcon);
            
            // Update popup content
            markerRef.current.setPopupContent(`
                <div class="player-popup">
                    <strong>${playerName}</strong><br>
                    X: ${position.x.toFixed(2)}<br>
                    Z: ${position.z.toFixed(2)}<br>
                    Y: ${position.y?.toFixed(2) || 'N/A'}<br>
                    Rotation: ${rotation.toFixed(1)}°
                </div>
            `);
        }
    }, [position, rotation, visible, playerName]);
    
    return null; // This component doesn't render anything directly
}

export default PlayerIcon;

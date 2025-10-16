import React, { useState, useCallback } from 'react';
import './index.css';

function PlayerControls({ 
    playerPosition, 
    setPlayerPosition, 
    playerRotation, 
    setPlayerRotation, 
    playerVisible, 
    setPlayerVisible,
    playerName,
    setPlayerName,
    mapData 
}) {
    const [tempPosition, setTempPosition] = useState({
        x: playerPosition?.x || 0,
        z: playerPosition?.z || 0,
        y: playerPosition?.y || 0
    });
    
    const [tempRotation, setTempRotation] = useState(playerRotation || 0);
    const [tempName, setTempName] = useState(playerName || "Player");
    
    const handlePositionChange = useCallback((field, value) => {
        const newPosition = { ...tempPosition, [field]: parseFloat(value) || 0 };
        setTempPosition(newPosition);
    }, [tempPosition]);
    
    const handleRotationChange = useCallback((value) => {
        setTempRotation(parseFloat(value) || 0);
    }, []);
    
    const handleNameChange = useCallback((value) => {
        setTempName(value);
    }, []);
    
    const applyPosition = useCallback(() => {
        setPlayerPosition(tempPosition);
    }, [tempPosition, setPlayerPosition]);
    
    const applyRotation = useCallback(() => {
        setPlayerRotation(tempRotation);
    }, [tempRotation, setPlayerRotation]);
    
    const applyName = useCallback(() => {
        setPlayerName(tempName);
    }, [tempName, setPlayerName]);
    
    const resetToCenter = useCallback(() => {
        if (mapData?.bounds) {
            const centerX = (mapData.bounds[0][1] + mapData.bounds[1][1]) / 2;
            const centerZ = (mapData.bounds[0][0] + mapData.bounds[1][0]) / 2;
            const newPosition = { x: centerX, z: centerZ, y: 0 };
            setTempPosition(newPosition);
            setPlayerPosition(newPosition);
        }
    }, [mapData, setPlayerPosition]);
    
    const randomizePosition = useCallback(() => {
        if (mapData?.bounds) {
            const minX = Math.min(mapData.bounds[0][1], mapData.bounds[1][1]);
            const maxX = Math.max(mapData.bounds[0][1], mapData.bounds[1][1]);
            const minZ = Math.min(mapData.bounds[0][0], mapData.bounds[1][0]);
            const maxZ = Math.max(mapData.bounds[0][0], mapData.bounds[1][0]);
            
            const randomX = minX + Math.random() * (maxX - minX);
            const randomZ = minZ + Math.random() * (maxZ - minZ);
            const randomY = Math.random() * 10 - 5; // Random Y between -5 and 5
            
            const newPosition = { x: randomX, z: randomZ, y: randomY };
            setTempPosition(newPosition);
            setPlayerPosition(newPosition);
        }
    }, [mapData, setPlayerPosition]);
    
    const randomizeRotation = useCallback(() => {
        const randomRot = Math.random() * 360;
        setTempRotation(randomRot);
        setPlayerRotation(randomRot);
    }, [setPlayerRotation]);
    
    if (!mapData) return null;
    
    return (
        <div className="player-controls">
            <h3>Player Position</h3>
            
            <div className="control-group">
                <button 
                    className={`toggle-button ${playerVisible ? 'active' : ''}`}
                    onClick={() => setPlayerVisible(!playerVisible)}
                >
                    {playerVisible ? 'Hide Player' : 'Show Player'}
                </button>
            </div>
            
            {playerVisible && (
                <>
                    <div className="control-group">
                        <label>Player Name:</label>
                        <input
                            type="text"
                            value={tempName}
                            onChange={(e) => handleNameChange(e.target.value)}
                            placeholder="Enter player name"
                        />
                        <button onClick={applyName}>Apply Name</button>
                    </div>
                    
                    <div className="control-group">
                        <label>X Position:</label>
                        <input
                            type="number"
                            value={tempPosition.x}
                            onChange={(e) => handlePositionChange('x', e.target.value)}
                            step="0.1"
                        />
                    </div>
                    
                    <div className="control-group">
                        <label>Z Position:</label>
                        <input
                            type="number"
                            value={tempPosition.z}
                            onChange={(e) => handlePositionChange('z', e.target.value)}
                            step="0.1"
                        />
                    </div>
                    
                    <div className="control-group">
                        <label>Y Position (Elevation):</label>
                        <input
                            type="number"
                            value={tempPosition.y}
                            onChange={(e) => handlePositionChange('y', e.target.value)}
                            step="0.1"
                        />
                    </div>
                    
                    <div className="control-group">
                        <label>Rotation (degrees):</label>
                        <input
                            type="number"
                            value={tempRotation}
                            onChange={(e) => handleRotationChange(e.target.value)}
                            min="0"
                            max="360"
                            step="1"
                        />
                    </div>
                    
                    <div className="control-group">
                        <button onClick={applyPosition}>Apply Position</button>
                        <button onClick={applyRotation}>Apply Rotation</button>
                    </div>
                    
                    <div className="control-group">
                        <button onClick={resetToCenter}>Center on Map</button>
                        <button onClick={randomizePosition}>Random Position</button>
                        <button onClick={randomizeRotation}>Random Rotation</button>
                    </div>
                    
                    <div className="control-group">
                        <small>
                            Map Bounds:<br/>
                            X: {mapData.bounds[0][1].toFixed(1)} to {mapData.bounds[1][1].toFixed(1)}<br/>
                            Z: {mapData.bounds[0][0].toFixed(1)} to {mapData.bounds[1][0].toFixed(1)}
                        </small>
                    </div>
                </>
            )}
        </div>
    );
}

export default PlayerControls;

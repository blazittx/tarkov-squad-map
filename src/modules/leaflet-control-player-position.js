// Leaflet control for player position management
import L from 'leaflet';

L.Control.PlayerPosition = L.Control.extend({
    options: {
        position: 'topright',
        playerPosition: null,
        setPlayerPosition: null,
        playerRotation: null,
        setPlayerRotation: null,
        playerVisible: null,
        setPlayerVisible: null,
        playerName: null,
        setPlayerName: null,
        mapData: null,
        isConnected: false,
        connectionError: null,
        otherPlayersCount: 0,
        isViewerMode: true, // Default to viewer mode (read-only)
        onModeChange: null, // Callback function for mode changes
        onPlayerDisconnect: null // Callback function for player disconnect
    },

    onAdd: function(map) {
        const container = L.DomUtil.create('div', 'leaflet-control-layers leaflet-control');
        container.setAttribute('aria-haspopup', 'true');

        // Create toggle button
        const toggle = L.DomUtil.create('a', 'leaflet-control-layers-toggle', container);
        toggle.href = '#';
        toggle.title = 'Player Position';
        toggle.setAttribute('data-badge', this.options.otherPlayersCount > 0 ? this.options.otherPlayersCount : 'undefined');

        // Create form container
        const form = L.DomUtil.create('form', 'leaflet-control-layers-list', container);
        form.style.display = 'none';

        // Create player position group
        const playerGroup = L.DomUtil.create('div', 'leaflet-control-layers-group group-collapsable', form);
        playerGroup.id = 'leaflet-control-layers-group-player';
        playerGroup.setAttribute('data-key', 'Player Position');

        // Group label
        const groupLabel = L.DomUtil.create('label', 'leaflet-control-layers-group-label', playerGroup);
        
        // Group name
        const groupName = L.DomUtil.create('span', 'leaflet-control-layers-group-name', groupLabel);
        groupName.textContent = 'Player Position';

        // WebSocket status indicator with client count
        const statusSpan = L.DomUtil.create('span', 'player-status-indicator', groupLabel);
        const clientCount = this.options.otherPlayersCount + 1; // +1 for current player
        statusSpan.innerHTML = this.options.isConnected ? ` 🟢 (${clientCount})` : ' 🔴 (0)';
        statusSpan.title = this.options.isConnected ? `Connected - ${clientCount} players` : 'Disconnected';

        // Create content container for better organization
        const contentContainer = L.DomUtil.create('div', 'player-content-container', playerGroup);

        // Mode toggle (Client/Viewer)
        const modeContainer = L.DomUtil.create('div', 'player-control-row', contentContainer);
        const modeLabel = L.DomUtil.create('label', 'player-control-label', modeContainer);
        modeLabel.textContent = 'Mode:';
        const modeToggle = L.DomUtil.create('button', 'player-mode-toggle', modeContainer);
        modeToggle.textContent = this.options.isViewerMode ? 'Viewer' : 'Client';
        modeToggle.type = 'button';
        modeToggle.title = this.options.isViewerMode ? 'Click to switch to Client mode' : 'Click to switch to Viewer mode';

        // Player name input
        const nameContainer = L.DomUtil.create('div', 'player-control-row', contentContainer);
        const nameLabel = L.DomUtil.create('label', 'player-control-label', nameContainer);
        nameLabel.textContent = 'Name:';
        const nameInput = L.DomUtil.create('input', 'player-name-input', nameContainer);
        nameInput.type = 'text';
        nameInput.value = this.options.playerName || 'Player';
        nameInput.placeholder = 'Enter player name';
        
        // Disable name input in viewer mode
        if (this.options.isViewerMode) {
            nameInput.disabled = true;
            nameInput.title = 'Viewer mode - name editing disabled';
        }

        // Position display
        const positionContainer = L.DomUtil.create('div', 'player-control-row', contentContainer);
        const positionLabel = L.DomUtil.create('label', 'player-control-label', positionContainer);
        positionLabel.textContent = 'Position:';
        const positionSpan = L.DomUtil.create('span', 'player-position-display', positionContainer);
        positionSpan.textContent = `X: ${this.options.playerPosition?.x?.toFixed(1) || 0}, Z: ${this.options.playerPosition?.z?.toFixed(1) || 0}`;

        // Rotation display
        const rotationContainer = L.DomUtil.create('div', 'player-control-row', contentContainer);
        const rotationLabel = L.DomUtil.create('label', 'player-control-label', rotationContainer);
        rotationLabel.textContent = 'Rotation:';
        const rotationSpan = L.DomUtil.create('span', 'player-rotation-display', rotationContainer);
        rotationSpan.textContent = `${this.options.playerRotation?.toFixed(1) || 0}°`;

        // Action buttons
        const buttonContainer = L.DomUtil.create('div', 'player-button-container', contentContainer);
        
        const centerBtn = L.DomUtil.create('button', 'player-action-btn', buttonContainer);
        centerBtn.textContent = 'Center';
        centerBtn.type = 'button';

        const randomBtn = L.DomUtil.create('button', 'player-action-btn', buttonContainer);
        randomBtn.textContent = 'Random';
        randomBtn.type = 'button';
        
        // Disable buttons in viewer mode
        if (this.options.isViewerMode) {
            centerBtn.disabled = true;
            centerBtn.title = 'Viewer mode - position editing disabled';
            randomBtn.disabled = true;
            randomBtn.title = 'Viewer mode - position editing disabled';
        }

        // Store references for updates
        this._container = container;
        this._form = form;
        this._toggle = toggle;
        this._modeToggle = modeToggle;
        this._nameInput = nameInput;
        this._positionSpan = positionSpan;
        this._rotationSpan = rotationSpan;
        this._statusSpan = statusSpan;
        this._centerBtn = centerBtn;
        this._randomBtn = randomBtn;
        this._playerGroup = playerGroup;

        // Event handlers
        L.DomEvent.on(toggle, 'click', this._toggleForm, this);
        L.DomEvent.on(modeToggle, 'click', this._onModeToggle, this);
        L.DomEvent.on(nameInput, 'change', this._onNameChange, this);
        L.DomEvent.on(centerBtn, 'click', this._onCenterClick, this);
        L.DomEvent.on(randomBtn, 'click', this._onRandomClick, this);

        // Prevent map events
        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.disableScrollPropagation(container);

        return container;
    },

    _toggleForm: function(e) {
        L.DomEvent.preventDefault(e);
        if (this._form.style.display === 'none') {
            this._form.style.display = 'block';
        } else {
            this._form.style.display = 'none';
        }
    },

    _onModeToggle: function(e) {
        L.DomEvent.preventDefault(e);
        
        const wasClientMode = !this.options.isViewerMode;
        const newViewerMode = !this.options.isViewerMode;
        
        // If switching from client to viewer, send disconnect message first
        if (wasClientMode && newViewerMode) {
            console.log('Switching from Client to Viewer - sending disconnect message');
            if (this.options.onPlayerDisconnect) {
                // Send disconnect message immediately
                this.options.onPlayerDisconnect();
            }
            
            // Hide the player icon for the current user when switching to viewer mode
            if (this.options.setPlayerVisible) {
                this.options.setPlayerVisible(false);
                console.log('Hiding player icon for viewer mode');
            }
        }
        
        // If switching from viewer to client, show the player icon
        if (!wasClientMode && !newViewerMode) {
            console.log('Switching from Viewer to Client - showing player icon');
            if (this.options.setPlayerVisible) {
                this.options.setPlayerVisible(true);
                console.log('Showing player icon for client mode');
            }
        }
        
        // Toggle the mode
        this.options.isViewerMode = newViewerMode;
        
        // Update button text and title
        this._modeToggle.textContent = this.options.isViewerMode ? 'Viewer' : 'Client';
        this._modeToggle.title = this.options.isViewerMode ? 'Click to switch to Client mode' : 'Click to switch to Viewer mode';
        
        // Update UI elements based on new mode
        if (this._nameInput) {
            this._nameInput.disabled = this.options.isViewerMode;
            this._nameInput.title = this.options.isViewerMode ? 'Viewer mode - name editing disabled' : 'Enter player name';
        }
        if (this._centerBtn) {
            this._centerBtn.disabled = this.options.isViewerMode;
            this._centerBtn.title = this.options.isViewerMode ? 'Viewer mode - position editing disabled' : 'Center player on map';
        }
        if (this._randomBtn) {
            this._randomBtn.disabled = this.options.isViewerMode;
            this._randomBtn.title = this.options.isViewerMode ? 'Viewer mode - position editing disabled' : 'Randomize player position';
        }
        
        // Notify parent component about mode change
        if (this.options.onModeChange) {
            this.options.onModeChange(this.options.isViewerMode);
        }
        
        console.log(`Switched to ${this.options.isViewerMode ? 'Viewer' : 'Client'} mode`);
    },

    _onNameChange: function(e) {
        if (this.options.isViewerMode) {
            console.log('Viewer mode: Name changes are disabled');
            return;
        }
        
        if (this.options.setPlayerName) {
            this.options.setPlayerName(e.target.value);
        }
    },

    _onCenterClick: function(e) {
        L.DomEvent.preventDefault(e);
        
        if (this.options.isViewerMode) {
            console.log('Viewer mode: Position changes are disabled');
            return;
        }
        
        if (this.options.mapData?.bounds && this.options.setPlayerPosition) {
            const centerX = (this.options.mapData.bounds[0][1] + this.options.mapData.bounds[1][1]) / 2;
            const centerZ = (this.options.mapData.bounds[0][0] + this.options.mapData.bounds[1][0]) / 2;
            this.options.setPlayerPosition({ x: centerX, z: centerZ, y: 0 });
        }
    },

    _onRandomClick: function(e) {
        L.DomEvent.preventDefault(e);
        
        if (this.options.isViewerMode) {
            console.log('Viewer mode: Position changes are disabled');
            return;
        }
        
        if (this.options.mapData?.bounds && this.options.setPlayerPosition) {
            const minX = Math.min(this.options.mapData.bounds[0][1], this.options.mapData.bounds[1][1]);
            const maxX = Math.max(this.options.mapData.bounds[0][1], this.options.mapData.bounds[1][1]);
            const minZ = Math.min(this.options.mapData.bounds[0][0], this.options.mapData.bounds[1][0]);
            const maxZ = Math.max(this.options.mapData.bounds[0][0], this.options.mapData.bounds[1][0]);
            
            const randomX = minX + Math.random() * (maxX - minX);
            const randomZ = minZ + Math.random() * (maxZ - minZ);
            const randomY = Math.random() * 10 - 5;
            
            this.options.setPlayerPosition({ x: randomX, z: randomZ, y: randomY });
        }
        
        // Also apply random rotation
        if (this.options.setPlayerRotation) {
            const randomRotation = Math.random() * 360;
            this.options.setPlayerRotation(randomRotation);
        }
    },

    updatePlayerData: function(data) {
        if (data.playerPosition !== undefined) {
            this.options.playerPosition = data.playerPosition;
            if (this._positionSpan) {
                this._positionSpan.textContent = `X: ${data.playerPosition.x?.toFixed(1) || 0}, Z: ${data.playerPosition.z?.toFixed(1) || 0}`;
            }
        }
        
        if (data.playerRotation !== undefined) {
            this.options.playerRotation = data.playerRotation;
            if (this._rotationSpan) {
                this._rotationSpan.textContent = `${data.playerRotation.toFixed(1)}°`;
            }
        }
        
        if (data.playerName !== undefined) {
            this.options.playerName = data.playerName;
            if (this._nameInput) {
                this._nameInput.value = data.playerName;
            }
        }
        
        if (data.isConnected !== undefined) {
            this.options.isConnected = data.isConnected;
            if (this._statusSpan) {
                const clientCount = (data.otherPlayersCount || 0) + 1; // +1 for current player
                this._statusSpan.innerHTML = data.isConnected ? ` 🟢 (${clientCount})` : ' 🔴 (0)';
                this._statusSpan.title = data.isConnected ? `Connected - ${clientCount} players` : 'Disconnected';
            }
        }
        
        if (data.otherPlayersCount !== undefined) {
            this.options.otherPlayersCount = data.otherPlayersCount;
            if (this._toggle) {
                this._toggle.setAttribute('data-badge', data.otherPlayersCount > 0 ? data.otherPlayersCount : 'undefined');
            }
        }
        
        if (data.isViewerMode !== undefined) {
            this.options.isViewerMode = data.isViewerMode;
            // Update UI elements based on viewer mode
            if (this._nameInput) {
                this._nameInput.disabled = data.isViewerMode;
                this._nameInput.title = data.isViewerMode ? 'Viewer mode - name editing disabled' : 'Enter player name';
            }
            if (this._centerBtn) {
                this._centerBtn.disabled = data.isViewerMode;
                this._centerBtn.title = data.isViewerMode ? 'Viewer mode - position editing disabled' : 'Center player on map';
            }
            if (this._randomBtn) {
                this._randomBtn.disabled = data.isViewerMode;
                this._randomBtn.title = data.isViewerMode ? 'Viewer mode - position editing disabled' : 'Randomize player position';
            }
        }
    }
});

L.control.playerPosition = function(options) {
    return new L.Control.PlayerPosition(options);
};

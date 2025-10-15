import { configureStore } from '@reduxjs/toolkit';

import { mapsReducer } from './features/maps/index.js';

// Minimal settings reducer for basic functionality
const settingsReducer = (state = { hideRemoteControl: false }, action) => {
    switch (action.type) {
        case 'settings/setHideRemoteControl':
            return { ...state, hideRemoteControl: action.payload };
        default:
            return state;
    }
};

export default configureStore({
    reducer: {
        maps: mapsReducer,
        settings: settingsReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        immutableCheck: false,
        serializableCheck: false,
    }),
});

import { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import equal from 'fast-deep-equal';
import {
    mdiImageFilterCenterFocusStrong,
    mdiCity,
    mdiWarehouse,
    mdiFactory,
    mdiStore24Hour,
    mdiNeedle,
    mdiLighthouse,
    mdiTank,
    mdiBeach,
    mdiPineTree,
    mdiEarthBox,
    mdiTunnelOutline,
} from '@mdi/js';

import doFetchMaps from './do-fetch-maps.mjs';
import { langCode, useLangCode } from '../../modules/lang-helpers.js';
import { placeholderMaps } from '../../modules/placeholder-data.js';
import { windowHasFocus } from '../../modules/window-focus-handler.mjs';

import rawMapData from '../../data/maps.json';

// Map names and descriptions in English
const mapTranslations = {
    'ground-zero': { name: 'Ground Zero', description: 'Ground Zero is a new map introduced in Escape from Tarkov.' },
    'streets-of-tarkov': { name: 'Streets of Tarkov', description: 'Streets of Tarkov is a large urban map with many buildings and streets.' },
    'customs': { name: 'Customs', description: 'Customs is a medium-sized map featuring a customs checkpoint and industrial areas.' },
    'factory': { name: 'Factory', description: 'Factory is a small, intense map perfect for quick raids.' },
    'interchange': { name: 'Interchange', description: 'Interchange is a large shopping mall with multiple floors and stores.' },
    'the-lab': { name: 'The Lab', description: 'The Lab is a high-risk, high-reward underground facility.' },
    'the-labyrinth': { name: 'The Labyrinth', description: 'The Labyrinth is a complex underground maze.' },
    'lighthouse': { name: 'Lighthouse', description: 'Lighthouse is a coastal map with a lighthouse and surrounding areas.' },
    'reserve': { name: 'Reserve', description: 'Reserve is a military base with underground bunkers and surface facilities.' },
    'shoreline': { name: 'Shoreline', description: 'Shoreline is a large map featuring a resort and surrounding areas.' },
    'woods': { name: 'Woods', description: 'Woods is a forested map with scattered buildings and natural cover.' },
    'openworld': { name: 'Openworld', description: 'This is an imagination of what the full map of Tarkov could look like. This open world map would likely include all of the key locations from the existing maps combined in a huge single map.' }
};

const projectionTranslations = {
    '2d': '2D',
    '3d': '3D',
    'interactive': 'Interactive',
    'landscape': 'Landscape'
};

const initialState = {
    data: placeholderMaps(langCode()),
    status: 'idle',
    error: null,
};

export const fetchMaps = createAsyncThunk('maps/fetchMaps', (arg, { getState }) => {
    return doFetchMaps({language: langCode(), gameMode: 'regular'});
});
const mapsSlice = createSlice({
    name: 'maps',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchMaps.pending, (state, action) => {
            state.status = 'loading';
        });
        builder.addCase(fetchMaps.fulfilled, (state, action) => {
            state.status = 'succeeded';

            if (!equal(state.data, action.payload)) {
                state.data = action.payload;
            }
        });
        builder.addCase(fetchMaps.rejected, (state, action) => {
            state.status = 'failed';
            console.log(action.error);
            state.error = action.payload;
        });
    },
});

export const mapsReducer = mapsSlice.reducer;

export const selectMaps = (state) => state.maps.data;

let fetchedLang = false;
let refreshInterval = false;

const clearRefreshInterval = () => {
    clearInterval(refreshInterval);
    refreshInterval = false;
};

export default function useMapsData() {
    const dispatch = useDispatch();
    const { data, status, error } = useSelector((state) => state.maps);
    const lang = useLangCode();
    
    useEffect(() => {
        if (fetchedLang !== lang) {
            fetchedLang = lang;
            dispatch(fetchMaps());
            clearRefreshInterval();
        }
        if (!refreshInterval) {
            refreshInterval = setInterval(() => {
                if (!windowHasFocus) {
                    return;
                }
                dispatch(fetchMaps());
            }, 600000);
        }
        return () => {
            clearRefreshInterval();
        };
    }, [dispatch, lang]);
    
    return { data, status, error };
};

export const useMapImages = () => {
    const { data: maps } = useMapsData();
    let allMaps = useMemo(() => {
        const mapImages = {};
        const apiImageDataMerge = (mapGroup, imageData, apiData) => {
            mapImages[imageData.key] = {
                id: apiData?.id,
                ...imageData,
                name: apiData?.name || mapTranslations[mapGroup.normalizedName]?.name || mapGroup.normalizedName,
                normalizedName: mapGroup.normalizedName,
                primaryPath: mapGroup.primaryPath,
                displayText: apiData?.name || mapTranslations[mapGroup.normalizedName]?.name || mapGroup.normalizedName,
                description: apiData?.description || mapTranslations[mapGroup.normalizedName]?.description || '',
                duration: apiData?.raidDuration ? apiData?.raidDuration + ' min' : undefined,
                players: apiData?.players || mapGroup.players,
                image: `/maps/${imageData.key}.jpg`,
                imageThumb: `/maps/${imageData.key}_thumb.jpg`,
                bosses: apiData?.bosses.map(bossSpawn => {
                    return {
                        name: bossSpawn.name,
                        normalizedName: bossSpawn.normalizedName,
                        spawnChance: bossSpawn.spawnChance,
                        spawnLocations: bossSpawn.spawnLocations,
                    }
                }),
                spawns: apiData?.spawns || [],
                extracts: apiData?.extracts || [],
                transits: apiData?.transits || [],
                locks: apiData?.locks || [],
                hazards: apiData?.hazards || [],
                lootContainers: apiData?.lootContainers || [],
                lootLoose: apiData?.lootLoose ?? [],
                switches: apiData?.switches || [],
                stationaryWeapons: apiData?.stationaryWeapons || [],
                artillery: apiData?.artillery,
            };
            mapImages[imageData.key].displayVariant = projectionTranslations[imageData.projection] || imageData.projection;
            if (imageData.orientation) {
                mapImages[imageData.key].displayVariant += ` - ${imageData.orientation}`;
            }
            if (imageData.specific) {
                mapImages[imageData.key].displayVariant += ` - ${imageData.specific}`;
            }
            if (imageData.extra) {
                mapImages[imageData.key].displayVariant += ` - ${imageData.extra}`;
            }
            mapImages[imageData.key].displayText += ` - ${mapImages[imageData.key].displayVariant}`;

            if (imageData.suppress) {
                mapImages[imageData.key].displayVariant += ` - ${mapImages[imageData.key].name}`;
            }

            if (imageData.altMaps) {
                for (const altKey of imageData.altMaps) {
                    const altApiMap = maps.find(map => map.normalizedName === altKey);
                    if (!altApiMap) {
                        // alt map is missing; so we skip it
                        continue;
                    }
                    apiImageDataMerge(mapGroup, {
                        ...imageData,
                        key: altKey,
                        altMaps: undefined,
                        suppress: true,
                    }, altApiMap);
                }
            }
        };
        for (const mapsGroup of rawMapData) {
            const apiMap = maps.find(map => map.normalizedName === mapsGroup.normalizedName);
            for (const map of mapsGroup.maps) {
                apiImageDataMerge(mapsGroup, map, apiMap);
            }
        }
        return mapImages;
    }, [maps]);
    return allMaps;
};

export const useMapImagesSortedArray = () => {
    let mapArray = Object.values(useMapImages())
    
    mapArray.sort((a, b) => {
        if (a.normalizedName === 'openworld')
            return 1;
        if (b.normalizedName === 'openworld')
            return -1;
        return a.name.localeCompare(b.name);
    });

    return mapArray
}

export const mapIcons = {
    'ground-zero': mdiImageFilterCenterFocusStrong,
    'streets-of-tarkov': mdiCity,
    'customs': mdiWarehouse,
    'factory': mdiFactory,
    'interchange': mdiStore24Hour,
    'the-lab': mdiNeedle,
    'the-labyrinth': mdiTunnelOutline,
    'lighthouse': mdiLighthouse,
    'reserve': mdiTank,
    'shoreline': mdiBeach,
    'woods': mdiPineTree,
    'openworld': mdiEarthBox,
};

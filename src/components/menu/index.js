import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import useStateWithLocalStorage from '../../hooks/useStateWithLocalStorage.jsx';
import { Link } from 'react-router-dom';
import { Icon } from '@mdi/react';
import {
    mdiCogOutline,
    mdiRemote,
    mdiClose,
} from '@mdi/js';

import { Box, Alert, IconButton, Collapse, Badge, LinearProgress } from '@mui/material';

import MenuItem from './MenuItem.jsx';

import { mapIcons, useMapImagesSortedArray } from '../../features/maps/index.js';

import alertConfig from './alert-config.js';

import IntersectionObserverWrapper from './intersection-observer-wrapper.js';

import './index.css';

// automatically selects the alert color
const alertColor = alertConfig.alertColors[alertConfig.alertLevel];

const Menu = () => {
    const [alertsClosed, setAlertsClosed] = useStateWithLocalStorage('alertBannersClosed', []);
    const [alertStateOpen, setAlertStateOpen] = useState(alertConfig.alwaysShow || !alertsClosed.includes(alertConfig.bannerKey));
    const gameMode = useSelector((state) => state.settings?.gameMode || 'regular');
    const loadingData = useSelector((state) => state.settings?.loadingData || false);

    const gameModeTranslated = useMemo(() => {
        const modes = {
            regular: 'PVP',
            pve: 'PVE'
        };
        return modes[gameMode] || gameMode;
    }, [gameMode]);

    const gameModeBadgeColor = useMemo(() => {
        const colors = {
            regular: 'success',
            pve: 'info',
        };
        return colors[gameMode] ?? 'warning';
    }, [gameMode]);

    const uniqueMaps = useMapImagesSortedArray();
    for (const map of uniqueMaps) {
        if (mapIcons[map.normalizedName]) {
            map.icon = mapIcons[map.normalizedName];
        }
        else {
            map.menuPadding = true;
        }
    }

    return (
        <>
            {/* ALERT BANNER SECTION */}
            {alertConfig?.alertEnabled === true && (
                <Box>
                <Collapse in={alertStateOpen}>
                    <Alert
                        severity={alertConfig.alertLevel}
                        variant='filled'
                        sx={{ backgroundColor: `${alertColor} !important`, borderRadius: '0px !important' }}
                        action={
                            <IconButton
                                aria-label="close"
                                color="inherit"
                                size="small"
                                onClick={() => {
                                    if (!alertsClosed.includes(alertConfig.bannerKey)) {
                                        setAlertsClosed([...alertsClosed, alertConfig.bannerKey]);
                                    }
                                    setAlertStateOpen(false);
                                }}
                            >
                                <Icon path={mdiClose} size={0.8} className="icon-with-text" />
                            </IconButton>
                        }
                    >
                        {alertConfig.text}

                        {alertConfig.linkEnabled === true && (
                            <>
                            <span>{' - '}</span>
                            <Link
                                to={alertConfig.link}
                                style={{ color: 'inherit', textDecoration: 'underline' }}
                                target="_blank"
                            >
                                {alertConfig.linkText}
                            </Link>
                            </>

                        )}
                    </Alert>
                </Collapse>
            </Box>
            )}
            {/* END ALERT BANNER SECTION */}
            
        </>
    );
};

export default Menu;
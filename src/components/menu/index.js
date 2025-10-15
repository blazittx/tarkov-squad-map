import { useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import useStateWithLocalStorage from '../../hooks/useStateWithLocalStorage.jsx';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [alertsClosed, setAlertsClosed] = useStateWithLocalStorage('alertBannersClosed', []);
    const [alertStateOpen, setAlertStateOpen] = useState(alertConfig.alwaysShow || !alertsClosed.includes(alertConfig.bannerKey));
    const gameMode = useSelector((state) => state.settings?.gameMode || 'regular');
    const loadingData = useSelector((state) => state.settings?.loadingData || false);

    const otherGameMode = useMemo(() => {
        if (gameMode === 'regular') {
            return 'pve';
        }
        return 'regular';
    }, [gameMode]);

    const gameModeTranslated = useMemo(() => {
        return t(`game_mode_${gameMode}`);
    }, [gameMode, t]);

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
                        {t(alertConfig.text, alertConfig.textVariables)}

                        {alertConfig.linkEnabled === true && (
                            <>
                            <span>{' - '}</span>
                            <Link
                                to={alertConfig.link}
                                style={{ color: 'inherit', textDecoration: 'underline' }}
                                target="_blank"
                            >
                                {t(alertConfig.linkText)}
                            </Link>
                            </>

                        )}
                    </Alert>
                </Collapse>
            </Box>
            )}
            {/* END ALERT BANNER SECTION */}
            <nav key="main-navigation" className="navigation">
                <ul className={`menu`}>
                <IntersectionObserverWrapper>
                    <li key="menu-home" data-targetid="home" className="overflow-member">
                        <Badge badgeContent={loadingData ? <LinearProgress /> : gameModeTranslated} color={gameModeBadgeColor} style={{cursor: 'pointer'}} onClick={() => {
                            // dispatch(setGameMode(otherGameMode));
                        }}>
                            <Link className="branding" to="/" onClick={(e) => {
                                e.stopPropagation();
                            }}>
                            {/* Tarkov.dev */}
                            <img
                                alt="Tarkov.dev"
                                height={30}
                                width={186}
                                src={`${process.env.PUBLIC_URL}/tarkov-dev-logo.svg`}
                                className={'logo-padding'}
                                loading="lazy"
                            />
                            </Link>
                        </Badge>
                    </li>
                    <li className="submenu-wrapper overflow-member"  key="menu-settings" data-targetid="settings">
                        <Link
                            aria-label="Settings"
                            to="/settings/"
                        >
                            <Icon
                                path={mdiCogOutline}
                                size={1}
                                className="icon-with-text"
                            />
                        </Link>
                    </li>
                    <li className="submenu-wrapper overflow-member"  key="menu-remote" data-targetid="remote">
                        <Link
                            aria-label="Remote control"
                            to="/control/"
                        >
                            <Icon path={mdiRemote} size={1} className="icon-with-text" />
                        </Link>
                    </li>
                    <li className="submenu-wrapper submenu-items overflow-member" key="menu-maps" data-targetid="maps">
                        <Link to="/maps/">{t('Maps')}</Link>
                        <ul style={{left: -40}}>
                            {Object.values(uniqueMaps.reduce((unique, map) => {
                                const sameMap = Object.values(unique).find(m => m.id === map.id);
                                if (!sameMap) {
                                    unique[map.id] = map;
                                    return unique;
                                }
                                if (map.projection === 'interactive') {
                                    unique[map.id] = map;
                                }
                                return unique;
                            }, {})).map((map) => (
                                <MenuItem
                                    displayText={map.name}
                                    key={`menu-item-${map.key}`}
                                    to={`/map/${map.key}`}
                                    icon={map.icon}
                                    padding={map.menuPadding}
                                />
                            ))}
                            <MenuItem
                                className="overflow-hidden"
                                displayText={`${t('More')}...`}
                                key={'menu-item-maps-more'}
                                to={'/maps'}
                            />
                        </ul>
                    </li>
                    <li className="submenu-wrapper submenu-items overflow-member" key="menu-api" data-targetid="api">
                        <Link
                            to="/api/"
                        >
                            {t('API')}
                        </Link>
                    </li>
                </IntersectionObserverWrapper>
                </ul>
            </nav>
        </>
    );
};

export default Menu;
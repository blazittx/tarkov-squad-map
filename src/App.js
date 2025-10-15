/* eslint-disable no-restricted-globals */
import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useSelector } from 'react-redux';
import CookieConsent from "react-cookie-consent";
import { ErrorBoundary } from "react-error-boundary";
import { ThemeProvider } from '@mui/material/styles';

import './App.css';
import theme from './modules/mui-theme.mjs';

import loadPolyfills from './modules/polyfills.js';

import RemoteControlId from './components/remote-control-id/index.jsx';
import useStateWithLocalStorage from './hooks/useStateWithLocalStorage.jsx';
import makeID from './modules/make-id.js';
import WindowFocusHandler from './modules/window-focus-handler.mjs';

import Loading from './components/loading/index.js';

import Menu from './components/menu/index.js';
import Footer from './components/footer/index.js';

const Map = React.lazy(() => import('./pages/map/index.js'));
const ErrorPage = React.lazy(() => import('./pages/error-page/index.js'));

const Maps = React.lazy(() => import('./pages/maps//index.js'));

loadPolyfills();

function Fallback({ error, resetErrorBoundary }) {
    return (
        <div className="display-wrapper" style={{minHeight: "40vh"}} key="fallback-wrapper">
            <h1 className="center-title">
                Something went wrong.
            </h1>
            <div className="page-wrapper" style={{minHeight: "40vh"}}>
                <details style={{ whiteSpace: 'pre-wrap' }}>
                    <pre style={{ color: "red" }}>{error.message}</pre>
                    <pre>{error.stack}</pre>
                    You can <button style={{ padding: '.2rem', borderRadius: '4px' }} onClick={resetErrorBoundary}>try again</button> or report the issue by
                    joining our <a href="https://discord.gg/WwTvNe356u" target="_blank" rel="noopener noreferrer">Discord</a> server and 
                    copy/paste the above error and some details in <a href="https://discord.com/channels/956236955815907388/956239773742288896" target="_blank" rel="noopener noreferrer">#🐞bugs-issues</a> channel.
                </details>
            </div>
        </div>
    );
}

function App() {
    const connectToId = new URLSearchParams(window.location.search).get(
        'connection',
    );
    if (connectToId) {
        localStorage.setItem('sessionId', JSON.stringify(connectToId));
    }
    const [sessionID] = useStateWithLocalStorage('sessionId', makeID(4));

    const hideRemoteControlId = useSelector(
        (state) => state.settings?.hideRemoteControl || false,
    );
    const remoteControlSessionElement = hideRemoteControlId ? null : (
        <Suspense fallback={<Loading />} key="suspense-connection-wrapper">
            <RemoteControlId
                key="connection-wrapper"
                sessionID={sessionID}
                socketEnabled={false}
                onClick={(e) => {}}
            />
        </Suspense>
    );
    return (
        <ThemeProvider theme={theme}>
        <div className="App">
            <Helmet htmlAttributes={{ lang: 'en' }}>
                <meta property="og:locale" content="en" key="meta-locale" />
            </Helmet>
            <Menu />
            <CookieConsent buttonText="I understand">
                This website uses cookies to ensure you get the best experience on our website.
            </CookieConsent>
            <WindowFocusHandler />
            <ErrorBoundary FallbackComponent={Fallback}>
                <Routes>
                    <Route
                        path={'/'}
                        key="maps-route"
                        element={[
                            <Suspense fallback={<Loading />} key="suspense-maps-wrapper">
                                <Maps key="maps-wrapper" />
                            </Suspense>,
                            remoteControlSessionElement,
                        ]}
                    />
                    <Route
                        path={'/maps/'}
                        key="maps-route-alt"
                        element={[
                            <Suspense fallback={<Loading />} key="suspense-maps-wrapper">
                                <Maps key="maps-wrapper" />
                            </Suspense>,
                            remoteControlSessionElement,
                        ]}
                    />
                    <Route
                        path={'/map/:currentMap'}
                        key="map-current-route"
                        element={[
                            <Suspense fallback={<Loading />} key="suspense-map-wrapper">
                                <Map key="map-wrapper" />
                            </Suspense>,
                            remoteControlSessionElement,
                        ]}
                    />
                    <Route
                        path="*"
                        element={[
                            <Suspense fallback={<Loading />} key="suspense-errorpage-wrapper">
                                <ErrorPage />
                            </Suspense>,
                            remoteControlSessionElement,
                        ]}
                    />
                </Routes>
            </ErrorBoundary>
            <Footer />
        </div>
        </ThemeProvider>
    );
}

export default App;

import { useState, useCallback } from 'react';
import { Badge } from '@mui/material';

import './index.css';

const Sides = {
    Left: 'Left',
    Right: 'Right',
};

function ID(props) {
    const [side, setSide] = useState(Sides.Left);
    const [copied, setCopied] = useState(false);

    const sessionText = props.socketEnabled
        ? props.sessionID
        : 'Click to connect';

    const handleCopyClick = async () => {
        if (!props.socketEnabled) return;

        try {
            await navigator.clipboard.writeText(props.sessionID);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Copy failed', err);
        }
    };

    let sideClass;
    let sideButtonContent;
    let otherSide;
    if (side === Sides.Left) {
        sideClass = 'id-wrapper-left';
        sideButtonContent = '>>';
        otherSide = Sides.Right;
    } else {
        sideClass = 'id-wrapper-right';
        sideButtonContent = '<<';
        otherSide = Sides.Left;
    }

    const handleSwitchSideClick = useCallback(() => {
        setSide(otherSide);
    }, [setSide, otherSide]);

    return (
        <div
            className={`id-wrapper ${sideClass}`}
            alt="open this page in another browser or window and connect using this id"
            title="open this page in another browser or window and connect using this id"
            onClick={props.onClick}
        >
            <div className="update-label">
                ID for remote control
                <span className="session-question">
                    <span>?</span>
                    <div className="session-popup">
                        Go to Tarkov.dev with another browser and enter this ID to control this page from there
                    </div>
                </span>
                <button
                    className="session-switch-side"
                    onClick={handleSwitchSideClick}
                >
                    {sideButtonContent}
                </button>
            </div>

            <div className="session-id-container">
                <Badge
                    badgeContent={copied ? 'Copied!' : 0}
                    color="success"
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                >
                    <span className="session-id" onClick={handleCopyClick} style={{cursor: 'pointer'}} >{sessionText}</span>
                </Badge>
            </div>
        </div>
    );
}

export default ID;

import { Link } from 'react-router-dom';

import { ReactComponent as GithubIcon } from '../../images/Github.svg';
import { ReactComponent as DiscordIcon } from '../../images/Discord.svg';
import { ReactComponent as XIcon } from '../../images/X.svg';

import './index.css';

import rawVersion from '../../data/version.json';

const version = rawVersion.version.slice(0, 7);

function Footer() {
    return (
        <div className={'footer-wrapper'}>
            <div className="footer-section-wrapper about-section-wrapper">
                <h3>Tarkov.dev</h3>
                <p>
                    The whole platform is open source and focused around developers. All code is available on <a href="https://github.com/the-hideout/tarkov-dev" target="_blank" rel="noopener noreferrer"><GithubIcon /> GitHub</a>.
                </p>
                <p>
                    If you wanna have a chat, ask questions or request features, we have a <a href="https://discord.gg/WwTvNe356u" target="_blank" rel="noopener noreferrer"><DiscordIcon /> Discord</a> server.
                </p>
                <p>
                    Follow us on <a href="https://x.com/tarkov_dev" target="_blank" rel="noopener noreferrer"><XIcon /> X</a> for all the latest updates.
                </p>
                <p>
                    <Link to="/about">About tarkov.dev</Link>
                </p>
                <h3>Contributors</h3>
                <p>Massive thanks to all the people who help build and maintain this project!</p>
                <p>Made with ❤️ by the community</p>
            </div>
            <div className="footer-section-wrapper">
                <h3>Supporters</h3>
                <p>
                    We encourage everyone who can to donate to support the people of Ukraine.
                </p>
                <p>
                    If you'd also like to support this project, you can make a donation and/or become a backer on <a href="https://opencollective.com/tarkov-dev" target="_blank" rel="noopener noreferrer">Open Collective</a>.
                </p>
                <h3>Item Data</h3>
                <p>
                    Fresh EFT data courtesy of{' '}
                    <a href="https://tarkov-changes.com" target="_blank" rel="noopener noreferrer">
                        <span>Tarkov-Changes</span>
                    </a>
                </p>
                <p>
                    Additional data courtesy of{' '}
                    <a href="https://www.sp-tarkov.com/" target="_blank" rel="noopener noreferrer">
                        <span>SPT</span>
                    </a>
                </p>
                <h3>Map Icons</h3>
                <p>
                    Map marker icons by{' '}
                    <a href="https://escapefromtarkov.fandom.com/wiki/Escape_from_Tarkov_Wiki" target="_blank" rel="noopener noreferrer">
                        <span>The Official Escape From Tarkov Wiki</span>
                    </a>
                </p>
            </div>
            <div className="footer-section-wrapper">
                <h3>Resources</h3>
                <p>
                    <Link to={'/api/'}>
                        Tarkov.dev API
                    </Link>
                </p>
                <p>
                    <a href="https://github.com/the-hideout/TarkovMonitor" target="_blank" rel="noopener noreferrer">
                        Tarkov Monitor
                    </a>
                </p>
                <p>
                    <Link to={'/moobot'}>
                        Moobot integration
                    </Link>
                </p>
                <p>
                    <Link to={'/nightbot/'}>
                        Nightbot integration
                    </Link>
                </p>
                <p>
                    <Link to={'/streamelements/'}>
                        StreamElements integration
                    </Link>
                </p>
                <p>
                    <a href={'https://discord.com/api/oauth2/authorize?client_id=955521336904667227&permissions=309237664832&scope=bot%20applications.commands'}>
                        Discord bot for your Discord
                    </a>
                </p>
                <h3>External resources</h3>
                <p>
                    <a href="https://tarkovtracker.io/" target="_blank" rel="noopener noreferrer">
                        TarkovTracker.io
                    </a>
                </p>
                <p>
                    <a href="https://github.com/RatScanner/RatScanner" target="_blank" rel="noopener noreferrer">
                        RatScanner
                    </a>
                </p>
                <p>
                    <iframe className='discord' title="discord-iframe" src="https://discord.com/widget?id=956236955815907388&theme=dark" loading="lazy" allowtransparency="true" frameBorder="0" sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"></iframe>
                </p>
            </div>
            <div className="copyright-wrapper">
                Tarkov.dev is a fork of the now shut-down tarkov-tools.com | Big thanks to kokarn for all his work building Tarkov Tools and the community around it.
            </div>
            <div className="copyright-wrapper">
                Game content and materials are trademarks and copyrights of Battlestate Games and its licensors. All rights reserved.
            </div>
            <div className="copyright-wrapper">
                version {': '}
                <a href="https://github.com/the-hideout/tarkov-dev/commits/main" target="_blank" rel="noopener noreferrer">{version}</a>
            </div>
        </div>
    );
}

export default Footer;

import SEO from '../../components/SEO.jsx';

import './index.css';

function ErrorPage(props) {
    return [
        <SEO 
            title="Page not found - Escape from Tarkov - Tarkov.dev"
            description="This is not the page you are looking for"
            key="seo-wrapper"
        />,
        <div className="page-wrapper error-page" key={'display-wrapper'}>
            <h1>Sorry, that page doesn't exist!</h1>
            <p>Please check the URL or go back to the <a href="/">homepage</a>.</p>
        </div>,
    ];
}

export default ErrorPage;

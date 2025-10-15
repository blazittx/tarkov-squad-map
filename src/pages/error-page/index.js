import { useTranslation } from 'react-i18next';

import SEO from '../../components/SEO.jsx';

import './index.css';

function ErrorPage(props) {
    const { t } = useTranslation();
    return [
        <SEO 
            title={`${t('Page not found')} - ${t('Escape from Tarkov')} - ${t('Tarkov.dev')}`}
            description={t('error-page-description', 'This is not the page you are looking for')}
            key="seo-wrapper"
        />,
        <div className="page-wrapper error-page" key={'display-wrapper'}>
            <h1>{t("Sorry, that page doesn't exist!")}</h1>
            <p>{t('Please check the URL or go back to the')} <a href="/">{t('homepage')}</a>.</p>
        </div>,
    ];
}

export default ErrorPage;

import { writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

import maps from "../src/data/maps.json" with { type: "json" };

const standardPathsWeekly = [
    '/about',
    '/api',
    '/api-users',
    '/control',
    '/maps',
    '/moobot',
    '/nightbot',
    '/settings',
    '/streamelements',
];

const languages = [
    "de",
    "en",
    "fr",
    "it",
    "ja",
    "pl",
    "pt",
    "ru"
]

const addPath = (sitemap, url, change = 'hourly') => {
    for (const lang in languages) {
        sitemap = `${sitemap}
    <url>`;
    
        if (Object.hasOwnProperty.call(languages, lang)) {
            const loclang = languages[lang];

            if (loclang === 'en') {
                sitemap = `${sitemap}
        <loc>https://tarkov.dev${url}</loc>`;
            }
            else {
                sitemap = `${sitemap}
        <loc>https://tarkov.dev${url}?lng=${loclang}</loc>`;
            }

            for (const lang in languages) {
                if (Object.hasOwnProperty.call(languages, lang)) {
                    const hreflang = languages[lang];

                    if (hreflang === 'en') {
                        sitemap = `${sitemap}
            <xhtml:link rel="alternate" hreflang="${hreflang}" href="https://tarkov.dev${url}"/>`;
                    }
                    else {
                        sitemap = `${sitemap}
            <xhtml:link rel="alternate" hreflang="${hreflang}" href="https://tarkov.dev${url}?lng=${hreflang}"/>`;
                    }
                }
            }
        }

        sitemap = `${sitemap}
        <changefreq>${change}</changefreq>
    </url>`;
    }

    return sitemap;
};

async function build_sitemap() {
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">`;

    for (const path of standardPathsWeekly) {
        sitemap = addPath(sitemap, path, 'weekly');
    }

    for (const mapsGroup of maps) {
        for (const map of mapsGroup.maps) {
            sitemap = addPath(sitemap, `/map/${map.key}`, 'weekly');
        }
    }

    sitemap = `${sitemap}
</urlset>`;

    const __dirname = fileURLToPath(new URL(".", import.meta.url));
    writeFileSync(path.join(__dirname, '..', 'public', 'sitemap.xml'), sitemap);
}

async function build_sitemap_index() {
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <sitemap>
        <loc>https://tarkov.dev/sitemap.xml</loc>
    </sitemap>
</sitemapindex>`;

    const __dirname = fileURLToPath(new URL(".", import.meta.url));
    writeFileSync(path.join(__dirname, '..', 'public', 'sitemap_index.xml'), sitemap);
}

(async () => {
    try {
        console.time('build-sitemap');

        await build_sitemap();

        await build_sitemap_index();
        
        console.timeEnd('build-sitemap');
    }
    catch (error) {
        console.error(error);
        console.log('trying to use pre-built sitemap (offline mode?)');
    }
})();

import fs from 'fs';

import doFetchMaps from '../src/features/maps/do-fetch-maps.mjs';
import graphqlRequest from '../src/modules/graphql-request.mjs';

async function getLanguageCodes() {
    const query = `{
        __type(name: "LanguageCode") {
            enumValues {
                name
            }
        }
    }`;
    return graphqlRequest(query).then(response => response.data.__type.enumValues.map(lang => {
        return lang.name;
    }));
}

const getMapNames = async (langs) => {
    const queries = langs.map(language => {
        return `${language}: maps(lang: ${language}) {
            id
            name
            description
        }`;
    });
    const query = `{
        ${queries.join('\n')}
    }`;
    return graphqlRequest(query).then(response => response.data);
};

console.time('Caching API data');
try {
    const allLangs = await getLanguageCodes();
    fs.writeFileSync('./src/data/supported-languages.json', JSON.stringify(allLangs, null, 4));
    const langs = allLangs.filter(lang => lang !== 'en');

    // Only handle maps data
    await doFetchMaps({prebuild: true}).then(maps => {
        maps = maps.map(map => {
            return {
                ...map,
                extracts: [],
                hazards: [],
                locks: [],
                lootContainers: [],
                lootLoose: [],
                spawns: [],
                switches: [],
                transits: [],
            };
        });
        fs.writeFileSync('./src/data/maps_cached.json', JSON.stringify(maps));

        return getMapNames(langs).then(mapResults => {
            const mapLangs = {};
            for (const lang in mapResults) {
                const localization = {};
                mapResults[lang].forEach(map => {
                    localization[map.id] = {
                        name: map.name,
                        description: map.description,
                    };
                });
                mapLangs[lang] = localization;
            }
            fs.writeFileSync(`./src/data/maps_locale.json`, JSON.stringify(mapLangs));
        });
    });
}
catch (error) {
    if (process.env.CI) {
        throw error;
    }
    else {
        console.log(error);
        console.log("attempting to use pre-cached values (offline mode?)");
    }
}
console.timeEnd('Caching API data');

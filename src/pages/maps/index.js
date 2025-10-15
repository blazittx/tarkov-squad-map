import { Link } from 'react-router-dom';

import { Icon } from '@mdi/react';
import { mdiMap } from '@mdi/js';

import SEO from '../../components/SEO.jsx';

import { mapIcons, useMapImagesSortedArray } from '../../features/maps/index.js';

import './index.css';
import { HashLink } from 'react-router-hash-link';

function Maps() {
    const mapImagesSortedArray = useMapImagesSortedArray();
    const uniqueMaps = mapImagesSortedArray.reduce((maps, current) => {
        if (!maps.some(storedMap => storedMap.normalizedName === current.normalizedName)) {
            maps.push({
                name: current.name,
                normalizedName: current.normalizedName,
                description: current.description,
            });
        }
        return maps;
    }, []);
    return [
        <SEO 
            title="Maps - Escape from Tarkov - Tarkov.dev"
            description="Get the latest information on all maps in Escape from Tarkov, including extract points and loot locations. Find out where to find the best gear and resources in the game"
            key="seo-wrapper"
        />,
        <div className={'page-wrapper'} key="map-page-wrapper">
            <h1 className="center-title">
                Escape from Tarkov 
                <Icon path={mdiMap} size={1.5} className="icon-with-text" /> 
                Maps
            </h1>
            <div className="page-wrapper map-page-wrapper">
                <p>
                    There are 11 different locations on the Escape from Tarkov map, of which 10 have been released publicly so far.
                    Although eventually all maps will be connected, they are currently all apart from one another.
                </p>

                <nav className="nav-maps">
                  {uniqueMaps.map((map) => (
                      <div className="item" key={`map-link-${map.normalizedName}`}>
                            <HashLink to={`/maps#${map.normalizedName}`}>
                                <span className="icon">
                                  <Icon 
                                      path={mapIcons[map.normalizedName]} 
                                      size={1}
                                      className="icon-with-text"
                                  />
                                </span>
                                {map.name}
                            </HashLink>
                      </div>
                    ))}
                </nav>
            </div>

            {uniqueMaps.map((mapsGroup) => {
                return (
                    <div key={mapsGroup.normalizedName} id={mapsGroup.normalizedName} className="information-section map-block">
                        <h2>
                            <span className="icon">
                              <Icon 
                                path={mapIcons[mapsGroup.normalizedName]} 
                                size={1}
                                className="icon-with-text"
                              />
                            </span>
                            {mapsGroup.name}
                        </h2>
                        <div className="page-wrapper map-page-wrapper">
                            {mapsGroup.description}
                        </div>
                        <div className="maps-wrapper">
                        {mapImagesSortedArray
                        .filter(map => map.normalizedName === mapsGroup.normalizedName)
                        .map((map) => {
                            const { displayText, displayVariant, key, imageThumb } = map;
                            let mapImageLink = `${process.env.PUBLIC_URL}${imageThumb}`;
                            if (map.projection === 'interactive') {
                                let path = map.svgPath || map.tilePath || `https://assets.tarkov.dev/maps/${map.normalizedName}/{z}/{x}/{y}.png`;
                                mapImageLink = path.replace(/{[xyz]}/g, '0');
                            }
                            return (
                                <div className="map-wrapper" key={`map-wrapper-${key}`}>
                                    <Link to={`/map/${key}`}>
                                        <img
                                            alt={`Map of ${displayText}`}
                                            className="map-image"
                                            loading="lazy"
                                            title={`Map of ${displayText}`}
                                            src={mapImageLink}
                                        />
                                        <h3>{displayVariant}</h3>
                                    </Link>
                                </div>
                            );
                        })}
                        </div>
                    </div>
                );
            })}
        </div>,
    ];
}

export default Maps;

let prefix = '/apis/mapleaflet';

export default {
    'osm':          {'org': 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                        'proxy': `${prefix}/osm/{z}/{x}/{y}`
                    },
    'osmCycle':     {'org': 'https://b.tile.thunderforest.com/cycle/{z}/{x}/{y}.png',
                        'proxy': `${prefix}/osmCycle/{z}/{x}/{y}`
                    },
    'osmCyclosm':     {'org': 'https://a.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png',
                        'proxy': `${prefix}/osmCyclosm/{z}/{x}/{y}`
                    },
    'osmDarkAll':   {'org': 'https://4.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
                        'proxy': `${prefix}/osmDarkAll/{z}/{x}/{y}`
                    },
    'sateliteEsri':
                   {'org': 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                        'proxy': `${prefix}/sateliteEsri/{z}/{x}/{y}`
                    },
};
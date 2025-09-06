# viteyss-site-mapleaflet

Web map supportted by `leafletjs`. 


### dependency

- **imgkap** [link ...](https://github.com/nohal/imgkap)
In core when it handle kap files it use ***imgkap** software to split kap to mheader and png. Look file `kapHelp.js` and `pathToKmgKapSplit` change it to your path.


### can do

- as vue / old style module
- can be as split / multiple one one site
- options on init
- basic map minimum clutter
- baseMaps from [OpenStreetMap](http://www.openstreetmap.org/copyright)
- proxy for tiles. So one time view online is accessable later as **offline**. For hosts tailing services, configs in `onlineMaps.js`
- look for **chart's files** ***.kap**, ***.kml** in local directories. Definition where to look for file now is in `api_mapleaflet.js` `mapioFolders` array. Add them as overlay.
    - charts can be filterd
    - force to show / hide
    - as png, svg with alpha channel
- loads gpx, kml, ... **files to traks** on client site powerd by [leaflet.filelayer.js](https://github.com/makinacorpus/Leaflet.FileLayer)
- process data to geo json powered by [togeojson.js](https://github.com/mapbox/togeojson)
- maps engine by [leaflet.js](https://leafletjs.com)
- [vue.js](https://vuejs.org/) for gui widget's


### options on init

Example will be init of main `mapioMapio.vue` to `div`

```js
    this.mioApp = createApp( MapioMapio,  
    {'mapname':"mio",  // < -- name must be `id` name skeam ok
        'mapOpts':{'abc':1,
            'zoomControl': false,
            'center': [9.2620320938,-79.9355079], 'zoom':12
        },
        'fileLoad': false, 'homeUrl': this.homeUrl,  
        'addlfBaseMaps': true} ).mount('#lfmapio');

        // `#lfmapio` - div where it will land 
        //              it need to provide correct style of div element
```

### ideas
- [ ] fullscreen button
- [ ] mesure distance / bearing
- [ ] tracks
    - [ ] load from directory
    - [ ] show / hide manager
    - [ ] build track?
- [ ] weakLock option
- [ ] split screen option
    - [ ] mirror location
- [ ] overlay for gui as
    - [ ] svg
    - [ ] html


### screenshot

![](./examples/screen_25090610.png)

First draft `25090610`

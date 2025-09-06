# viteyss-site-mapleaflet

Web map supportted by `leafletjs`. 


### screenshot

![](./examples/screen_25090610.png)

First draft `25090610`


### what can do

- as vue / old style module
- can be as split / multiple one one site
- options on init
- basic map minimum clutter
- baseMaps from [OpenStreetMap](http://www.openstreetmap.org/copyright)
- fullscreen button
- proxy for tiles. So one time view online is accessable later as **offline**. For hosts tailing services, configs in `onlineMaps.js`
- chart's files *.kap, **.kml (as raster and vector *.svg) in local directories
    - charts can be filterd
    - force to show / hide
    - as png, svg with alpha channel
- loads gpx, kml, ... **files to traks** on client site
- process data to geo json
- gui widget's with options. Look section options `on init`


### dependency

- **imgkap** [link ...](https://github.com/nohal/imgkap)
In core when it handle kap files it use ***imgkap** software to split kap to mheader and png. Look file `kapHelp.js` and `pathToKmgKapSplit` change it to your path.


### used libraries

Libraries are comming prefetchd. So are comming with viteyss-site-mapleatlet. Cas be found in `./assets` directory.

[leaflet.fullscreen](https://github.com/brunob/leaflet.fullscreen) | [leaflet.filelayer.js](https://github.com/makinacorpus/Leaflet.FileLayer) | [togeojson.js](https://github.com/mapbox/togeojson) | [leaflet.js](https://leafletjs.com) | [vue.js](https://vuejs.org/)


### charts local file system

Definition where it looks for file now is in `api_mapleaflet.js` `mapioFolders` array. Add them as overlay.
Can do: *.kap, *.kml, *.svg


![](./examples/screen_mapio_filtering_chart_files.png)

**Filtering** by source as directory where it was found.
**Forcing** show / hide by clicking on map item
**Borders** to show posible chart
**shows / hides** automaticaly chart base on `%` of area it takes on screen


### tracks local file system

* can load file from client as overlay.
* TODO look for local files and present them with manager


### options on init - xdoc

Example will be init of main `mapioMapio.vue` to `div`

```js
    this.mioApp = createApp( MapioMapio,  
    {'mapname':"mio",  // < -- name must be `id` name skeam ok
        'mapOpts':{'abc':1,
            'zoomControl': false,
            'center': [9.2620320938,-79.9355079], 'zoom':12
        },
        'addFullScreenBt': true,
        'fileLoad': false, 'homeUrl': this.homeUrl,  
        'addlfBaseMaps': true} ).mount('#lfmapio');

        // `#lfmapio` - div where it will land 
        //              it need to provide correct style of div element
```



### ideas

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



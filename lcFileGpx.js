
function lcFileGpxLoad( map, control ){

    let contfl = L.Control.fileLayerLoad({
        // Allows you to use a customized version of L.geoJson.
        // For example if you are using the Proj4Leaflet leaflet plugin,
        // you can pass L.Proj.geoJson and load the files into the
        // L.Proj.GeoJson instead of the L.geoJson.
        layer: L.geoJson,
        // See http://leafletjs.com/reference.html#geojson-options
        layerOptions: {style: {color:'red'}},
        // Add to map after loading (default: true) ?
        addToMap: true,
        // File size limit in kb (default: 1024) ?
        fileSizeLimit: 1024,
        // Restrict accepted file formats (default: .geojson, .json, .kml, and .gpx) ?
        formats: [
            '.geojson',
            '.kml',
            '.gpx'
        ]
    }).addTo(map);

    contfl.loader.on('data:loaded', function (event) {
        // event.layer gives you access to the layers you just uploaded!
        // Add to map layer switcher
        //map.addOverlay
        //console.log('event',event, '\n\nfile:',event.filename);
        //event.layer.removeFrom( map );
        control.addOverlay(
            //L.layerGroup({"customID":Math.random()}), 
            event.layer,
            `trak - ${event.filename}`
            );
        //event.layer.addTo( map );
        
    });

    contfl.loader.on('data:error', function (error) {
        // Do something usefull with the error!
        console.error('ojj',error);
    });

    return contfl;
}

export{ lcFileGpxLoad }
import onlineMaps from "./onlineMaps"

let lfBaseBapsAttribution = [];

let lfBaseMaps = function(map){

    let lftileLayer_osm = L.tileLayer(onlineMaps['osm']['proxy'], {
        maxZoom: 19,
    });//.addTo(this.lfmap);
    lfBaseBapsAttribution.push('&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>');

    var lftileLayer_cycle = L.tileLayer(onlineMaps['osmCycle']['proxy'], {
        maxZoom: 19,
    });//.addTo(this.lfmap);
    lfBaseBapsAttribution.push('© OpenStreetMap contributors. Tiles courtesy of Andy Allan. Website and API terms');
      
    var lftileLayer_cyclOSM = L.tileLayer(onlineMaps['osmCyclosm']['proxy'], {
        maxZoom: 19,
    }).addTo( map );
    lfBaseBapsAttribution.push('© OpenStreetMap contributors. Tiles style by CyclOSM hosted by OpenStreetMap France. Website and API terms');
      
    var osmHOT = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        maxZoom: 19,
    });
    lfBaseBapsAttribution.push('© OpenStreetMap contributors, Tiles style by Humanitarian OpenStreetMap Team hosted by OpenStreetMap France');
    
    var arcgis = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 18,
    });
    lfBaseBapsAttribution.push('© Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community');
    

    let lftileLayer_workDark = L.tileLayer(onlineMaps['osmDarkAll']['proxy'], {
        maxZoom: 19,
    });//.addTo(this.lfmap);
    lfBaseBapsAttribution.push('&copy; basemaps.cartocdn.com/dark_all');
      
      
    var baseMaps = {
    "OpenStreetMap": lftileLayer_osm,
    "OpenStreetMap,CyclOSM": lftileLayer_cyclOSM,
    "OpenStreetMap,Cycle": lftileLayer_cycle,
    "OpenStreetMap.dark": lftileLayer_workDark,
    "OpenStreetMap.HOT": osmHOT,
    'satelites - Esri':arcgis
    };

    return baseMaps;


}

export { lfBaseMaps, lfBaseBapsAttribution }
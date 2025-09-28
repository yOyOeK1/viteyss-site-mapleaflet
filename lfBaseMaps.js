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
      
    let lftileLayer_workDark = L.tileLayer(onlineMaps['osmDarkAll']['proxy'], {
        maxZoom: 19,
    });//.addTo(this.lfmap);
    lfBaseBapsAttribution.push('&copy; basemaps.cartocdn.com/dark_all');
      
      
    var baseMaps = {
    "OpenStreetMap": lftileLayer_osm,
    "OpenStreetMap,CyclOSM": lftileLayer_cyclOSM,
    "OpenStreetMap,Cycle": lftileLayer_cycle,
    "OpenStreetMap.dark": lftileLayer_workDark,
    "OpenStreetMap.HOT": osmHOT
    };

    return baseMaps;


}

export { lfBaseMaps, lfBaseBapsAttribution }
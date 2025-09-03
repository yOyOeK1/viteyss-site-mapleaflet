import onlineMaps from "./onlineMaps"



let lfBaseMaps = function(map){

    let lftileLayer_osm = L.tileLayer(onlineMaps['osm']['proxy'], {
        maxZoom: 19,
        //attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });//.addTo(this.lfmap);

    var lftileLayer_cycle = L.tileLayer(onlineMaps['osmCycle']['proxy'], {
        maxZoom: 19,
        //attribution: '© OpenStreetMap contributors. Tiles courtesy of Andy Allan. Website and API terms'
    });//.addTo(this.lfmap);
      
    var lftileLayer_cyclOSM = L.tileLayer(onlineMaps['osmCyclosm']['proxy'], {
        maxZoom: 19,
        //attribution: '© OpenStreetMap contributors. Tiles style by CyclOSM hosted by OpenStreetMap France. Website and API terms'
    }).addTo( map );
      
    var osmHOT = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        maxZoom: 19,
        //attribution: '© OpenStreetMap contributors, Tiles style by Humanitarian OpenStreetMap Team hosted by OpenStreetMap France'
    });
      
    let lftileLayer_workDark = L.tileLayer(onlineMaps['osmDarkAll']['proxy'], {
        maxZoom: 19,
        //attribution: '&copy; basemaps.cartocdn.com/dark_all'
    });//.addTo(this.lfmap);
      
      
    var baseMaps = {
    "OpenStreetMap": lftileLayer_osm,
    "OpenStreetMap,CyclOSM": lftileLayer_cyclOSM,
    "OpenStreetMap,Cycle": lftileLayer_cycle,
    "OpenStreetMap.dark": lftileLayer_workDark,
    "OpenStreetMap.HOT": osmHOT
    };

    return baseMaps;


}

export { lfBaseMaps }
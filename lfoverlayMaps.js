let lfOverLayMaps = function( map, thomeUrl ){
    
    let lftileLayer_work = L.tileLayer(`${thomeUrl}workTiles/{z}/{x}/{y}.png`, {
        maxZoom: 18,
        minZoom: 15,
        maxNativeZoom: 17,
        minNativeZoom: 17,
        opacity:0.5,
        attribution: '&copy; EB -panamaTODO'
      });//.addTo(this.lfmap);


      let lftileLayer_workBing = L.tileLayer(`${thomeUrl}workTilesBing/{z}/{x}/{y}.jpg.tile`, {
        maxZoom: 18,
        minZoom: 15,
        maxNativeZoom: 15,
        minNativeZoom: 17,
        opacity:0.5,
        attribution: '&copy; BingTODO'
      });//.addTo(this.lfmap);
      
      var overlayMaps = {
        //"EB - panama": lftileLayer_work,
        //"bing": lftileLayer_workBing,
      };

      return overlayMaps;
}

export { lfOverLayMaps }
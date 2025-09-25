



function resizeLayers( map, geoLayer ){
    var currentZoom = map.getZoom();
    let pixBound = map.getPixelBounds();
    let llBound = map.getBounds();
    
    let viewH = pixBound['max'].distanceTo( pixBound['min'] );
    let viewDist = llBound['_northEast'].distanceTo( llBound['_southWest'] );
    
    
    geoLayer.eachLayer(function(layer) {
        if( false && layer.feature.id == 139507 ){
            
            console.log('point id 139507', layer );
            
            return layer.setRadius(50);
        }else{
            let d = layer.feature.properties.depth/1.00;
            let nR = mMapVal( d, 0, viewDist, 0, viewH );
            if( d < 2.9 ){ // draft to red 
                nR = 10.0;
                return layer.setStyle( {fillColor:'red'} );
            }else if( nR < 5.0 )
                nR = 10.0;
            
            //return layer.setRadius( parseInt(nR) );
        }
    });
}


function setOn_fixOnZoom( map, geoLayer ){
    map.on('zoomend', function() {
        resizeLayers( map, geoLayer );        
    });
    // load geojson end 
    
}



function getLgeoJSON( map, dataG, cells = [3,3], cellSize = 50  ){
    let lTr = L.geoJSON([dataG], {
        style(feature) {
            return feature.properties && feature.properties.style;
        },
        
        onEachFeature(feature, layer){
            let popupContent = '';
            let pro = feature.properties;
            //console.log('getLgeoJSON / eachFuture '+feature);
            if (feature.properties && feature.id) {
                popupContent = `Death: ${pro.depth} meters.<br>Id: ${feature.id}`;
            }
           
            layer.bindPopup(popupContent);

            if( (feature.xy[0]%6)== 0  && (feature.xy[1]%6)== 0  ){
                layer.bindTooltip(`${pro.depth}`, {
                    permanent: true,
                    direction: 'bottom'
                }).openTooltip(); 
            }
        },

        
        pointToLayer(feature, latlng) {
            //console.log('latlong fly:',latlng,'feature',feature);
            let mapPixBou = map.getPixelBounds();
            let viewW = mapPixBou['max']['x']-mapPixBou['min']['x'];
            let viewH = mapPixBou['max']['y']-mapPixBou['min']['y'];

            let xy = feature.xy;
            let p_tr = L.point( (xy[0]+1)*cellSize ,  viewH-(xy[1])*cellSize );
            let p_bl = L.point( xy[0]*cellSize ,      viewH-(xy[1]+1)*cellSize );
            let ll_tr = map.containerPointToLatLng( p_tr );
            let ll_bl = map.containerPointToLatLng( p_bl );
            



            //console.log('ll',[ll_bl,ll_tr],'xy:',xy,'view:',[viewW,viewH],'depth',feature.properties.depth,'fillOpa',feature.properties.style.fillOpacity);
            return L.rectangle( [ ll_bl, ll_tr],{
                weight: 0,
                width:0//,
                //fillOpacity: feature.properties.style.fillOpacity,
            });
            /*
            return L.circleMarker(latlng, {
                //radius: 8,
                //color: '#000',
                //opacity: 0,
                //fillOpacity: 1,
                //fillColor: '#ff7800',            
                weight: 0,
                width:0
            });
            */
        
        }
    });
    return lTr;
}

var countCells = ( map, cellSize = 50 )=>{
    let pb = map.getPixelBounds();
    let w = pb['max']['x'] - pb['min']['x'];
    let h = pb['max']['y'] - pb['min']['y'];
    return [ parseInt(w/cellSize), parseInt(h/cellSize) ];           
}


let geoHelper = {
    getLgeoJSONFramData: getLgeoJSON,
    setOnZoom_fixScale: setOn_fixOnZoom,
    doResizeLayers: resizeLayers,
    getCellsCount: countCells
    
};

export { geoHelper }
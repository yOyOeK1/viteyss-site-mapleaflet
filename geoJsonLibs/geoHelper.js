import { getColorToDepth, getColor } from "./getColorToDepth.js";



let cellSize = 50;

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
            let d = layer.feature.depth/1.00;
            let nR = mMapVal( d, 0, viewDist, 0, viewH );
            if( d < 4.9 ){ // draft to red 
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
        //resizeLayers( map, geoLayer );        
    });
    // load geojson end 
    
}


class getLgeoJSON{
    constructor( map,  cellSize = 50, minDepth = 2.6  ){
        this.map = map;
        this.dataG = [];
        this.cellSize = cellSize;
        this.minDepth = minDepth;
        this.minColor = '#ff0000';
        this.colorM = [
            [0,         '#ffea6f'],
            [2.2,       '#73bcc7'],
            [10.0 ,     '#eef9fa']
        ];        
    }
    
    makeJso=( dataG )=>{
        return L.geoJSON([dataG], {
            style: this.style,
            onEachFeature: this.onEachFeature,
            pointToLayer: this.pointToLayer
        });
    }
    style = (feature) => {
        let colorsA = getColorToDepth( feature.depth );

        colorsA['rgb'] = getColor( feature.depth, this.colorM );


        if( feature.depth <= this.minDepth )
            colorsA['rgb'] = this.minColor;


        return {
            fillOpacity: colorsA['alpha'],
            fillColor: colorsA['rgb'],
        };
        //return feature.properties && feature.properties.style;
    }
    
    onEachFeature = (feature, layer) => {
        //console.log('getLgeoJSON / eachFuture '+feature);
        let popupContent = '';
        let pro = feature;
        if (feature && feature.id) {
            popupContent = `Depth: ${pro.depth} meters.<br>Id: ${feature.id}`;
        }
        
        layer.bindPopup(popupContent);

        if( openTooltips &&(feature.xy[0]%6)== 0  && (feature.xy[1]%6)== 0  ){
            layer.bindTooltip(`${pro.depth}`, {
                permanent: true,
                direction: 'bottom'
            }).openTooltip(); 
        }
    }

    pointToLayer = (feature, latlng) => {
        //console.log('latlong fly:',latlng,'feature',feature);
        let mapPixBou = this.map.getPixelBounds();
        let viewW = mapPixBou['max']['x']-mapPixBou['min']['x'];
        let viewH = mapPixBou['max']['y']-mapPixBou['min']['y'];

        let xy = feature.xy;
        let p_tr = L.point( (xy[0]+1)*this.cellSize ,  viewH-(xy[1])*this.cellSize );
        let p_bl = L.point( xy[0]*this.cellSize ,      viewH-(xy[1]+1)*this.cellSize );
        let ll_tr = this.map.containerPointToLatLng( p_tr );
        let ll_bl = this.map.containerPointToLatLng( p_bl );
        
        //console.log('ll',[ll_bl,ll_tr],'xy:',xy,'view:',[viewW,viewH],'depth',feature.properties.depth,'fillOpa',feature.properties.style.fillOpacity);
        let tOpts = {
            weight: 0,
            width:0//,
            //fillOpacity: feature.properties.style.fillOpacity,
        };
        if( feature.depth <= this.minDepth ){
            console.log('min depth set 3 point ');
            tOpts['fillColor'] = 'red';
        }

        return L.rectangle( [ ll_bl, ll_tr], tOpts);
       
    }
}

var countCells = ( map, cellSize = 50 )=>{
        let pb = map.getPixelBounds();
        let w = pb['max']['x'] - pb['min']['x'];
        let h = pb['max']['y'] - pb['min']['y'];
    return [ parseInt(w/cellSize), parseInt(h/cellSize) ];           
}

let openTooltips = 0;
var setTooltipsAs =( nState )=>{ openTooltips = nState; };

let geoHelper = {
    getLgeoJSONC: getLgeoJSON,
    //setOnZoom_fixScale: setOn_fixOnZoom,
    //doResizeLayers: resizeLayers,
    getCellsCount: countCells,
    setTooltips: setTooltipsAs
    
};

export { geoHelper }
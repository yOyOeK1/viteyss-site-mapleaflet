import MapioMapio from "./assets/mapioMapio.vue";
import MapioMapsPanel from "./assets/mapioMapsPanel.vue";
import { contextMenuSimple, setMapObject } from "./contextMenuSimple";
import { lcFileGpxLoad } from "./lcFileGpx";
import { lfBaseMaps } from "./lfBaseMaps";
import { lfMakeIconClickable } from "./lfMakeIconClickable";
import { lfMakeKmPanel } from "./lfMakeKmPanel";
import { lfMakeSmallLatLonToClipboard } from "./lfMakeSmallLatLonBanToClipBoard";
import { lfOverLayMaps } from "./lfoverlayMaps";
import onlineMaps from "./onlineMaps";
import { createApp } from 'vue';
import { wqHandlerr_install } from "./wqHandlers";
import { geoJtest1 } from './workGeojson/test1.js'
import { geoJ1 } from "./geoJsonLibs/geoj1.js";
import { geoJ2 } from "./geoJsonLibs/geoj2.js";


class s_vysmapleafletPage{

  constructor(){

    this.geoJ1 = geoJtest1;
    this.lfmap = -1;
    this.lflayCon = -1;
    this.lfpanel = -1;
    this.lftileLayer_osm = -1;
    this.lftileLayer_work = -1;
    this.onlineMaps = onlineMaps;

    this.mioApp = -1;
    this.mioApp1 = -1;
    this.mPanel = -1;
    this.lcFileGpx = -1;
    wqHandlerr_install(this);

    this.ll = {

    };

  }
  
  get getName(){
    return `vys mapleaflet`;
  }
    
  
  get getDefaultBackgroundColor(){
    return "#ffffff";
  }
  
  getHtml = () => {
    
    

    return `<style>
    .leaflet-control-attribution{
      display: none;
    }
    </style>
    <link rel="stylesheet" href="${this.homeUrl}node_modules/leaflet/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="">
    <script src="${this.homeUrl}node_modules/leaflet/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
    <script src="${this.homeUrl}assets/togeojson.js"></script>
    <script src="${this.homeUrl}assets/leaflet.filelayer.js"></script>
    <link rel="stylesheet" href="${this.homeUrl}assets/leaflet.fullscreen.Control.FullScreen.css">
    <script src="${this.homeUrl}assets/leaflet.fullscreen.Control.FullScreen.js"></script>
    <script src="${this.homeUrl}assets/leaflet.tilelayer.fallback.js"></script>
    <link rel="stylesheet" href="${this.homeUrl}assets/leaflet.contextmenu.css">
    <script src="${this.homeUrl}assets/leaflet.contextmenu.js"></script>
    <script src="${this.homeUrl}assets/leaflet.latlng-graticule.js"></script>
<!--
    <b>${this.getName}</b><br>
    <img src="${this.homeUrl}assets/ico_viteyss_32.png"><br>
    This is a npm package<br>
    viteyss-site-mapleaflet<br>
    <pre>
    In Menu: ${this.getName}
    Home url: ${this.homeUrl}
    Ver: ${this.instanceOf.ver}

    More ditails in \`./site.json\`
    </pre>
    -->
    <div id="lfmapio"></div>
    <div id="lfmapio2"></div>
    `;

  }

  lfAddMarker = ( ll )=>{
    L.marker( ll ).addTo( this.lfmap );
  }


  addMapOverlay=()=>{
    var crownHill = L.marker([39.75, -105.09]).bindPopup('This is Crown Hill Park.'),
    rubyHill = L.marker([39.68, -105.00]).bindPopup('This is Ruby Hill Park.');
    
    var parks = L.layerGroup();
    this.lflayCon.addOverlay( parks, 'Abc park');
  }

  getHtmlAfterLoad = () =>{
    cl(`${this.getName} - getHtmlAfterLoad()`);
    

    let contextMenuObj = contextMenuSimple( this.homeUrl );
    
    //setTimeout(()=>{
      this.mioApp = createApp( MapioMapio,  
        {'mapname':"mio", 
            'mapOpts':{'abc':1,
              'zoomControl': true,
              'center': [
                //9.472598206607001,-78.96273136138917
                //9.472616667,-78.962383333
                9.471910340675768,-78.96352529525758
                //39.7471494,-104.9998241
                ], 'zoom':16
            },
            'fileLoad': false, 'homeUrl': this.homeUrl, 
            'addSmallLatLon': true, 
            'addlfBaseMaps': true,
            //'addGrid': true,
            'addContextMenu': contextMenuObj,
            'addOSD': true,
          } ).mount('#lfmapio');
      this.mioApp1 = createApp( MapioMapio, 
        {'mapname':"mioMap2", 
            'mapioDirs': true,
            'addFullScreenBt': true,
            'addFallbackTiles': false,
            'addGrid': true,
            'fileLoad': true, 'homeUrl': this.homeUrl,  
            'addlfBaseMaps': false} ).mount('#lfmapio2');

      // for context menu 
      setMapObject( pager._page.mioApp.$data.map );


      // svg osd on map?
      let myOlDiv = lfMakeKmPanel( this.mioApp.$data.map, this.homeUrl, 'osdDivTest' );
      $.get( `${this.homeUrl}assets/osdMapTest1.svg`, function( data, status ){
          siteByKey.s_multiSVGPage.o.mulSvgParseGet( data  , status, false, '.osdDivTest' );
          
      } );



      // load geojson
      function onEachFeature(feature, layer) {
        let popupContent = '';
        let pro = feature.properties;

        if (feature.properties && feature.id) {
          popupContent = `Death: ${pro.depth} meters.<br>Id: ${feature.id} Zoom:`+pager._page.mioApp.$data.map.getZoom();
        }

        layer.bindPopup(popupContent);
      }

      //const bicycleRentalLayer = L.geoJSON([geoJtest1.bicycleRental, geoJtest1.campus], {
      //this.depthGeoJson = L.geoJSON([geoJ1], {
      this.depthGeoJson = L.geoJSON([geoJ2], {
        style(feature) {
          return feature.properties && feature.properties.style;
        },

        onEachFeature,

        pointToLayer(feature, latlng) {
          return L.circleMarker(latlng, {
            //radius: 8,
            //color: '#000',
            weight: 0,
            //opacity: 0,
            //fillOpacity: 1,
            //fillColor: '#ff7800',
            
            width:0
          });

        }
      }).addTo(pager._page.mioApp.$data.map);
      

      pager._page.mioApp.$data.map.on('zoomend', function() {
          var currentZoom = pager._page.mioApp.$data.map.getZoom();
          let pixBound = pager._page.mioApp.$data.map.getPixelBounds();
          let llBound = pager._page.mioApp.$data.map.getBounds();
          
          let viewH = pixBound['max'].distanceTo( pixBound['min'] );
          let viewDist = llBound['_northEast'].distanceTo( llBound['_southWest'] );
          

          pager._page.depthGeoJson.eachLayer(function(layer) {
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
                /*( 
                  (parseFloat(layer.feature.properties.depth)*10.0) /
                  (( Math.log(50000000,currentZoom) ) )
                );*/
                //console.log(currentZoom,"zoom  current radius: "+layer.getRadius()+" nr for "+layer.feature.properties.depth+"  "+nR);
                return layer.setRadius( parseInt(nR) );
              }
          });
      
      });
      // load geojson end 
      
      

      // bind move 
      if( 1 ){
        this.mioApp.$data.map.on( 'moveend', (e='')=>{
          //console.log('connect moveend ....');
          console.log('moveend2');
          this.ll['last'] = this.mioApp.$data.map.getCenter();
          this.ll['zoom'] = this.mioApp.$data.map.getZoom();

          this.mioApp1.$data.map.setView( this.ll['last'], this.ll['zoom'] );
         // this.mPanel._instance.ctx.onMoveDoneEvent( {'lfmap':this.map} );
        });
      }

    //},500);
    /*
    this.mPanel = createApp( MapioMapsPanel );

    setTimeout(()=>{


      this.lfmap = L.map('lfmapdiv',{
          center: [9.2620320938,-79.9355079], 
          zoom:12
      });
    

      this.lflayCon = L.control.layers( 
        lfBaseMaps( this.lfmap )//, 
        //lfOverLayMaps( this.lfmap, this.homeUrl )
      ).addTo( this.lfmap );
      //lflayCon.addBaseLayer(osmHOT, 'OpenHotMap');
      
      this.lfAddMarker([9.2620320938,-79.9355079]);
      this.lfAddMarker([9.3416632,-79.906264422]);
      
      
      lfMakeKmPanel( this.lfmap, this.homeUrl)

      console.log('loaded lfmap ... :)');
      this.mPanel.mount('.kmdivPanel');


      // events 
      this.lfmap.on( 'moveend', (e='')=>{
        console.log('moveend ....');
        this.mPanel._instance.ctx.onMoveDoneEvent(this);
      });
      this.lfmap.on('overlayadd',(e='')=>{
        console.log('overlayadded ....');
        this.mPanel._instance.ctx.currentFolderOverlayChange(e);
      });
       this.lfmap.on('overlayremove',(e='')=>{
        console.log('overlayremove ....');
        this.mPanel._instance.ctx.currentFolderOverlayChange(e);
      });

      // playground 
      this.lcFileGpx = lcFileGpxLoad( this.lfmap );

      //this.lfmap.on(
      //  'moveend', 
      //  (e)=>{console.log('viewrestart ....');}
        //this.mPanel._instance.ctx.onMoveDoneEvent
      //);

      lfMakeIconClickable( this.lfmap, this.homeUrl)

     

    },700);
    */

    setTimeout(()=>{
      sOutSend('wsClientIdent:mapio');

    },1000);
  }

  get svgDyno(){
    return '';
  }

  svgDynoAfterLoad(){

  }

  onMessageCallBack = ( r ) => {
    //cl( `${this.getName} [cb] - got msg `+JSON.stringify(r));

    if( String(r.topic).startsWith('map/osd/') ){
      //this.mioApp.pushToOSD( r );
      siteByKey.s_multiSVGPage.o.onMessageCallBack( r );
    }


  }

}

export { s_vysmapleafletPage };

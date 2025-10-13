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





import { geoJtest1 } from './workGeojson/test1.js'
import { geoJ1 } from "./geoJsonLibs/geoj1.js";
import { geoJ2 } from "./geoJsonLibs/geoj2.js";
import { wqh_mapleaflet } from "./wqh_mapleaflet.js";



class s_vysmapleafletPage{

  constructor(){

    this.geoJ1 = geoJtest1;
    //this.lfmap = -1;
    this.lflayCon = -1;
    this.lfpanel = -1;
    this.lftileLayer_osm = -1;
    this.lftileLayer_work = -1;
    this.onlineMaps = onlineMaps;

    this.mioApp = -1;
    this.mioApp1 = -1;
    this.mPanel = -1;
    this.lcFileGpx = -1;

    this.q2handlers = new wqh_mapleaflet().getHandlers();
    

    

    this.ll = {
    };

  }
  
  get getName(){
    return `vys mapleaflet`;
  }
    
  
  get getDefaultBackgroundColor(){
    return "#ffffff";
  }
  


  getJsIncludeHtml = () => {
    return `
      <style>
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
    `;
  }


  getHtml = () => {

    let contextMenuObj = contextMenuSimple( this.homeUrl );
    
    this.mioApp = createApp( MapioMapio,  
      {'mapname':"mio", 
          'mapOpts':{
            'abc':1,
            'zoomControl': false,
            'center': [ 9.562813071565845,-78.86047482490541], 
            'zoom':16
          },
          'useSettingToResume':true,
          //'fileLoad': false, 
          'homeUrl': this.homeUrl, 
          'addSmallLatLon': true, 
          'addlfBaseMaps': true,
          'addFullScreenBt': false,
          'addFallbackTiles': false,
          'addGrid': false,
          'addContextMenu': contextMenuObj,
          'addOSD': false,
          'depthSoundings': '../conturesTest/LogDepth.db',
          'mapioShareIt':true
        } );
    this.mioApp1 = createApp( MapioMapio, 
      {'mapname':"mioMap2", 
        'mapioDirs': true,
        'addFullScreenBt': true,
        'addFallbackTiles': false,
        'addGrid': true,
        'fileLoad': true, 
        'homeUrl': this.homeUrl,  
        'addlfBaseMaps': false,
        'depthSoundings': '../conturesTest/LogDepth.db'
        
      } );

    return this.getJsIncludeHtml()+`
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

  //lfAddMarker = ( ll )=>{
  //  L.marker( ll ).addTo( this.lfmap );
  //}


  addMapOverlay=()=>{
    var crownHill = L.marker([39.75, -105.09]).bindPopup('This is Crown Hill Park.'),
    rubyHill = L.marker([39.68, -105.00]).bindPopup('This is Ruby Hill Park.');
    
    var parks = L.layerGroup();
    this.lflayCon.addOverlay( parks, 'Abc park');
  }

  getHtmlAfterLoad = () =>{
    cl(`${this.getName} - getHtmlAfterLoad()`);
    
    
    this.mioApp.mount('#lfmapio');
    this.mioApp1.mount('#lfmapio2');

    // for context menu 
    setMapObject( pager._page.mioApp._instance.data.map );


    // svg osd on map?
    if(0){
      let myOlDiv = lfMakeKmPanel( this.mioApp._instance.data.map, this.homeUrl, 'osdDivTest' );
      $.get( `${this.homeUrl}assets/osdMapTest1.svg`, function( data, status ){
        siteByKey.s_multiSVGPage.o.mulSvgParseGet( data  , status, false, '.osdDivTest' );
      });
    }

      

      

    // bind move 
    var syncMapTopToBottom = () => {
      console.log('moveend2 ... sync ');
      this.ll['last'] = this.mioApp._instance.data.map.getCenter();
      this.ll['zoom'] = this.mioApp._instance.data.map.getZoom();

      this.mioApp1._instance.data.map.setView( this.ll['last'], this.ll['zoom'] );
      console.log('moveend2 ... sync .. DONE');
      
    };
    if( 1 ){
      this.mioApp._instance.data.map.on( 'moveend', (e='')=>{
        //console.log('connect moveend ....');
        // this.mPanel._instance.ctx.onMoveDoneEvent( {'lfmap':this.map} );
        syncMapTopToBottom();
      });

      setTimeout(()=>{ syncMapTopToBottom(); },800);
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

  onPageLeft = () =>{
    console.log('onPageLeft ....', this.mioApp, this.mioApp1);
    this.mioApp.unmount();
    this.mioApp1.unmount();
    console.log('... unmount vue');

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

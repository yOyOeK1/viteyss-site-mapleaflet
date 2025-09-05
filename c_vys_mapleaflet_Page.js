import MapioMapsPanel from "./assets/mapioMapsPanel.vue";
import { lfBaseMaps } from "./lfBaseMaps";
import { lfMakeIconClickable } from "./lfMakeIconClickable";
import { lfMakeKmPanel } from "./lfMakeKmPanel";
import { lfOverLayMaps } from "./lfoverlayMaps";
import onlineMaps from "./onlineMaps";
import { createApp } from 'vue';


class s_vysmapleafletPage{

  constructor(){
    this.lfmap = -1;
    this.lflayCon = -1;
    this.lfpanel = -1;
    this.lftileLayer_osm = -1;
    this.lftileLayer_work = -1;
    this.onlineMaps = onlineMaps;

    this.mPanel = -1;

  }
  
  get getName(){
    return `vys mapleaflet`;
  }
    
  
  get getDefaultBackgroundColor(){
    return "#ffffff";
  }
  
  getHtml = () => {
    
    

    return `
    <style>
    .leaflet-control-attribution{
      display: none;
    }
    </style>
    <link rel="stylesheet" href="${this.homeUrl}node_modules/leaflet/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="">
    <script src="${this.homeUrl}node_modules/leaflet/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
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
    </pre>-->
    <div id="lfmapdiv"
      style="width: 100vw; min-height: 100vh;"></div>
    
    `;

  }

  lfAddMarker = ( ll )=>{
    L.marker( ll ).addTo( this.lfmap );
  }

  getHtmlAfterLoad = () =>{
    cl(`${this.getName} - getHtmlAfterLoad()`);
 
    this.mPanel = createApp( MapioMapsPanel );

    setTimeout(()=>{


      this.lfmap = L.map('lfmapdiv',{
          center: [9.2620320938,-79.9355079], 
          zoom:12
      });
    

      
      
    
      this.lflayCon = L.control.layers( 
        lfBaseMaps( this.lfmap ), 
        lfOverLayMaps( this.lfmap, this.homeUrl )
      ).addTo( this.lfmap );
      //lflayCon.addBaseLayer(osmHOT, 'OpenHotMap');
      
      this.lfAddMarker([9.2620320938,-79.9355079]);
      this.lfAddMarker([9.3416632,-79.906264422]);
      
      
      lfMakeKmPanel( this.lfmap, this.homeUrl)

      console.log('loaded lfmap ... :)');
      this.mPanel.mount('.kmdivPanel');
      this.lfmap.on( 'moveend', (e='')=>{
        console.log('moveend ....');
        this.mPanel._instance.ctx.onMoveDoneEvent(this);
      });


      //this.lfmap.on(
      //  'moveend', 
      //  (e)=>{console.log('viewrestart ....');}
        //this.mPanel._instance.ctx.onMoveDoneEvent
      //);

      lfMakeIconClickable( this.lfmap, this.homeUrl)

      /*
      // add temst kml file 
      let b = L.latLngBounds( 
            L.latLng( 9.37471695665061, -79.9458092451096 ),
            L.latLng( 9.36598906657464, -79.9522948265076 )
      );
      let imageUrl = `${this.homeUrl}/workKmls/shelterBayMarine`;
      console.log('imageUrl: ',imageUrl);
      L.imageOverlay( imageUrl, b ).addTo( this.lfmap );
      */

    },700);

  }

  get svgDyno(){
    return '';
  }

  svgDynoAfterLoad(){

  }

  onMessageCallBack = ( r ) => {
    cl( `${this.getName} [cb] - got msg `);

  }

}

export { s_vysmapleafletPage };

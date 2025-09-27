<template>
    <div class="mioMap" 
        :id="mapname">mioMap {{ mapname }}</div>
</template>
<script>
import { ref, createApp } from 'vue';
import { lfBaseMaps } from '../lfBaseMaps';
import { lfMakeKmPanel } from '../lfMakeKmPanel';
import { lcFileGpxLoad } from '../lcFileGpx';
import MapioMapsPanel from './mapioMapsPanel.vue';
import { lfMakeGrid } from '../lfMakeGrid';
import { lfMakeSmallLatLonToClipboard } from '../lfMakeSmallLatLonBanToClipBoard';
import mioHashHelper from './mioHashHelper';
import { lfMakeOSD, lfOSDpushToOSD } from '../lfMakeOSD';
import { depthSoundinOverLay } from '../geoJsonLibs/depthSoundingHelp';
//import { dbSoundingsToData } from '../geoJsonLibs/fromdb';

export default{
    props:{
        'mapname': { type: String, required: true },
        'addlfBaseMaps': { type: Boolean, required: true },
        'homeUrl': { type: String, required: true },
        'fileLoad': { type: Boolean, default: false },
        'mapOpts': { default: { center: [9.2620320938,-79.9355079], zoom:12 } },
        'addSmallLatLon': { default: false },
        'mapioDirs': { type: Boolean, default: false },
        'addFullScreenBt': { type: Boolean, default: false }, // fullscreen button next to zoom
        'addFallbackTiles': { type: Boolean, default: true },
        'addContextMenu': { default: undefined }, // look leaflet.contextmenu.js
        'addGrid': { default: false},
        'useHash': { type:Boolean, default: true }, // put and restore hash url
        'addOSD': { default: false },
        'depthSoundings': { default: "" }
    },
    data(){
        let map = ref();
        let control = ref();
        let fsControl = ref(); // fullscreen controls
        let conFileLoad = ref();
        let tilesFallback = ref();
        let olGrid = ref();
        let olSmallLL = ref();
        let olOSD = ref();
        let LgeoJsonDbDepths = ref(Object());
        //let dbSoundingsRun = ref(0);

        return { map, control, fsControl, conFileLoad, tilesFallback, olGrid, olSmallLL, olOSD,
            LgeoJsonDbDepths, //dbSoundingsRun
         };
    },
    methods:{
        doEcho(){
            console.log('echo !!!');
        },
        getObject( objName ){
            return this[objName];
        },
        pushToOSD( msg ){
            //console.log('pushToOSD ['+this.addOSD+']: ',msg);
            if( this.addOSD )
                lfOSDpushToOSD(msg);
        }
    },
    mounted(){
        console.log('mounted:'+this.mapname);

        
        console.log('log concat mapOptions');

        if( this.addContextMenu != undefined ){
            for(let k of Object.keys( this.addContextMenu) ){
                this.mapOpts[ k ] = this.addContextMenu[ k ];
            }
        }


        this.map = L.map( this.mapname, this.mapOpts);

        if( this.addFallbackTiles ){
            this.tilesFallback = L.tileLayer.fallback('/apis/mapleaflet/osmCyclosm/{z}/{x}/{y}', {
                minNativeZoom: 4,
                maxNativeZoom: 19,
                minZoom: 3,
                maxZoom: 22,
                attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
                errorTileUrl: `${this.homeUrl}assets/leaflet.TileLayer.Fallback.no-tile.png`
            });

            this.tilesFallback.addTo( this.map );
        }

        


        if( this.addlfBaseMaps ){
            this.control = L.control.layers( lfBaseMaps( this.map ), 
                //lfOverLayMaps( this.lfmap, this.homeUrl )
            ).addTo( this.map );
        }else{
            this.control = L.control.layers( {}, 
                //lfOverLayMaps( this.lfmap, this.homeUrl )
            ).addTo( this.map );
        }

        
        
        if( this.addFullScreenBt ){
            this.fsControl = L.control.fullscreen();
            this.map.addControl( this.fsControl );
            this.map.on('enterFullscreen', function(){
                if(window.console) window.console.log('enterFullscreen');
            });
            this.map.on('exitFullscreen', function(){
                if(window.console) window.console.log('exitFullscreen');
            });
        }

        
        if( this.fileLoad )
            this.conFileLoad = lcFileGpxLoad( this.map, this.control );
        
        if( this.addSmallLatLon )
            this.olSmallLL = lfMakeSmallLatLonToClipboard( this.map, this.homeUrl );


        if( this.mapioDirs ){
            let mPanelDivName = this.mapname+'divKmPanel';
            lfMakeKmPanel( this.map, this.homeUrl, mPanelDivName );
            this.mPanel = createApp( MapioMapsPanel, { 'mapioMap': this } );
            this.mPanel.mount( `.${mPanelDivName}` );
            //window['mPanel'] = this.mPanel;
            this.map.on( 'moveend', (e='')=>{
                console.log('moveend 7 ....');
                this.mPanel._instance.ctx.onMoveDoneEvent( {'lfmap':this.map} );
                console.log('moveend 7 ....END');
            });
            this.map.on('overlayadd',(e='')=>{
                console.log('overlayadded ....');
                this.mPanel._instance.ctx.currentFolderOverlayChange(e);
            });
            this.map.on('overlayremove',(e='')=>{
                console.log('overlayremove ....');
                this.mPanel._instance.ctx.currentFolderOverlayChange(e);
            });
            //this.mPanel._instance.ctx.onMoveDoneEvent( {'lfmap':this.map} );
        }




        //// depth soundings 
        if( this.depthSoundings != '' ){
            this.LgeoJsonDbDepths = depthSoundinOverLay( this.map, this.control );
        }
        //// depth soundings 



        
        if( this.addGrid ){
            this.olGrid = lfMakeGrid( this.map );
        }

        // do hash adress start resume
        if( this.useHash ){
            mioHashHelper( this.map, this.mapname );

        }

        /*
        if( this.addOSD )
            this.olOSD = lfMakeOSD( this.map, this.homeUrl );
        */


    }

}
</script>
<style>
.mioMap{
    width: 100vw; 
    min-height: 50vh;
}
</style>
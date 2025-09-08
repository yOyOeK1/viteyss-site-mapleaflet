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

export default{
    props:{
        'mapname': { type: String, required: true },
        'addlfBaseMaps': { type: Boolean, required: true },
        'homeUrl': { type: String, required: true },
        'fileLoad': { type: Boolean, default: false },
        'mapOpts': { default: { center: [9.2620320938,-79.9355079], zoom:12 } },
        'mapioDirs': { type: Boolean, default: false },
        'addFullScreenBt': { type: Boolean, default: false }, // fullscreen button next to zoom
        'addFallbackTiles': { type: Boolean, default: true },
        'addContextMenu': { default: undefined }, // look leaflet.contextmenu.js
        'addGrid': { default: false}
    },
    data(){
        let map = ref();
        let control = ref();
        let fsControl = ref(); // fullscreen controls
        let conFileLoad = ref();
        let tilesFallback = ref();
        let olGrid = ref();

        return { map, control, fsControl, conFileLoad, tilesFallback, olGrid };
    },
    methods:{
        doEcho(){
            console.log('echo !!!');
        },
        getObject( objName ){
            return this[objName];
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

        if( this.addGrid ){
            function slashZeros( v ){
                console.log('slash in ',v,'         ');
                let sV = String(v);
                if( Math.abs( v ) >1.0 && sV.endsWith('0') ){
                    slashZeros( parseFloat( sV.substring(0, v.length-2) ) );
                }
                console.log("out",sV);
                return sV;
            }

            this.olGrid = L.latlngGraticule({
                'color': 'gray',
                'latFormatTickLabel':(s)=>{
                    return s.toFixed(5);
                },
                'lngFormatTickLabel':(s)=>{
                    return s.toFixed(5);
                },
                showLabel: true,
                zoomInterval: [
                    {start: 2, end: 3, interval: 30},
                    {start: 4, end: 4, interval: 10},
                    {start: 5, end: 6, interval: 5},
                    {start: 6, end: 7, interval: 2},
                    {start: 8, end: 9, interval: .5},
                    {start: 10, end: 10, interval: 0.166666666},
                    {start: 11, end: 11, interval: 0.083333333},
                    {start: 12, end: 12, interval: 0.0625},
                    {start: 13, end: 14, interval: 0.01666666666/4},
                    {start: 15, end: 18, interval: 0.01666666666/10}
                    
                ]
            }).addTo(this.map);
            //this.olGrid.bringToFront();
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
        
        if( this.mapioDirs ){
            let mPanelDivName = this.mapname+'divKmPanel';
            lfMakeKmPanel( this.map, this.homeUrl, mPanelDivName );
            this.mPanel = createApp( MapioMapsPanel, { 'mapioMap': this } );
            this.mPanel.mount( `.${mPanelDivName}` );
            //window['mPanel'] = this.mPanel;
            this.map.on( 'moveend', (e='')=>{
                console.log('moveend ....');
                this.mPanel._instance.ctx.onMoveDoneEvent( {'lfmap':this.map} );
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
    }

}
</script>
<style>
.mioMap{
    width: 100vw; 
    min-height: 50vh;
}
</style>
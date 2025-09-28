<template>
    <div class="mioMap" 
        :id="mapname">mioMap {{ mapname }}</div>
</template>
<script>
import { ref, createApp } from 'vue';
import { lfBaseMaps , lfBaseBapsAttribution } from '../lfBaseMaps';
import { lfMakeKmPanel } from '../lfMakeKmPanel';
import { lcFileGpxLoad } from '../lcFileGpx';
import MapioMapsPanel from './mapioMapsPanel.vue';
import { lfMakeGrid } from '../lfMakeGrid';
import { lfMakeSmallLatLonToClipboard } from '../lfMakeSmallLatLonBanToClipBoard';
import mioHashHelper from './mioHashHelper';
import { lfMakeOSD, lfOSDpushToOSD } from '../lfMakeOSD';
import { depthSoundinOverLay } from '../geoJsonLibs/depthSoundingHelp';
import CSettings from '../compSettings/cSettings.vue';
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
        let depthSouningO = ref(Object());

        return { map, control, fsControl, conFileLoad, tilesFallback, olGrid, olSmallLL, olOSD,
            LgeoJsonDbDepths, depthSouningO,//dbSoundingsRun
            cSettings: ref(Object()),
            settingsOn: false,
            confT1: ref(Object()),
            mapll: ref({lat:0.0, lng:0.0}),
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

    computed:{
        getLastLat(){
            return this.mapll['lat'];
        },
        getLastLng(){
            return this.mapll['lng'];
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

        console.log('mapio ['+this.mapname+'] opts: '+JSON.stringify(this.mapOpts,null,2));

        this.map = L.map( this.mapname, this.mapOpts);
        

        // for settings update ui if open settings
        let mapC = this.map.getCenter();
        this.mapll['lat'] = mapC['lat'];
        this.mapll['lng'] = mapC['lng'];
        this.map.on( 'moveend', (e='')=>{
            let mapC = this.map.getCenter();
            this.mapll.lat = mapC['lat'];
            this.mapll.lng = mapC['lng'];

            if( this.settingsOn && setOpts.isOpen ){
                this.confT1[0].fields[0].text = mapC['lat'];
                this.confT1[0].fields[1].text = mapC['lng'];
            }
            if( this.settingsOn && setOpts.isOpen == false ){
                this.settingsOn = false;
            }

        });
        // for settings update ui if open settings END

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

        // use setOpts as settings
        if(1){
            let setOptR = setOpts.methods.restoreSettings( 'mapio_'+this.mapname );
        }
        // use setOpts as settings



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
            this.depthSouningO = new depthSoundinOverLay( this.map, this.control );
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



        // settings
        if(1){
            let kName = 'osdDivSettings'+this.mapname
            let mySettDiv = lfMakeKmPanel( this.map, this.homeUrl, kName );
            $('.'+kName).html(`<button id="${kName}Open">stgs</button>`);

            $('#'+kName+'Open').on('click',()=>{
                //setOpts.methods.openPanel();
                
                let llzoom = map.getZoom();
                let zoomSetIs = llzoom;

                let onSettingsChange = (ev='', value='')=>{
                    this.map.setZoom(value);
                };

                this.confT1 = ref([
                    { 
                        name: 'Map at',
                        fields: [
                            { name: "lat",      text: this.getLastLat },
                            { name: "lng",      text: this.getLastLng },
                            { name: "Zoom",     range: true, min:1, max:22, step:1, value:zoomSetIs, callBackF:onSettingsChange }
                        ]
                     },
                     { 
                        name: 'Mapio - settings',
                        desc: "Setting of map ("+this.mapname+")",
                       
                     },
                     { 
                        name: 'Maps attributions',
                        html: lfBaseBapsAttribution.join("<br>"),
                       
                     }
                ]);


                if( this.depthSoundings != "" ){

                    let onSettingsChangeDBSoundigRaster = (ev='', value='')=>{
                        console.log('dbSoundigRaster', value);
                        this.depthSouningO.setGridCellSize( value );
                    };
                    let onSettingsChangeDBSoundigMinDepth = (ev='',val='')=>{
                        console.log('dbSounding new min depth',val);
                        this.depthSouningO.geoH.minDepth = parseFloat(val);
                        this.depthSouningO.depthSoundingUpdate();
                    }

                    this.confT1.splice(1,0,{ 
                        name: 'dbSoundings',
                        fields: [
                            { name: "db sources",          filesList: true, value:this.depthSoundings, desc: "Paths to files *.sqlit3 with depth sounding logs. Separate paths with [,] comma."   },
                            { name: "raster size",          range: true, min:4, max:50, step:1, value:this.depthSouningO.gridCellSize, callBackF:onSettingsChangeDBSoundigRaster },
                            { name: "min depth (meters)",     range: true, min:0.1, max:10, step:0.1, value:2.6, callBackF:onSettingsChangeDBSoundigMinDepth }
                        ]
                     });

                }

                //window['confT1_'+this.mapname] = this.confT1;
                setOpts.methods.openPanelWithConfig( this.confT1 );
                this.settingsOn = true;
            });

        }
        // settings



    }

}
</script>
<style>
.mioMap{
    width: 100vw; 
    min-height: 50vh;
}

.leaflet-bottom,.leaflet-top{
    z-index: 997 !important;
}
</style>
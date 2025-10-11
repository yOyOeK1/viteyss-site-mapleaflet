<template>
    <div class="mioMap" 
        :id="mapname">mioMap {{ mapname }}</div>
</template>
<script>
import { ref, createApp } from 'vue';
import { lfBaseMaps , lfBaseBapsAttribution, lfBaseBapsKeys } from '../lfBaseMaps';
import { lfMakeKmPanel } from '../lfMakeKmPanel';
import { lcFileGpxLoad } from '../lcFileGpx';
import MapioMapsPanel from './mapioMapsPanel.vue';
import { lfMakeGrid } from '../lfMakeGrid';
import { lfMakeSmallLatLonToClipboard } from '../lfMakeSmallLatLonBanToClipBoard';
import mioHashHelper from './mioHashHelper';
import { lfMakeOSD, lfOSDpushToOSD } from '../lfMakeOSD';
import { depthSoundinOverLay } from '../geoJsonLibs/depthSoundingHelp';
import CSettings from '../compSettings/cSettings.vue';
import DepthColorPicker from '../geoJsonLibs/depthColorPicker.vue';
import DepthColorsPreesets from '../geoJsonLibs/depthColorsPreesets.vue';
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
        'depthSoundings': { default: "" },
        'useSettingToResume': { default: false }
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
            depthColPresConf: {}, depthColPicApp:-1, deCoPiAp:-1,
            cSettings: ref(Object()),
            settingsOn: false,
            confT1: ref(Object()),
            mapll: ref({lat:0.0, lng:0.0}),
            settKey: `mapio/${this.mapname}/`,
            lfbm:ref(Object()),currBaseMapO: ref(Object()), lfbmKeySel: '' // for base map and settings
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

        if( this.useSettingToResume == true ){
            this.mapOpts['zoom'] = localStorageH.getK(this.settKey+'zoom', this.mapOpts['zoom']);
            this.mapOpts['center'] = [
                localStorageH.getK(this.settKey+'lat', this.mapOpts['center'][0]),
                localStorageH.getK(this.settKey+'lng', this.mapOpts['center'][1])
            ];
        }

        
        console.log('log concat mapOptions');

        if( this.addContextMenu != undefined ){
            for(let k of Object.keys( this.addContextMenu) ){
                this.mapOpts[ k ] = this.addContextMenu[ k ];
            }
        }

        console.log('mapio ['+this.mapname+'] opts: '+JSON.stringify(this.mapOpts,null,2));

        this.map = L.map( this.mapname, this.mapOpts);
        this.map['settKey'] = this.settKey;
        this.map['mapname'] = this.mapname;
        

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




        // base map 


        if( this.addlfBaseMaps ){
            if( 0 ){
                this.control = L.control.layers( lfBaseMaps( this.map ), 
                    //lfOverLayMaps( this.lfmap, this.homeUrl )
                ).addTo( this.map );
            } else if( 1 ){
                this.control = L.control.layers( {} ).addTo( this.map );
                this.lfbm = lfBaseMaps( this.map );
                this.lfbmKeySel = localStorageH.getK('mapio/'+this.mapname+'/basemap/keySel', 'OpenStreetMap,CyclOSM' );
                this.currBaseMapO = this.lfbm[ this.lfbmKeySel ];
                this.control.addOverlay( this.currBaseMapO, this.lfbmKeySel );
                this.currBaseMapO.addTo( this.map );
            }
        }else{
            this.control = L.control.layers( {}, 
                //lfOverLayMaps( this.lfmap, this.homeUrl )
            ).addTo( this.map );
        }

            // base map settings 
        let onBaseMapSettingChange = ( ev='', value='')=>{
            console.log('base map setting change !',value);

            this.control.removeLayer( this.currBaseMapO );
            this.currBaseMapO.remove( this.map );

            this.lfbmKeySel = value;
            console.log('   new map is :'+this.lfbmKeySel);
            this.currBaseMapO = this.lfbm[ this.lfbmKeySel ];
            this.control.addOverlay( this.currBaseMapO, this.lfbmKeySel );
            this.currBaseMapO.addTo( this.map );

        };


        // base map end 
        
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
                console.log('overlayadded ....DONE');
            });
            this.map.on('overlayremove',(e='')=>{
                console.log('overlayremove ....');
                this.mPanel._instance.ctx.currentFolderOverlayChange(e);
                console.log('overlayremove ....DONE');
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

                let divColorPickerName = "colorPicker"+this.mapname;

                

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
                        name: 'Color picker',
                        fields: [
                            { name: "depth color presets", whantDiv: 'presets'+divColorPickerName },
                            { name: "depth color legend", whantDiv: divColorPickerName }
                        ]
                       
                     },
                     { 
                        name: 'Mapio - settings',
                        html: "Setting of map ("+this.mapname+")"+
                            `<button id="btSaveMapioSet${this.mapname}">Save settings</button>`,
                       
                     },
                     { 
                        name: 'Maps attributions',
                        html: lfBaseBapsAttribution.join("<br>"),
                       
                     }
                ]);


                if( this.addlfBaseMaps ){
                    this.confT1.splice(1,0,{ 
                        name: 'Base maps',
                        fields: [
                            { name: "set base map",      selectoneoption: true, value: this.lfbmKeySel, values: Object.keys(this.lfbm),
                                    callBackF:onBaseMapSettingChange
                             }
                        ]
                     });
                }
                
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
                        //icon: this.homeUrl+"./geoJsonLibs/dbSoundings_ico_124_124.png",
                        name: 'dbSoundings',
                        fields: [
                            ////{ name: "db sources",          filesList: true, value:this.depthSoundings, desc: "Paths to files *.sqlit3 with depth sounding logs. Separate paths with [,] comma."   },
                            //{ name: "db sources",          desc:this.depthSoundings+" Paths to files *.sqlit3 with depth sounding logs. Separate paths with [,] comma."   },
                            { name: "raster size",          range: true, min:4, max:50, step:1, value:this.depthSouningO.gridCellSize, callBackF:onSettingsChangeDBSoundigRaster },
                            { name: "min depth (meters)",     range: true, min:0.1, max:10, step:0.1, value:this.depthSouningO.geoH.minDepth, callBackF:onSettingsChangeDBSoundigMinDepth }
                        ]
                     });

                }
                
                //window['confT1_'+this.mapname] = this.confT1;
                setOpts.methods.openPanelWithConfig( this.confT1 );
                this.settingsOn = true;


                // add listiner for on save settings 
                setTimeout(()=>{
                    $(`#btSaveMapioSet${this.mapname}`).click(()=>{
                        console.log('save settings! '+this.mapname);

                        console.log(`- base map: [${this.lfbmKeySel}]`)
                        localStorageH.setK('mapio/'+this.mapname+'/basemap/keySel', this.lfbmKeySel );

                        console.log(`- lat: [${this.confT1[0]['fields'][0]['text']}]`)
                        localStorageH.setK(this.settKey+'lat', this.confT1[0]['fields'][0]['text']);

                        console.log(`- lng: [${this.confT1[0]['fields'][1]['text']}]`)
                        localStorageH.setK(this.settKey+'lng', this.confT1[0]['fields'][1]['text']);

                        console.log(`- zoom: [${this.confT1[0]['fields'][2]['value']}]`)
                        localStorageH.setK(this.settKey+'zoom', this.confT1[0]['fields'][2]['value']);

                        console.log(`- min depth: `+this.depthSouningO.geoH.minDepth);
                        localStorageH.setK( 'geoHelper/'+this.mapname+'/minDepth', this.depthSouningO.geoH.minDepth );

                        console.log(`- min depth color: `+this.depthSouningO.geoH.minColor);
                        localStorageH.setK( 'geoHelper/'+this.mapname+'/minColor', this.depthSouningO.geoH.minColor );
                        
                        console.log(`- gridCellSize: `+this.depthSouningO.gridCellSize);
                        localStorageH.setK( 'depthSounding/'+this.mapname+'/gridCellSize', this.depthSouningO.gridCellSize );

                        console.log(`- presets: `,this.depthColPresConf);       
                        let tr = {
                            presets: this.depthColPresConf.presets,
                            selected: this.depthColPicApp._instance.ctx.$data.preselected_id,
                        };                        
                        console.log(`- presets: as json`,JSON.stringify(tr,null,4));

                        localStorageH.setK(this.settKey+'depthColPresets', JSON.stringify(tr) );
                        for(let preset of this.depthColPresConf.presets){
                            localStorageH.setK('depthColPreset/'+preset.name, JSON.stringify(preset) );
                        }

                        $.toast({
                            heading: 'Saved',
                            text: 'To local settings.',
                            icon: 'success'
                        });

                    });
                },500);




                // start div depth color picker 

                let divEl = $("#"+divColorPickerName);
                //depthSouningO: this.depthSouningO,
                //geoH: this.depthSouningO.geoH
                if( this.deCoPiAp === -1 )
                    this.deCoPiAp = createApp( DepthColorPicker, {
                        mapio:this
                    });

                //let depthColPresConf = JSON.parse(localStorageH.getK(this.settKey+'depthColPresets', JSON.stringify(
                this.depthColPresConf = {
                    presets: [
                        { id:0, name: 'yell-blue-whi', colorM: [ 
                            [0,  '#ffea6f'], [2.2,    '#73bcc7'], [10.0,    '#eef9fa'] ],
                            },
                        { id:1, name: 'red-2', colorM: [ 
                            [0,  '#ff0000'], [2.5,    '#ff2200'], [5.0,    '#dddd00'], [10.0,    '#eef9fa'] ],
                            }
                    ],
                    selected: 0,
                    mapio: this
                };
                console.log('depth color presets from locStoH1');
                let depthColPresConf_from_locStoH = localStorageH.getK(this.settKey+'depthColPresets', '' );
                console.log('depth color presets from locStoH2: ',depthColPresConf_from_locStoH);
                
                if( depthColPresConf_from_locStoH != '' ){
                    console.log('depth color presets from locStoH3 using from settings ....');
                    let j = JSON.parse( depthColPresConf_from_locStoH );
                    this.depthColPresConf['selected'] = j['selected'];
                    this.depthColPresConf['presets'] = j['presets'];
                    
                }
                for( let lsI of localStorageH.getStats()['keys'] ){
                    if( lsI.startsWith('depthColPreset/') ){
                        let lsV = JSON.parse(localStorageH.getK( lsI ));
                        
                        let lookForRes = this.depthSouningO.getPresetById( this.depthColPresConf['presets'], lsV.id );
                        if( lookForRes == undefined ){
                            console.log('preset in localstorage: '+lsI,'\n\nvOff',lsV,'\n\nlookFor',lookForRes);
                            console.log('not in local stack add ....');
                            this.depthColPresConf['presets'].push( lsV );
                        }

                    }
                }
                //)));
                if( this.depthColPicApp === -1 )
                    this.depthColPicApp = createApp( DepthColorsPreesets, this.depthColPresConf );

                setTimeout(()=>{
                    if(0){
                        console.log('color picker and preset second run .....', this.deCoPiAp,'\n\n',this.depthColPicApp);
                        try{
                            if( this.deCoPiAp['_instance']['isMounted'] ){

                                console.log('pre mount',this.deCoPiAp['_instance']);
                                this.deCoPiAp.unmount();
                                console.log('post mount',this.deCoPiAp['_instance']);
                                this.depthColPicApp.unmount();
                                console.log('unmount and clean ok');
                            }

                        }catch(e){
                            console.error('unmount and clean error \n',e);
                        }
                    }
                
                    setTimeout(()=>{
                        this.deCoPiAp.mount( "#"+divColorPickerName );
                        this.depthColPicApp.mount( "#presets"+divColorPickerName );
                        console.log('color picker mounted ....');
                        // to update if change by resume
                        //this.depthColPicApp._instance.ctx.onChange();
                    },1000);
                
                },100);



                // start div depth color picker  end 






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
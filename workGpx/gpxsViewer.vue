<template>
    
    <i class="fa-solid fa-eye-slash"></i>
    <i class="fa-solid fa-eye"></i>



    <div
        class="gsvDeb">
        gpxs [{{mapname}}] - action: ({{ actionNow }}) <br>
            srcType:({{ srcType }}) id: {{ idEdit }}<br>
        <hr>
    </div>

    <div class="gpxViewer" 
        v-if="actionNow == 'edit'">

    <div
        v-show="src0Expand == false"
        @click="src0Expand = true;setSrc0( source_id )"
        >
        <i class="fa-solid fa-caret-down"></i>
        <i class="fa-solid fa-file"></i>
        Source - id: {{ source_id }} 
        <hr>
    </div>

    <div 
        v-show="source_id != -1 && src0Expand == true"
        class="gsvSrc0">
        <div
            @click="src0Expand = false">
            <i class="fa-solid fa-caret-up"></i>
            <i class="fa-solid fa-file"></i>
            Source - id: {{ source_id }}
            <br>        
        </div>
        Name: <input type="text" 
            v-model="src0.name"/><br>
        Desc: <input type="text" 
            v-model="src0.desc"/><br>
        Src type: <input type="text" 
            v-model="src0.srcType"/><br>
        xmlSource: {{ src0More.xmlSource }}<br>
        Counts: 
            pois({{ src0More.waypointsc }}), 
            tracks({{ src0More.tracksc }}), 
            routes({{ src0More.routesc }})<br>
        Entry: {{ src0More.entryDate }}
        <!--
        -->
        <hr>
    </div>

    <div v-show="srcType=='waypoints'">
        <i class="fa-solid fa-location-dot"></i>
        Waypoint - id: {{ idEdit }}<br>
        
        <button 
            @click="handleItemClick('edit','waypoint',data.id)" title="Edit it"><i class="fa-solid fa-pencil"></i></button>
        <button 
            @click="handleItemClick('remove','waypoint',data.id)" title="Remove it"><i class="fa-solid fa-trash"></i></button>
        <button v-show="dataChanged"
            @click="handleItemClick('save','waypoint',data.id)" title="Save changes"><i class="fa-solid fa-floppy-disk"></i></button>
        <button v-show="dataChanged"
            @click="handleItemClick('reset','waypoint', data.id)" title="Cancel changes"><i class="fa-solid fa-delete-left"></i></button>
    
            <br>

        Name:<input type="text" 
            v-model="data.name" @change="onChangeValueInForm($event, data.name, 'name')"/><br>
        Lat:<input type="decimal" 
            v-model="data.lat" @change="onChangeValueInForm($event, data.lat, 'lat')"/><br>
        Lng:<input type="decimal" 
            v-model="data.lon" @change="onChangeValueInForm($event, data.lon, 'lng')"/><br>
        Sym:<input type="decimal" 
            v-model="data.sym"/><br>
        Desc:<input type="decimal" 
            v-model="data.desc" @change="onChangeValueInForm($event, data.desc, 'desc')"/><br>
    </div>

    <!--
        <div v-if="srcType =='waypoints'">
            
            <div v-for="v in src0.waypoints">
                <a :onclick="'gpxsManager.openInfoOf(\'waypoints\',\''+v.id+'\',\'moveMapTo\');'" 
                :title="'aInfo_waypoint_'+v.id"><i class="fa-solid fa-circle-info"></i></a>
                {{ v.id }} - {{ v.name }} 
            </div>
            
            
        </div>
    -->
        
    <div v-show="srcType=='routes'">
        <i class="fa-solid fa-shuffle"></i>
        Route - id: {{ idEdit }}<br>

        <button 
            @click="handleItemClick('edit','route',data.id)" title="Edit it"><i class="fa-solid fa-pencil"></i></button>
        <button 
            @click="handleItemClick('remove','route',data.id)" title="Remove it"><i class="fa-solid fa-trash"></i></button>
        <br>
        

        Name:<input type="decimal" 
            v-model="data.name"/><br>
        Desc:<input type="decimal" 
            v-model="data.desc"/><br>

        Length: {{ distToNiceStr( data ) }}<br>

        Points: ---
        
    </div>


    <div v-show="srcType=='tracks'">
        <i class="fa-solid fa-s"></i>
        Track - id: {{ idEdit }}<br>

        <button 
            @click="handleItemClick('edit','track',data.id)" title="Edit it"><i class="fa-solid fa-pencil"></i></button>
        <button 
            @click="handleItemClick('remove','track',data.id)" title="Remove it"><i class="fa-solid fa-trash"></i></button>
        
        <br>
        

        Name:<input type="decimal" 
            v-model="data.name" @change="onChangeValueInForm($event, data.name, 'name')"/><br>
        Desc:<input type="decimal" 
            v-model="data.desc" @change="onChangeValueInForm($event, data.desc, 'desc')"/><br>
        
        Length: {{ distToNiceStr( data ) }}
    </div>


    <div v-show="srcType=='points'">
        <i class="fa-solid fa-map-pin"></i>
        Point - id: {{ idEdit }}<br>
        Lat:<input type="decimal" /><br>
        Lng:<input type="decimal" /><br>
    </div>



    </div>

    <!--
    
    <div class="gpxViewer" 
        v-if="actionNow == 'gpxs view'">
        <h3>On map</h3>

        <i title="Find in gpx's"
            class="fa-solid fa-magnifying-glass"></i>
        <input type="text"
            v-model="nameFilter"
            @change="onChange_filterName()"
            ></input>

        <table style="width:100%;border:1px solid gray;">
            <tr>
                <td>Actions</td>
                <td>Name</td>
                <td>Sourc of gpx</td>
            </tr>
            <span v-for="lgpx in gpxs">
                <tr>
                    <td>
                        <section :id="lgpx.id+'_gpx'">{{ lgpx.id+'_gpx' }}</section>
                        id:{{lgpx.id}}
                    </td>
                    <td>{{lgpx.name}}</td>
                    <td>{{lgpx.xmlSource}}</td>
                </tr>
                <tr>
                    <td colspan="3"
                        @click="lgpx.tracks_expand = !lgpx.tracks_expand"
                        >
                        <i v-if="!lgpx.tracks_expand" class="fa-solid fa-caret-down" ></i>
                        <i v-else class="fa-solid fa-caret-up" ></i>

                        <i class="fa-solid fa-s"></i>Tracks: {{lgpx.tracks.length}}
                    </td>
                </tr>
                <tr v-if="lgpx.tracks_expand"
                    v-for="lt in lgpx.tracks">                        
                    <td>
                        <section :id="lgpx.id+'_track_'+lt.id">{{ lgpx.id+'_track_'+lt.id }}</section>
                        id:{{ lt.id }}</td>
                    <td></td>
                    <td></td>
                </tr>
                        
                <tr>
                    <td colspan="3"
                        @click="lgpx.routes_expand = !lgpx.routes_expand"
                        >
                        <i v-if="!lgpx.routes_expand" class="fa-solid fa-caret-down" ></i>
                        <i v-else class="fa-solid fa-caret-up" ></i>

                        <i class="fa-solid fa-shuffle"></i>Routes: {{lgpx.routes.length}}
                    </td>
                </tr>
                <tr v-if="lgpx.routes_expand"
                    v-for="lt in lgpx.routes">                        
                    <td>
                        <section :id="lgpx.id+'_route_'+lt.id">{{ lgpx.id+'_route_'+lt.id }}</section>
                        id:{{ lt.id }}</td>
                    <td></td>
                    <td></td>
                </tr>
                <tr>
                    <td colspan="3"
                        @click="lgpx.waypoints_expand = !lgpx.waypoints_expand"
                        >
                        <i v-if="!lgpx.waypoints_expand" class="fa-solid fa-caret-down" ></i>
                        <i v-else class="fa-solid fa-caret-up" ></i>

                        <i class="fa-solid fa-location-dot"></i>Waypoints: {{lgpx.waypoints.length}}
                    </td>
                </tr>
                <tr 
                    v-for="lt in lgpx.waypoints"
                    v-if="lgpx.waypoints_expand"
                    >                        
                    <td>
                        <section :id="lgpx.id+'_waypoint_'+lt.id">{{ lgpx.id+'_waypoint_'+lt.id }}</section>
                        id:{{ lt.id }}
                        <button title="fly to"
                            @click="flyTo('waypoint',lt.id, [lt.lat, lt.lon])"><i class="fa-solid fa-magnifying-glass"></i></button>
                        <div
                            v-if="(lt.name == nameFilter && nameFilter != '')"
                        >yes!</div>
                    
                    </td>
                    <td>
                        {{ lt.name }}
                    </td>
                    <td> {{ lt.lat }} <br> {{ lt.lon }}</td>
                </tr>
            </span>

        </table>
    </div>

    -->


    <div v-if="actionNow == 'gpxs view'">

        <div>
            <i title="Find in gpx's"
                class="fa-solid fa-magnifying-glass"></i>
            <input type="text"
                id="nameFilter"
                @change="onChange_filterName()"
                ></input>
        </div>
    </div>

    <span v-for="lgpx in sources" class="gpxViewer"
        v-if="actionNow == 'gpxs view'">

        <div v-if="nameFilterTest( {name:lgpx.name, desc:lgpx.xmlSource} )"
                class="gpxItemTypeHeader"
            >
            <section :id="lgpx.id+'_gpx'">{{ lgpx.id+'_gpx' }}</section>

            <button 
                @click="handleItemClick('remove','gpx',lgpx.id)" title="Remove it"><i class="fa-solid fa-trash"></i></button>

            id:{{lgpx.id}}
            - {{lgpx.name}}
            <br>
            <small>{{lgpx.xmlSource}}</small>
        
        </div>



        <div v-for="dType in doTypes">

            <div
                @click="lgpx[ dType.srcTypes+'_expand' ] = !lgpx[ dType.srcTypes+'_expand' ]"
                :class=" 'gpxType_'+dType.srcTypes "
                v-if="nameFilter == '' && getGpxTypeCountBySourcId( dType.srcTypes, lgpx.id ) > 0"
                >
                <i v-if="!lgpx[ dType.srcTypes+'_expand' ]" class="fa-solid fa-caret-down" ></i>
                <i v-else class="fa-solid fa-caret-up" ></i>


                <i :class=" dType.icon "></i>{{  dType.name }} - ( {{ getGpxTypeCountBySourcId( dType.srcTypes, lgpx.id ) }} )
            
            </div>
            
            <div v-if="lgpx[ dType.srcTypes+'_expand' ]" :class=" 'gpxType_'+dType.srcTypes ">                        
                <span v-for="lt in getGpxBySourceId( dType.srcTypes, lgpx.id ) ">

                    <div v-if="nameFilterTest( lt )"
                        class="gpxItemCell">
                        <section :id="lgpx.id+'_'+dType.srcType+'_'+lt.id">{{ lgpx.id+'_'+dType.srcType+'_'+lt.id }}</section>
                        

                        <button 
                            v-if=" dType.srcType == 'waypoint'"
                            title="fly to"
                            @click="flyTo( dType.srcType ,lt.id, [lt.lat, lt.lon])"><i class="fa-solid fa-magnifying-glass"></i></button>

                        <button 
                            v-else-if=" dType.srcType == 'route' || dType.srcType == 'track'"
                            title="fly to"
                            @click="flyTo( dType.srcType ,lt.id, lt.points)"><i class="fa-solid fa-magnifying-glass"></i></button>


                        <button 
                            @click="handleItemClick('edit',dType.srcType,lt.id)" title="Edit it"><i class="fa-solid fa-pencil"></i></button>
                        <button 
                            @click="handleItemClick('remove',dType.srcType,lt.id)" title="Remove it"><i class="fa-solid fa-trash"></i></button>



                        
                        id:{{ lt.id }} - {{ lt.name }}

                        <small v-if=" dType.srcType == 'waypoint'">
                            <br><img :src=" getIcon( lt ) " :title="lt.sym"
                                class="iconViewInSpot">
                            <br>{{ lt.lat }} , {{ lt.lon }}

                        </small>

                        <small v-else-if=" lt.points != undefined && ( dType.srcType == 'route' || dType.srcType == 'track' )">
                            <br>Points: {{ lt.points.length }}</br>
                            <br>Distance: {{ distToNiceStr( {'distance':lt.distance} ) }}
                        </small>
                        
                        <div :id=" 'ei_'+lgpx.id+'_'+dType.srcType+'_'+lt.id "></div>


                    </div>
                
                </span>
            </div>
            
            
            
            
        </div>

    </span>




 <hr>
    TODO:<br>
    <button>Export current view</button>
<hr>
    
    

<div 
    v-if="actionNow == 'import gpx' || actionNow == 'importing gpx' ">
    <h3>Import *.gpx file</h3>
    Description:
    <input type="text" 
        id="importFileDesc"/><br>
    File:<br></br>
    <small>Select file *.gpx on your device for importing:</small><br>
    <input type="file"
        id="importFileField" 
        @change="onChangeImportFileformFileSelected()"/><br>


    <div v-if="impGp != null  && actionNow != 'importing gpx' "
        class="impGpxInfo">
        File information:<br>
        tracks: ({{ impGp.tracks.length }})<br>
        routes: ({{ impGp.routes.length }}) <br>
        waypoints: ({{ impGp.waypoints.length }})<br>

        <button title="Import"
            @click="startImportFile_fromForm()"><i class="fa-solid fa-file-import"></i></button>
    </div>

    <div v-if=" actionNow == 'importing gpx' ">
        Import in progress ...
    </div>

</div>
<button 
    @click="startImportFile()"
    v-else-if="actionNow != 'import gpx'"
    >Import *.gpx</button>

<br><br><br><br><br><br>



</template>
<script>
import { ref,toRaw,createApp } from 'vue'
import { gpxParser } from './gpxParser.js';
import GpxItemView from './gpxItemView.vue';


export default{
    data(){
        return{
            mapname: '',
            gpxsManager:null,
            source_id: ref(-1),
            actionNow:'',
            srcType:'',
            dataChanged: false,
            idEdit:-1,
            data: ref(-1),
            layer: toRaw(-1),
            nameFilter: '',
            gpxs:ref(null),
            sources: ref(null),
            doTypes:[
                { name: 'Tracks', srcTypes: 'tracks',  srcType: 'track',   icon: 'fa-solid fa-s'},
                { name: 'Routes', srcTypes: 'routes',   srcType: 'route',   icon: 'fa-solid fa-shuffle'},
                { name: 'Waypoints', srcTypes: 'waypoints',  srcType: 'waypoint',  icon: 'fa-solid fa-location-dot'},
            ],
            src0: ref({}), src0Expand: false,
            src0More: { 'xmlSource':'', 'waypointsc':0,'tracksc':0,'routesc':0,'entryDate':''},
            orgData:toRaw({ layer: null, data:null, srcType: '', srcTypes: '', id: -1, source_id:-1 }),
            impGp: null,
            impStatus: null,

            listitem_seleced: -1,
            gItemView: null,
        };
    },
    mounted(){
        console.log('gpxs viewer on mounted .....');
        window['gpxsVSrcLooking'] = false;
    },
    computed:{
    },
    methods:{

        getGpxTypeCountBySourcId( srcTypes, source_id ){
            let r = this.getGpxBySourceId( srcTypes, source_id );
            return r.length;
        },
        getGpxBySourceId( srcTypes, source_id ) {
            let tr = [];
            for(let i of this.gpxs[ srcTypes ] ){
                if( i.source_id == source_id )
                    tr.push( i );
            }
            return tr;
        },

        nameFilterTest( gpxItem ){            
            //console.log('nameFilter Test to ',gpxItem['name'], ' and ',this.nameFilter);
            if( this.nameFilter == ''  )
                return true;
            if( gpxItem.name == null )
                return false;
            if( gpxItem.name.toUpperCase().indexOf( this.nameFilter.toUpperCase() ) != -1 )
                return true;
            return false;
        },
        onChange_filterName(){
            this.nameFilter = $('#nameFilter').val();
            console.log(' on change - filter name : ['+this.nameFilter+']');
            let setAs = ( this.nameFilter != '' );
            for( let g of this.sources ){
                g['tracks_expand'] = setAs;
                g['routes_expand'] = setAs;
                g['waypoints_expand'] = setAs;
            }
                
        },

        listitem_CleanSelected(){
            this.gItemView.unmount();
            this.gItemView = null;
            this.listitem_seleced = -1;

        },
        listitem_NowSelected( layer, srcType, id, latlng ){
            if( this.listitem_seleced != -1 ){
                console.log('Li now selected - need to clean ....');
                this.listitem_CleanSelected();
            }

            let items = gpxsCDB.gpx[ `${srcType}s` ].filter( item => item.id == id );
            let source_id = -1;
            if( items.length != 1 ){
                console.error(' to many elements fount !!!!');
                return 1;
            }else{
                source_id = items[0].source_id;
            }
            let divName = 'ei_'+source_id+'_'+srcType+'_'+id;
            this.listitem_seleced = divName;

            let dataToPass =  {
                srcType: srcType, id:id, latlng:latlng,
                item: items[0],
                gpxsManager: this.gpxsManager
            };
            console.log('Li now selected - go go .... divName: ',divName,
                '\ndata to pass:\n',dataToPass
            );
            this.gItemView = createApp( GpxItemView,dataToPass);
            this.gItemView.mount( `#${divName}` );



        },

        flyTo( srcType, id, latlng ){
            console.log('flyTo ['+this.mapname+'] srcType:['+srcType+'] id:['+id+'] ', latlng);
            
            let actionStatus = this.gpxsManager.actionStatus;
            if( actionStatus == 'open')
                this.gpxsManager.$data.actionStatus = 'selected';
            else if( actionStatus == 'selected')
                this.gpxsManager.$data.actionStatus = 'selected';
            else
                this.gpxsManager.$data.actionStatus = 'NaN - state #23';


            if( srcType == 'waypoint'){
                this.gpxsManager.mapio.map.flyTo( L.latLng( latlng ), 15 );
            
            }else{
                let mmlat = this.findMinMax( latlng, 'lat');
                let mmlon = this.findMinMax( latlng, 'lon');
                console.log('   ... border \n',mmlat,'\n',mmlon);
                let b = L.latLngBounds(
                    L.latLng( mmlat.min, mmlon.min ),
                    L.latLng( mmlat.max, mmlon.max )
                );
                this.gpxsManager.mapio.map.flyToBounds( b, {maxZoom:16} );

            }

            let tr = this.gpxsManager.findLayerInJGeo( srcType, id );
            console.log('   ... found in geo json ',tr);
            if( tr.length == 1 ){
                this.gpxsManager.makeLayerSelected( tr[0] );
                this.listitem_NowSelected( tr[0], srcType, id, latlng );
                //this.gpxsManager.makeLayerPopupOpen( tr[0] );
            }
        },
        getIcon( lt ){
            let icon = this.gpxsManager.getIcon( lt.sym );
            //console.log(icon);
            return icon.options.iconUrl;
        },
        startImportFile(){
            console.log('start import file');
            this.actionNow = 'import gpx';
        },
        onChangeImportFileformFileSelected(){
            console.log('file selected ....');
            this.makeGpxFromFormFileSelected();
        },
        onFileInGpx( gpx ){
            console.log(' file in gpx \n',gpx);
            this.impGp = gpx;
        },
        makeGpxFromFormFileSelected(){
            this.impGp = null;
            let fHandler = $('#importFileField')[0].files[0];
            if( !fHandler ) return -1;

            const reader = new FileReader();
            let eDesc = $('#importFileDesc').val();

            reader.onload = (e) => {
                let gpxStr = e.target.result;
                let gp = new gpxParser();
                let tmapname = this.mapname;
                gp.parse( gpxStr );
                gp['extraDesc'] = eDesc;
                gp['src'] = [ 
                    localStorageH.getK('device/location'), 
                    localStorageH.getK('device/name'),
                    this.mapname ];
                gp['entryDate'] = parseInt( Date.now() );
                gp['fileName'] = fHandler.name;
                console.log('so imported gpx is \n',gp);
                this.onFileInGpx( gp );
            };
            reader.readAsText(fHandler);

        },
        startImportFile_fromForm(){
            let eDesc = $('#importFileDesc').val();

            console.log('start import file - from form to gpx and db .....',
                '\nfile field: ',$('#importFileField'),
                '\nExtra desc: ',eDesc
            );
            if( this.impGp == null  ) return -1;
            this.actionNow = 'importing gpx';
            this.impStatus = null;
            let tmapname = this.mapname;

            fetch( '/apis/mapleaflet/gpxQ/importFromPost',{
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.impGp)
            } ).then( ( r )=>{

                r.json().then((j)=>{
                
                    console.log('   ... fetch DONE ',j);
                    if( 'status' in j && j.status == 'ok' ){
                        $.toast({
                            heading: 'Info',
                            text: 'Import DONE !'                            
                        });
                        this.startEdit( tmapname, 0, 0 );


                    }
                });


            });

           

            console.log('   .. reader is DONE');

        },
        gpxsSetExpandSet(){
            //let tr = [];
            this.sources = gpxsCDB.sources;
            for( let g of this.sources ){
                //console.log('    ... gpxs ...',g);
                g['tracks_expand'] = false;
                g['routes_expand'] = false;
                g['waypoints_expand'] = false;
                //tr.push( g );
            }
            this.gpxs = gpxsCDB.gpx;
        },
        onDataChange(){
            this.dataChanged = true;
        },
        onChangeValueInForm( e = '', value='',whatChange){
            console.log(`on change [${whatChange}]value in form `,e ,'\nvalue:',value);
            let prop = -1;
            if ( this.layer != undefined || this.layer.feature == undefined ){
                console.error( 'error onChangeValueInForm',
                    '\nlayer: ',this.layer,
                    '\n\nfeature',this.layer.feature
                 );
                //return 1;
            }


            if( this.srcType == 'waypoints' ){
                prop = this.layer.feature.properties;

            }else if( this.srcType == 'tracks' ){
                prop = this.layer.feature.geometry.properties;
            }

            if( ['lat', 'lng','lon'].indexOf( whatChange) != -1 ){
                this.layer.setLatLng([this.data.lat, this.data.lon]);
                this.gpxsManager.mapio.map.flyTo([this.data.lat, this.data.lon]); 
            
            } else if( whatChange == 'name'){
                console.log('  \\_ name ',this.layer);
                prop.name = this.data.name;
                
                let trP = this.gpxsManager.makeBindPopup( this.layer );
                toRaw(this.layer).bindPopup( toRaw(trP) ).openPopup();

            }else if( whatChange == 'desc'){
                console.log('  \\_ desc ',this.layer);
                prop.desc = this.data.desc;

                let trP = this.gpxsManager.makeBindPopup( this.layer );
                toRaw(this.layer).bindPopup( toRaw(trP) ).openPopup();
            }
            
            if( 'bindEditCircle' in this.layer ){
                this.layer['bindEditCircle'].setLatLng( this.layer['_latlng'] );
            }
            this.onDataChange();
        
        },
        handleItemClick( action, srcType, id ) {
            //this.gpxsManager.handleItemClick( action, srcType, id );

            let tNow = gpxsCDB.getEntryDate();
            if( action == 'remove' && srcType == 'gpx' ){
                let gsrc = gpxsCDB.sources.filter(s=>s.id == id )[0];
                /// confirmation 
                let r = confirm(`Delete gpx id: ${id} \n`+
                    `\t${gsrc.name}\n\t${gsrc.srcType}\n\nwith all:\n`+
                    `\t- tracks\n\t- waypoints\n\t- routes`);
                console.log('Q: ',r);
                if( r == false ) return 1;
            }

            gpxsCDB.onAction({ 
                action: action, 
                srcType: srcType, 
                id: id,
                //data: toRaw( action == 'reset' ? this.orgData.data : this.data ),
                entryDate: tNow
                });


            /*
            let srcTypes = `${srcType}s`;
            let ir = gpxsCDB.findIndexInGpx( srcTypes, id );
            let gpxI = ir['gpxIndex'];
            let itemI = ir['itemIndex'];
            q2.emit( 
                    'and/mapioGpxsManager/gpxs/action',
                { action: action, src: [q2.getName(), this.mapname],
                    gpxIndex:gpxI, srcTypes:srcTypes, srcType: srcType, itemIndex: itemI,
                    data: toRaw( action == 'reset' ? this.orgData.data : this.data ),
                    entryDate: parseInt( Date.now() )
                 });
                 */
            

        },
        /*
        resetThisOne( srcType, source_id ){},
        saveThisOne( srcType, source_id ){},
        editThisOne( srcType, source_id){
            gpxsManager.editThisOne(srcType,source_id);
        },
        removeThisOne( srcType, source_id){
            gpxsManager.removeThisOne(srcType,source_id);
        },
        */
        getEntryFromTimeStamp( sid ){
            if(  this.setSrc0( sid ) ){
                return new Date( this.src0.entryDate );
            } else {
                return '-';
            }
        },
        setSrc0( sid ){
            if( window['gpxsVSrcLooking'] == true ) return false;
            
            if( this.src0 == {} ){
                console.log(' setSrc0 .... is running ',sid); 
                return false;   
            }
            //console.log(' setSrc0 .... ',sid);
            if( sid == -1 ) return false;
            //this.src0 = -1;
            window['gpxsVSrcLooking'] = true;
            for( let s of this.gpxsManager.$data.gpxs ){
                if( s.id == sid ){
                    this.src0 = JSON.parse(JSON.stringify(s));
                    //console.log('  .... setSrc0: ',s);
                    window['gpxsVSrcLooking'] = false;
                    this.src0More.xmlSource = this.src0.xmlSource;
                    this.src0More.tracksc = this.src0.tracks.length;
                    this.src0More.routesc = this.src0.routes.length;
                    this.src0More.waypointsc = this.src0.waypoints.length;
                    this.src0More.entryDate = new Date( this.src0.entryDate );
                    return true;
                }
            }

            window['gpxsVSrcLooking'] = false;
            return false;
        },
        getSourceCount( sid, keyn ){
            if(  this.setSrc0( sid ) ){
                return this.src0[ keyn ].length;
            } else {
                return '-';
            }
        },
        getSourceValue(sid, keyn ){
            if( this.setSrc0( sid ) ){
                return this.src0[ keyn ];
            }else
                return '-';
        },
        distToNiceStr( da ){
            //console.log('distToNiceStr: ', da.distance);            
            return gpxsManager.utilsdistanceToNice( parseFloat( da.distance ) );
        },
        findMinMax( dataTo, indexToLook ){
            let min = -1
            let max = -1
            let i = 0
            for(let d of dataTo){
                if( i == 0 ){
                    min = d[ indexToLook ];
                    max = d[ indexToLook ];
                    i = 1;
                }else{
                    if( min > d[ indexToLook ] )
                        min = d[ indexToLook ];
                    if( max < d[ indexToLook ] )
                        max = d[ indexToLook ];
                }
            }
            return {
                'min': min, 'max': max
            };
        },

        startEdit( mapname, srcType, id ){

            console.log(`gpx'sVie . startEdit \n\tmapname: ${mapname} \n\tsrcType: ${srcType} \n\tid: ${id}`);
            this.mapname = mapname;
            this.gpxsManager = mapioByName[ mapname ].gpxsManager._instance.ctx;
            
            if( srcType == 0 && id == 0 ){
                this.gpxsSetExpandSet();
                this.actionNow = 'gpxs view';
                return 1;
            }


            this.actionNow = 'edit';


            let itemRes = gpxsCDB.findIndexInGpx( srcType, id );
                //this.gpxsManager.findIndexItemInGpxs( srcType, id );
            console.log('start Edit pre \n',itemRes);


            this.srcType = srcType;
            this.idEdit = id;
            this.data = gpxsCDB.gpxs[ itemRes.gpxIndex ][ srcType ][ itemRes.itemIndex ];
            console.log('start Edit - looking for '+srcType+' .... '+id,
                '\n so data:\n',this.data
            );
            this.orgData.data = JSON.parse(JSON.stringify(toRaw( this.data )));
            this.orgData.srcType = `${srcType}`;
            this.orgData.id = parseInt(this.data.id);
            
            if( this.data == -1 ){
                console.log('error was not able to find object in gpxs ',this.gpxsManager.$data.gpxs);
                return 1;
            }

            if( 'source_id' in this.data ){
                this.source_id = this.data.source_id;
                this.orgData.source_id = parseInt( this.source_id );
                this.setSrc0( this.source_id );
            } else
                this.source_id = -1;


            console.log('gpxsV - startEdit '+srcType+' id:'+id,
                '\n',this.data
            );

            let srcT = srcType.substring(0,srcType.length-1);
            this.layer = toRaw(this.gpxsManager.findLayerInJGeo( srcT, id ));
            if( this.layer.length != 1 ){
                console.error('error got more then one layer !');
                return 1;
            }
            this.layer = toRaw( this.layer[0] );
            this.orgData.layer = toRaw( this.layer[0] );
            //console.log('gpxsVSrc layer ....',this.layer);
            //console.log('gpxsVSrc layer ....',this.layer);
        }
    }

}

</script>
<style>
.gsvDeb{
    background-color: rgb(206, 132, 132);
}

.gsvSrc0{
    background-color: rgb(221, 238, 178);
}

.gpxViewer button{
    padding: 5px;
    margin: 2px;
}

.gpxViewer section{
    font-size:50%;
}

.impGpxInfo{
    border-radius: 3px;
    border: solid 1px gray;
    background-color: lavender;
}


.gpxType_tracks{
    background-color: rgb(235, 164, 164);
}

.gpxType_routes{
    background-color: rgb(154, 167, 218);
    
}
.gpxType_waypoints{
    background-color: rgb(189, 214, 154);
}

.gpxItemTypeHeader{
    background-color: rgb(250, 245, 236);
    border-top: 10px double orange;
}
.gpxItemCell{
    border: 1px gray solid;
}
.gpxItemCellSelected{
    border: 1px gray solid;
    background-color: rgb(189, 223, 178);
}
.iconViewInSpot{
    object-position: center;
    object-fit: none;
    object-view-box: xywh(10px 10px);
    border-radius: 3px;
    width: 36px;
    height: 36px;
    border: 1px solid gray;
    background-color: rgb(158, 209, 227);
}
</style>
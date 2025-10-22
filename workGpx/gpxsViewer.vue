<template>
    
    <div
        class="gsvDeb">
        gpxs [{{mapname}}] - {{ actionNow }} ({{ srcType }}) id: {{ idEdit }}<br>
        <hr>
    </div>

    <div class="gpxViewer">

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



</template>
<script>
import { ref,toRaw } from 'vue'
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
            src0: ref({}), src0Expand: false,
            src0More: { 'xmlSource':'', 'waypointsc':0,'tracksc':0,'routesc':0,'entryDate':''},
            orgData:toRaw({ layer: null, data:null, srcType: '', srcTypes: '', id: -1, source_id:-1 })
        };
    },
    mounted(){
        console.log('gpxs viewer on mounted .....');
        window['gpxsVSrcLooking'] = false;
    },
    computed:{
    },
    methods:{
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

            let srcTypes = `${srcType}s`;
            let ir = this.gpxsManager.findIndexItemInGpxs( srcTypes, id );
            let gpxI = ir['gpxIndex'];
            let itemI = ir['itemIndex'];
            q2.emit( 
                'and/mapioGpxsManager/gpxs/action',
                { action: action, src: [q2.getName(), this.mapname],
                    gpxIndex:gpxI, srcTypes:srcTypes, srcType: srcType, itemIndex: itemI,
                    data: toRaw( action == 'reset' ? this.orgData.data : this.data ),
                    entryDate: parseInt( Date.now() )
                 });


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
        startEdit( mapname, srcType, id ){
            this.mapname = mapname;
            this.gpxsManager = mapioByName[ mapname ].gpxsManager._instance.ctx;
            this.actionNow = 'edit';


            let itemRes = this.gpxsManager.findIndexItemInGpxs( srcType, id );
            console.log('start Edit pre \n',itemRes);


            this.srcType = srcType;
            this.idEdit = id;
            console.log('start Edit - looking for '+srcType+' .... '+id);
            this.data = -1;
            for( let g of this.gpxsManager.$data.gpxs ){
                for( let o of g[ srcType ] ){
                    if( o.id == id ){
                        this.data = JSON.parse(JSON.stringify(o));
                        this.orgData.data = JSON.parse(JSON.stringify(toRaw( o )));
                        this.orgData.srcType = `${srcType}`;
                        this.orgData.id = parseInt(o.id);
                        break;
                    }
                }
                if( this.data != -1 )
                    break;
            }
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
</style>
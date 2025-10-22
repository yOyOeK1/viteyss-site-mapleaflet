<template>gpx's manager .vue
    <button onclick="gpxsManager.openInfoOf('waypoints','1');">opW1</button>
</template>
<script>
import { ref, createApp, toRaw } from 'vue';
import { gpxParser } from './gpxParser.js';
import GpxsViewer from './gpxsViewer.vue';
//import gpxParser from 'gpxparser'

export default{
    props:[ 'mapio' ],
    data(){
        console.log('gpx\'s ... data ');
        return {
            inOverlay: false,
            gpxs: [],
            gpxsEntryDate: ref(-1),
            lgeojson: toRaw(-1),
            lines:[],
            markers:[],
            gpxsEditor: ref(Object()),
            editCircle: -1,
            isEditorRunning: false,

            bUnit_dist: localStorageH.getK('bUnit_dist', 'metric - km / m / cm'),
        };
    },
    mounted(){
        console.log('gpx\'s ... mounted ');

        window['gpxsManager'] = this;

        this.mountAsOverlay();
        this.getAllFromHost();
        
        

    },
    methods:{
        
        gpxsOlder( srcGpxs, iEntryDate ){
            if( parseInt( iEntryDate ) > parseInt( srcGpxs ) )
                return true;
            return false;
        },
        q2_register(){
            setTimeout(()=>{
                q2.on( 'meDebug'+this.mapio.mapname, 'and/mapioGpxsManager/gpxs/action', this.q2_doMyCallBack );
            },100);
        },
        q2_doMyCallBack(t,p){
            let srcMe = [q2.getName(), this.mapio.mapname];
            console.log(`q2 -> gpxsManager [`,srcMe,`] topic:`+t,'\npayload: ',p,
                '\nthis entryDate:',this.gpxsEntryDate
            );
            if( this.inOverlay == false ) return 1;

            let haveEntryDate = false;
            if( 'entryDate' in p ){
                haveEntryDate = true;
                let tIsIn = '?';
                let ged = parseInt( window['gpxsEntryDate'] );
                let ied = parseInt( p['entryDate'] );
                let ted = parseInt( this.gpxsEntryDate );
                if( ied == ted )
                    tIsIn = 'same';
                else if( ied > ted )
                    tIsIn = 'new';
                else
                    tIsIn = 'old';

                console.log('   msg have time stamp: '+ied+'    to '+ted,
                    '\n\tis to local ['+tIsIn+']: '+(ied-ted)+
                    '\n\tis to global ['+tIsIn+']: '+(ied-ged)
                );

            }


            if( typeof(p) == 'string' ||
                typeof(p) == 'number' ||
                !( 'src' in p ) ||
                !( 'action' in p ) ||
                p == '?' 
            ){
                console.log('q2 -> gpxsManager $ [?] try one more time?\n\n',p,'\n\n.....................');
                return 1;
            }

            if( 'src' in p && 'action' in p && 
                p.action == 'dbUpdated' 
            ){
                console.log(' .... db updated msg OK TODO');

                if( p.orgData.action == 'remove' && p.orgData.srcType == 'waypoint' ){
                    if( this.gpxsOlder( gpxsEntryDate, p['entryDate']) ){
                        //window['gpxs'][ p['gpxIndex'] ][ p['srcTypes'] ].push( data );
                        //window['gpxsEntryDate'] = p['entryDate'];
                        window['gpxs'][ p.orgData['gpxIndex'] ][ p.orgData['srcTypes'] ].splice( p.orgData['itemIndex'], 1 );
                        window['gpxsEntryDate'] = p['entryDate'];
                        
                    }
                } else if( p.msgRes == 'saved' && p.orgData.srcType == 'waypoint' ){
                    if( this.gpxsOlder( gpxsEntryDate, p['entryDate']) ){
                        //window['gpxs'][ p['gpxIndex'] ][ p['srcTypes'] ].push( data );
                        //window['gpxsEntryDate'] = p['entryDate'];
                        window['gpxs'][ p.orgData['gpxIndex'] ][ p.orgData['srcTypes'] ][ p.orgData['itemIndex'] ] = p['orgData']['data'];
                        window['gpxsEntryDate'] = p['entryDate'];
                        
                    }
                }



            }else if( srcMe[0] == p['src'][0] && srcMe[1] == p['src'][1] ){
                console.log(' ... qq2 for me ! :)');


                if( p['action'] == 'reset' ){
                    this.q2_action_reset( p );
                }else if( p['action'] == 'save' ){
                    this.q2_action_save( p );
                }


            }else{
                console.log(' ... qq2 for others ! :)');
                
                if( p['action'] == 'save' ){
                    this.q2_action_remove( p );
                    this.gpxsEntryDate-=10;
                    this.q2_action_insert( p );
                }

            }

            if( p['action'] == 'remove' ){
                this.q2_action_remove( p );

            }
        
        },
        q2_action_insert( p ){
            console.log('       ...insert');
            let srcType = p['srcTypes'].substring(0, p['srcTypes'].length-1 );
            let data = p['data'];

            if( this.gpxsOlder( this.gpxsEntryDate, p['entryDate']) ){
                this.gpxs[ p['gpxIndex'] ][ p['srcTypes'] ].push( data );
                this.gpxsEntryDate = p['entryDate'];
            }
            //window['gpxs'][ p['gpxIndex'] ][ p['srcTypes'] ].push( data );
            //window['gpxsEntryDate'] = p['entryDate'];

            this.insertGpxsDataTo_lgeojson( srcType, data );
            //this.openInfoOf( p['srcTypes'], data['id'],  p['src'][1], 'moveMapTo' );
        },
        q2_action_remove( p ){
            console.log(' ....  all.mapios      ...remove');
            let srcType = p['srcTypes'].substring(0, p['srcTypes'].length-1 );
            this.removeGpxsDataTo_lgeojson( srcType, p['data']['id'] );

            if( this.gpxsOlder(  this.gpxsEntryDate, p['entryDate']) ){
                this.gpxs[ p['gpxIndex'] ][ p['srcTypes'] ].splice( p['itemIndex'] , 1 );
                this.gpxsEntryDate = p['entryDate'];
            }
            //window['gpxs'][ p['gpxIndex'] ][ p['srcTypes'] ].splice( p['itemIndex'], 1 );
            //window['gpxsEntryDate'] = p['entryDate'];

        },
        q2_action_save( p ){
            console.log('       ...save');
            let data = p['data'];

            if( this.gpxsOlder(  this.gpxsEntryDate, p['entryDate']) ){
                this.gpxs[ p['gpxIndex'] ][ p['srcTypes'] ][ p['itemIndex'] ] = data;
                this.gpxsEntryDate = p['entryDate'];
            }
            //window['gpxs'][ p['gpxIndex'] ][ p['srcTypes'] ][ p['itemIndex'] ] = data;
            //window['gpxsEntryDate'] = p['entryDate'];
        },
        q2_action_reset( p ){
            console.log('       ...reset');                    
            let srcType = p['srcTypes'].substring(0, p['srcTypes'].length-1 );
            let data = p['data'];
            
            this.removeGpxsDataTo_lgeojson( srcType, data['id'], false );

            if( this.gpxsOlder( this. gpxsEntryDate, p['entryDate']) ){
                this.gpxs[ p['gpxIndex'] ][ p['srcTypes'] ][ p['itemIndex'] ] = data;
                this.gpxsEntryDate = p['entryDate'];
            }

            this.insertGpxsDataTo_lgeojson( srcType, data );
            this.openInfoOf( p['srcTypes'], data['id'],  p['src'][1], 'moveMapTo' );

        },

        findLayerInJGeo(srcType, id){
            let tr = [];
            let lgeo = toRaw(this.lgeojson);
            if( lgeo == -1 ){
                return [];
            }
            //console.log('lgeo',lgeo);
            lgeo.eachLayer(function(layer) {
                //console.log("Feature", layer.feature);
                if(
                    ( 'geometry' in layer.feature &&
                        'properties' in layer.feature.geometry &&
                        layer.feature.geometry.properties.type == srcType &&
                        layer.feature.geometry.properties.id == id
                    ) || (
                    layer.feature.properties.type == srcType &&
                    layer.feature.properties.id == id )
                 ){
                    //console.log("Feature", layer.feature.properties.type, layer.feature.properties.id);
                    tr.push( toRaw(layer) );
                }
            });
            return tr;
        },
        findIndexItemInGpxs( srcType, id ){
            let tr = [];
            if( srcType == 'gpx' ){
                 for( let i=0,ic=this.gpxs.length; i<ic; i++ ){
                    g = this.gpxs[ i ];
                    if( g.id == id ){
                        return i;
                    }
                }
            } else if( ['tracks','waypoints','routes'].indexOf( srcType) != -1 ){
                for( let gi=0,gic=this.gpxs.length; gi<gic; gi++ ){
                    for( let ii=0, iic=this.gpxs[gi][ srcType ].length; ii<iic; ii++ ){
                        if( this.gpxs[gi][ srcType ][ ii ].id == id ){
                            return { gpxIndex: gi, itemIndex: ii };
                        }
                    }
                }
            } else {
                console.info('find index item in gpx got wrong srcType ...',srcType,'   id:',id);
            }

            return -1;
        },


        handleData_windowGpxsChange( action, srcType, id ){
            console.log('handleData - window gpxs change', 
                '\naction:  ',action,
                '\nsrcType: ',srcType,
                '\nid:      ',id)   ;
        },
       
        handleItemClick( action, srcType, id ) {
            console.log('handleItemClick Item clicked:', 
                '\naction:  ',action,
                '\nsrcType: ',srcType,
                '\nid:      ',id)   ;
            // Perform actions based on the data received from the child

            if ( action == 'reset' && srcType == 'waypoint'){
                let ir = this.findIndexItemInGpxs( `${srcType}s`, id );
                let data = toRaw( this.gpxsEditor._instance.ctx.$data.orgData['data'] );
                
                //console.log('index look res     new .   src:',ir['gpxIndex'],' item:',ir['itemIndex'] );

                this.removeGpxsDataTo_lgeojson( srcType, id, true );
                this.gpxs[ ir['gpxIndex'] ][`${srcType}s`][ ir['itemIndex'] ] = data;

                this.insertGpxsDataTo_lgeojson( srcType, data );

                this.openInfoOf( `${srcType}s`, data.id,  this.mapio.mapname, 'moveMapTo' );
            }

        },



        insertGpxsDataTo_lgeojson( srcType,data ){
            let mGpx = new gpxParser();
            mGpx[`${srcType}s`].push( data ); 
            let mjGeo = mGpx.toGeoJSON();
            toRaw(this.lgeojson).addData( mjGeo );
        },
        removeGpxsDataTo_lgeojson(srcType, id, closePanelAtEnd = true){
            let tr = this.findLayerInJGeo( srcType, id );

            console.log('remove this ones ',tr.length);
            if( tr.length > 0 ){
                toRaw(this.lgeojson).closePopup();
            }

            for( let l of tr )
                toRaw(this.lgeojson).removeLayer( toRaw(l) );

            if( closePanelAtEnd )
               setOpts.methods.closePanel();

        },
         // need to be change
        editThisOne(srcType, id){
            let tr = this.findLayerInJGeo( srcType, id );
            if( tr.length == 1 ){
                console.log('set lEdit to ',srcType, ' id ',id);
                window['lEdit'] = tr[0];
            }

        },
        
        utilsdistanceToNice( distance ){
            //console.log('utilsdistanceToNice: ',distance);
            let unit = 'm';
            if( this.bUnit_dist.startsWith('metric') ){
                if( distance> 1000.00 ){
                    distance/=1000.00
                    unit = 'km';
                }else{
                    unit = 'meters'
                }
                return distance.toFixed(2)+' ['+unit+']';

            }else{
                return distance.toFixed(4)+' [meters]';
            }

        },
        mountAsOverlay(){
            console.log('gpx\'s mount As overlay .....');
            this.myOverlay = L.marker([0,0],{opacity:0.0});
            toRaw(this.mapio.control).addOverlay( toRaw(this.myOverlay), 'Gpx\'s overlay' );
            let tmap = toRaw( this.mapio.map );
            toRaw(this.myOverlay).addTo( tmap );
            this.inOverlay = true;
           
        
            tmap.on('overlayadd',(e='')=>{
                if( e.name == 'Gpx\'s overlay' ){
                    console.log('overlay added of gpx\'s manager ....');
                    this.inOverlay = true;
                    this.getAllFromHost();
                }
            });
            tmap.on('overlayremove',(e='')=>{
                if( e.name == 'Gpx\'s overlay' ){
                    console.log('overlayr emove of gpx\'s manager ....',e);
                    this.destroyGeoJsonOverlay();
                    this.inOverlay = false;
                }
            });

        },
        destroyGeoJsonOverlay(){
            if( this.inOverlay == true ){
                this.lgeojson.remove( toRaw(this.mapio.map) );
                this.lgeojson = null;
                this.gpxs = null;
                this.gpxsEntryDate = -1
            }
        },
        getIcon(name){
            var icons = {
                'share': L.icon({
                    iconUrl: this.mapio.homeUrl+'assets/mapMarkers/marker-icon-share.png', // Replace with your green marker image path
                    shadowUrl: this.mapio.homeUrl+'assets/mapMarkers/marker-shadow.png', // Replace with your shadow image path
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                }),
                'anchorage':L.icon({
                    iconUrl: this.mapio.homeUrl+'assets/mapMarkers/markicons/2st-Anchorage.svg', // Replace with your green marker image path
                    iconSize: [21, 23],
                    iconAnchor: [10, 11],
                    popupAnchor: [0,-5],
                    shadowUrl: this.mapio.homeUrl+'assets/mapMarkers/marker-shadow.png', // Replace with your shadow image path
                    shadowSize: [21, 21],
                    shadowAnchor:[2,11]
                }),
                'anchorage-green': L.icon({
                    iconUrl: this.mapio.homeUrl+'assets/mapMarkers/ink-marker-anchorage.png', // Replace with your green marker image path
                    shadowUrl: this.mapio.homeUrl+'assets/mapMarkers/marker-shadow.png', // Replace with your shadow image path
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                }),
                'notFound':L.icon({
                    iconUrl: this.mapio.homeUrl+'assets/mapMarkers/ink-marker-notFound.png', // Replace with your green marker image path
                    shadowUrl: this.mapio.homeUrl+'assets/mapMarkers/marker-shadow.png', // Replace with your shadow image path
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                }),
            };

            let keys = Object.keys( icons );
            if( keys.indexOf( name ) == -1 ){

                if( name.startsWith( 'markicons/') && 
                    ( name.endsWith('.svg') || name.endsWith('.png') )
                 ){
                    return L.icon({
                        iconUrl: this.mapio.homeUrl+'assets/mapMarkers/'+name, // Replace with your green marker image path
                        //shadowUrl: this.mapio.homeUrl+'assets/mapMarkers/marker-shadow.png', // Replace with your shadow image path
                        iconSize: [25, 25],
                        iconAnchor: [12, 12],
                        popupAnchor: [0, -10],
                        //shadowSize: [41, 41]
                    });
                }else if( name.startsWith( '2markicons/') && 
                    ( name.endsWith('.svg') || name.endsWith('.png') )
                 ){
                    name = name.substring(1);
                    return L.icon({
                        iconUrl: this.mapio.homeUrl+'assets/mapMarkers/'+name, // Replace with your green marker image path
                        //shadowUrl: this.mapio.homeUrl+'assets/mapMarkers/marker-shadow.png', // Replace with your shadow image path
                        iconSize: [40, 40],
                        iconAnchor: [20, 20],
                        popupAnchor: [0, -10],
                        //shadowSize: [41, 41]
                    });
                }



                return icons['notFound'];
            }

            return icons[ name ];
        },
        onNewGpxs( ){
            console.log('gpx\'s onNewGpxs .....'+this.gpxs.length);
            let gpxP = new gpxParser();
            gpxP.tracks = [];
            gpxP.routes = [];
            gpxP.waypoints = [];
            for( let s of this.gpxs ){
                for( let t of s.tracks)
                    gpxP.tracks.push( t );
                for( let r of s.routes)
                    gpxP.routes.push( r );
                for( let w of s.waypoints)
                    gpxP.waypoints.push( w );
            }
            console.log('gpx\'s -> onNewGpxs make geojson ...... from gpxP ',
                '\nso: waypoints:'+gpxP.waypoints.length,
                '\nso: tracks:'+gpxP.tracks.length,
                '\nso: routes:'+gpxP.routes.length
            );
            this.makeGeoJsonOverlay( gpxP.toGeoJSON() );

        },
        makeGeoJsonOverlay( geoJ ){
            //console.log( geoJ );
            let tutilsdistanceToNice = this.utilsdistanceToNice;
            let tGetIcon = this.getIcon;
            let thomeUrl = this.mapio.homeUrl;
            let tmap = toRaw(this.mapio.map);
            let tmakePointToLayer = this.makePointToLayer;
            this.lgeojson = null;
            this.lgeojson = toRaw( L.geoJSON( geoJ,
            {
                style: function (feature) { 
                    if(feature.properties.name ){
                        console.log('--------------------\n',feature.properties.name,'geo style for teature:',feature);  
                    }else{
                        //console.log('geo style for teature:',feature.properties);
                        
                    }
                    
                    if( feature.properties.type == 'route' ){ // line for route
                        return {
                            "color": "blue",
                            "weight": 5,
                            "opacity": 0.75
                        };
                    }else{                                  // line for track
                        return {
                            "color": "yellow",
                            "weight": 5,
                            "opacity": 0.75
                        };
                    }
                },
                pointToLayer: tmakePointToLayer

            }).bindPopup((layer)=> {
                return this.makeBindPopup( layer );
                
            }).addTo( tmap )
            .bringToFront() );


        },

        makePointToLayer(feature, latlng, opts = {}){
            //console.log('point to layer - feature: ',feature);
            opts['icon'] = this.getIcon('share');
            if( 'sym' in feature.properties){
                opts['icon'] = this.getIcon( feature.properties.sym );
                if( feature.properties.sym == 'anchorage' ){
                    opts['icon'] = this.getIcon( feature.properties.sym );
                }
            }
            return L.marker(latlng,opts);
        },

        makeBindPopup( layer){
            let prop = layer.feature.properties;
                
            // for tracks lines
            if( 'properties' in layer.feature.geometry && layer.feature.geometry.properties.type == 'track' ){
                prop = layer.feature.geometry.properties;
                let IDStr = 'aInfo_track_'+prop.id;
                console.log('bindPopup - track line ', JSON.stringify(prop,null,4) );
                return this.makePopupContent( IDStr, prop, 'tracks');

            // routes lines
            }else if( prop.type == 'route' ){ //  for route
                let IDStr = 'aInfo_route_'+prop.id;
                console.log('bindPopup - route line', JSON.stringify(prop,null,4) );
                return this.makePopupContent( IDStr, prop, 'routes');
            
            // waypoints
            }else {
                if( !('id' in prop) ){
                    prop.id = 'not set';
                }
                let IDStr = 'aInfo_waypoint_'+prop.id;
                console.log('bindPopup - waypoint', JSON.stringify(prop,null,4) );
                return this.makePopupContent( IDStr, prop, 'waypoints');
            }
        },
        makePopupContent( IDStr, prop, srcType ){
            return ''+
                `<a onclick="gpxsManager.openInfoOf('${srcType}','${prop.id}','${this.mapio.mapname}');"
                    title="${IDStr}"
                    ><i class="fa-solid fa-circle-info"></i></a> `+
                (prop.name == null ? `${srcType} No#`+prop.id : prop.name )+
                (prop.desc != null && prop.desc != '' ? ' - '+prop.desc:'')+
                ('distancte' in prop ? `<br>length: `+tutilsdistanceToNice( parseFloat(prop.distance) ): '' );
        },

        onMarkerMove(e='',l='' ){
            console.log('on Marker drag move end ',e,"\nl:",l );
            this.gpxsEditor._instance.ctx.$data['data']['lat'] = toRaw(e.target._latlng.lat);
            this.gpxsEditor._instance.ctx.$data['data']['lon'] = toRaw(e.target._latlng.lng);
            this.gpxsEditor._instance.ctx.onDataChange();
            this.editCircle.setLatLng( [e.target._latlng.lat, e.target._latlng.lng] );
        },
        onPanelClone(){
            let tmap = toRaw(this.mapio.map);
            tmap.closePopup();
            //console.log('gpxs manager got panel close ....');
            let l = this.editCircle['bindLayerTo'];
            //console.log('   so l ',l);
            //console.log('   so editcircle ',this.editCircle);
            if( l != undefined ){
                if( 'dragging' in l ){
                    toRaw( l ).setZIndexOffset(-1000);
                    l.dragging.disable();
                }

            }
            if( this.editCircle != -1 ){
               this.editCircle.remove( tmap );

            }


        },
        openInfoOf( srcType, id, mapname, opts = '' ){
            console.log('openInfo of map',mapname,' my name is?:',this.mapio.mapname);
            
            if( mapname != this.mapio.mapname ){
                console.log('   .... wrong one :P');
                mapioByName[ mapname ]['gpxsManager']._instance.ctx.openInfoOf( srcType, id, mapname, opts = '' );
                return 1;
            }
            let tmap = toRaw(window['mapioByName'][mapname].map);
            

            /*
            this.lgeojson.eachLayer(function(layer) {
                // 'layer' here represents an individual Leaflet layer for each GeoJSON feature.
                // You can access the original GeoJSON feature data via layer.feature.
                console.log("Feature", layer.feature.properties.type, layer.feature.properties.id);

                // Perform actions on each layer, for example, binding a popup:
                //layer.bindPopup("<b>" + layer.feature.properties.name + "</b>");
            });
            */

            //console.log('gpxsEditor as ',this.gpxsEditor);
            if( this.gpxsEditor._instance != null && 
                this.gpxsEditor._instance.isMounted ){
                this.gpxsEditor.unmount();
                //console.log('unmount .... '+this.gpxsEditor._instance);
                this.gpxsEditor = null;
                this.isEditorRunning = false;
            }

            let srcT = srcType.substring(0,srcType.length-1);            
            let tr = this.findLayerInJGeo( srcT, id);
            if( tr.length != 1 ){
                console.error('wrong count in result! should be 1 \n',tr);
                return 1;
            }
            console.log('       .. in open info of tr is \n',tr);

            let onPanelReadyForEditor = ( divName )=>{
                this.gpxsEditor = createApp( GpxsViewer, {} );
                this.gpxsEditor.mount(`#${divName}`);
                this.isEditorRunning = true;
                this.gpxsEditor._instance.ctx.startEdit( mapname, srcType, id );
                if( opts == 'moveMapTo'){
                    //console.log('move to ',this.gpxsEditor._instance.ctx.$data.data.lat, this.gpxsEditor._instance.ctx.$data.data.lon);
                    this.lgeojson.closePopup();
                    tmap.flyTo([
                        this.gpxsEditor._instance.ctx.$data.data.lat, 
                        this.gpxsEditor._instance.ctx.$data.data.lon
                    ]);
                    //.panBy([-50,0]);

                }
            };
            
            console.log('openInfo of ',srcType, ' id:',id);
            if( setOpts.isOpen )
                setOpts.methods.closePanel();
            setOpts.openPanelWithDiv(`Info - ${srcType} (${id})`, onPanelReadyForEditor, this.onPanelClone );
            

            this.lgeojson.closePopup();

            for( let l of tr ){
                if( srcType == 'waypoints' ){
                    l.dragging.enable();
                    l['isNowEdited'] = true;
                    console.log('enable isNowEdited .... layer', l,
                        '\n\nll',l['_latlng']);
                    toRaw( l ).setZIndexOffset(1000);
                    this.editCircle = L.circleMarker(
                        l['_latlng'], {
                        radius: 40,
                        fillColor: 'green',
                        fillOpacity: 0.2,
                        color:'red',
                        width: 5,
                        opacity:0.5,
                    }).addTo( tmap );
                    this.editCircle['bindLayerTo'] = l;
                    l['bindEditCircle'] = this.editCircle;

                    //l.setIcon( this.getIcon('anchorage-green') );
                    l.on('dragstart',()=>{
                        this.lgeojson.closePopup();
                    });
                    l.on('drag',(e='')=>{
                        this.editCircle.setLatLng( l.getLatLng() );
                        this.editCircle.setStyle({
                            opacity:0.1,
                            radius:30
                        });
                    });
                    l.on('dragend',(e='')=>{
                        this.onMarkerMove(e);
                        this.editCircle.setStyle({
                            opacity:0.5,
                            radius:40
                        });
                    });
                    
                }
            }

            /*
            console.log('look to popup open ',srcT,' - ',id);
            if( tr.length > 0 ){
                console.log( 'found tr to popup ....' );
                for( let l of tr ){
                    //l.openPopup();
                    let trP = this.makeBindPopup( l );
                    console.log('open ',l,'\n popup:'+l,'\ntrPopup: ',trP);
                    toRaw(l).bindPopup( trP ).openPopup();
                }
            }
                */

        },

        getFetchAsJson_test1(){
            
            this.getFetchAsJson( 'getInfo', {}, ( j )=>{ 
                console.log('test1 got ',j);
            });
        },
        getFetchAsJson(url = 'getInfo', opts={}, callBack){

            let fetch_getAll = async function( url='getInfo', opts = {}){
                let resp = await fetch( '/apis/mapleaflet/gpxQ/'+url, opts );
                if( !resp.ok ){
                    //this.status = 'can\'t get list';
                    return undefined;
                }else{
                    return await resp.json();
                }            
            }
            let tcallBack = callBack;
            fetch_getAll().then(data=>{ tcallBack( data ) } );
        },

        getAllFromHost(){
            // wait it's fetching
            if( window['gpxs']== -1 ){
                console.log(`gpx\'s fetch in progress data - .... wait [${this.mapio.mapname}]`);
                setTimeout(()=>{
                    console.log(`      data - .. wait  [${this.mapio.mapname}]`);
                    this.getAllFromHost();
                },300);
                return 1;
            }

            
            // is locally
            if( window['gpxs'] != undefined  && window['gpxs'].length != 0 ){
                this.gpxs = toRaw(JSON.parse(JSON.stringify( gpxs )));
                this.gpxsEntryDate = window['gpxsEntryDate'];
                console.log('gpx\'s ... getAllFromHost window gpxs data -> gpxs\n',this.gpxs,
                    '\nentryDate:',this.gpxsEntryDate
                );
                this.onNewGpxs();
                this.q2_register();

            }else{       
                
                window['gpxs'] = -1;
                let fetch_getAll = async function(){
                    let resp = await fetch('/apis/mapleaflet/gpxQ/getAll',{ });
                    if( !resp.ok ){
                        //this.status = 'can\'t get list';
                        return 'error';
                    }else{
                        return await resp.json();
                    }            
                }

                fetch_getAll().then(data=>{
                    if( data != 'error' ){
                        window['gpxs'] = toRaw( JSON.parse(JSON.stringify( data['gpxs'] )) );
                        window['gpxsEntryDate'] = data['entryDate'];
                        this.gpxs = JSON.parse(JSON.stringify( data['gpxs'] ));
                        this.gpxsEntryDate = data['entryDate'];
                        console.log('gpx\'s ... getAllFromHost host   data -> gpxs\n',this.gpxs,
                            '\nentryDate:',this.gpxsEntryDate
                        );
                        this.onNewGpxs();
                        this.q2_register();
                    }
                });

            }

        }

    }
}
</script>
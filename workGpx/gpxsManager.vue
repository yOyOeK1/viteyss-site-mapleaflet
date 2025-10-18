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
            geoJ: [],
            lgeojson: toRaw(-1),
            lines:[],
            markers:[],
            gpx: ref(new gpxParser()),
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
        findLayerInJGeo(srcType, id){
            let tr = [];
            if( this.lgeojson == -1 ){
                return [];
            }
            let lgeo = this.lgeojson;
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
                    tr.push( layer );
                }
            });
            return tr;
        },
        editThisOne(srcType, id){
            let tr = this.findLayerInJGeo( srcType, id );
            if( tr.length == 1 ){
                console.log('set lEdit to ',srcType, ' id ',id);
                window['lEdit'] = tr[0];
            }

        },
        removeThisOne(srcType, id, closePanelAtEnd = true){
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
        onNewData(){
            console.log('gpx\'s onNewData .....'+this.gpxs.length);
            this.gpx.tracks = [];
            this.gpx.routes = [];
            this.gpx.waypoints = [];
            for( let s of this.gpxs ){
                for( let t of s.tracks)
                    this.gpx.tracks.push( t );
                for( let r of s.routes)
                    this.gpx.routes.push( r );
                for( let w of s.waypoints)
                    this.gpx.waypoints.push( w );
            }
            //console.log('gpx\'s waypoints:',this.gpx.waypoints);
            this.makeGeoJsonOverlay();

        },
        destroyGeoJsonOverlay(){
            if( this.inOverlay == true ){
                this.lgeojson.remove( toRaw(this.mapio.map) );
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
                })
            };

            return icons[ name ];
        },
        makeGeoJsonOverlay(){
            console.log('gpx\'s make geojson ......');
            this.geoJ = this.gpx.toGeoJSON();
            //this.geoJ = this.gpxJ.features;
            console.log( this.geoJ );
            console.log('gpx\'s make geojson ......DONE',
                '\nso: waypoints:'+this.gpx.waypoints.length,
                '\nso: tracks:'+this.gpx.tracks.length,
                '\nso: routes:'+this.gpx.routes.length
            );
            let tutilsdistanceToNice = this.utilsdistanceToNice;
            let tGetIcon = this.getIcon;
            let thomeUrl = this.mapio.homeUrl;
            let tmap = toRaw(this.mapio.map);
            let tmakePointToLayer = this.makePointToLayer;
            this.lgeojson = toRaw( L.geoJSON( this.geoJ,
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
                `<a onclick="gpxsManager.openInfoOf('${srcType}','${prop.id}');"
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
        openInfoOf( srcType, id, opts = '' ){
            let tmap = toRaw(this.mapio.map);

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

            let onPanelReadyForEditor = ( divName )=>{
                this.gpxsEditor = createApp( GpxsViewer, {} );
                this.gpxsEditor.mount(`#${divName}`);
                this.isEditorRunning = true;
                this.gpxsEditor._instance.ctx.startEdit( srcType, id );
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
            
            let srcT = srcType.substring(0,srcType.length-1);            
            let tr = this.findLayerInJGeo( srcT, id);

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


        getAllFromHost(){
            console.log('gpx\'s ... getAllFromHost ');
            if( 'gpxsManager' in window && window.gpxsManager.$data.gpxs.length != 0 ){
                this.gpxs = window.gpxsManager.$data.gpxs;
                console.log('window gpxsManager data -> gpxs\n',this.gpxs);
                this.onNewData();

            }else{            

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
                        this.gpxs = data;
                        console.log('data -> gpxs\n',this.gpxs);
                        this.onNewData();
                    }
                });

            }

        }

    }
}
</script>
<template>
    gpx's manager .vue

</template>
<script>
import { ref } from 'vue';
import { gpxParser } from './gpxParser.js';
//import gpxParser from 'gpxparser'

export default{
    props:[ 'mapio' ],
    data(){
        console.log('gpx\'s ... data ');
        return {
            inOverlay: false,
            gpxs: [],
            geoJ: [],
            lgeojson: ref(Object()),
            lines:[],
            markers:[],
            gpx: ref(new gpxParser())
        };
    },
    mounted(){
        console.log('gpx\'s ... mounted ');

        window['gpxsManager'] = this;

        this.mountAsOverlay();
        this.getAllFromHost();
    },
    methods:{
        openInfoOf( srcType, id ){
            console.log('openInfo of ',srcType, ' id:',id);
        },
        mountAsOverlay(){
            console.log('gpx\'s mount As overlay .....');
            this.myOverlay = L.marker([0,0]);
            this.mapio.control.addOverlay( this.myOverlay, 'Gpx\'s overlay' );
            this.myOverlay.addTo( this.mapio.map );
            this.inOverlay = true;
           
        
            this.mapio.map.on('overlayadd',(e='')=>{
                if( e.name == 'Gpx\'s overlay' ){
                    console.log('overlay added of gpx\'s manager ....');
                    this.inOverlay = true;
                    this.getAllFromHost();
                }
            });
            this.mapio.map.on('overlayremove',(e='')=>{
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
                this.lgeojson.remove( this.mapio.map );
            }
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
            

            this.lgeojson = L.geoJSON( this.geoJ,
            {
                style: function (feature) { 
                    //console.log(feature.properties.name,'geo style for teature:',feature);  
                    
                    if( feature.properties.type == 'WPT' ){ // line for route
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
                }

            }).bindPopup(function (layer) {
                let prop = layer.feature.properties;
                // routes lines
                if( prop.type == 'WPT' ){ //  for route
                    let IDStr = 'aInfo_route_'+prop.id;
                    console.log('route line', JSON.stringify(prop,null,4) );
                    return (prop.name == null ? 'Route No#'+prop.id : prop.name )+
                        (prop.desc != null && prop.desc != '' ? ' - '+prop.desc:'')+
                        ` <a onclick="gpxsManager.openInfoOf('route','${prop.id}');"><i class="fa-solid fa-circle-info"></i> id:${IDStr}</a>`+
                        `<br>length: `+prop.distance.toFixed(3);
                
                // for tracks lines
                } else if( 'properties' in layer.feature.geometry && layer.feature.geometry.properties.type == 'track' ){
                    prop = layer.feature.geometry.properties;
                    let IDStr = 'aInfo_track_'+prop.id;
                    console.log('track line ', JSON.stringify(prop,null,4) );
                    return (prop.name == null ? 'Track No#'+prop.id : prop.name )+
                        (prop.desc != null && prop.desc != '' ? ' - '+prop.desc:'')+
                        ` <a onclick="gpxsManager.openInfoOf('track','${prop.id}');"><i class="fa-solid fa-circle-info"></i> id:${IDStr}</a>`+
                        `<br>length: `+prop.distance.toFixed(3);

                // waypoints
                }else {
                    if( 'id' in prop ){

                    }else{
                        prop.id = 'not set';
                    }

                    let IDStr = 'aInfo_waypoint_'+prop.id;
                    console.log('waypoint', JSON.stringify(prop,null,4) );
                    return (prop.name == null ? 'Waypoint No#'+prop.id : prop.name )+
                        (prop.desc != null && prop.desc != '' ? ' - '+prop.desc:'')+
                        ` <a onclick="gpxsManager.openInfoOf('waypoint','${prop.id}');"><i class="fa-solid fa-circle-info"></i> id:${IDStr}</a>`;
                        
                }
            }).addTo( this.mapio.map );


        },
        getAllFromHost(){
            console.log('gpx\'s ... getAllFromHost ');

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
                    this.onNewData();
                }
            });


        }

    }
}
</script>
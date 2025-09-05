<template>

    <span v-if="status == 'loaded'">
        mapioMapPanel | {{ mapios.length }}
    </span>
    {{ status }} | ({{ openNowCount }}/{{ mapios.length }})

    <span v-for="( item, index ) in mapios" >
        <MapioMapIteml 
            @my-custom-event="handleCustomEvent"
            :kid="index" 
            :kfile="item['path']"
            :kitem="item"
            :lfmapprop="mlfmap"
            :style="'max-width:'+mapItemWidth+'px;'"
            />
    </span><br>
    don't show:{{ mapNotShow }}
    

</template>
<script>

import { ref } from 'vue';
import MapioMapIteml from './mapioMapIteml.vue';



export default{
    components:{ MapioMapIteml },
    data(){
        let status = ref('loaded');

        let mapios = ref([]);
        let mlfmap = ref(Object());
        let mapKeys = ref([]);
        let mapFolders = ref(Object());
        let mapFoldersDone = false;
        let mapNotShow =ref([]);
        let openNowCount = ref(0);
        

        return { status, mapios, mlfmap, mapKeys, 
            mapFolders, mapFoldersDone, mapNotShow,
            openNowCount };

    },
    mounted(){
        this.getMapiosList();
    },
    computed:{
        mapItemWidth(){
            let sW = 100;
            if( this.openNowCount == 0)
                return sW;
            
            return parseInt( sW / this.openNowCount );
        }
    },
    methods:{

        getMapItemWidth(){
            // TODO FIX get screen size half?
            return parseInt(200/this.openNowCount.length);
        },

        doSvgToOverlay( targetMapio, imgUrl, bounds ){

            fetch( imgUrl )
            .then(response => response.text())
            .then(svgString => {
                console.log('got svg for layer ....');
                const parser = new DOMParser();
                const svgDoc = parser.parseFromString(svgString, 'image/svg+xml');
                const svgElement = svgDoc.documentElement;

                if (!svgElement.hasAttribute('viewBox')) {
                    svgElement.setAttribute('viewBox', `0 0 ${svgElement.getAttribute('width') || 100} ${svgElement.getAttribute('height') || 100}`);
                }

                targetMapio['imageOverlay'] = L.svgOverlay(svgElement, bounds);

            })
            .catch(error => console.error('Error loading SVG:', error));

        },

        buildMapio( mapio ){
            mapio['inframe'] = false;
            mapio['showing'] = false;
            mapio['forceAction'] = false;
            mapio['zoomOk'] = {};
            mapio['llArea'] = mapio.split.llSize[0]*mapio.split.llSize[1];
            mapio['mapioB'] = L.latLngBounds( 
                L.latLng( mapio.split.llBorders.tl[0], mapio.split.llBorders.tl[1] ),
                L.latLng( mapio.split.llBorders.br[0], mapio.split.llBorders.br[1] )
            );
            mapio['rectangle'] = L.rectangle( mapio['mapioB'], { color: 'green', width: 1, 'fill':false, 'opacity': 0.5} );
            let pngPathB64 = btoa(mapio.split.pngPath);
            let ext = mapio.split.pngPath.split('.');
            ext = ext[ ext.length-1 ];
            let imageUrl = '/apis/mapleaflet/getMapio/'+pngPathB64;
            
            //console.log(`imageUrl: *.${ext}`,imageUrl);
            if( ext == 'svg' ){
                this.doSvgToOverlay( mapio, imageUrl, mapio['mapioB'] );
            }else{
                mapio['imageOverlay'] = L.imageOverlay( imageUrl, mapio['mapioB'] );
            }
            return mapio;
        },
        
        onMoveDoneEvent( e ){
            this.mlfmap = e.lfmap;
            let mapB = e.lfmap.getBounds();
            let mapZoom = e.lfmap.getZoom();
            let mapSize = [ 
                mapB['_northEast']['lng'] - mapB['_southWest']['lng'],
                mapB['_northEast']['lat'] - mapB['_southWest']['lat']
            ];
            let mapArea = mapSize[0]*mapSize[1];

            // add to controls all directories
            if( this.mapFoldersDone == false )
                this.setCurrentFoldersOverlays();  

            // see what to show
            for( let mapio of this.mapios ){
                if( !('mapioB' in mapio) ){
                    mapio = this.buildMapio( mapio );
                }

                
                // skip if 
                if( mapio['forceAction'] ){

                    
                
                // filter only overlay selected 
                }else if( this.mapNotShow.indexOf( mapio['kapDir'] ) == -1 ){
                
                    //console.log('mapB',mapB,'\nmapioB',mapio['mapioB']);
                    if( mapB.intersects( mapio['mapioB']) ){
                        let gogoScale = false;
                        // clean this on resize !!! 
                        if( mapZoom in mapio['zoomOk'] ){
                            gogoScale = mapio['zoomOk'][mapZoom];

                        }else{
                            let fraction = mapio['llArea']/mapArea;
                            if( fraction < 120.00 && fraction > 0.1 ){
                                gogoScale = true;
                                mapio['zoomOk'][mapZoom]=true;
                            }else{
                                mapio['zoomOk'][mapZoom]=false;
                            }
                        }
                        
                        this.mapioInFrame(e.lfmap, mapio, gogoScale);
                        
                    }else{
                        this.mapioOfFrame(e.lfmap, mapio);
                        
                    }
                }
            }
        },
        
        currentFolderOverlayChange( e ){
            if( this.mapFoldersDone ){
                if( e['type'] == 'overlayadd' ){
                    this.mapiosOffFrame( this.mlfmap, this.mapios );
                    let fid = this.mapNotShow.indexOf( e['name'] );
                    this.mapNotShow.pop( fid );
                    this.onMoveDoneEvent({'lfmap':this.mlfmap});
                }else if( e['type'] == 'overlayremove' ){
                    this.mapiosOffFrame(  this.mlfmap, this.mapios );
                    this.mapNotShow.push( e['name'] );
                    this.onMoveDoneEvent({'lfmap':this.mlfmap});
                }
            }
            
        },
        // from items emit on show / hide
        handleCustomEvent(data) {
            //receivedData.value = data;
            console.log('parent got click',data);
            let mapio = this.mapios[ data['kid'] ];
            console.log(`mapio at ${data['kid']} ${mapio.fname}`);
            if( mapio.showing ){                
                this.mapioInFrame( this.mlfmap, mapio, false );
            }else{
                this.mapioInFrame( this.mlfmap, mapio, true );
            }
            mapio['forceAction'] = ! mapio['forceAction'];
        
        },

        mapioInFrame( lfmap, mapio, gogoScale ){
            if( gogoScale == true ){                
                if( mapio.inframe == false ){
                    mapio.imageOverlay.addTo( lfmap ); 
                    mapio.inframe = true;
                    mapio.showing = true;
                    this.openNowCount++;
                }else if( mapio.showing == false ){
                    mapio.showing = true;
                    mapio.rectangle.removeFrom( lfmap );
                    mapio.imageOverlay.addTo( lfmap );                    
                }

            }else{
                if( mapio.inframe == true ){
                    mapio.imageOverlay.removeFrom( lfmap );
                    mapio.rectangle.addTo( lfmap );
                    mapio.showing = false;                   
                }else if ( mapio.inframe == false ){
                    mapio.rectangle.addTo( lfmap ); 
                    mapio.inframe = true;
                    mapio.showing = false;
                    this.openNowCount++;
                }

            }                      
        },
        mapiosOffFrame( lfmap, mapios ){
            for( let m of mapios ){
                this.mapioOfFrame( lfmap, m );
            }
        },
        mapioOfFrame( lfmap, mapio ){
            if( mapio.inframe == true ){
                if( mapio.showing == false ){
                     mapio.rectangle.removeFrom( lfmap );
                }else{
                    mapio.imageOverlay.removeFrom( lfmap );
                }
                mapio['showing'] = false;
                mapio['inframe'] = false;
                mapio['forceAction'] = false;
                this.openNowCount--;
            }
                      
        },
        getMapiosList(){
            let fetchMapiosList = async function(){
                let resp = await fetch('/apis/mapleaflet/mapio/getList');
                if( !resp.ok ){
                    this.status = 'can\'t get list';
                    return 'error';
                }else{
                    return await resp.json();
                }

            }

            fetchMapiosList().then(data=>{
                //console.log('have list !!!', data);
                if( data != 'error' ){
                    this.status = 'have mapios';

                    //console.log('do types collection ',data.payload);
                    for( let m of data.payload ){
                        if( this.mapKeys.indexOf( m['type'] ) == -1 )
                            this.mapKeys.push( m['type'] );
                    }

                    this.mapFolders = data.mapFolders;
                    this.mapios = data.payload;
                    window['mapios'] = this.mapios;
                    

                }else{
                    this.status = 'got wrong data';
                }
            });
        },

        setCurrentFoldersOverlays(){
            //console.log('set current folders overlays done '+this.mapFoldersDone+'....',this.mlfmap,"\n\n",this.mapFolders);
            for( let mf of this.mapFolders){
                //console.log('add current folder '+mf.name);
                mf['o-ov'] = L.layerGroup({"customID":Math.random()});
                pager._page.lflayCon.addOverlay( mf['o-ov'], mf.name);
                mf['o-ov'].addTo( this.mlfmap );
            }
            this.mapFoldersDone = true;
        }

    }
}
</script>

<style>

.kmdivPanel{
    display: inline-block;
}
</style>
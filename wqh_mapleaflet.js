import MapioMapio from "./assets/mapioMapio.vue";
import { createApp } from 'vue';

let mstat = {
    running: false
};

function getSrc( addIt ){
    return ['and',q2.getName(),'s_vysmapleafletPage',addIt];
}

class wqh_mapleaflet{
    constructor(){

    }
    getHandlers=()=>{
        return {            
            showOnMap:( msg )=>{
                console.log('showOnMap - > '+msg['topic']+'    payload:['+msg['payload']+']');

                if( msg['topic'].endsWith("/cmd") ){

                    if( msg['payload'] == 'ping' ){
                        q2.emit( 'and/showOnMap/res', 'pong' );

                    }else if( msg['payload'] == "?"){
                        q2.emit( msg['topic'].replaceAll('/cmd','/res'), {
                            "src": getSrc('showOnMap'),
                            "name":"showOnMap",
                            'status': mstat,
                            'in_min':[
                                {name:'lat', vType:'float', default: 0.0},
                                {name:'lng', vType:'float', default: 0.0 },
                                {name:'zoom', vType: 'range' , min:1, max: 19, value: 16 ,step: 1 }
                            ]
                        } );


                    /* show on map v1 -
                        all$        q2.emit('and/showOnMap/cmd',{"doIt":1,lat:9.482799625691166,lng:-78.63588809967042,zoom:12})
                        single      q2.emit('and/F_at_armv81.36729/s_vysmapleafletPage/showOnMap/cmd',{"doIt":1,lat:9.482799625691166,lng:-78.63588809967042,zoom:12}) 
                    */ 
                    }else if( 'doIt' in msg['payload'] ){
                        let opts = msg['payload'];
                        console.log("showOnMap got DOIT!!!\n",opts);
                        $('body').append( siteByKey.s_vysmapleafletPage.o.getJsIncludeHtml());
                        setTimeout(()=>{
                            let myN = Date.now();
                            setOpts.methods.openPanelWithConfig([
                                {
                                    name: 'showing ....',
                                    html: `<div id="showOnMap${myN}" 
                                        style="width:200px;height:200px;"
                                        ></div>`
                                }], 'Show on map');

                            let mioApp = createApp( MapioMapio,  
                                {'mapname':"mio"+myN, 
                                    'mapOpts':{
                                        'abc':1,
                                        'zoomControl': false, 
                                        'center': [opts['lat'],opts['lng']], 
                                        'zoom':opts['zoom']
                                    },
                                    'addSmallLatLon': false, 
                                    'addlfBaseMaps': true,
                                    'addFullScreenBt': true,
                                    'homeUrl': siteByKey.s_vysmapleafletPage.o.homeUrl
                                    } );
                            window['mioApp3425'] = mioApp;
                            setTimeout(()=>{
                                mioApp.mount('#showOnMap'+myN);
                            },300);

                            setTimeout(()=>{
                                console.log('mapio wqh ',mioApp);
                                L.marker([ opts['lat'], opts['lng'] ], {
                                    title: "Share: "+opts['lat']+' , '+opts['lng'],
                                    draggable:false,
                                })
                                .bindPopup('abc')
                                .addTo( mioApp._instance.data.map )
                                .openPopup();
                                mioApp._instance.ctx.$data.map.invalidateSize()
                            },400);

                        },10);


                    }


                }

            }
        };
    }
}





export { wqh_mapleaflet }
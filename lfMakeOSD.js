import MiOSDPanel from "./assets/miOSDPanel.vue";
import { lfMakeKmPanel } from "./lfMakeKmPanel";
import { createApp,ref } from 'vue';

let miOSD = -1;
var osdTopics = {};

function lfMakeOSD (map, homeUrl) {
    let ll = {
        'last': map.getCenter(),
        'zoom': map.getZoom()
    };
    let divName = 'divOSD';
    
    lfMakeKmPanel( map, homeUrl, divName,{ 
        'position':[15,12],
        mapCornerPosition: 'bottomright',
        'onClickCallBack': (e)=>{
            console.log('lat,lon click',e);
            //let mapCenterll = map.getCenter();
            let msg = `${ll.last.lat},${ll.last.lng}`
            navigator.clipboard.writeText(msg);
            $.toast('In clipboard: '+`${msg}`);
        }
    });
    $('.'+divName).css({
        'border':'solid 1px gray',
        'border-radius': '3px',
        'background-color': '#ffffff33',
        'padding-left': '3px',
        'padding-right': '10px'
    });


    let updateSmallLatLon = ( e ='')=>{
        ll['last'] = map.getCenter();
        ll['zoom'] = map.getZoom();
        $('.'+divName).html( `
            <div style="text-align:right;">
                <div id="app${divName}">app${divName}</div>
                OSD:<small>${ll.last.lat.toFixed(7)} ${ll.last.lng.toFixed(7)}</small>
            </div>
        `);
    }
    //map.on( 'moveend', updateSmallLatLon );
    updateSmallLatLon();


    //miOSD = createApp( MiOSDPanel,{"osdd":osdTopics} ).mount(`#app${divName}`);
    //miOSD.setOSDData( osdTopics );
    //window['miOSD'] = miOSD;
    
    console.log('lfMake return');
    return this;
    
}



let lfOSDpushToOSD = ( msg )=>{
    console.log('lfMakeOSD got pushToOSD ',msg);
    //osdTopics[ msg['topic'] ] = msg;
   // miOSD.dataUpdate();
}

export { lfMakeOSD,lfOSDpushToOSD }
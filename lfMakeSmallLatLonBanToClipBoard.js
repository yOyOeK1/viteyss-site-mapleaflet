import { lfMakeKmPanel } from "./lfMakeKmPanel";

function lfMakeSmallLatLonToClipboard (map, homeUrl) {
    let ll = {
        'last': map.getCenter(),
        'zoom': map.getZoom()
    };
    
    lfMakeKmPanel( map, homeUrl, 'divmAp',{ 
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
    $('.divmAp').css({
        'border':'solid 1px gray',
        'border-radius': '3px',
        'background-color': '#ffffff33',
        'padding-left': '3px',
        'padding-right': '10px'
    });


    let updateSmallLatLon = ( e ='')=>{
        ll['last'] = map.getCenter();
        ll['zoom'] = map.getZoom();
        $('.divmAp').html( `
            <div style="text-align:right;">
            <small>${ll.last.lat.toFixed(7)} ${ll.last.lng.toFixed(7)}</small>
            </div>
        `);
    }
    map.on( 'moveend', updateSmallLatLon );
    updateSmallLatLon();

    return {
        'this':this,
        'll': ll

    };

}

export { lfMakeSmallLatLonToClipboard }
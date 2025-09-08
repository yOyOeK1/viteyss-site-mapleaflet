
export default function ( map, mapname ){


    //console.log('attt start\nhash\n',window.location.hash,
    //        '\n\nurl:\n', urlArgs);

    // restore settings - from url
    if( urlArgs[ mapname] ){
        let j = JSON.parse( urlArgs[ mapname ] );
        let ll = L.latLng( j['lat'],j['lng']);
        console.log('mapio urlhash restore '+mapname+' settings hash: '+JSON.stringify(j,null,4));
        //setTimeout(()=>{map.setView( ll , j['z'] );}, 1750);
    }

    // set / update hash
    map.on( 'moveend', (e='')=>{
        let lllast = map.getCenter();
        //let hashBase = urlArgs;
        urlArgs[mapname]= JSON.stringify({
            t:Date.now(),
            z:map.getZoom(),
            lat:lllast.lat,
            lng:lllast.lng});
        let h = '';
        for( let k of Object.keys(urlArgs) )
            h+=`&${k}=${urlArgs[k]}`

        window.location.hash=h;
        //console.log('e',e,'\nhash\n',window.location.hash,
        //    '\n\nurl:\n', urlArgs);
    });

}
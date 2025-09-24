

let mstat = {
    running: false
};

function showOnMap( msg ){
    console.log('showOnMap - > '+msg['topic']);

    if( msg['topic'].endsWith("/cmd") ){

        if( msg['payload'] == 'ping' ){
            qqC.send( 'and/showOnMap/res', 'pong' );

        }else if( msg['payload'] == "?"){
            qqC.send( 'and/showOnMap/res', {
                "src": qqS.ident,
                "name":"showOnMap",
                'status': mstat,
                'in_min':['lat','lng','zoom']
            } );
        }

    }

}

function wqHandlerr_install( siteO ){
    console.log('wqHandlerr_install ....');
    siteByKey.s_vysmapleafletPage['showOnMap'] = showOnMap;
}

export { wqHandlerr_install, showOnMap }
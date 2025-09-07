

function showCoordinates (e) {
    //alert(e.latlng);
    $.toast({
        heading: 'Coordinates',
        text: `${e.latlng}`,
        //showHideTransition: 'slide',
        //hideAfter: 800,
        icon: 'info'
    });
}

function centerMap (e) {
    pager._page.mioApp.$data.map.panTo(e.latlng);
}

function zoomIn (e) {
    pager._page.mioApp.$data.map.zoomIn();
}

function zoomOut (e) {
    pager._page.mioApp.$data.map.zoomOut();
}



let _map = -1;
let _mcStack = [];
let _mcStackpath = [];
function mcPush( name ){
    _mcStackpath.push( name );
    _mcStack.push( _map.options.contextmenuItems );
    _map.contextmenu.removeAllItems();
    return _mcStack.length - 1;
}
function mcPop(){
    _map.contextmenu.removeAllItems();
    let stl = _mcStack.length-1;
    mcPushStack( _mcStack[ stl ] );
    _mcStackpath.pop( stl )
    _mcStack.pop( stl );
}
function mcPushStack( stack ){
    for( let omi of stack )
        _map.contextmenu.addItem( omi );    
}
function mcShowAtPoint( e ){
    _map.contextmenu._showAtPoint( L.point( e.containerPoint.x, e.containerPoint.y ) );
}

function subMenu (e) {
    mcPush('submenu');
    console.log('click a',e);
    //pager._page.mioApp.map.contextmenu._hide();
    
    mcPushStack([
        {text: "<- back",
            callback: (e)=>{
                
                console.log('doing back ! ', _mcStack.length);
                mcPop();
                mcShowAtPoint( e );
            }
        },
        {text:_mcStackpath.join('->') },
        '-',
        {text:"submenu :)" },
        ]);
    mcShowAtPoint( e );
        

}

let setMapObject = function ( map ){
    _map = map;
}

let contextMenuSimple = function(  homeUrl ) { 
    // fix this !
    return {

        contextmenu: true,
        contextmenuWidth: 140,
        contextmenuItems: [{
            text: 'Show coordinates',
            callback: showCoordinates
        }, {
            text: 'Center map here',
            callback: centerMap
        }, '-', {
            text: 'Zoom in',
            icon: `${homeUrl}assets/zoom-in.png`,
            callback: zoomIn
        }, {
            text: 'Zoom out',
            icon: `${homeUrl}assets/zoom-out.png`,
            callback: zoomOut
        }, '-',{
            text: 'Submenu ->',
            //icon: `${homeUrl}assets/zoom-out.png`,
            callback: subMenu
        }]
    };

};

export { contextMenuSimple, setMapObject }
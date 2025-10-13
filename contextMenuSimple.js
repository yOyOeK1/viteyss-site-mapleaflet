

class miMesureDist{
    constructor(){
        this.p0 = -1;
        this.m0 = L.marker([0,0],{
            draggable: true,
            title: 'From '
        });
        this.m0.on('dragend',(e)=>{
            this.p0 = this.m0.getLatLng();
            this.rebuild();
        });
        this.m0.on('dragstart',(e)=>{ this.line.removeFrom( _map ); } );

        this.p1 = -1;
        this.m1 = L.marker([0,0],{
            draggable: true,
            title: 'To '
        });
        this.m1.on('dragend',(e)=>{
            this.p1 = this.m1.getLatLng();
            this.rebuild();
        });
        this.m1.on('dragstart',(e)=>{ this.line.removeFrom( _map ); } );

        this.line = L.polyline( [ this.p0, this.p1 ], {
            color: 'orange'
        } );
    }


    setP0=(latlng)=>{
        if( this.p0 != -1 ){
            this.m0.removeFrom( _map );
            this.p0 = -1;
           
        }
        if( this.p1 != -1 ){
            this.m1.removeFrom( _map );
            this.p1 = -1;
            this.line.removeFrom( _map );
        }
        

        this.p0 = latlng;
        this.m0.setLatLng( this.p0 ).addTo( _map );
    }

    setP1=(latlng)=>{

        if( this.p1 != -1 ){
            this.m1.removeFrom( _map );
            this.p1 = -1;
            this.line.removeFrom( _map );
        }
        
        this.p1 = latlng;
        this.m1.setLatLng( this.p1 ).addTo( _map );
        this.line.setLatLngs( [ this.p0, this.p1 ], {
            color: 'orange'
        } ).addTo( _map );
    }

    rebuild=()=>{
        if( this.p1 != -1 ){
            this.line.removeFrom( _map );
        }        
        
        this.m1.setLatLng( this.p1 ).addTo( _map );
        this.line.setLatLngs( [ this.p0, this.p1 ], {
            color: 'orange'
        } ).addTo( _map );
        this.getDist();
    }

    getDist=()=>{
        let dist = _map.distance( this.p0, this.p1 ).toFixed(2)+' met.'
        this.line.bindPopup( `length:\n ${dist}`).openPopup();
        return dist;
    }
}

let miMesDis;


function showCoordinatesOver_mapioShare(e){
    console.log('share cooridnates over q2 ',e);
    q2.emit('and/mapioShare/cmd',{doIt:"addMarker",ll:[e.latlng.lat, e.latlng.lng],id:'share.'+Date.now()}) 
}

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
        contextmenuItems: [
        {
            text: 'mesure From',
            callback: (e)=>{ 
                if( miMesDis == undefined )
                    miMesDis = new miMesureDist();
                miMesDis.setP0( e.latlng ); 
            }
        }, {
            text: 'To',
            callback: (e)=>{ 
                miMesDis.setP1( e.latlng ); 
                $.toast('distance: '+miMesDis.getDist() );
            }
        },'-',
        {
            text: 'Show coordinates',
            callback: showCoordinates
        }, {
            text: 'Center map here',
            callback: centerMap
        },
        // share poi q2.emit('and/mapioShare/cmd',{doIt:"addMarker",ll:[9.481593249618884,-78.63517198929484]}) 
        {
            text: '<i class="fa-solid fa-share-nodes"></i> Share POI',
            callback: showCoordinatesOver_mapioShare
        },
        '-', 
        {
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


class miMesureDist{
    constructor( map ){
        this.map = map;
        this.p0 = -1;
        this.m0 = L.marker([0,0],{
            draggable: true,
            title: 'From '
        });

        this.m0.on('dragend',(e)=>{
            console.log('m0 - dragend ',e);
            this.p0 = this.m0.getLatLng();
            this.rebuild( this.map );
        });
        this.m0.on('dragstart',(e)=>{ 
            console.log('m0 - dragstart ',e);
            this.line.removeFrom( this.map ); 
        } );

        this.p1 = -1;
        this.m1 = L.marker([0,0],{
            draggable: true,
            title: 'To '
        });
        this.m1.on('dragend',(e)=>{
            console.log('m1 - dragend ',e);
            this.p1 = this.m1.getLatLng();
            this.rebuild(  this.map );
        });
        this.m1.on('dragstart',(e)=>{ 
            console.log('m01- dragstart ',e);
            this.line.removeFrom( this.map ); 
        } );

        this.line = L.polyline( [ this.p0, this.p1 ], {
            color: 'orange'
        } );
    }


    setP0=(map, latlng)=>{
        if( this.p0 != -1 ){
            this.m0.removeFrom( map );
            this.p0 = -1;
           
        }
        if( this.p1 != -1 ){
            this.m1.removeFrom( map );
            this.p1 = -1;
            this.line.removeFrom( map );
        }
        

        this.p0 = latlng;
        this.m0.setLatLng( this.p0 ).addTo( map );
    }

    setP1=(map,latlng)=>{

        if( this.p1 != -1 ){
            this.m1.removeFrom( map );
            this.p1 = -1;
            this.line.removeFrom( map );
        }
        
        this.p1 = latlng;
        this.m1.setLatLng( this.p1 ).addTo( map );
        this.line.setLatLngs( [ this.p0, this.p1 ], {
            color: 'orange'
        } ).addTo( map );
    }

    rebuild=( map )=>{
        if( this.p1 != -1 ){
            this.line.removeFrom( map );
            
            
            this.m1.setLatLng( this.p1 ).addTo( this.map );
            this.line.setLatLngs( [ this.p0, this.p1 ], {
                color: 'orange'
            } ).addTo( this.map );
            this.getDist();
        }        
    }

    clearAll=( map )=>{
        console.log('clear all mesurments ...');
         if( this.p1 != -1 ){
            console.log('..... OK');
            this.m0.removeFrom( map );
            this.m1.removeFrom( map );
            this.p1 = -1;
            this.line.removeFrom( map );
        }
    }

    getDist=()=>{
        let dist = this.map.distance( this.p0, this.p1 ).toFixed(2)+' met.'
        this.line.bindTooltip( `length:\n ${dist}`).openTooltip();
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



let mapO = -1;
let _mcStack = [];
let _mcStackpath = [];
/*
function mcPush( name ){
    _mcStackpath.push( name );
    _mcStack.push( mapO.options.contextmenuItems );
    mapO.contextmenu.removeAllItems();
    return _mcStack.length - 1;
}
function mcPop(){
    mapO.contextmenu.removeAllItems();
    let stl = _mcStack.length-1;
    mcPushStack( _mcStack[ stl ] );
    _mcStackpath.pop( stl )
    _mcStack.pop( stl );
}
function mcPushStack( stack ){
    for( let omi of stack )
        mapO.contextmenu.addItem( omi );    
}
function mcShowAtPoint( e ){
    mapO.contextmenu._showAtPoint( L.point( e.containerPoint.x, e.containerPoint.y ) );
}
*/
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
    mapO = map;
}

class contextMenuSimple{

    constructor( homeUrl ){
        console.log('make context menu simple ... init');
        this.homeUrl = homeUrl;
        this.map = -1;

    }

    setMapObject = ( map ) =>{
        this.map = map;    
    }

    getContextMenu=()=>{ 
        // fix this !
        return {

            contextmenu: true,
            contextmenuWidth: 140,
            contextmenuItems: [
            {
                text: 'Mesure From',
                callback: (e)=>{ 
                    if( miMesDis == undefined )
                        miMesDis = new miMesureDist( this.map);
                    miMesDis.setP0( this.map, e.latlng ); 
                }
            }, {
                text: '\_ To',
                callback: (e)=>{ 
                    if( miMesDis != undefined ){
                        miMesDis.setP1( this.map, e.latlng ); 
                        $.toast('distance: '+miMesDis.getDist() );
                    }
                }
            },{
                text: '\_ Clear',
                callback: (e)=>{ 
                    if( miMesDis != undefined ){
                        miMesDis.clearAll( this.map );
                    }
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
                icon: `${this.homeUrl}assets/zoom-in.png`,
                callback: zoomIn
            }, {
                text: 'Zoom out',
                icon: `${this.homeUrl}assets/zoom-out.png`,
                callback: zoomOut
            }, '-',{
                text: 'Submenu ->',
                //icon: `${homeUrl}assets/zoom-out.png`,
                callback: subMenu
            }]
        };

    }

}

export { contextMenuSimple, setMapObject }
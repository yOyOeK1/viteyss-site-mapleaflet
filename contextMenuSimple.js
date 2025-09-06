

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
let contextMenuSimple = function( homeUrl ) {
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
        }]
    };

};

export { contextMenuSimple }
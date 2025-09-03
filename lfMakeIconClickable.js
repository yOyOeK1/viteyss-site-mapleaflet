let lfMakeIconClickable = function(map, thomeUrl){

    L.Control.Watermark = L.Control.extend({

        onAdd: function(map) {            
            var img = L.DomUtil.create('img');
            L.DomUtil.setPosition( img, L.point(0,-10));
            img.src = `${thomeUrl}assets/ico_viteyss_32.png`;
            img.style.width = '64px';
            L.DomEvent.on(img, 'click',(e)=>{
              let mousPos = L.DomEvent.getMousePosition(e);
              console.log('click', 
                `mouse: ${mousPos}`, 
                'zoom: '+map.getZoom(),
                'll:'+map.containerPointToLatLng( mousPos ),// ,tlfmap.getZoom()) 
                'll2pix:'+map.latLngToContainerPoint( L.latLng( 9.2620320938,-79.9355079 ) )
              );
              L.DomEvent.stopPropagation(e);
              return 1;
            });

            return img;
        },

        onRemove: function(map) {
            // Nothing to do here
        }

      });

      L.control.watermark = function(opts) {
          return new L.Control.Watermark(opts);
      }

      L.control.watermark({ position: 'bottomleft' }).addTo( map );
      
}

export { lfMakeIconClickable }
let lfMakeKmPanel = function(map, thomeUrl){

    L.Control.Watermark = L.Control.extend({

        onAdd: function(map) {            
            var kmdiv = L.DomUtil.create('div');
            L.DomUtil.setClass( kmdiv, 'kmdivPanel');
            kmdiv.innerHTML = 'KmPanel';
            L.DomUtil.setPosition( kmdiv, L.point(0,-60));
            L.DomEvent.on(kmdiv, 'click',(e)=>{
              let mousPos = L.DomEvent.getMousePosition(e);
              console.log('click', 
                `kmmouse: ${mousPos}`, 
                'zoom: '+map.getZoom(),
                'll:'+map.containerPointToLatLng( mousPos ),// ,tlfmap.getZoom()) 
                'll2pix:'+map.latLngToContainerPoint( L.latLng( 9.2620320938,-79.9355079 ) )
              );
              L.DomEvent.stopPropagation(e);
              return 1;
            });

            return kmdiv;
        },

        onRemove: function(map) {
            // Nothing to do here
        }

      });

      L.control.watermark = function(opts) {
          return new L.Control.Watermark(opts);
      }

      L.control.watermark({ position: 'bottomright' }).addTo( map );
      
}

export { lfMakeKmPanel }
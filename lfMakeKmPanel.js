let lfMakeKmPanel = function(map, thomeUrl, 
    divName = 'kmdivPanel', options = {}
  ){

    let position = options['position'] || [0,0];
    let mapCornerPosition = options['mapCornerPosition'] || 'bottomright';
    let onClickCallBack = options['onClickCallBack'] || function(e){
      let mousPos = L.DomEvent.getMousePosition(e);
      console.log('click', 
        'divName: '+divName,
        `kmmouse: ${mousPos}`, 
        'zoom: '+map.getZoom(),
        'll:'+map.containerPointToLatLng( mousPos ),// ,tlfmap.getZoom()) 
        'll2pix:'+map.latLngToContainerPoint( L.latLng( 9.2620320938,-79.9355079 ) )
      );


      L.DomEvent.stopPropagation(e);
      return 1;
    
    };


    L.Control.Watermark = L.Control.extend({

        onAdd: function(map) {            
            var kmdiv = L.DomUtil.create('div');
            L.DomUtil.setClass( kmdiv, divName);
            L.DomUtil.setPosition( kmdiv, L.point( position[0], position[1] ));
            kmdiv.innerHTML = 'KmPanel ('+divName+')';
            
            L.DomEvent.on(kmdiv, 'click', onClickCallBack);

            return kmdiv;
        },

        onRemove: function(map) {
            // Nothing to do here
        }

      });

      L.control.watermark = function(opts) {
          return new L.Control.Watermark(opts);
      }

      L.control.watermark({ position: mapCornerPosition }).addTo( map );
      
}

export { lfMakeKmPanel }
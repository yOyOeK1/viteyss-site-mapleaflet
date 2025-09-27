
import { geoHelper } from '../geoJsonLibs/geoHelper';



function depthSoundinOverLay( map, control ){
    
    let gridCellSize = 20;
    let dbSoundingsRun = 1;
    let overLayName = 'dbSoundings';
    let LgeoJsonDbDepths = -1;


    var depthSoundingUpdate = () => {
        //dbSoundingsToData.selectByRaster( this.depthSoundings, this.map.getB, onDbDone );
        let mapB = map.getBounds();
        mapB['cellsc'] = geoHelper.getCellsCount( map, gridCellSize );

        
        let fetchMapiosList = async function(){
            let resp = await fetch('/apis/mapleaflet/dbSoundings',{ headers: mapB });
            if( !resp.ok ){
                //this.status = 'can\'t get list';
                return 'error';
            }else{
                return await resp.json();
            }
            
        }
        
        fetchMapiosList().then(data=>{
            //console.log('have list !!!', data);
            if( data != 'error' ){
                console.log('have dbSoundings ...');
                if( LgeoJsonDbDepths == -1 ){
                    LgeoJsonDbDepths = geoHelper.getLgeoJSONFramData( map, data, mapB['cellsc'], gridCellSize );
                    LgeoJsonDbDepths.addTo( map );
                    geoHelper.doResizeLayers( map, LgeoJsonDbDepths );
                    control.addOverlay( LgeoJsonDbDepths, overLayName );
                }


                if( LgeoJsonDbDepths != -1 ){
                    console.log('have old geo depths....');
                    LgeoJsonDbDepths.clearLayers();
                    //this.control.removeLayer( this.LgeoJsonDbDepths );
                    LgeoJsonDbDepths.addData( data );
                    geoHelper.doResizeLayers( map, LgeoJsonDbDepths );                            
                    
                }

            }
        });


        let dbSoundingsChkOverlayStatus = ( e )=>{
            if( e['type'] == 'overlayadd' ){
                dbSoundingsRun = 1;
            }else if( e['type'] == 'overlayremove' ){
                dbSoundingsRun = 0;
            }
                                
        };


        map.on('overlayadd',(e='')=>{
            console.log('overlayadded of dbSoundings ....');
            dbSoundingsChkOverlayStatus(e);
        });
        map.on('overlayremove',(e='')=>{
            console.log('overlayremove of dbSoundings ....');
            dbSoundingsChkOverlayStatus(e);
        });

    };


    map.on( 'moveend', (e='')=>{
        if( dbSoundingsRun == 1 )
            depthSoundingUpdate();
    });

    depthSoundingUpdate();


    return LgeoJsonDbDepths;
}

export { depthSoundinOverLay }
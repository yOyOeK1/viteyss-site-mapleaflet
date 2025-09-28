
import { geoHelper } from '../geoJsonLibs/geoHelper';



class depthSoundinOverLay{

    constructor( map, control ){
        this.map = map;
        this.lastData = [];
        this.control = control;
        this.gridCellSize = 10;
        this.dbSoundingsRun = 1;
        let mapB = this.map.getBounds();
        this.geoHelper = geoHelper;
        this.geoH = new geoHelper.getLgeoJSONC( this.map,  this.gridCellSize )
        this.overLayName = 'dbSoundings';
        this.LgeoJsonDbDepths = -1;
        this.updateDelay = -1;
        this.setEvents();
        this.depthSoundingUpdate();
    }

    setGridCellSize=( newSize )=>{
        this.gridCellSize = newSize;
        this.geoH = new geoHelper.getLgeoJSONC( this.map,  this.gridCellSize );
        this.reinstallLgeo();        
    }

    reinstallLgeo=()=>{
        this.control.removeLayer( this.LgeoJsonDbDepths );
        this.map.removeLayer( this.LgeoJsonDbDepths );
        this.LgeoJsonDbDepths = -1;
        //this.geoHelper.doResizeLayers( this.map, this.LgeoJsonDbDepths );
        this.depthSoundingUpdate();
    }

    setEvents=()=>{
        
        this.map.on('overlayadd',(e='')=>{
            console.log('overlay added of dbSoundings ....');
            this.dbSoundingsChkOverlayStatus(e);
        });
        this.map.on('overlayremove',(e='')=>{
            console.log('overlayr emove of dbSoundings ....');
            this.dbSoundingsChkOverlayStatus(e);
        });

        
        /*
        this.map.on( 'zoomstart', (e='')=>{
            console.log('depthsounding movestart ... hide popups ');
            if( this.LgeoJsonDbDepths != -1 ){
                console.log('have old geo depths....');
                this.geoHelper.setTooltips(0);
                this.LgeoJsonDbDepths.eachLayer(function(lay){
                    lay.closeTooltip();
                    });
                    this.map.removeLayer( this.LgeoJsonDbDepths );
                    this.LgeoJsonDbDepths.clearLayers();
                    console.log('have old geo depths....DONE');
                    }
                    });
                    */
        this.map.on( 'zoomend', (e='')=>{
            console.log('depthsounding zoomends ...  ');
        });

        this.map.on( 'moveend', (e='')=>{
            if( this.dbSoundingsRun == 1 )
                //this.geoHelper.setTooltips(1);
                this.depthSoundingUpdate();
        });

    }
    
    


    depthSoundingUpdate = () => {
        //dbSoundingsToData.selectByRaster( this.depthSoundings, this.map.getB, onDbDone );
        let mapB = this.map.getBounds();
        mapB['cellsc'] = this.geoHelper.getCellsCount( this.map, this.gridCellSize );
        mapB['cellSize'] = this.gridCellSize;

        
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
            console.log('have list !!! cellSize', this.gridCellSize);
            if( data != 'error' ){
                this.lastData = data;
                console.log('have dbSoundings ...');
                if( this.LgeoJsonDbDepths == -1 ){
                    this.LgeoJsonDbDepths = this.geoH.makeJso(data);
                    this.LgeoJsonDbDepths.addTo( this.map );
                    //this.geoHelper.doResizeLayers( this.map, this.LgeoJsonDbDepths );
                    this.control.addOverlay( this.LgeoJsonDbDepths, this.overLayName );
                }


                if( this.LgeoJsonDbDepths != -1 ){
                    console.log('have old geo depths....');
                    if( this.updateDelay != -1 ){
                        clearTimeout( this.updateDelay );
                        this.updateDelay = -1;
                    }
                    if( this.updateDelay == -1 ){
                        this.updateDelay = setTimeout(()=>{
                            this.LgeoJsonDbDepths.clearLayers();
                            //this.control.removeLayer( this.this.LgeoJsonDbDepths );
                            this.LgeoJsonDbDepths.addData( data );
                            //this.geoHelper.doResizeLayers( this.map, this.LgeoJsonDbDepths );                            
                        },300);
                    }
                    
                }

            }
        });
      
    };

    dbSoundingsChkOverlayStatus = ( e )=>{
        if( e['type'] == 'overlayadd' ){
            this.dbSoundingsRun = 1;
            this.depthSoundingUpdate();
        }else if( e['type'] == 'overlayremove' ){
            this.dbSoundingsRun = 0;
        }
                            
    }
    
    
}

export { depthSoundinOverLay }
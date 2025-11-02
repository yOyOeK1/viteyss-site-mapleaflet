import { gpxParser } from "./gpxParser.js";
import { gpx_indexedDB } from "./indexedDBTest1.js";

class gpxsClientDBHelper{


    constructor(){
        this.ed = Date.now();
        console.log('gpxsCDB contrutor DONE');

        this.state = '';
        this.data = null;
        this.dataInTTime = -1;
        this.sources = [];
        this.gpx = {};
        this.gpxStatus = false;

        this.tStart = -1;

        this.waitList = [];

        this.setLoc = localStorageH.getK('device/location');
        this.setName = localStorageH.getK('device/name');

        /*
        this.localData = -1;
        this.lDB = new gpx_indexedDB();
        this.lDB.getLast(d=>{
            if( d <=0 ){
                console.log('iDBno local gpx in inDB');
            }else{
                console.log('iDB have local gpx .....',d);
                this.localData = d;
            }
        });
        */
        

        this.setState('init DONE');

    }

    cl=( msg )=>{
        console.log( 'gpxsCDB ',msg);
    }

    onAction = ( opts ) =>{
        this.cl(' on action .......');
        this.cl( opts );


        // recognize action 
        if( opts.action == 'remove' && opts.srcType == 'gpx' ){
            this.remove_gpx( opts.id );
        }else if( opts.action == 'remove' &&  [ 'route', 'waypoint', 'track' ].indexOf( opts.srcType ) != -1 ){
            this.crud_fetch({ action: 'remove_'+opts.srcType, id: opts.id } );
        }else if( opts.action == 'insert' &&  [ 'route', 'waypoint', 'track' ].indexOf( opts.srcType ) != -1 ){
            this.crud_fetch({ action: 'insert_'+opts.srcType, data: opts } );
        }

        // recognize action DONE

    }

    remove_gpx = ( gpxId ) => {   
        this.crud_fetch({
            action: 'remove_gpx',
            id: gpxId,
            tracks: true, waypoints: true, routes: true
        });
    }

    crud_fetch = ( actionBody ) =>{

        let to = { 
            sto: setTimeout(()=>{            
                    console.log('action Time out \n',actionBody);
                },2000), 
            isDone: Object()  
        };
        to.isDone = (j)=>{
            clearTimeout( to.sto );
            console.log('action DONE in time \n\n',actionBody,
                '\n\nresult\n',j
            );

            let affected = 0;
            for( let o of j.operations )
                affected+= o.res.changes;

            let iId = ('id' in j ? j.id : actionBody.id);

            $.toast('Action on gpx ['+actionBody.action+']<br>'+
                'Id: '+iId+'   .... in '+j.workTime+' (ms)<br>'+
                'Status: '+j.atomActionStatus+'<br>'+
                'Affected: '+affected
            );
        };

        fetch( '/apis/mapleaflet/gpxQ/atom',{
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify( actionBody )
        } ).then( ( r )=>{
            r.json().then((j)=>{            
                console.log('   atomActions... fetch DONE ',j);
                to.isDone(j);
                /*if( 'status' in j && j.status == 'ok' ){
                    $.toast({
                        heading: 'Info',
                        text: 'Import DONE !'                            
                    });
                    
                }*/
            });
        });
    }

    getSrc = ( addSrc ) => {
        return [ this.setLoc, this.setName, addSrc ];
    }

    getStatus = () => {
        return this.gpxStatus;
    }
    getEntryDate=()=>{
        return parseInt( this.ed );
    }
    getGpx = () =>{
        if( this.gpxStatus )
            return this.gpx;
        else
            return -1;
    }

    getEntryDate=()=>{
        return this.ed;
    }

    setState=( nState )=>{
        this.cl('[set state]:   [ '+nState+' ]' );
        this.state = nState;
        this.onStateChange();
    }


    findIndexInGpx=( srcType, id )=>{
        let tr = [];
        if( srcType == 'gpx' ){
            for( let i=0,ic=this.gpxs.length; i<ic; i++ ){
            let g = this.gpxs[ i ];
            if( g.id == id ){
                return i;
            }
        }
        } else if( ['tracks','waypoints','routes'].indexOf( srcType) != -1 ){
            for( let gi=0,gic=this.gpxs.length; gi<gic; gi++ ){
                for( let ii=0, iic=this.gpxs[gi][ srcType ].length; ii<iic; ii++ ){
                    if( this.gpxs[gi][ srcType ][ ii ].id == id ){
                        return { gpxIndex: gi, itemIndex: ii };
                    }
                }
            }
        } else {
            console.info('find index item in gpx got wrong srcType ...',srcType,'   id:',id);
        }

        return -1;
    }



    onStateChange=()=>{

        

        if( this.state == 'init DONE' ){
            this.tStart = Date.now();
            this.dataInTTime = [];
            this.fetch_getAll();
            this.setState('waiting for db');

        }else if( this.state == 'waiting for db'){
        }else if( this.state == 'got db gpxs'){
            this.cl('   so do we want to process something ? inTimeOf:'+(Date.now()-this.tStart)+" ms. ");
            this.dataInTTime.push(['got data', Date.now()-this.tStart]);
            this.tStart_buildGpx = Date.now();
            this.buildGpxFromGpxs();
            this.dataInTTime.push(['build gpxs', Date.now()-this.tStart_buildGpx]);
            this.dataInTTime.push(['gpxsCDB', Date.now()-this.tStart]);
        }else if( this.state == 'gpx done'){
            this.cl('   so what now? all loop in inTimeOf:'+(Date.now()-this.tStart)+" ms. " );
        }

    }





    buildGpxFromGpxs=()=>{
        console.log('data is \n',this.data);

        if( !('status' in this.data) || this.data.status != 'ok' ){
            $.toast('gpx data from host ERROR');
            console.error( this.data );
            return 1;
        }else{
            this.ed = this.data.modDate.entryDate;
            console.log('gpxs data stats from '+(Date.now()-this.ed)+'\n',this.data.stats);
        }



        let gpxT = new gpxParser();
        gpxT.tracks = this.data.tracks;
        gpxT.routes = this.data.routes;
        gpxT.waypoints = this.data.waypoints;
        this.sources = this.data.sources;

        this.cl('gpx from gpx\'s DB ...... DONE'+
            '\nso: waypoints:'+gpxT.waypoints.length+
            '\nso: tracks:'+gpxT.tracks.length+
            '\nso: routes:'+gpxT.routes.length
        );
        this.gpx = gpxT;

        /*
        console.log('local DB: save ...');
        let gpxStr = JSON.stringify(gpxT);
        let bSize = 4095;
        let gSCunksC = parseInt( gpxStr.length / bSize ) + 1;
        localStorageH.setK('gpxsLocalDBC', gSCunksC);
        
        let pC = 0;
        for( let b=0; b<gSCunksC; b++ ){
            localStorageH.setK('gpxsLocalDBC_'+b, gpxStr.substring( b*bSize, bSize ) );
        }
        console.log('local DB: save ...DONE');
        */
        
        /*
        if( this.localData == -1 ){
            console.log('lDB add data '+(new Date()));
            this.lDB.addData( 'nice '+(new Date()) );
        }
        */

        this.gpxStatus = true;
        this.setState('gpx done');
    }



    fetch_getAll=()=>{

        /* 
        //need more work local cashe
        //console.log('local DB:\n',this.localData);
        if( this.localData != -1 ){
            console.log('from local inDB .... o.O ');
            this.data = JSON.parse(this.localData);
            this.setState('got db gpxs');
            return 1;
        }
            */
        
        
        let fetchIt = async function(){
            let resp = await fetch('/apis/mapleaflet/gpxQ/getAll',{ });
            if( !resp.ok )return 'error';
            else return await resp.json();                       
        };


        fetchIt().then(data=>{
            if( data != 'error' ){
                this.data = data;
                this.setState('got db gpxs');
            } else {
                this.setState('error 1 - resp not ok');
            }
        });
    }





}

export{ gpxsClientDBHelper }
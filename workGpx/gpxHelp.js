import { gpxDBHelp } from "./gpxDBHelp.js";
import fs from 'fs';
import gpxParser from 'gpxparser'
import path from 'path'



class gpxHelp{


    constructor(opts){
        this.opts = opts;
        this.cl(' init .....');
        this.dbh = new gpxDBHelp(  opts['dbPath'] );
        this.q2 = -1;

    }


    cl=(msg)=>{
        console.log('gpxHelp    -> ',msg);

    }

    setQ2=(q2)=>{ 
        this.q2 = q2;
    }

    q2_callBackOn_dbDone=( msgRes, onData )=>{
        if( this.q2 == -1 ){
            this.cl('ERROR gpxHelp got callback on db Done but no q2, no client. ');
            return 1;
        }

        this.cl(['DB done with ,....', msgRes]);
        this.q2.emit('and/mapioGpxsManager/gpxs/action', { action: 'dbUpdated', src: [this.q2.getName(), 'gpxHelp'],
            msgRes: msgRes,
            orgData: onData,
            entryDate: onData['entryDate']
            });

    }

    q2_handler=(topic,p)=>{
        console.log('gpx\'s Help Host: gpxsAction\n',
            '   topic:\n\t\t'+topic+'\n'+
            '   payload:\n',p,'\n--------------------------'
        );

        if( p['action'] == 'remove' ){
            let tn = parseInt(Date.now());

            if( p['srcType'] == 'waypoint' ){
                this.dbh.removeWaypoints( p['data'], this.q2_callBackOn_dbDone, p);
            }

        }else if( p['action'] == 'save' ){
            if( p['srcType'] == 'waypoint' ){
                this.dbh.saveWaypoints( p['data'], this.q2_callBackOn_dbDone, p);
            }

        }


    }


    importFile=( gpxFilePath )=>{
        let gpxStr = fs.readFileSync( gpxFilePath ).toString();
        //this.cl(['so we have import file string:',gpxStr]);
        let gpx = new gpxParser();
        
        this.cl('import file parsing ......');
        gpx.parse( gpxStr );
        this.cl('import file parsing ...... DONE');
        //console.log(gpx.metadata);
        let desc = 'import from file: '+gpxFilePath;
        let fBasename = path.basename( gpxFilePath );
        this.importGpx( gpxFilePath, fBasename, desc, 'file import', gpx );
    }

    importGpx=( xmlSource, name, desc, srcType, gpx ) =>{
        this.dbh.insertNewGpx( xmlSource, name, desc, srcType, gpx );
    }  
   

}


if( 0 ){
    let gh = new gpxHelp({
        homePath: '/home/yoyo/Apps/viteyss-site-mapleaflet/workGpx/homePathTest',
        dbPath: '/home/yoyo/Apps/viteyss-site-mapleaflet/workGpx/homePathTest/dbGpx.db'
    });

    //gh.importFile( '/home/yoyo/Apps/viteyss-site-mapleaflet/workGpx/homePathTest/navobj.xml' );
    gh.importFile( '/home/yoyo/Apps/viteyss-site-mapleaflet/workGpx/homePathTest/layers/AnchorAuto.gpx');

}

export{ gpxHelp }
import { gpxDBHelp } from "./gpxDBHelp.js";
import fs from 'fs';
import gpxParser from 'gpxparser'
import path from 'path'



class gpxHelp{


    constructor(opts){
        this.opts = opts;
        this.cl(' init .....');
        this.dbh = new gpxDBHelp(  opts['dbPath'] );

    }


    cl=(msg)=>{
        console.log('gpxHelp    -> ',msg);

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
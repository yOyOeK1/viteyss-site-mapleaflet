
import { spawnSync } from 'child_process';
import fs from 'fs'
import path from 'path'
import convert from 'xml-js';





let kmlRead = function ( pathTokml ){
    return fs.readFileSync( pathTokml );
}

let kmlParse = function ( kmlJs, PngPath ){
    let rgb = {};
    //let sizeO = sizeOf( fs.readFileSync(PngPath) );
    let size = [10,10]; // TODO FIX !! get image size 
    let box = kmlJs['kml']['GroundOverlay']['LatLonBox'];
    let r = {
        'n': parseFloat( box['north']['_text'] ),
        'e': parseFloat( box['east']['_text'] ),
        's': parseFloat( box['south']['_text'] ),
        'w': parseFloat( box['west']['_text'] )
    };
    let llBorders = {
        tl: [ r.n,r.w ], tr: [ r.n, r.e ], br: [ r.s, r.e ], bl: [ r.s, r.w ]
    };

    let ref = [];
   

    //console.log('ref\n',ref,'\n\nsize\n',size,'\n\nllborder\n',llBorders);
    let llSize = [ (llBorders.tr[0]-llBorders.bl[0]), ((llBorders.tr[1]-llBorders.bl[1])) ];
    return {
        'ref': ref, 'size': size, 'llBorders': llBorders,
        'llSize': llSize,
        'llCenter': [ llBorders.tl[0] + (llSize[0]*0.5), llBorders.bl[1] + (llSize[1]*0.5) ]
    };

}


let cl = function ( msg ){ console.log(msg); }


let kmlFileIdentState = function ( pathToKa, dirList ){
    //cl(['kml ident ',`[${pathToKa}]`]);

    if( pathToKa.endsWith('.kml') ){
        
        let pathToKaNoExt = pathToKa.substring( 0, pathToKa.length-4 );
        let fNameBase = pathToKa.substring( pathToKa.lastIndexOf('/')+1, pathToKa.length-4 );
        //cl(['look for splits ',path.dirname( pathToKa ), '.split', `${fNameBase}.mheader.kml`]);
        let kmlFile = fs.readFileSync( pathToKa );
        let kmlStr = kmlFile.toString();
        let kjs = JSON.parse( convert.xml2json(kmlFile, {compact: true, spaces: 2} ) ); 
        let tMheaderkml = true;
        //console.log(JSON.stringify(kjs,null,4));
        let tPngPath = kjs['kml']['GroundOverlay']['name']['_text'];
        let tPng = false;
        console.log(`[i] kml working on:\n\t[${pathToKa}]`);

        // png chk
        // from kml file
        try{
            tPng = 'errno' in fs.statSync( tPngPath ) ? false : true;
        }catch(e){
            console.error(`\terror  path to image from file [${tPngPath}] - not there`);
        }
        // ./ local basename
        if( tPng == false ){
            try{
                let asLocal = path.join( path.dirname(pathToKa), path.basename( tPngPath ) );
                tPng = 'errno' in fs.statSync( asLocal ) ? false : true;
                if( tPng )
                    tPngPath = asLocal;
                console.log(`\tok file as basename [${tPngPath}]`);
            }catch(e){
                console.error(`\terror  path in to image  [${tPngPath}] -  not there`);
            }
        }
        
        // all good
        if( tMheaderkml && tPng ){

            //let pngIngo = [100,100];
            //let kmlParseRes = kmlParse( kmlRaw );
            let kmlParseRes = kmlParse( kjs, tPngPath );
            kmlParseRes['pngPath'] = tPngPath;
            return ['ok', kmlParseRes];

        }


        
    }
        
    return ['no',''];
}

let kmlLookInDir = function ( dirToLook, parentDir = undefined ){
    if( parentDir == undefined ){
        cl(['kmlLook ',dirToLook]);
        parentDir = [];
    }

    let dirList = fs.readdirSync( dirToLook );
    for( let dEl of dirList ){
        let dElFull = path.join(dirToLook, dEl);
        let fStat = fs.statSync( dElFull );
        if( fStat.isDirectory() ){
            //parentDir.push( {
            //    "path": dElFull,
            //    "isDir": true,

//            } );

            parentDir = kmlLookInDir( dElFull, parentDir );

        }else if( fStat.isFile() ){
            let tRes = kmlFileIdentState( dElFull, dirList );
            if(  tRes[0] == 'ok' ){
                 parentDir.push( {
                    "fname": dEl,
                    "path": dElFull,
                    "isDir": false,
                    "kmlMain": true,
                    "split":tRes[1]
                } );
            }

        }


    }


    return parentDir
}



//let kmlRaw = kmlRead( '/home/yoyo/Apps/viteyss-site-mapleaflet/tests/2-06.kml');
//kmlParse( kmlRaw );

//let dirWithkmls = '/home/yoyo/Apps/viteyss-site-mapleaflet/tests';
//console.log('look for kmls:',kmlLookInDir( dirWithkmls, undefined ,true ) );

//console.log('kmlHelp');

export {  kmlLookInDir }
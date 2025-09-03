
import { spawnSync } from 'child_process';
import { dir } from 'console';
import fs from 'fs'
import path from 'path'

var pathToImgKapSpilt = '/home/yoyo/Apps/viteyss-site-mapleaflet/bin/imgkapSpilt.sh';



let kapRead = function ( pathToKap ){
    return fs.readFileSync( pathToKap );
}

let kapParse = function ( kapRaw ){
    let sKap = kapRaw.toString();
    let sKapL = sKap.split("\n");
    //console.log('kapRaw lines', sKapL.length);

    let maxLen = parseInt('REF/3,2453,1812,9.1567439,-79.8137938'.length*1.2);

    let rgb = {};
    let size = [0,0];
    let llBorders = {
        tl: [0,0], tr: [0,0], br: [0,0], bl: [0,0]
    };
    let ref = [];
    for( let l of sKapL ){
        if( l.length < maxLen ){
            //console.log('line', `abc${l}de`);
            if( l.substring(0,4) == 'REF/' ){
                let reft = l.substring(4,l.length-2).split(",");
                for( let r in reft ){
                    reft[r] = parseFloat(reft[r]);
                }
                ref.push( reft );

                if( reft[1] > size[0] ) size[0] = reft[1];
                if( reft[2] > size[1] ) size[1] = reft[2];

            }
        }
    }

    for( let r of ref ){
        // set max size

        if( r[1] == 0 && r[2] == 0 ){
            llBorders.tl = [ r[3], r[4] ];

        }else if( r[1] == 0 && r[2] == size[1] ){
            llBorders.bl = [ r[3], r[4] ];

        }else if( r[1] == size[0] && r[2] == 0 ){
            llBorders.tr = [ r[3], r[4] ];

        }else if( r[1] == size[0] && r[2] == size[1] ){
            llBorders.br = [ r[3], r[4] ];
        }


    }

    //console.log('ref\n',ref,'\n\nsize\n',size,'\n\nllborder\n',llBorders);
    let llSize = [ (llBorders.tr[0]-llBorders.bl[0]), ((llBorders.tr[1]-llBorders.bl[1])) ];
    return {
        'ref': ref, 'size': size, 'llBorders': llBorders,
        'llSize': llSize,
        'llCenter': [ llBorders.tl[0] + (llSize[0]*0.5), llBorders.bl[1] + (llSize[1]*0.5) ]
    };

}


let cl = function ( msg ){ console.log(msg); }


let kapFileIdentState = function ( pathToKa, dirList, buildMissing = false ){
    //cl(['kap ident ',`[${pathToKa}]`]);

    if( !pathToKa.endsWith('.mheader.kap') &&
        pathToKa.endsWith('.kap')
    ){
        
        let pathToKaNoExt = pathToKa.substring( 0, pathToKa.length-4 );
        let fNameBase = pathToKa.substring( pathToKa.lastIndexOf('/')+1, pathToKa.length-4 );
        cl(['look for splits ',path.dirname( pathToKa ), '.split', `${fNameBase}.mheader.kap`]);
        let tMheaderKap = false;
        let tMheaderKapPath = path.join( path.dirname( pathToKa ), '.split', `${fNameBase}.mheader.kap`);
        let tPng = false;
        let tPngPath = path.join( path.dirname( pathToKa ), '.split', `${fNameBase}.png` );
        try{
            tMheaderKap = 'errno' in fs.statSync( tMheaderKapPath ) ? false : true;

            tPng = 'errno' in fs.statSync( tPngPath ) ? false : true;
        }catch(e){}
        
        // if missing 
        if( buildMissing ){
            if( !tMheaderKap || !tPng ){
                cl(`buildMissing \n\t\t[${pathToImgKapSpilt} ${pathToKa}]\n------------------------------`);
                let worker = spawnSync( 
                    path.resolve(pathToImgKapSpilt),
                    [path.resolve(pathToKa)])
                    ;
                if (worker.error) {
                    console.error('Failed to spawn process:', worker.error);                }

                // Log the standard output and standard error
                console.log('stdout:', worker.stdout.toString());
                console.error('stderr:', worker.stderr.toString());

                // Log the exit code
                console.log('Exit code:', worker.status);
                if( worker.status == 0 ){
                    tMheaderKap = true;
                    tPng = true;
                }
                cl('\----------------------------------------------------');
             }
        }

        // all good
        if( tMheaderKap && tPng ){

            let kapRaw = kapRead( tMheaderKapPath );
            let kapParseRes = kapParse( kapRaw );
            kapParseRes['pngPath'] = tPngPath;
            return ['ok', kapParseRes];

        }


        
    }
        
    return ['no',''];
}

let kapLookInDir = function ( dirToLook, parentDir = undefined, buildMissing = false ){
    if( parentDir == undefined ){
        cl(['kapLook ',dirToLook]);
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

            parentDir = kapLookInDir( dElFull, parentDir, buildMissing );

        }else if( fStat.isFile() ){
            let tRes = kapFileIdentState( dElFull, dirList, buildMissing );
            if(  tRes[0] == 'ok' ){
                 parentDir.push( {
                    "path": dElFull,
                    "isDir": false,
                    "kapMain": true,
                    "conf":tRes[1]
                } );
            }

        }


    }


    return parentDir
}



//let kapRaw = kapRead( '/home/yoyo/Apps/viteyss-site-mapleaflet/tests/2-06.kap');
//kapParse( kapRaw );

//let dirWithKaps = '/home/yoyo/Apps/viteyss-site-mapleaflet/tests';
//console.log('look for kaps:',kapLookInDir( dirWithKaps, undefined ,true ) );

//console.log('kapHelp');

export {  kapLookInDir }
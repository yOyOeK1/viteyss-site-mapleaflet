


/**
 * GET /apis/mapleaflet
 * 
 * Bridge GET on http(s) to proxy maps tails.
 * * looks for `q` value in headers
 * 
 * #### use example:
 * ```bash
 * TODO curl -x POST http://localhost:8080/apis/mapleaflet -d 'q=exeIt/{"v":"1"}'  | jq .
 * ```
 * 
*/

import onlineMaps from "./onlineMaps.js";
import fs from 'fs'
import path from 'path'
import { Agent, setGlobalDispatcher,ProxyAgent} from 'undici'
import { savePhotoFromAPI } from "./fetchhttps.js";
import { kapLookInDir } from "./kapHelp.js";
import { kmlLookInDir } from "./kmlHelp.js";



class serverMapLeaflet{

    constructor(){
        
        this.method = "GET";
        this.url = "/apis/mapleaflet";
        this.ottO = undefined;
        this.server = undefined;
        this.casheFolder = '/home/yoyo/tmp/charts';
        this.mapioFolders = [
           { 'name': 'kaps1', 'dir': '/home/yoyo/Apps/viteyss-site-mapleaflet/tests' },
           { 'name': 'kmls1', 'dir': '/home/yoyo/Apps/viteyss-site-mapleaflet/workKmls' }
        ];
        this.kapsResults = -1;
        this.onlineMaps = onlineMaps;
        this.chkFolder();
        
        this.cl(`init .... will handle ${this.method} at ${this.url}`);



        const agent = new Agent({
        connect: {
            rejectUnauthorized: false
        }
        })

        setGlobalDispatcher(agent);

    }
    
    cl( str ){
        console.log(` serMapLeaflet     ${this.method}  ${this.url}     `,str);
    }

    chkFolder=( extraP='' )=>{
        let pathT = this.casheFolder; 
        if( extraP != '' ){
            pathT = path.join( this.casheFolder, extraP );
        }
        
        if( !fs.existsSync( pathT ) ){
            console.error(`[E] ${this.url} no cashe folder `,pathT);
            return false
        }
        return true;
    }

     mkDirIfNotPresent = ( mkey, z, y )=>{
        let isD = this.chkFolder( mkey );
        if( !isD )
            fs.mkdirSync( path.join( this.casheFolder, mkey ) );

        isD = this.chkFolder( path.join( mkey, z ) );
        if( !isD )
            fs.mkdirSync( path.join( this.casheFolder, mkey, z ) );

        isD = this.chkFolder( path.join( mkey, z, y ) );
        if( !isD )
            fs.mkdirSync( path.join( this.casheFolder, mkey, z, y ) );

        return 1;
    }

    doKeyXYZRequest=( req, res, sapi )=>{
        let tr = '';
        let mkey = sapi[0];
        let zyx = [ sapi[1], sapi[2], sapi [3] ];
        if( mkey in this.onlineMaps ){
            tr = JSON.stringify(this.onlineMaps[ mkey ]);
            let saveIt = path.join( this.casheFolder, mkey, zyx[0], zyx[1], zyx[2]);
            
            // chk if is in cashe
            let isFileInCashe = this.chkFolder( path.join( mkey , zyx[0], zyx[1], zyx[2] ) );
            if( isFileInCashe ){
                // todo File in directory 
                fs.readFile( saveIt, (err,data)=>{
                    if(err){
                        this.cl(`[E] saving file ${saveIt} error:`+err);
                        res.end('error');
                    }else{
                        this.cl('[cacheed]');
                        res.end(data);
                    }

                } ); 
                return 1;
            }

            // chk target directory if not make it /mkey/z/y/x
            this.mkDirIfNotPresent( mkey , zyx[0], zyx[1] );
            //url to download
            let uUrl = String(this.onlineMaps[ mkey ]['org'])
                .replaceAll('{z}',zyx[0])
                .replaceAll('{x}',zyx[1])
                .replaceAll('{y}',zyx[2]);

            savePhotoFromAPI( uUrl, saveIt, (buf)=>{
                if( buf != undefined ){
                    this.cl('[download]');
                    res.end(buf);
                }else{
                    this.cl('[e] when downloading :(');
                    res.end('404');
                }
            });
            return 1;
        }

        return 0;
    }

    doGetMapio( req,res, bUrl ){                
        let b64q = bUrl.substring(9);
        this.cl('q for '+b64q+'\nbUrl: '+bUrl);
        if( b64q.length > 20 ){
            let path = Buffer.from( b64q, 'base64' ).toString('utf-8');
            if( this.kapsResults == -1 ){
                res.end('error. no kaps list. first mapio/getList');
            }else{
                for( let kap of this.kapsResults ){
                    if( kap.split.pngPath == path ){
                        res.end( fs.readFileSync( kap.split.pngPath ) );
                        return 1;
                    }   
                }
                //res.end('ok: '+path+'\n\nkapRes'+JSON.stringify(this.kapsResults,null,4));
                res.end('error. wrong path! not in list');
            }
            return 1;
        }
    }


    async doIt( req, res ){


        let bUrl = String(req.originalUrl).substring( this.url.length+1 );
        let sapi = bUrl.split("/");

        // / key / x / y / z
        if( sapi.length ==  4 ){
            return this.doKeyXYZRequest( req, res, sapi );        

        }else if( bUrl.startsWith('getMapio/') ){
            return this.doGetMapio( req,res, bUrl );
            
            
        }else if( bUrl.startsWith('mapio/getList') ){
            // curl -k -x GET https://localhost:8080/apis/mapleaflet/mapio/getList | jq .

            this.cl(' mapio -> getList .....');
            let tr = {
                "topic": this.url+'/mapio/getList',
                "mapioFolders": this.mapioFolders,
                "payload":[]
            };
            
            for( let dir of this.mapioFolders ){

                // look for *.kap's
                this.cl(['kapDir scann', dir]);
                let scanRes = kapLookInDir( dir.dir, undefined ,true );
                if( scanRes.length >0 ){
                    this.cl(`   - have *.kap's ${scanRes.length} files`);

                    for( let mfI of scanRes ){
                        mfI['type'] = 'kap';
                        mfI['kapDir'] = dir.name;
                        mfI['dpA'] = parseInt( mfI['split']['size'][0]/mfI['split']['llSize'][0] ) ;
                        tr['payload'].push( mfI );
                    }
                }

                // look for *.kml's
                this.cl(['kmlDir scann', dir]);
                scanRes = kmlLookInDir( dir.dir, undefined );
                if( scanRes.length >0 ){
                    this.cl(`   - have *.kml's ${scanRes.length} files`);

                    for( let mfI of scanRes ){
                        mfI['type'] = 'kml';
                        mfI['kapDir'] = dir.name;
                        mfI['dpA'] = parseInt( mfI['split']['size'][0]/mfI['split']['llSize'][0] ) ;
                        tr['payload'].push( mfI );
                    }
                }




            }


            this.cl(`   - sort it ....`);
            //this.cl( JSON.stringify(tr,null,4)+"\n" );
            let pt = tr['payload'];
            pt.sort((a,b)=>{
                //let sA = a.split.llSize[0]*a.split.llSize[1];
                //let sB = a.split.llSize[0]*a.split.llSize[1];
                let sA = a.dpA;
                let sB = b.dpA;
                //this.cl(['sort a,b',sA, sB]);
                if( sA < sB ){
                //    this.cl('-');
                    return -1;
                }else if( sB > sA ){
                //    this.cl('+');
                    return 1;
                }
                //this.cl('0');
                return 0;

            });
            tr['payload'] = pt;



            this.kapsResults = tr['payload'];

            res.end(JSON.stringify(tr,null,4)+"\n");
            return 1;

        }else{
            res.end('404');

        } 
        
        return 0;
       
    }

   
    handleRequest( args ){
        let {req, res, server } = args;

        if( req.method == this.method && String(req.url).startsWith(this.url) ){
            //this.cl('in middle ....');
            this.server = server;
            return this.doIt( req,res );

        }



    }
}

export { serverMapLeaflet }

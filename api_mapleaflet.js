


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



class serverMapLeaflet{

    constructor(){
        
        this.method = "GET";
        this.url = "/apis/mapleaflet";
        this.ottO = undefined;
        this.server = undefined;
        this.casheFolder = '/home/yoyo/tmp/charts';
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

    async doIt( req, res ){


        let bUrl = String(req.url).substring( this.url.length+1 );
        let sapi = bUrl.split("/");
        // / key / x / y / z
        if( sapi.length ==  4 ){
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
                    this.cl('[download]');
                    res.end(buf);
                });
                return 1;

                //tr+= "\n"+uUrl;
            }

            //res.end( 'nice !'+JSON.stringify(sapi)+tr );
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

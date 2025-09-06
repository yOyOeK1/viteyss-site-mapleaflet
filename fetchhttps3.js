import { Writable } from 'stream';

import { stream } from 'undici';
import https from 'https'

//'https://192.168.43.220:8080/yss/siteNo/6/assets/ico_viteyss_32.png';
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
var req = https.request({ 
    host: '192.168.43.220', 
    port: 8080,
    path: '/yss/siteNo/6/assets/ico_viteyss_32.png',
    method: 'GET'

}, function(res){

    var body = [];
    res.on('data', function(data){
        body.push(data);
    });

    res.on('end', function(){
        console.log( body.join('') );
    });

});
req.end();

req.on('error', function(err){
    console.log(err);
});

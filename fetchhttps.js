import { env } from "process";
import { setGlobalDispatcher, ProxyAgent } from "undici";
import fs from 'fs'


async function savePhotoFromAPI(u, saveIt = false, callBack = undefined ) {
  if (env.https_proxy) {
    // Corporate proxy uses CA not in undici's certificate store
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    const dispatcher = new ProxyAgent({uri: new URL(env.https_proxy).toString() });
    setGlobalDispatcher(dispatcher);

  }

  const response = await fetch(u);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  if( saveIt!=false ){
    fs.createWriteStream(saveIt).write(buffer);
  }

  if( callBack != undefined ) callBack( buffer );

    
}
//savePhotoFromAPI( url );
export { savePhotoFromAPI }




class gpx_indexedDB{

    constructor( ){
        this.DB_NAME = 'MyDatabaseGPX2';
        this.DB_VERSION = 1;
        this.db = null;
    }

    initDB=(  runCallBack )=>{
        let openRequest = indexedDB.open(this.DB_NAME, this.DB_VERSION);

        this.set_onerror( openRequest );
        this.set_onsuccess( openRequest , runCallBack );
        this.set_onupgradeneeded( openRequest );
    }

    set_onerror( req, callBack = undefined ){
        req.onerror = (event) => {
            console.error('Error opening database:', event.target.errorCode);
            if( callBack != undefined )
                callBack();
        };
    }

    set_onsuccess ( req, callBack = undefined ){
        req.onsuccess = (event) => {
            let db = event.target.result;
            console.log('Database opened successfully.');
            //this.addData ( gpxj );
            if( callBack != undefined )
                callBack( db );
        };
    }

    set_onupgradeneeded( req ){
        req.onupgradeneeded = (event) => {
            let db = event.target.result;
            if (!db.objectStoreNames.contains('gpxLocal')) {
                db.createObjectStore('gpxLocal', { keyPath: 'id', autoIncrement: true });
                console.log('Object store "gpxLocal" created.');
            }
        };
    }

    /*
    gpxsCDB.lDB.getAll(i=> console.log('yes:',i));
    gpxsCDB.lDB.deleteItem(2,i=> console.log('yes:',i));
    gpxsCDB.lDB.getByMykey( 'abc', undefined, d=> console.log('yes!',d) );
    gpxsCDB.lDB.getByMykey( 'id', 2, d=> console.log('yes!',d) );
    gpxsCDB.lDB.addData( {abc:11} );

    */


    deleteItem = ( keyNo, callBackOnData )=>{
        console.log('iDB delete Item: ',keyNo);
        this.initDB( db => {   
            console.log('iDB init done go go with deteting ....');    
                
            if (!db) {
                console.error('iDBDatabase not open yet.');
                callBackOnData( 0 );
                return 0;
            }

            const transaction = db.transaction(["gpxLocal"], "readwrite");
            const objectStore = transaction.objectStore("gpxLocal");
            const getRequest = objectStore.delete( keyNo ); 
            this.set_onsuccess( getRequest, ()=>{ callBackOnData( 'ok' ); });
            getRequest.oncomplete = () => {
                console.log('iDB completed ... :) Nice!3 ');
            };
            this.set_onerror( getRequest, ()=>{ callBackOnData( -2 ); } );
            
        });
    }

    getAllKeys= () =>{
        console.log('iDB get All keys');
        let trpOk = -1;
        let trpEr = -1;
        let trp = new Promise( (onOk, onEr)=>{
            trpOk = onOk;
            trpEr = onEr;
        });
        let iList = [];

        this.initDB( db => {   
            console.log('iDB init done go go with get all keys ....');    
                
            if (!db) {
                console.error('Database not open yet.');
                callBackOnData( 0 );
                return 0;
            }

            const transaction = db.transaction(["gpxLocal"], "readonly");
            const objectStore = transaction.objectStore("gpxLocal");
            const getRequest = objectStore.getAllKeys(); 

            getRequest.onsuccess = (event) => {
                const item = event.target.result;
                if (item) {
                    console.log("iDB Selected getAllKeys ... ", item,
                        '\n current iList ',iList
                    );
                    trpOk(item);

                    
                } else {
                    console.log("iDB Item not found with key 1");                    
                    trpEr('no item ? get all keys ')
                }
            };

            getRequest.onerror = (event) => {
                console.error("Error getting item by key:", event.target.errorCode);
                trpEr('no item ? get all keys -2')
                
            };


        });
    
        return trp;
    }


    getAll = ( callBackOnData )=>{
        console.log('iDB get All');
        return this.initDB( db => {   
            console.log('iDB init done go go with select ....');    
                
            if (!db) {
                console.error('Database not open yet.');
                callBackOnData( 0 );
                return 0;
            }

            let keysId = []; 
            this.getAllKeys().then(keys=>{
                keysId = keys;
                
                const transaction = db.transaction(["gpxLocal"], "readonly");
                const objectStore = transaction.objectStore("gpxLocal");
    
                console.log('iDB object store is ',objectStore);

                console.log('iDB object store is keysId ',keysId);
                const getRequest = objectStore.getAll();             

                getRequest.onsuccess = (event) => {
                    const item = event.target.result;
                    if (item) {
                        console.log("iDB Selected getAll ... ", item);
                        for( let i=0,ic=item.length; i<ic; i++ ){
                            item[i]['iDBid'] = keysId[i]; 
                        }
                        callBackOnData( item );
                        return 0;
                    } else {
                        console.log("Item not found with key 1");
                        callBackOnData( -1 );
                        return -1;
                    }
                };

                getRequest.onerror = (event) => {
                    console.error("Error getting item by key:", event.target.errorCode);
                    callBackOnData( -2 );
                    return -2;
                };


            });

        });
    }

    getLast = ( callBackOnData ) => {
        console.log('iDB get last');
        this.getAll( d => {
            callBackOnData( d[ d.length -1 ] );
        });
    }

    getByMykey = ( mykey, keyValue = undefined, callBackOnData ) => {
        console.log('iDB get by mykey ['+mykey+'] == '+keyValue);
        if( keyValue )
            this.getAll( d => {
                callBackOnData( d.filter( i => i[ mykey ] == keyValue ) );
            });
        else
            this.getAll( d => {
                callBackOnData( d.filter( i => mykey in i ) );
            });
    }

    addData = ( data ) => {
        this.initDB( db => {       
                
            if (!db) {
                console.error('Database not open yet.');
                return;
            }

            
            const transaction = db.transaction(['gpxLocal'], 'readwrite');

            transaction.onerror = (event) => {
                console.error('Transaction error:', event.target.errorCode);
            };

            transaction.oncomplete = () => {
                console.log('Transaction completed successfully.');
            };

            const objectStore = transaction.objectStore('gpxLocal');
            const addRequest = objectStore.add( data );

            addRequest.onsuccess = (event) => {
                console.log('Data added successfully with key:', event.target.result);
            };

            addRequest.onerror = (event) => {
                console.error('Error adding data:', event.target.errorCode);
            };
        });
    }
    

}

export{ gpx_indexedDB }
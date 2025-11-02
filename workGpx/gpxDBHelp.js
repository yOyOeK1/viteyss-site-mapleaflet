import sqlite3 from 'sqlite3';

class gpxDBHelp{

    constructor( dbPath ){
        this.dbPath = dbPath;
        
        this.db = -1;
        
        this.maxThreads = 1;
        this.waitThrottle = 70;

        this.entryDate = Date.now();

        this.initDb();
        this.createV1();
    }


    initDb = () => {
        let SQLite3 = sqlite3.verbose();
        this.db = new SQLite3.Database( this.dbPath, (err) => {
            if (err) {
                console.error('Error opening database:', err.message);
            } else {
                console.log('Connected to the SQLite database.');
                // Create table and perform operations
            
            }
        });
    }

    createV1=()=>{
        let q = `
        CREATE TABLE sources
            (
                id INTEGER PRIMARY KEY AUTOINCREMENT, 
                xmlSource text,
                name text,
                desc text,
                srcType text,
                metadata_id INTEGER,
                entryDate text
            );
        `;
        let qR = this.db.all( q,[], this.resHandle );

        q = `
        CREATE TABLE metadatas
            (
                id INTEGER PRIMARY KEY AUTOINCREMENT, 
                source_id INTEGER,
                name text,
                desc text,
                link text,
                author text,
                time text,
                entryDate text
            );
        `;
        qR = this.db.all( q,[], this.resHandle );

        q = `
        CREATE TABLE waypoints
            (
                id INTEGER PRIMARY KEY AUTOINCREMENT, 
                source_id INTEGER,
                name text,
                sym text,
                cmt text,
                desc text,
                lat real,
                lon real,
                ele text,
                time text,
                entryDate text
            );
        `;
        qR = this.db.all( q,[], this.resHandle );

        q = `
        CREATE TABLE tracks
            (
                id INTEGER PRIMARY KEY AUTOINCREMENT, 
                source_id INTEGER,
                name text,
                cmt text,
                desc text,
                src text,
                number text,
                link text,
                type text,
                distance real,
                elevation real,
                slopes real,
                entryDate text
            );
        `;
        qR = this.db.all( q,[], this.resHandle );

        
        q = `
        CREATE TABLE points
            (
                id INTEGER PRIMARY KEY AUTOINCREMENT, 
                track_id INTEGER,
                route_id INTEGER,
                lat real,
                lon real,
                ele text,
                time text,
                entryDate text
            );
        `;
        qR = this.db.all( q,[], this.resHandle );


        q = `
        CREATE TABLE routes
            (
                id INTEGER PRIMARY KEY AUTOINCREMENT, 
                source_id INTEGER,
                name text,
                cmt text,
                desc text,
                src text,
                number text,
                link text,
                type text,
                distance real,
                elevation real,
                slopes real,
                entryDate text
            );
        `;
        qR = this.db.all( q,[], this.resHandle );


    }

    resHandle = ( err, rows )=>{
        if( err ){
            console.error("Error selecting resHendle ",err.message);
        }else{
            //console.log('rows',rows);

        }
    }


    q_getAll_Waypoints=( source_id, callBack )=>{
        this.db.all( 
            `SELECT * FROM waypoints
            WHERE source_id=?;`, [source_id],function( err, rows ){
            if( err ){
                console.error("Error selecting resHendle ",err.message);
                callBack( undefined );
            }else{
                //console.log('waypoint ',rows);
                callBack( rows );
            }
        });
    }

    q_getAll_Tracks=( source_id, callBack )=>{
        this.db.all( 
            `SELECT * FROM tracks
            WHERE source_id=?;`, [source_id],function( err, rows ){
            if( err ){
                console.error("Error selecting resHendle ",err.message);
                callBack( undefined );
            }else{
                //console.log('tracks ',rows);
                callBack( rows );
            }
        });
    }

    q_getAll_PointsTrack=( source_id, callBack )=>{
        this.db.all( 
            `SELECT * FROM points
            WHERE track_id=?;`, [source_id],function( err, rows ){
            if( err ){
                console.error("Error selecting resHendle ",err.message);
                callBack( undefined );
            }else{
                //console.log('waypoint ',rows);
                callBack( rows );
            }
        });
    }
    


    getAllCallBackManager = ( callBack, rows, wayIsDone, traIsDone ) => {
        if( wayIsDone == true && traIsDone == true ){
            console.log('get all call back manager done send back !');
            callBack( rows );
        }
    }

    q_getAll2=( callBack, srcs, status = 0 )=>{
        console.log('getAll2 status: '+status);

        let tr = {
            'gpxs':[],
            'waypoints':[],
            'routes':[],
            'tracks':[]
        };

        callBack( tr );
    }

    lookAtPromiss = ( promiss, callBack ) => {
        let loopAtPromiss = setInterval( ()=>{
            let allDone = [];
            let i = 0;
            for( let pro of promiss ){
                i++;
                //console.log(i+' pro is ',pro);
                if( pro.status == false){
                    allDone.push(pro);
                    if( this.maxThreads < allDone.length ){
                        break;
                    }
                }
            }
            if( allDone == 0 ){  
                console.log(' .... All DONE');
                promiss = [];
                clearInterval(loopAtPromiss);         
                callBack();
            }else{
                //console.log('('+i+') wait ....('+i+' / '+promiss.length+')');
                for( let pro of allDone){
                    pro.runIt( (s) => { pro.status = s; }  );
                }
            }
        },this.waitThrottle);
    }

    q_getAll=( callBack, srcs, status = 0 )=>{
        console.log('getAll status: '+status);
        let tgetAll = this.q_getAll;
        let tCallBackManager = this.getAllCallBackManager;
        let tWaypoints = this.q_getAll_Waypoints;
        let tTracks = this.q_getAll_Tracks;
        let tPointsTrack = this.q_getAll_PointsTrack;
        let promiss = [];
        
        if( status == 0 ){
            srcs = [];
            status++;
            this.db.all( 
                `SELECT *, 'gpx' as 'type' FROM sources;`, [],function( err, rSources ){
                    if( err ){
                        console.error("Error selecting resHendle ",err.message);
                        callBack( undefined );
                    }else{
                        srcs = rSources;
                        tgetAll( callBack, srcs, status );
                        
                    }
                });

        }else if( status == 1 ){ // waypoints
             status++;
             for( let s of srcs ){
                let wayToDo = srcs.length;
                let wayDone = 0;
                let wayIsDone = false;
                tWaypoints( 
                    s['id'], ( waypoints )=>{
                        s['waypoints']=waypoints;
                        wayDone++;
                        if( wayDone == wayToDo || waypoints.length == 0 ){
                            tgetAll( callBack, srcs, status ); 
                        }                       
                    });
            }
        
        }else if( status == 2 ){ // tracks
             status++;
             promiss = [];
             
             for( let s of srcs ){
                let traToDo = srcs.length;
                let traDone = 0;
                let traIsDone = false;
                tTracks( 
                    s['id'], ( tracks )=>{
                        s['tracks'] = tracks ;
                        traDone++;
                        if( traDone == traToDo || tracks.length == 0 ){
                            tgetAll( callBack, srcs, status ); 
                        }                       
                    });
            }
        
        }else if( status == 3 ){ // points for tracks
             status++;
             //tgetAll( callBack, srcs, status ); 
             //let sToDo = s.length;
             //let sDone = 0;  
             promiss = [];     
                   
             for( let s of srcs ){
                //console.log('srcs: '+s.id);
                if( 'tracks' in s ){

                    let doIt=( t )=>{
                        let runIt = ( callBack ) =>{
                            let p = this.getSelect(`
                                SELECT *, 'point' as 'type' FROM points WHERE track_id=${t['id']}
                                `);
                            p.then((d)=>{
                            // console.log('   ... points ad '+t['id']);
                                t['points'] = d;
                                callBack(true);
                            });
                        };
                        promiss.push( {status:false,runIt:runIt} );
                   }

                    for( let t of s['tracks'] ){
                        //console.log('   track: '+t.id,'\n\tpromiss:'+promiss.length );
                        doIt(  t );
                    }
                }
            }

            
            this.lookAtPromiss( promiss, ()=>{
                tgetAll( callBack, srcs, status ); 
            });
                
        
        } else if( status == 4 ){ // get routes
            status++;
            promiss = [];   

            let doIt=( s )=>{
                let runIt = ( callBack ) => {
                    let p = this.getSelect(`
                        SELECT *,'route' as 'type' FROM routes WHERE source_id=${s['id']}
                        `);
                    p.then((d)=>{
                        // console.log('   ... points ad '+t['id']);
                        s['routes'] = d;
                        callBack(true);
                        });
                };
                promiss.push( {status:false,runIt:runIt} );
            };

            for( let s of srcs ){ 
                doIt(  s );
            }

            this.lookAtPromiss( promiss, ()=>{
                tgetAll( callBack, srcs, status ); 
            });
                
        
        }  else if( status == 5 ){ // get routes points
            status++;
            promiss = [];  
            
            let isWaiting = false;

            
            let doIt =( r ) =>{
                let runIt = ( callBack ) => {
                    let p = this.getSelect(`
                        SELECT * FROM points WHERE route_id=${r['id']}
                        `);
                    p.then((d)=>{
                        // console.log('   ... points ad '+t['id']);
                        r['points'] = d;
                        callBack(true);
                        });
                };
                promiss.push( {status:false,runIt:runIt} );
            };
                
            for( let s of srcs ){ 
                for( let r of s['routes'] ){                
                   doIt(  r );
                } 
            }

            this.lookAtPromiss( promiss, ()=>{
                tgetAll( callBack, srcs, status ); 
            });
                
        
        }else {
            //console.log(" what now ? res ");
            if( 'entryDate' in srcs ){
                //console.log('       was send ?', ( Date.now() - srcs.entryDate ) );
                return 1;
            }
            this.entryDate = Date.now();
            srcs['entryDate'] = this.entryDate;
            callBack( srcs );
        }


        /*
                let wayToDo = rows.length;
                let wayDone = 0;
                let wayIsDone = false;
                let traToDo = rows.length;
                let traDone = 0;
                let traIsDone = false;

                for( let s of rows ){
                    s['lever'] = 'source';
                    console.log('source: ',s);

                    tTracks(
                        s['id'], ( tracks )=>{
                            
                            for( let track of tracks ){
                                tPointsTrack( track['id'], ( points )=>{
                                    track['points'] = points;
                                } );

                            }
                            s['tracks'] = tracks;



                            traDone++;
                            if( traDone == traToDo ){
                                console.log('last track ! of '+traToDo);
                                //callBack( rows );
                                traIsDone = true;
                                tCallBackManager( callBack, rows, wayIsDone, traIsDone);
                            }
                        }
                     );

                    tWaypoints( 
                        s['id'], ( waypoints )=>{
                            s['waypoints']=waypoints;
                            wayDone++;
                            if( wayDone == wayToDo ){
                                console.log('last waypoint ! of '+wayToDo);
                                //callBack( rows );
                                wayIsDone = true;
                                tCallBackManager( callBack, rows, wayIsDone, traIsDone);
                            }
                        }
                     );


                }

            }
        });

        */
    }

    getPromissinCountNDone=( promiss )=>{
        let pNDone = 0;
        for( let ps of promiss )
            if( !ps ) pNDone++;
        return pNDone;
    }

    q_getInfo=( callBack, srcs, status = 0 )=>{
        console.log('getInfo status: '+status);
        let tgetAll = this.q_getInfo;
        let tCallBackManager = this.getAllCallBackManager;
        let tWaypoints = this.q_getAll_Waypoints;
        let tTracks = this.q_getAll_Tracks;
        let tPointsTrack = this.q_getAll_PointsTrack;
        let promiss = [];

        callBack({
            title: 'getInfoResponse',
            entryDate: this.entryDate
        });
        return 1;
        
        if( status == 0 ){
            srcs = [];
            status++;
            this.db.all( 
                `SELECT * FROM sources;`, [],function( err, rSources ){
                    if( err ){
                        console.error("Error selecting resHendle ",err.message);
                        callBack( undefined );
                    }else{
                        srcs = rSources;
                        tgetAll( callBack, srcs, status );
                        
                    }
                });

        }else if( status == 1 ){ // waypoints
             status++;
             for( let s of srcs ){
                let wayToDo = srcs.length;
                let wayDone = 0;
                let wayIsDone = false;
                tWaypoints( 
                    s['id'], ( waypoints )=>{
                        s['waypoints']=waypoints;
                        wayDone++;
                        if( wayDone == wayToDo ){
                            tgetAll( callBack, srcs, status ); 
                        }                       
                    });
            }
        
        }else if( status == 2 ){ // tracks
             status++;
             for( let s of srcs ){
                let traToDo = srcs.length;
                let traDone = 0;
                let traIsDone = false;
                tTracks( 
                    s['id'], ( tracks )=>{
                        s['tracks'] = tracks ;
                        traDone++;
                        if( traDone == traToDo ){
                            tgetAll( callBack, srcs, status ); 
                        }                       
                    });
            }
        
        }else if( status == 3 ){ // points for tracks
             status++;
             //tgetAll( callBack, srcs, status ); 
             //let sToDo = s.length;
             //let sDone = 0;  
             promiss = [];     
                   
             for( let s of srcs ){
                //console.log('srcs: '+s.id);
                for( let t of s['tracks'] ){
                    //console.log('   track: '+t.id);
                    let p = this.getSelect(`
                        SELECT * FROM points WHERE track_id=${t['id']}
                        `);
                    p.then((d)=>{
                       // console.log('   ... points ad '+t['id']);
                        t['points'] = d;
                    });    
                    promiss.push( false );
                    let pid = promiss.length-1;
                    
                    p.finally( ()=>{ 
                        promiss[ pid ] = true; 
                        //console.log('   point ... '+pid+' DONE');
                    } );
                    
                    
                }
            }

            this.lookAtPromiss( promiss, ()=>{
                tgetAll( callBack, srcs, status ); 
            });
                
        
        } else if( status == 4 ){ // get routes
            status++;
            promiss = [];     
                
            for( let s of srcs ){                
                let p = this.getSelect(`
                    SELECT * FROM routes WHERE source_id=${s['id']}
                    `);
                promiss.push( false );
                let pid = promiss.length -1;
                p.then((d)=>{
                    // console.log('   ... points ad '+t['id']);
                    s['routes'] = d;
                    promiss[ pid ] = true;
                });    
            }

            this.lookAtPromiss( promiss, ()=>{
                tgetAll( callBack, srcs, status ); 
            });
                
        
        }  else if( status == 5 ){ // get routes points
            status++;
            promiss = [];     
                
            for( let s of srcs ){ 
                for( let r of s['routes'] ){                
                    let p = this.getSelect(`
                        SELECT * FROM points WHERE route_id=${r['id']}
                        `);
                    promiss.push( false );
                    let pid = promiss.length -1;
                    p.then((d)=>{
                        // console.log('   ... points ad '+t['id']);
                        r['points'] = d;
                        promiss[ pid ] = true;
                    });   
                } 
            }

            this.lookAtPromiss( promiss, ()=>{
                tgetAll( callBack, srcs, status ); 
            });
                
        
        }else {
            console.log(" what now ? res ");
            callBack( srcs );
        }


        /*
                let wayToDo = rows.length;
                let wayDone = 0;
                let wayIsDone = false;
                let traToDo = rows.length;
                let traDone = 0;
                let traIsDone = false;

                for( let s of rows ){
                    s['lever'] = 'source';
                    console.log('source: ',s);

                    tTracks(
                        s['id'], ( tracks )=>{
                            
                            for( let track of tracks ){
                                tPointsTrack( track['id'], ( points )=>{
                                    track['points'] = points;
                                } );

                            }
                            s['tracks'] = tracks;



                            traDone++;
                            if( traDone == traToDo ){
                                console.log('last track ! of '+traToDo);
                                //callBack( rows );
                                traIsDone = true;
                                tCallBackManager( callBack, rows, wayIsDone, traIsDone);
                            }
                        }
                     );

                    tWaypoints( 
                        s['id'], ( waypoints )=>{
                            s['waypoints']=waypoints;
                            wayDone++;
                            if( wayDone == wayToDo ){
                                console.log('last waypoint ! of '+wayToDo);
                                //callBack( rows );
                                wayIsDone = true;
                                tCallBackManager( callBack, rows, wayIsDone, traIsDone);
                            }
                        }
                     );


                }

            }
        });

        */
    }

    


    dbAllAsync = (query, params = []) => {
        return new Promise((resolve, reject) => {
            this.db.all(query, params, (err, rows) => {
                if (err) {
                    return reject(err);
                }
                resolve(rows);
            });
        });
    }

    async getSelect ( q ){
        return await this.dbAllAsync( q );
    }


    insertNewGpx=( fPath, name, desc, srcType, gpx )=>{

        console.log('insertNewGpx ... gpx info\n',
            'tracks: ',gpx.tracks.length,
            ', routes: ',gpx.routes.length,
            ', waypoints: ',gpx.waypoints.length,
        );

        let mPOk = null;
        let mPErr = null;
        let mPromis = new Promise(( isOk, isEr )=>{
            mPOk = isOk;
            mPErr = isEr;
        });

        let iterRes = [];
        let iterNo = 0;
        let iterDone = 0;
        let iterCurrentToDo = 4;
        let iterItem = setInterval(()=>{

            console.log(' .. chk status of insert of new gpx ....('+iterDone+' / '+iterCurrentToDo+')',iterNo++);
            if( iterDone == iterCurrentToDo ){
                mPOk( iterRes );
                clearInterval( iterItem );
            }
        },1000);


        let tNow = parseInt(Date.now());

        let tinsertTracks = this.insertTracks;
        let tinsertWaypoints = this.insertWaypoints;
        let tinsertRoutes = this.insertRoutes;
        let res = this.db.run( `
        INSERT INTO sources ( 
            xmlSource,  name,   desc,   srcType,    entryDate 
            ) VALUES ( ?,?,     ?,      ?,          ?);
        `, [ fPath,     name,   desc,   srcType,    tNow ],function( err ){
            if( err ){
                console.error("Error selecting resHendle ",err.message);
            }else{
                let source_id = this.lastID;
                iterDone++;
                iterRes.push({source_id: source_id} );
                console.log('gpx inserted with id .....',source_id);
                tinsertTracks( source_id, tNow, gpx.tracks ).then((r)=>{
                    console.log(' - track says:     ',r);
                    iterRes.push({track: r} );
                    iterDone++;
                });
                tinsertWaypoints( source_id, tNow, gpx.waypoints ).then((r)=>{
                    console.log(' - waypoint says:  ',r);
                    iterRes.push({waypoint: r} );
                    iterDone++;
                });
                tinsertRoutes( source_id, tNow, gpx.routes ).then((r)=>{
                    console.log(' - route says:     ',r);
                    iterRes.push({route: r} );
                    iterDone++;
                });
                return 11;
            }
        });
        //console.log('gpxDBHelper insert res:\n',res );
        return mPromis;

    }

    insertWaypoints=( source_id, tNow, waypoints )=>{

        let mPOk = null;
        let mPErr = null;
        let mPromis = new Promise(( isOk, isEr )=>{
            mPOk = isOk;
            mPErr = isEr;
        });

        let dParse = this.db.prepare( `
        INSERT INTO waypoints ( 
                            source_id,  name,   sym,    cmt,   lat,    lon,    ele,    time,   entryDate 
            ) VALUES (      ?,          ?,      ?,      ?,     ?,      ?,      ?,      ?,      ?);
        `);
        
        for( let p of waypoints ){
            dParse.run(
                [source_id,  p.name, p.sym, p.cmt, p.lat,  p.lon,  p.ele,  p.time, tNow ],
                ( err )=>{
                    if( err ){
                        console.error("Error selecting resHendle ",err.message);
                        mPErr( err.message );
                    }else{
                        mPOk({'waypoint_id':'ok'});
                    }
                });
        }
        dParse.finalize();

        if( waypoints.length == 0 ){
            setTimeout(()=>{ mPOk({'waypoint_id':-1}); },10);
        }

        return mPromis;

    }
    //saveWaypoints
    saveWaypoints= ( data, callBack, extraDataForCallBack = undefined) =>{
        console.log('gpxDBHelp - saveWaypoint');
        setTimeout(()=>{
            let d = data;
            let res = this.db.run( `UPDATE waypoints SET 
                name=?,   sym=?,    cmt=?,    desc=?,   lat=?,    lon=?,    ele=?,    time=?,   entryDate=?
                 WHERE id=?;
            `, [d.name,   d.sym,    d.cmt,    d.desc,   d.lat,    d.lon,    d.ele,    d.time,   d.entryDate,
                    data.id ],
            function( err ){
                if( err ){
                    console.error("Error selecting resHendle ",err.message);
                    callBack('ERROR/save', extraDataForCallBack != undefined ? extraDataForCallBack : data );
                }else{
                    callBack('saved',extraDataForCallBack != undefined ? extraDataForCallBack : data);
                }
            });

        },1);
    }

    removeWaypoints = ( data, callBack, extraDataForCallBack = undefined) =>{
        console.log('gpxDBHelp - removeWaypoint');
        setTimeout(()=>{
            let res = this.db.run( `DELETE FROM 
                waypoints WHERE id=?;
            `, [ data.id ],
            function( err ){
                if( err ){
                    console.error("Error selecting resHendle ",err.message);
                    callBack('ERROR/remove', extraDataForCallBack != undefined ? extraDataForCallBack : data );
                }else{
                    callBack('removed',extraDataForCallBack != undefined ? extraDataForCallBack : data);
                }
            });

        },1);
    }

    insertRoutes=( source_id, tNow, routes )=>{
        let mPOk = null;
        let mPErr = null;
        let mPromis = new Promise(( isOk, isEr )=>{
            mPOk = isOk;
            mPErr = isEr;
        });

        let tinsertPoints = this.insertPoints;
        for( let r of routes ){
            //console.log('insert route',[                source_id,  r.name, r.cmt,  r.desc, r.src,  r.number,   r.link, r.distance.total, tNow ]);
            let res = this.db.run( `
            INSERT INTO routes ( 
                                source_id,  name,   cmt,    desc,   src,    number,         link,           type,   distance,           entryDate 
                ) VALUES (      ?,          ?,      ?,      ?,      ?,      ?,              ?,              ?,      ?,                  ?);
            `, [                source_id,  r.name, r.cmt,  r.desc, r.src,  `${r.number}`,  `${JSON.stringify(r.link)}`,    r.type, r.distance.total,   tNow ],
            function( err ){
                if( err ){
                    console.error("Error selecting resHendle ",err.message);
                }else{
                    let route_id = this.lastID;
                    console.log('route inserted with id ...',route_id);
                    tinsertPoints( route_id, tNow, 'route', r.points );
                    mPOk({'route_id':this.lastID});
                }
            });

        }

        if( routes.length == 0 ){
            setTimeout(()=>{ mPOk({'route_id':-1}); },10);
        }

        return mPromis;
    }

    insertTracks=( source_id, tNow, tracks )=>{
        let mPOk = null;
        let mPErr = null;
        let mPromis = new Promise(( isOk, isEr )=>{
            mPOk = isOk;
            mPErr = isEr;
        });
        let tinsertPoints = this.insertPoints;

        for( let t of tracks ){
           //console.log('insert Track',[                source_id,  t.name, t.cmt,  t.desc, t.src,  t.number,   t.link, t.distance.total, tNow ]);
            let res = this.db.run( `
            INSERT INTO tracks ( 
                                source_id,  name,   cmt,    desc,   src,    number,         link,   distance,   entryDate 
                ) VALUES (      ?,          ?,      ?,      ?,      ?,      ?,              ?,      ?,          ?);
            `, [                source_id,  t.name, t.cmt,  t.desc, t.src,  `${t.number}`,  `${JSON.stringify(t.link)}`, t.distance.total, tNow ],
            function( err ){
                if( err ){
                    console.error("Error selecting resHendle ",err.message);
                }else{
                    let track_id = this.lastID;
                    console.log('track inserted with id ...',track_id);
                    tinsertPoints( track_id, tNow, 'track', t.points );
                    mPOk({'track_id':track_id});
                }
            });

        }


        if( tracks.length == 0 ){
            setTimeout(()=>{ mPOk({'track_id':-1}); },10);
        }

        return mPromis;
    }
    insertPoints=( source_id, tNow, pointsAs, points )=>{
        let t_id = 0;
        let r_id = 0;
        if( pointsAs == 'track' )
            t_id = source_id;
        else
            r_id = source_id; 

        let dParse = this.db.prepare( `
        INSERT INTO points ( 
                            track_id,   route_id,   lat,    lon,    ele,    time,   entryDate 
            ) VALUES (      ?,          ?,          ?,      ?,      ?,      ?,      ?);
        `);
        
        for( let p of points ){
            dParse.run(
                [t_id,       r_id,       p.lat,  p.lon,  p.ele,  p.time, tNow ],
                ( err )=>{
                    if( err ){
                        console.error("Error selecting resHendle ",err.message);
                    }else{
                        

                    }
                });
        }
        dParse.finalize();
       
    }

}


export { gpxDBHelp }
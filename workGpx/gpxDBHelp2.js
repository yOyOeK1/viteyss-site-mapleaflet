

import Database from 'better-sqlite3';

class gpxDBHelp2{

    constructor( dbPath ){
        this.dbPath = dbPath;
        
        this.db = -1;
        
        this.maxThreads = 1;
        this.waitThrottle = 70;

        this.entryDate = Date.now();

        this.initDb();
        this.createV1();
        this.modCurrent = this.modGetLast();
        this.infoOld = {};
        this.q_getInfo( ( r )=>{ this.infoOld = r; } );
        console.log('init DONE ,\nmodCurrent: ',this.modCurrent);
        //this.db.close();



    }


    initDb = () => {
        this.db = new Database( this.dbPath );
    }



    execNoReturn=( q, descOfTast = '' )=>{
        if( descOfTast != '' )
            console.log( descOfTast );
        try{
            this.db.exec( q );
            this.insert_modDates('createDB','init');
        }catch(e){
            if( `${e}`.startsWith( 'SqliteError: table' ) && `${e}`.endsWith(' already exists') )
                console.log('               its OK - table was there ');
            else
                console.error('DB error\n',`[${e}]`,'-----------------');
            
        }
    }


    q_getAll= () =>{
        console.log('get all ');
        let tStart = Date.now();
        let tmodDate = this.modGetLast();
        
        let routesR = this.db.prepare(`select * from routes ORDER BY time`).all();
        let trQ = this.db.prepare(`select id,lat,lon,route_id,track_id,time from points `).all();
        let tracksR = this.db.prepare(`select * from tracks ORDER BY time `).all();
        let waypointsR = this.db.prepare(`select * from waypoints  ORDER BY time`).all();
        let sources = this.db.prepare(`select * from sources `).all();
        
        let stats = {
            routesCount: routesR.length,
            tracksCount: tracksR.length,
            waypointCount: waypointsR.length,
            points:trQ.length
        };

        for( let t of tracksR){
            t['points'] = trQ.filter( i => i.track_id == t.id );
        }
        for( let t of routesR){
            t['points'] = t['points'] = trQ.filter( i => i.route_id == t.id );
        }
        //L.LineUtil.simplify();

        return {
            sources: sources,
            routes: routesR,
            tracks: tracksR,
            waypoints: waypointsR,
            stats: stats,
            workTime: ( Date.now() - tStart ),
            modDate: tmodDate,
            status:'ok'
        };
    }

    getEntryDate(){
        return parseInt( Date.now() )
    }

    q_getInfo=( callBack )=>{
        let tNow = this.getEntryDate();
        callBack( {
            action:'info',
            modLast: this.modGetLast(),
            sources: this.lastId_ofTable( 'sources' ),
            waypoints:  this.lastId_ofTable( 'waypoints' ),
            routes: this.lastId_ofTable( 'routes' ),
            points: this.lastId_ofTable( 'points' ),

            infoFrom: tNow
        } );
    }


    insert_modDates = ( action , src ) =>{
        /* action, src, entryDate */
        this.db.prepare(`
            INSERT INTO modDates 
            ( action, src, entryDate ) VALUES ( ?,?,? )
            `).run( action, src, this.getEntryDate()  );
    }


    insert_source=( data )=>{
        this.insert_modDates('insert_source',data.xmlSource);
        return this.db.prepare(`
            INSERT INTO sources ( 
                    xmlSource,   name,    desc,    srcType,     entryDate 
                ) VALUES ( 
                    @xmlSource,  @name,   @desc,   @srcType,    @entryDate);
            `).run(data);
    }

    insert_waypoint=( data )=>{
        let d = this.db.prepare(`
            INSERT INTO waypoints ( 
                                source_id,  name,   sym,    cmt,   lat,    lon,    ele,    time,   entryDate 
                ) VALUES (      @source_id,  @name,   @sym,    @cmt,   @lat,    @lon,    @ele,    @time,   @entryDate);
            `);
        if( data == undefined ){
            return d;
        }else{
            this.insert_modDates('insert_waypoint','');
            return d.run( data );
        }
        
    }
    insert_waypoints=( data )=>{
        let tr = [];
        let insWay = this.insert_waypoint();
        let multi = this.db.transaction((data) => {
            for( let d of data ){
                tr.push( insWay.run( d ) );
            }
        });
        multi( data );
        return tr;
                
    }

    insert_track=( data )=>{
        let d = this.db.prepare(`
            INSERT INTO tracks ( 
                                source_id,  name,   cmt,    desc,   src,    number,         link,   distance,   time,entryDate 
                ) VALUES (      @source_id,  @name,   @cmt,    @desc,   @src,    @number,         @link,   @distance,   @time,@entryDate);
            `);
        if( data == undefined ){
            return d;
        }else{
            this.insert_modDates('insert_track','');
            return d.run( data );
        }
        
    }

    insert_route=( data )=>{
        let d = this.db.prepare(`
            INSERT INTO routes ( 
                                source_id,  name,   cmt,    desc,   src,    number,         link,           type,   distance,           time,entryDate 
                ) VALUES (      @source_id,  @name,   @cmt,    @desc,   @src,    @number,         @link,           @type,   @distance,  @time, @entryDate);
            `);
        if( data == undefined ){
            return d;
        }else{
            this.insert_modDates('insert_route','');
            return d.run( data );
        }
        
    }

    insert_point=( data )=>{
        let d = this.db.prepare(`
           INSERT INTO points ( 
                            track_id,   route_id,   lat,    lon,    ele,    time,   entryDate 
            ) VALUES (      @track_id,   @route_id,   @lat,    @lon,    @ele,    @time,   @entryDate );
            `);
        if( data == undefined ){
            return d;
        }else{
            this.insert_modDates('insert_point','');
            return d.run( data );
        }
        
    }
    insert_points=( data )=>{
        let tr = [];
        let insWay = this.insert_point();
        let multi = this.db.transaction((data) => {
            for( let d of data ){
                tr.push( insWay.run( d ) );
            }
        });
        multi( data );
        return tr;
                
    }

    insert_NewGpx=( xmlSource, name, desc, srcType, gpx )=>{
        let tNow = this.getEntryDate();
        console.log('insertNewGpx ... gpx info\n',
            'tracks: ',gpx.tracks.length,
            ', routes: ',gpx.routes.length,
            ', waypoints: ',gpx.waypoints.length,
        );

        let souRes = this.insert_source({
            xmlSource: xmlSource,
            name: name, desc: desc, srcType: srcType, entryDate:tNow
        });

        let insertRes = [ souRes ];
        let pToDo = [];

        let count = 0;
        for( let i of gpx.waypoints ){
            i['source_id'] = souRes.lastInsertRowid;
            i['entryDate'] = tNow;
            if( (count++ % 10) == 0 ) console.log(` + waypoint ...( ${count} / ${gpx.waypoints.length})`);
        }
        insertRes.push( this.insert_waypoints( gpx.waypoints ) );
        count = 0;
        for( let i of gpx.tracks ){
            i['source_id'] = souRes.lastInsertRowid;
            i['entryDate'] = tNow;
            i['distance'] = i.distance.total;
            let iTodo = i['points'];
            i['time'] = iTodo[0].time;
            i['points'] = null;
            i['slopes'] = null;
            i['link'] = null;
            i['elevation'] = null;
            let res = this.insert_track( i );
            insertRes.push( res  );

            for( let pi of iTodo){
                pi['route_id'] = -1;
                pi['track_id'] = res.lastInsertRowid;
                pi['entryDate'] = tNow;
                pToDo.push( pi );
            }
            //insertRes.push( this.insert_points( iTodo ) );

            if( (count++ % 10) == 0 ) console.log(` + track ...( ${count} / ${gpx.tracks.length})`);
        }
        count = 0;
        for( let i of gpx.routes ){
            i['source_id'] = souRes.lastInsertRowid;
            i['entryDate'] = tNow;
            i['distance'] = i.distance.total;
            i['link'] = null;
            let iTodo = i['points'];
            i['time'] = iTodo[0].time;
            i['points'] = null;
            i['slopes'] = null;
            i['elevation'] = null;
            let res = this.insert_route( i );
            insertRes.push( res );
            for( let pi of iTodo){
                pi['track_id'] = -1;
                pi['route_id'] = res.lastInsertRowid;
                pi['entryDate'] = tNow;
                pToDo.push( pi );
            }
            //insertRes.push( this.insert_points( iTodo ) );

            if( (count++ % 10) == 0 ) console.log(` + route ...( ${count} / ${gpx.routes.length})`);
        }
        
        insertRes.push( this.insert_points( pToDo ) );


        return insertRes;
    }


    lastId_ofTable = ( tableName ) =>{
        return this.db.prepare(`select id, entryDate, '${tableName}' as tableName from ${tableName} where 1 order by entryDate desc limit 1`).get();
    }

    modGetLast = () => {
        return this.db.prepare('select * from modDates where 1 order by entryDate desc limit 1').get();
    }

    getGpxForSrc = ( data ) => {
        let src = data.src.join( ' / ' );
        let sources = this.db.prepare(`select id from sources WHERE xmlSource=? limit 1`).get( src );
        console.log(' get gpx for src ',src,' db result ',sources );
        if( sources == undefined ){
           console.log('   ... no local map gpx ... making it ....');
            let insRes = this.insert_source({
                xmlSource: src,   
                name: 'On map operations',    
                desc: '',    
                srcType: src,     
                entryDate: data.entryDate
            });
            console.log( '  after insert gpx we have ',insRes );
            return insRes.lastInsertRowid;
        }         
        
        return sources.id;
    }


    atom_action = ( atom )=>{
        console.log('DB atom ...');
        let mainReturn = {atomActionStatus:'ok', operations: [] };
        let tr = [];
        

        let source_id = ( 'data' in atom && 'src' in atom.data ) ? this.getGpxForSrc( atom.data ) : -1;



        if( atom.action == 'insert_waypoint' ){
            let d = atom.data;
            if( 'name' in d ){
                // is with Data TODO            
            }else{
                // is empty new 
                d.data['source_id'] = source_id;
                let insRes = this.insert_waypoint( d.data );
                tr.push( {
                    action: 'insert_waypoint',
                    res:  insRes});
                mainReturn['id'] = insRes.lastInsertRowid;
                mainReturn['source_id'] = source_id;
            }
        }



        if( atom.action == 'remove_track' ){
            tr.push( {
                action: 'delete_track_points',
                res: this.db.prepare(`DELETE FROM points WHERE track_id=?`).run( atom.id ) });
            tr.push( {
                action: 'delete_track',
                res: this.db.prepare(`DELETE FROM tracks WHERE id=?`).run( atom.id ) });
        
        }

        if( atom.action == 'remove_route' ){
            tr.push( {
                action: 'delete_route_points',
                res: this.db.prepare(`DELETE FROM points WHERE route_id=?`).run( atom.id ) });

            tr.push( {
                action: 'delete_route',
                res: this.db.prepare(`DELETE FROM routes WHERE id=?`).run( atom.id )} );

        }

        if( atom.action == 'remove_waypoint' ){
             tr.push( {
                action: 'delete_waypoint',
                res: this.db.prepare(`DELETE FROM waypoints WHERE id=?`).run( atom.id ) });
        }

        if( atom.action == 'remove_points_track' ){
            tr.push( {
                action: 'delete_points_track',
                res: this.db.prepare(`DELETE FROM points WHERE track_id=?`).run( atom.id ) });
        
        }

        if( atom.action == 'remove_points_route' ){
            tr.push( {
                action: 'delete_points_route',
                res: this.db.prepare(`DELETE FROM points WHERE route_id=?`).run( atom.id ) });
        }

        if( atom.action == 'remove_gpx' ){

            if( atom.waypoints )
                tr.push( {
                    action: 'delete_waypoints',
                    res: this.db.prepare(`DELETE FROM waypoints WHERE source_id=?`).run( atom.id ) });
            if( atom.tracks ){
                tr.push( {
                    action: 'delete_tracks_points',
                    res: this.db.prepare(`DELETE FROM points WHERE track_id IN (
                        SELECT id FROM tracks WHERE source_id=? )`).run( atom.id ) });
                tr.push( {
                    action: 'delete_tracks',
                    res: this.db.prepare(`DELETE FROM tracks WHERE source_id=?`).run( atom.id ) });
            }
            if( atom.routes ){
                tr.push( {
                    action: 'delete_routes_points',
                    res: this.db.prepare(`DELETE FROM points WHERE route_id IN (
                        SELECT id FROM routes WHERE source_id=? )`).run( atom.id ) });

                tr.push( {
                    action: 'delete_routes',
                    res: this.db.prepare(`DELETE FROM routes WHERE source_id=?`).run( atom.id )} );
            }

            tr.push( {
                    action: 'delete_sources',
                    res: this.db.prepare(`DELETE FROM sources WHERE id=?`).run( atom.id )} );


        }



        mainReturn.operations = tr;
        return mainReturn;
    }



    createV1=()=>{
        let q = `
        CREATE TABLE modDates
            (
                id INTEGER PRIMARY KEY AUTOINCREMENT, 
                action text,
                src text,
                entryDate text
            );
        `;
        this.execNoReturn( q, 'create table modDates' );
        
        
        q = `
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
        this.execNoReturn( q, 'create table sources' );

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
        this.execNoReturn( q, 'create table metadatas' );

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
        this.execNoReturn( q, 'create table waypoints' );

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
                time text,
                entryDate text
            );
        `;
        this.execNoReturn( q, 'create table tracks' );

        
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
        this.execNoReturn( q, 'create table points' );


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
                time text,
                entryDate text
            );
        `;
        this.execNoReturn( q, 'create table routes' );


    }

}

if( 0 ){
    let gdbh = new gpxDBHelp2('/tmp/db1.db');
}

export { gpxDBHelp2 }
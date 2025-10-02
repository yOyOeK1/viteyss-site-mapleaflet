import sqlite3 from 'sqlite3';
import fs from 'fs'
import { getColorToDepth } from './getColorToDepth.js';

/*
node ./fromdb.js
cp /tmp/geoj2.js ./
*/

var configg = {
    'dbPath': '/home/yoyo/Apps/viteyss-site-mapleaflet/conturesTest/LogDepth.db'
};
var map = {
  "_southWest": {
    "lat": 9.470174795895131,
    "lng": -78.96643280982973
  },
  "_northEast": {
    "lat": 9.473645876685529,
    "lng": -78.96061778068542
  }
};

let SQLite3 = sqlite3.verbose();
var db = new SQLite3.Database(configg['dbPath'], (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    // Create table and perform operations
   
  }
});


function rowsToGeo( rows ){
    let tr = [];

    for( let r of rows ){
        let colorsA = getColorToDepth( r['depth'] );
        tr.push({
            "geometry": {
                "type": "Point",
                "coordinates": [
                   r['lon'],r['lat']
                ],
                radius: parseInt(r['depth']),
            },
            "id": r['id'],
            "xy": [ r['x_cell_id'], r['y_cell_id'] ],
            "type": "Feature",
            "depth": r['depth'].toFixed(1)
            /*"properties": {
                "style": {
                    //weight: 0,
                    //color: "green",
                    //opacity: 1.0,
                    fillOpacity: colorsA['alpha'],
                    fillColor: colorsA['rbg'],
                    //color: colorsA['rbg'],
                }
            },*/
        });
    }


    return tr;
}

function select2( db, mapBorders, limit = 10, callBack = undefined, wCells = 50, hCells = 50 ){
    const numXCells = wCells;
    const numYCells = hCells;

    const sqlQuery = `
   SELECT
  CAST((Lat - ?) / ((? - ?) / ?) AS INTEGER) AS y_cell_id,
  CAST((Lon - ?) / ((? - ?) / ?) AS INTEGER) AS x_cell_id,
  MIN(depth) AS depth,
  lat,lon,id

FROM depths
WHERE
  Lat >= ? AND Lat <= ? AND
  Lon >= ? AND Lon <= ?
GROUP BY
  y_cell_id,
  x_cell_id
ORDER BY
  depth desc;
    `;

    // Create an object to pass to your database driver
    // The keys match the named parameters in the query
    const params = [
        mapBorders['_southWest']['lat'], // ? 1
        mapBorders['_northEast']['lat'], // ? 2
        mapBorders['_southWest']['lat'], // ? 3
        numYCells,                       // ? 4
        mapBorders['_southWest']['lng'], // ? 5
        mapBorders['_northEast']['lng'], // ? 6
        mapBorders['_southWest']['lng'], // ? 7
        numXCells,                       // ? 8
        mapBorders['_southWest']['lat'], // ? 9
        mapBorders['_northEast']['lat'], // ? 10
        mapBorders['_southWest']['lng'], // ? 11
        mapBorders['_northEast']['lng']  // ? 12
    ];

    let abcd = db.all(sqlQuery,params,( err, rows )=>{
        if( err )
            console.error('Error selecting data:', err.message);
        
        else{
            //console.log(`results\n`,rows);
            let toFile = {
                "type": "FeatureCollection",
                "cells": [ wCells, hCells],
                "features": rowsToGeo( rows )
                };

            if( callBack != undefined ){
                callBack( toFile );
            }else{

                //console.log(JSON.stringify(toFile,null,4));
                fs.writeFileSync('/tmp/geoj2.js', 
                    'let geoJ2 = '+
                    JSON.stringify(toFile,null,4)+
                    ';\nexport{ geoJ2 }'
                );
            }
        }
    });
}


function select1( db, mapBorders, limit = 10, callBack = undefined ){

    let abcd = db.all(`select id,Lat,Lon,depth from depths
        where 
         usable=1 AND 
         Lat <= ${mapBorders['_northEast']['lat']} AND 
         Lat >= ${mapBorders['_southWest']['lat']} AND

         Lon <= ${mapBorders['_northEast']['lng']} AND 
         Lon >= ${mapBorders['_southWest']['lng']} 

        order by depth desc
        
        limit ${limit};`,[],( err, row )=>{
        if( err )
            console.error('Error selecting data:', err.message);
        
        else{
            console.log(`results\n`,row);
            let toFile = {
                "type": "FeatureCollection",
                "features": rowsToGeo( row )
                };

            if( callBack != undefined ){
                callBack( toFile );
            }else{

                //console.log(JSON.stringify(toFile,null,4));
                fs.writeFileSync('/tmp/geoj1.js', 
                    'let geoJ1 = '+
                    JSON.stringify(toFile,null,4)+
                    ';\nexport{ geoJ1 }'
                );
            }
        }
    });
    console.log('abcdb: ',abcd);
}

//select1( db, map, 20000 ); 
//select2( db, map, 20000 ); 
let dbSoundingsToData = {
    getDb: db,
    selectByRaster: select2
};
export { dbSoundingsToData, getColorToDepth }
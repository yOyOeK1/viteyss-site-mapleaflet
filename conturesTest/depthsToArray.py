import sqlite3


config = {
    'dbPath': './LogDepth.db'
}


map = {
  "_southWest": {
    "lat": 9.468746139647635,
    "lng": -78.96837472915651
  },
  "_northEast": {
    "lat": 9.47568829502144,
    "lng": -78.95444869995119
  }
}
map = {
  "_southWest": {
    "lat": 9.468661478350203,
    "lng": -78.96708726882936
  },
  "_northEast": {
    "lat": 9.475603635435439,
    "lng": -78.96019935607912
  }
}


def getPoints( mapBorders, limit = 10 ):
    q = f'''select Lat,Lon,depth from depths 
where 
 usable=1 AND

 Lat <= {mapBorders['_northEast']['lat']} AND 
 Lat >= {mapBorders['_southWest']['lat']} AND

 Lon <= {mapBorders['_northEast']['lng']} AND 
 Lon >= {mapBorders['_southWest']['lng']} 

order by depth

limit {limit}'''
    dbcon = sqlite3.connect(config['dbPath'])
    dbcon.enable_load_extension(True)
    dbc = dbcon.cursor()
    dbres = dbc.execute( q )
    return dbres



def findMinMax( dataTo, indexToLook ):
    min = -1
    max = -1
    i = 0
    #print(f"find mm: in index[{indexToLook}]")
    
    for d in dataTo:
        #print(f"i: {i}   d:{d}")
        if i == 0:
            min = d[ indexToLook ]
            max = d[ indexToLook ]
            i = 1
        else:
            if min > d[ indexToLook ]:
                min = d[ indexToLook ]
            if max < d[ indexToLook ]:
                max = d[ indexToLook ]
         
    return {
        'min': min, 'max': max
    }

def findMinStep( dataTo, indexToLook ):
    s = 100000000000000.00
    i = 0
    pLast = -1
    for d in dataTo:
        if i == 0:
            pLast = d[ indexToLook ]
        else:
            stpe = d[ indexToLook ] - pLast
            if (stpe != 0 and s > stpe ) or (i == 1 and stpe != 0):
                s = stpe
                


        i+= 1
    return s

def findGoodPoint( dataTo, ix, iy, latOff, lngOff, latS, lngS):
    bor = {
        '_northEast':{ 'lat': latOff+(iy*latS), 'lng': lngOff+(ix*lngS) },
        '_southWest':{ 'lat': latOff+(iy*latS)-latS, 'lng': lngOff+(ix*lngS)-lngS },
    }
    trD = -1
   # print(f"---------------------{ix}, {iy}-------\nbor\n{bor}\n\n")
    for d in dataTo:
        if d[0] <= bor['_northEast']['lat'] and d[0] >= bor['_southWest']['lat'] and d[1] <= bor['_northEast']['lng'] and d[1] >= bor['_southWest']['lng']:
            #print(f"p at {ix}, {iy} depth: {d[2]}")
            return d[2]
    return None
    

def growByDepth( depth ):
    return int( 2+depth )

def findDepthsAndGrow( dataTo ):
    for y in range(0, len( dataTo ), 1):
        for x in range (0, len( dataTo[0]), 1):
            if dataTo[y][x] != None:
                d = dataTo[y][x]
                if d > 5: 
                    d = int( d )
                #print(f"point ( {x},{y} ) depth: {d}")

                gby = growByDepth( d )
                for gx in range( x-gby, x+gby, 1 ):
                    for gy in range( y-gby, y+gby, 1 ):
                        try:

                            if dataTo[ y-gy ][ x-gx ] == None or dataTo[ y-gy ][ x-gx ] > d:
                                dataTo[ y-gy ][ x-gx ] = d

                        except:
                            print("oiysh")

    return dataTo
                
    


if __name__ == "__main__":
    print("Run test .....")

    mapmm = [
        [ map['_northEast']['lat'], map['_northEast']['lng'], 0 ],
        [ map['_southWest']['lat'], map['_southWest']['lng'], 0 ]   
    ]

    points = getPoints( map, 3000 )
    aPo = []
    for r in points:
        print( r )
        aPo.append( r)
    
    Latmm = findMinMax( aPo, 0 )
    Lngmm = findMinMax( aPo, 1 )
    Depmm = findMinMax( aPo, 2 )
    print('min max ----------------')
    print(f"at lat: ")
    print( Latmm )
    print(f"at lng: ")
    print( Lngmm )
    print(f"at Dep: ")
    print( Depmm )


    LatS = sorted(aPo, key=lambda x: x[0])
    LatSampSize = findMinStep( LatS, 0 )
    LngS = sorted(aPo, key=lambda x: x[1])
    LngSampSize = findMinStep( LngS, 1 )
    DepS = sorted(aPo, key=lambda x: x[2])
    DepSampSize = findMinStep( LatS, 2 )

    mapLatS = sorted(mapmm, key=lambda x: x[0])
    mapLatSampSize = findMinStep( mapLatS, 0 )
    mapLngS = sorted(mapmm, key=lambda x: x[1])
    mapLngSampSize = findMinStep( mapLngS, 1 )

    conW = mapLatSampSize/LatSampSize
    conH = mapLngSampSize/LngSampSize
    print(f'''sample step min:
        lat: {LatSampSize}
        lng: {LngSampSize}
        dep: {DepSampSize}
        map -------------
        size:   {mapLatSampSize}
                {mapLngSampSize}
        array size: { conW }  , { conH }
        readings:   { len(DepS) }
        
        ''')



    z = []
    for y in range(0, int(conH), 1):
        row = []
        for x in range(0, int(conW), 1):
            row.append( 
                findGoodPoint( DepS, x, y, Latmm['min'], Lngmm['min'], LatSampSize, LngSampSize ) 
                )


        z.append( row )
            
    #z = findDepthsAndGrow( z )

    import arrayToSvg
    import os

    tKml = '../workKmls/depthTest_Grow1'
    tKmlBase = os.path.basename( tKml )
    print(f"save as {tKml}.kml")
    arrayToSvg.arrayToSvg( z, f"{tKml}.svg" )


    kmlC = f'''<?xml version="1.0" encoding="UTF-8"?>
<kml><GroundOverlay><name>{tKmlBase}.svg</name><color>88ffffff</color><Icon>
<href>{tKmlBase}.svg</href>
<viewBoundScale>0.75</viewBoundScale></Icon><LatLonBox>
<north>{Latmm['max']}</north>
<south>{Latmm['min']}</south>
<east>{Lngmm['max']}</east>
<west>{Lngmm['min']}</west>
</LatLonBox></GroundOverlay></kml>'''
    with open( f"{tKml}.kml", "w" ) as file:
        file.write( kmlC )
    




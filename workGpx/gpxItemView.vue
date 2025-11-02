<template>
    <h4>Extra info - {{ srcType }}</h4>

<div>
    <b>Time of creation:</b> 
        {{ item.time }}
</div>
<div v-if="srcType == 'track'">

    <div>        
        <b>Time starts:</b>
        {{ item.points[0].time }}
    </div>
    <div>        
        <b>Time ends:</b>
        {{ item_points_last.time }}
    </div>    
    
    <b>Travel total time:</b>
    {{  getTimeTotal('nice') }}<br></br>
    <b>- speed (avg):</b>
    {{  getSpeed('totalAvg') }}
</div>

<div>
    <b>Description:</b>
    {{ item.desc }}
</div>
<div>
    <b>Type:</b>
    {{ item.type }}
</div>
<div>
    <b>unixMS:</b>
    {{ convertTimeToUnix( item.time) }}
</div>


</template>

<script>

export default{
    props:[
        'srcType', 'id', 'latlng', 'item','gpxsManager'
    ],
    data(){
        return {
            item_points_last:''
        };
    },

    methods:{

        // 2016-10-28T15:56:01.000Z
        convertTimeToUnix( strTime ){
            let dateObject = new Date( strTime);
            let unixTimestampInMilliseconds = dateObject.getTime();
            //console.log( unixTimestampInMilliseconds );
            return unixTimestampInMilliseconds;
        },
        getSpeed( speedType ){
            if( speedType == 'totalAvg' ){
                let tTotalH = this.getTimeTotal('unix')/60.00/60.00;
                let tDistKm = this.item.distance/1000.00;
                let tAvgSpeed = tDistKm / tTotalH;
                return tAvgSpeed.toFixed(4)+' '+this.gpxsManager.utilsGetUnitsFor('speed');
            }
            return 'speedType:'+speedType;
        },
        getTimeTotal( returnAs = 'nice'){

            if( !('timeUnix' in this.item.points[0]) )
                this.item.points.forEach( p => { p['timeUnix'] = this.convertTimeToUnix( p.time ); } );

            this.item_points_last = this.item.points[ this.item.points.length - 1 ];
            let tTotal = this.item_points_last.timeUnix - 
                this.item.points[0].timeUnix;
            if( returnAs == 'nice')
                return this.gpxsManager.utilsUnixMillisToNice_howLond(tTotal);
            else if( returnAs == 'unix' )
                return parseInt( tTotal / 1000.00 );

            return 'timeAs['+returnAs+']';
        }


    }

}

</script>

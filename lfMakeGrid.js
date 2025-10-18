
class lfMakeGrid{
    
    constructor( map ){
        this.map = map;
        this.olGrid = -1;
    }

    slashZeros=( v )=>{
        console.log('slash in ',v,'         ');
        let sV = String(v);
        if( Math.abs( v ) >1.0 && sV.endsWith('0') ){
            slashZeros( parseFloat( sV.substring(0, v.length-2) ) );
        }
        console.log("out",sV);
        return sV;
    }

    getolGrid = ( ) =>{

        this.olGrid = L.latlngGraticule({
            'color': 'black',
            'latFormatTickLabel':(s)=>{
                return s.toFixed(5);
            },
            'lngFormatTickLabel':(s)=>{
                return s.toFixed(5);
            },
            showLabel: true,
            zoomInterval: [
                {start: 2, end: 3, interval: 30},
                {start: 4, end: 4, interval: 10},
                {start: 5, end: 6, interval: 5},
                {start: 6, end: 7, interval: 2},
                {start: 8, end: 9, interval: .5},
                {start: 10, end: 10, interval: 0.166666666},
                {start: 11, end: 11, interval: 0.083333333},
                {start: 12, end: 12, interval: 0.0625},
                {start: 13, end: 14, interval: 0.01666666666/4},
                {start: 15, end: 18, interval: 0.01666666666/10}
                
            ]
        }).addTo( this.map );
        //this.olGrid.bringToFront();
        this.olGrid.bringToFront();
        return this.olGrid;
    }
}
export { lfMakeGrid }
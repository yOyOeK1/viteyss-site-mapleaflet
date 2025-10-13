






class mapioShare{
    constructor( mapioO ){
        this.mapio = mapioO;

        this.name = `mapioShare_${this.mapio.mapname}`;
        this.q2Src = ['and',q2.getName(),this.name ];
    
        this.markers = [];


        this.registerOn();
    }

    getIcon=(name)=>{
        var icons = {
            'share': L.icon({
                iconUrl: this.mapio.homeUrl+'assets/mapMarkers/marker-icon-share.png', // Replace with your green marker image path
                shadowUrl: this.mapio.homeUrl+'assets/mapMarkers/marker-shadow.png', // Replace with your shadow image path
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            })
        };

        return icons[ name ];
    }

    cl=(msg,t="")=>{
        if( t != "" ) t = "\n"+t;
        console.log(this.name+' : ',msg,t);
    }

    registerOn=()=>{
        q2.on( this.name, 'and/mapioShare/cmd', this.onCB_cmd );
        q2.on( this.name, this.q2Src.join('/')+'/addMarker', );
    }

    onCB_cmd=(t,p)=>{
        this.cl('cb cmd$ '+t,p);

        if( t.endsWith("/cmd") ){

            if( p == 'ping' ){
                q2.emit( 'and/mapioShare/res', 'pong' );

            }else if( p == "?"){
                q2.emit( t.replaceAll('/cmd','/res'), {
                    "src": this.q2Src,
                    "name":"mapioShare",
                    'status': -1,
                    'cmds':[

                        /*
                        q2.emit('and/mapioShare/cmd',{doIt:"addMarker",ll:[9.481593249618884,-78.63517198929484]})
                        q2.emit('and/mapioShare/cmd',{doIt:"addMarker",ll:[9.481593249618884,-78.63517198929484],popup:"Ok tu (X)"})
                        */
                        {name:'addMarker', value: [
                            {name:'ll',     vType:'ll', default: [ 0.0, 0.0 ] },
                            {name:'popup',  vType:'string', default: undefined }
                            ]
                        },
                        
                        ]
                    } 
                );          
            }else if( 'doIt' in p ){
                if(p['doIt'] == 'addMarker' ){
                    this.cl('do it add marker ?',JSON.stringify(p,null,4));
                    let id = 'id' in p ? p['id'] : 'shP.'+Date.now();

                    let isNew = -1;
                    for( let m of this.markers ){
                        if( m.id == id ){
                            isNew = m;
                            break;

                        }
                    }

                    if( isNew == -1 ){
                        let m = L.marker(p.ll, {
                            title: "Share: "+(new Date()),
                            draggable:true,
                            icon: this.getIcon('share'),
                            contextmenu: true,
                            contextmenuItems: [
                                {
                                    text: '<i class="fa-solid fa-share-nodes"></i> marker to <i class="fa-solid fa-trash"></i>',
                                    index: 0,
                                    callback: (e)=>{ 
                                        m.remove(this.mapio.map);
                                        this.markers.pop(this.markers.indexOf({ id: id, m:m }));
                                        console.log('now have markers in stock ... '+this.markers.length);
                                    }
                                },
                                {
                                    text: '<i class="fa-solid fa-share-nodes"></i> or remove all',
                                    index: 1,
                                    callback: (e)=>{ 
                                        for( let mm of this.markers ){
                                            mm['m'].remove(this.mapio.map);
                                        }
                                        this.markers = [];
                                        
                                    }
                                }, 
                                {
                                    separator: true,
                                    index: 2
                                }
                            ]
                        });
                        m.on('dragend',(e)=>{
                            //console.log('share point drag end ',e,e.target['_latlng']);
                            this.cl(`share point move end :${id} new ll:`+e.target['_latlng']['lat']+' , '+e.target['_latlng']['lng'])
                            q2.emit('and/mapioShare/cmd',{doIt:"addMarker",ll:[ e.target['_latlng']['lat'], e.target['_latlng']['lng'] ],id:id})
                        });
                        if( 'popup' in p && p['popup'] != "" )
                            m.bindPopup( `${p['popup']}` );

                        m.addTo(this.mapio.map);

                        if( 'popup' in p )
                            m.openPopup();

                        this.markers.push({ id: id, m:m });
                    }else{
                        isNew.m.setLatLng(p.ll);
                    }

                    //window['sham'] = m;
                }

            }
        }
    }

    onCB_addMarker=(t,p)=>{
        this.cl('cb add marker '+t,p);

    }

}

export{ mapioShare }
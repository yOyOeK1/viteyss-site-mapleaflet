<template>
    <div 
        class="kmiItem"
        v-show="kitem.inframe"
        :title="kitem.fname+': \n'+kitem.path+' \ndpA: '+kitem.dpA+'\nlat, lon: '+JSON.stringify(kitem.split['llCenter'])"
        :style="{ 
            'background-color':  doBgColor(),
         
            }"
        @click="itemClick()"
        @mouseover="mouseOverS()"
        @mouseout="mouseOutS()"
        >{{ kitem.fname }}</div>
</template>
<script>

import { ref,defineEmits } from 'vue';

export default{
    props:[ 'kid', 'kfile', 'kitem','lfmapprop' ],
    data(){
        let status = ref('loaded');
        let kmiColor = ref('orange');
        let mapio = ref([]);
        let lBorder = -1;

        return { status, kmiColor, mapio,lBorder };

    },
    
    methods:{
        doBgColor(){
            if( this.kitem['showing'] ){
                if( this.kitem['type'] == 'kap')
                    return 'green';
                else if( this.kitem['type'] == 'kml' )
                    return 'orange';
                else
                    return 'yellow';
            }else{
                return 'gray';
            }
        },
        mouseOverS(){
            if( this.lBorder == -1 ){
                this.lBorder = L.rectangle( 
                    [ this.kitem.split.llBorders.tl, this.kitem.split.llBorders.br ],
                    {color: 'red', weight: 1}
                );

            }

            this.lBorder.addTo( this.lfmapprop );
            console.log('over'+this.lfmapprop.getCenter());
        },
        mouseOutS(){
            console.log('out');
            this.lBorder.remove();
        },
        itemClick(){
            console.log('click ! '+this.kid+' '+this.kitem.showing );
            //if( !this.kitem.showing )
            this.$emit('myCustomEvent',{                
                "action":"toogle",
                "kid": this.kid
            });



        }
    }


}
</script>
<style>

.kmiItem{
    display: inline-block;
    max-height: 15px;
    border-radius: 3px;
    border: solid 1px gray;
    padding:3px;
    margin-left: 2px;

    overflow-x: hidden !important;
   
   
}
</style>
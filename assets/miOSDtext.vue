<template>
    <div 
        class="miOSDtext"
        @click="itemClick()"
        @mouseover="mouseOverS()"
        @mouseout="mouseOutS()"
        >{{ titleNice }} (({{ timeOk }}))<br>
        {{ value }}
        
        </div>
</template>
<script>

import { ref,defineEmits } from 'vue';

export default{
    props:[ 'title', 'value', 'iterNo' ],
    data(){
        let tLast = ref(0);
        let tDelta = ref(0);
        let interval = -1;
        let titleNice = ref('');
        let timeOk = ref('--');

        return { tLast, tDelta, interval, titleNice, timeOk };
    },
    
    methods:{
        /*
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
        doBordorColor(){
            //
            let color = 'rgb(209, 255, 91)';
            //console.log(this.kitem);
            if( this.kitem['forceAction'] )
                color = '#ff0000';
            return `solid 1px ${color}`;
        },*/
        mouseOverS(){
            console.log('over');
        },
        mouseOutS(){
            console.log('out');
            
        },
        itemClick(){
            console.log('click ! ' );

        }
    }


}
</script>
<style>

.miOSDtext{
    background-color: greenyellow;
    display: inline-block;
    border-radius: 3px;
    padding:3px;
    margin-left: 2px;

   
   
   
}
</style>
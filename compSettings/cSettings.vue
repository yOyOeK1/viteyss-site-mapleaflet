<template>
    
    
    cSett .vue {{ pmap.mapname }} {{ isOpen }}
    <button @click="isOpen=!isOpen">?</button>


    <div v-show="isOpen"
        class="cSetShe"
        :id="'cSetShelw'+pmap.mapname"
        :style="'top:'+pxy[0]+'px;right:'+pxy[1]+'px;'"
        >
        Setting shellf

    </div>

</template>
<script>

export default{
    props:[ 'pmap' ],
    data(){
        return {
            isOpen: true
        };
    },
    computed:{
        pxy(){
            let offSet = [0,0];
            try{

                let mDiv = document.getElementById('cSetShelw'+this.pmap.mapname).getBoundingClientRect();
                console.log('mDiv ',mDiv);
                offSet = [ 0,0 ];
            }catch(e){
                console.log('mDiv error',e);
            }

            return [0+offSet[0],-10+offSet[1]];
        }
    }

}
</script>

<style>
.cSetShe{
    background-color: rgb(206, 206, 206);
    min-width: 45vw;
    min-height: 100vh;
    

    position: absolute;
    
    z-index: 100;
}

</style>
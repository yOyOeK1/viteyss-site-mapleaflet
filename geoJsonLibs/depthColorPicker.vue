<template>
<div class="depColPic">
<pre><input type="color" 
    v-model="mapio.depthSouningO.geoH.colorM[0][1]"
    @change="makeUpdateSoudings()"
    >- rafa / sand</input>
<input type="color" 
    v-model="mapio.depthSouningO.geoH.colorM[1][1]"
    @change="makeUpdateSoudings()"
    >- {{ mapio.depthSouningO.geoH.colorM[1][0] }} blue</input>
<input type="color" 
    v-model="mapio.depthSouningO.geoH.colorM[2][1]"
    @change="makeUpdateSoudings()"
    >- {{ mapio.depthSouningO.geoH.colorM[2][0] }} white</input>

<b>Custom alarm</b>
minimum depth ({{ mapio.depthSouningO.geoH.minDepth }}) meters
<input type="color" 
    v-model="mapio.depthSouningO.geoH.minColor"
    @change="makeUpdateSoudings()"
    >- color</input>
</pre>

</div>
</template>
<script>
export default{
    props:['mapio'],
    methods:{
        makeUpdateSoudings(){
            this.mapio.depthSouningO.depthSoundingUpdate();
        }
    }


}


</script>
<style>
.depColPic input{
    border: 0px;
    width: 25px;
    height: 25px;
}
</style>
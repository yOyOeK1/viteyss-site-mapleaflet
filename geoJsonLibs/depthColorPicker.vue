<template>
<div class="depColPic">


    <table 
        class="depColPicTab">
        <tr>
            <td>0</td>
            <td v-for="i in maxIntDepth"
                :style="'background-color:'+getColorForDepth(i/2)+';'"
                ></td>
            <td>{{ maxIntDepth }}</td>
        </tr>
    </table>

    <table>
        <tr>

            <td v-for="(colS,index) of mapio.depthSouningO.geoH.colorM"
                :class="index == editingIndex ? 'depKeyDepEdit': ''"
                >
                <input 
                    type="color" 
                    v-model="mapio.depthSouningO.geoH.colorM[index][1]"
                    @change="makeUpdateSoudings()"
                    >
                </input>
                <button @click="editingIndex=index" class="btDepColPic">{{colS[0]}}</button>
            </td>
            <td>
                <button @click="onAddNew()" class="btDepColPic">+</button>
            </td>

        </tr>
    </table>

    <div v-if="editingIndex != -1"
        class="depKeyDepEdit">
        Depth key at:
        <input type="number"
            inputmode="decimal"
            step="0.1"
            style="min-width: 25%;"
            v-model="mapio.depthSouningO.geoH.colorM[editingIndex][0]"
            @change="makeUpdateSoudings()"
            ></input>
        <button @click="onRemove()" class="btDepColPic">[x]</button>
    </div>

<hr>
<b>Custom alarm:</b><br>
depth less then ({{ mapio.depthSouningO.geoH.minDepth }}) meters<br>
<input type="color" 
    v-model="mapio.depthSouningO.geoH.minColor"
    @change="makeUpdateSoudings()"
    > - color</input>


</div>
</template>
<script>
import { getColor} from './getColorToDepth';

export default{
    props:['mapio'],
    data(){
        return {
            editingIndex:-1
        };
    },
    computed:{
        maxIntDepth(){
            let tr = 5;
            for( let d of this.mapio.depthSouningO.geoH.colorM  )
                if( tr < d[0] )
                    tr = d[0];
            return parseInt(tr+5);
        }
    },
    methods:{
        onAddNew(){
            let cm = this.mapio.depthSouningO.geoH.colorM;
            this.mapio.depthSouningO.geoH.colorM.push(
                JSON.parse( JSON.stringify(cm[ cm.length-1 ] ) )
            );
        },
        onRemove(){
            this.mapio.depthSouningO.geoH.colorM.pop( this.editingIndex );
            this.editingIndex = -1;
            this.makeUpdateSoudings();
        },

        makeUpdateSoudings(){
            this.mapio.depthSouningO.geoH.colorM.sort( 
                (a,b)=> a[0] - b[0]
             );

            this.mapio.depthSouningO.depthSoundingUpdate();
        },
        getColorForDepth( depth ){
            return getColor( depth,this.mapio.depthSouningO.geoH.colorM )
        }
    }


}


</script>
<style>
.btDepColPic{
    border:0px;
    margin:0px;
    padding:5px;
}
.depColPic input{
    border: 0px;
    width: 25px;
    height: 25px;
}
.depColPicTab{
    border-collapse: collapse;
    border-spacing: 0px;
    
    margin: 0px;
    padding: 0px;
    border: 0px;
    min-width:100px;
    min-height: 15px;
}
.depColPicTab tr {
    margin: 0px;
    padding: 0px;
    border: 0px;
}

.depKeyDepEdit{
    border-radius: 6px;
    border:solid 1px gray;
    background-color: white;
}
</style>
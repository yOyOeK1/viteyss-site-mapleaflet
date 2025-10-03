<template>
    <select
        v-model="preselected"
        @change="onChange($event)"
        >
        <option v-for="pset in presets"
            :value="pset.id"
            >
            {{ pset.name }}
        </option>
    </select>
    <button @click="onAddNew()" class="btDepColPic">+</button>
    <!--
    <br>
    <i v-for="col in presets[ preselected ].colorM"
        :style="'background-color:'+col[1]+';'">{{ col[0] }},</i>
    -->
    <br>
    id:({{ preselected }}) Name:<input type="text"
        v-model="presets[ preselected ].name"></input>

</template>
<script>
export default{
    props:[ 'presets','selected','mapio' ],
    data(){
        return { 
            preselected: this.selected 
        };
    },

    methods:{
        onAddNew(){
            let tr = JSON.parse( JSON.stringify( this.presets[ this.preselected ] ) );
            tr['id'] = this.presets.length;
            tr['name']+='_'+(Date.now()%1000);
            this.presets.push( tr );
            this.preselected = this.presets.length-1;
        },
        onChange( event ){
            console.log('depth color theme selected ', event,' pneselection:',this.preselected,
                '\ncolors\n',this.presets[ this.preselected ].colorM
            );
            this.mapio.depthSouningO.geoH.colorM = this.presets[ this.preselected ].colorM;
            this.mapio.depthSouningO.depthSoundingUpdate();
        }
    }

}

</script>
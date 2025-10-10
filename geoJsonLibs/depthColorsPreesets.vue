<template>
    <select
        v-model="preselected_id"
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
    id:({{ preselected_id }}) Name:<input type="text"
        v-model="getPresetById( preselected_id ).name"></input>

</template>
<script>
export default{
    props:[ 'presets','selected','mapio' ],
    data(){
        return { 
            preselected_id: this.selected 
        };
    },
    computed:{
    },
    methods:{
        getPresetById( id ){
            console.log('get preset by id:'+id);
            for( let pre of this.presets )
                if( pre.id === id )
                    return pre;
            return undefined;
        },
        onAddNew(){
            let tr = JSON.parse( JSON.stringify( this.getPresetById( this.preselected_id ) ) );
            tr['id'] = Date.now();//this.presets.length;
            tr['name']+='_'+(Date.now()%1000);
            this.presets.push( tr );
            this.preselected_id = tr['id'];
            //this.selected = tr['id'];
        },
        onChange( event ){
            let preset = this.getPresetById( this.preselected_id );
            console.log('depth color theme selected ', event,' pneselection:',this.preselected_id,
                '\ncolors\n',preset.colorM
            );
            this.mapio.depthSouningO.geoH.colorM = preset.colorM;
            this.mapio.depthSouningO.depthSoundingUpdate();
            this.preselected_id = preset.id;
        }
    }

}

</script>
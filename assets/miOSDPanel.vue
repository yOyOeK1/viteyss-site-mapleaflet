<template>
    miOSDPanel :)
    
    <div>
            
       

    </div>

</template>
<script>
import { ref } from 'vue';

export default{
    props:{
        'osdd': { required: true },
    },
    data(){
        let topics = ref([]);
        let topicsC = 0;
        let rows = 1;
        let iter = ref(0);

        //setInterval(()=>{ this.iterUpdate()},
        //    1000);

        return { topics, topicsC, rows,iter };
    },
    methods:{
        iterUpdate(){
            this.iter++;
        },
        dataUpdate(){
            /*
            this.topics = Object.keys( this.osdd );
            this.topicsC = this.topics.length;
            this.rows = parseInt( this.topicsC )+1;
            */
        }

    }


}

</script>
<template>
    <div class="maze_container">

    </div>
</template>

<script setup>  
    import { ref } from 'vue';
    
    const width = 500;
    const height =  500;
    const max = 40;
    const min =  20;
    const nodes =  Math.floor(Math.random() *(max-min) + min)
    console.log(nodes);
    const node_list = [];
    for(let i = 0; i<nodes; i++)
    {
        console.log(i+1)
        const node_cords = {
            y_cords:Math.floor(Math.random()*100),
            x_cords:Math.floor(Math.random()*100),
            node:i+1,
        }
        node_list.push(node_cords);
    }
    node_list.forEach(node => {
        console.log(node)
        
    });
</script>

<style scoped>
    .maze_container
    {
        width:500px;
        height:500px;
        background: black;
    }
</style>
<template>
    <div class="options_menu"> 
        <form @submit.prevent>
            <button type="button" @click="regenerate" >Regenerate</button>
            <button type="button" @click="solve">Solve Points</button>
            <button type="button" @click="clearChanges">Clean Maze</button>
            <button type="button" @click="stopGeneration">Stop</button>
        </form>
        <form @submit.prevent="" @change="updateSettings" class="change_difficulty">
            <select v-model="node_size">
                <option value=10>Hard</option>
                <option value=20>Medium</option>
                <option value=40>Easy</option>
            </select>
        </form>
        <form @submit.prevent="" @change="updateSettings" class="change_algorithm">
            <select v-model="selectedAlgorithm">
                <option value="prims">Prim's Algorithm</option>
                <option value="back_recursive">Recursive Backtracker</option>

            </select>
        </form>
        <form @submit.prevent="" class="chnage_solvingAlgo" @change="updateSettings">
            <select v-model="selectedSolvingAlgorithm">
                <option value="astar">A*</option>
                <option value="bfs">Breadth-First-Search</option>
            </select>
        </form>
        <form>
            <input type="number" min="10" max="1000" step="10" v-model="delayTime">
            <label clas="toggle">
                Visualize
                <input type="checkbox" v-model="visualize" @change="updateSettings">
                <span class="slider"></span>
            </label>
        </form>
    </div>
</template>

<script setup>
    import { ref, watch } from 'vue';
    const emit  = defineEmits(['regenerate', 'solve', 'clearChanges', 'stopGeneration', 'update:settings']);

    const node_size = ref(40);
    const selectedAlgorithm = ref("prims");
    const selectedSolvingAlgorithm =  ref("astar");
    const delayTime =  ref(10);
    const visualize =  ref(false);

    function regenerate()
    {
        emit('regenerate');
    }
    function solve()
    {
        emit('solve');
    }
    function clearChanges()
    {
        emit('clearChanges')
    }
    function stopGeneration()
    {
        emit('stopGeneration');
    }
    function updateSettings()
    {
        emit('update:settings',
            {
                node_size : node_size.value,
                selectedAlgorithm : selectedAlgorithm.value,
                selectedSolvingAlgorithm : selectedSolvingAlgorithm.value,
                delayTime : delayTime.value,
                visualize : visualize.value
            }
        )
    }
    watch([node_size, selectedAlgorithm, selectedSolvingAlgorithm, delayTime, visualize], ()=>
        {
            updateSettings();
        }
    )

</script>

<style scoped>
    .options_menu {
    display: flex;
    flex-direction: column;
    gap: 10px;
    background: #2c2f33;
    padding: 15px;
    border-radius: 10px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    width: 250px;
    color: white;
    }
    .time_stats{
        padding:15px;
        gap:10px;   
        display:flex;
        flex-direction: column;
        background-color: #2c2f33;
        border-radius: 10px;
        text-align: center;
        
    }
    .options_menu form {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }

    button {
        background: #5865F2;
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 5px;
        cursor: pointer;
        transition: background 0.2s ease-in-out;
    }

    button:hover {
        background: #4752c4;
    }

    select, input {
        padding: 6px;
        border-radius: 5px;
        border: 1px solid #ccc;
        background: #23272a;
        color: white;
    }

    select:focus, input:focus {
        outline: none;
        border-color: #7289DA;
    }

    input {
        text-align: center;
    }
</style>
<template>
        <div class="options_menu"> 
        <form @submit.prevent>
            <button type="button" @click="doSomething" >Regenerate</button>
            <button type="button" @click="solve">Solve Points</button>
        </form>
        <form @submit.prevent="" @change="changeDifficulty" class="change_difficulty">
            <select v-model="selectedDifficulty">
                <option value="10">Hard</option>
                <option value="20">Medium</option>
                <option value="40">Easy</option>
            </select>
        </form>
        <form @submit.prevent="" @change="doSomething" class="change_algorithm">
            <select v-model="selectedAlgorithm">
                <option value="kruskal">Kruskal's Algorithm</option>
                <option value="prims">PRIMS</option>
                <option value="back_recursive">Recursive Backtracker</option>
                <option value="treegrow">Growing Tree</option>
                <option value="huntkill">Hunt and Kill</option>
                <option value="wilson">Wilson's</option>
                <option value="eller">Eller's</option>
            </select>
        </form>
        <form @submit.prevent="" @change="doSomething" class="chnage_solvingAlgo">
            <select v-model="selectedSolvingAlgorithm">
                <option value="astar">A*</option>
                <option value="bfs">Breadth-First-Search</option>
            </select>
        </form>
        <form>
            <input type="number" min="10" max="1000" step="10" v-model="delayTime">Delay
        </form>
    </div>
</template>

<script setup>
    const selectedDifficulty =  ref("20");
    const selectedAlgorithm =  ref("back_recursive");
    const selectedSolvingAlgorithm =  ref("astar")
    const delayTime = ref(1)    
</script>
<style scoped>

</style>
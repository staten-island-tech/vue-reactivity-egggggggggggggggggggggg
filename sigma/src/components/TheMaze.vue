<template>
    <div class="maze_container"
    :style="{
        gridTemplateRows:  `repeat(${width/node_size},${node_size}px)`,
        gridTemplateColumns: `repeat(${height/node_size},${node_size}px)`
    }">
        <div 
            v-for="n in (width/node_size) * (height/node_size)":key="n"
            class="grid_item"
            :style="{width:`${node_size}px`,height:`${node_size}px`,border:`${node_size/40}px solid #FFFFFF`}"
            :data-coordinates="`${assign_cords(n).column},${assign_cords(n).row}`"
        >

        </div>
    </div>
    <div> 
        <form @submit.prevent>
            <button type="button" @click="doSomething">Visualize Generation</button>
            <button type="button" @click="solveMaze">Solve Maze</button>
        </form>
        <form @submit.prevent="" @change="changeDifficulty">
            <select v-model="selectedDifficulty">
                <option value="Hard">Hard</option>
                <option value="Medium">Medium</option>
                <option value="Easy">Easy</option>
            </select>
        </form>
        <form @submit.prevent="" @change="changeAlgorithm">
            <select v-model="selectedAlgorithm">
                <option value="kruskal">Khruskal's Algorithm</option>
                <option value="prim">Prim's Algorithm</option>
                <option value="back_recursive">Recursive Backtracker</option>
                <option value="treegrow">Growing Tree</option>
                <option value="huntkill">Hunt and Kill</option>
                <option value="wilson">Wilson's</option>
                <option value="eller">Eller's</option>
            </select>
        </form>
    </div>
</template>
<script setup>  
    //note x =  column and y = row
    import { ref, onMounted} from 'vue';;
    const width = 800;
    const height =  800;
    const node_size = 40;
    const grid =  []; 
    const check_set = [];
    function assign_cords(square_position)
    {
        const row = Math.ceil(square_position/(width/node_size));
        const column =  square_position - ((row - 1)*(height/node_size));
        return { column, row }
    }


    function generate_grid()
    {
        for(let y =  0; y < Math.floor(height / node_size); y++)
        {
            const row = []
            for(let x = 0; x < Math.floor(width / node_size); x++)
            {
                row.push(
                    {
                        x: x+1,
                        y: y+1,
                        walls: {
                            left:true, 
                            right:true, 
                            top:true, 
                            bottom:true,
                        },
                        set:`${y+1},${x+1}`
                    }
                )
            }
            grid.push(row);
        }
        console.log(grid)
    }
    generate_grid();
    function get_random_edge()
    {
        const initial_vertex = [Math.floor(Math.random() * (width/node_size)+1), Math.floor(Math.random()*(height/node_size-1)+1)];
        const axis_change =  Math.random() < 0.5? 0:1;//be either y or x axis that gets decremented or incremented by 1 will be applied to pre existing axis 
        const cord_shift =  Math.random() < 0.5? -1:1;//decrement or increment by 1 to get vertice closest to first one
        let temporary_vertex =  [...initial_vertex];
        if((temporary_vertex[axis_change]+cord_shift)>width/node_size)
        {
            temporary_vertex[axis_change]-=1;
        }
        else if((temporary_vertex[axis_change]+cord_shift)<1)
        {
            temporary_vertex[axis_change]+=1;
        }
        else
        {
            temporary_vertex[axis_change]+=cord_shift
        }
        return {initial_vertex, temporary_vertex}
    }
    function delay(ms)
    {
        return new Promise(resolve=>setTimeout(resolve, ms))
    }
    async function kruskal_generation()
    {    
        Object.keys(sets).length;
        for(let i = 0; i<30; i++)
        {
            //Execute a union find before every iteration to ensure the set_list has unique sets
            const new_edge = get_random_edge();
            const insanelylong1 = grid[new_edge.initial_vertex[1]-1][new_edge.initial_vertex[0]-1];
            const insanelylong2 =  grid[new_edge.temporary_vertex[1]-1][new_edge.temporary_vertex[0]-1];
            
            if(insanelylong1.set == insanelylong2.set)
            {
                continue;
            }
            else{
                border_generation(new_edge.initial_vertex, new_edge.temporary_vertex);   
            }
            console.log(new_edge)
            await delay(1);
        }
        console.log(grid);
        console.log(sets);
        //Handle edge case where the bottom doesnt get anything applied to it 
    }
    const sets = {};
    function cordString(coords)
    {return `${coords[0]},${coords[1]}`}
    function border_generation(coords_a,coords_b)
    {
        console.log(coords_a, coords_b)
        const matching_axis = coords_a[0] == coords_b[0] ? 1:0;
        if(coords_a[0] == coords_b[0])
        {
            const [largest,smallest] =  coords_a[1] > coords_b[1] ? [coords_a,coords_b]:[coords_b,coords_a];
            document.querySelector(`[data-coordinates="${cordString(largest)}"]`).style.borderTop = `none`;
            document.querySelector(`[data-coordinates="${cordString(smallest)}"]`).style.borderBottom = `none`;
            grid[largest[1]-1][largest[0]-1].walls.top=false;
            grid[smallest[1]-1][smallest[0]-1].walls.bottom=false;
            if(!sets[grid[smallest[1]-1][smallest[0]-1].set])
            {
                sets[grid[smallest[1]-1][smallest[0]-1].set] = []
            }
            if(sets[grid[smallest[1]-1][smallest[0]-1].set] || sets[grid[largest[1]-1][largest[0]-1].set])
            {
                const preexisting_set = sets[grid[largest[1]-1][largest[0]-1].set] ? grid[largest[1]-1][largest[0]-1].set: grid[smallest[1]-1][smallest[0]-1].set;
                console.log(preexisting_set)
            }


            sets[grid[smallest[1]-1][smallest[0]-1].set].push([grid[largest[1]-1][largest[0]-1].set])
            grid[smallest[1]-1][smallest[0]-1].set = grid[largest[1]-1][largest[0]-1].set;


        }
        else if(coords_a[1] == coords_b[1])
        {
            const [largest, smallest] =  coords_a[0] > coords_b[0] ? [coords_a, coords_b]:[coords_b, coords_a];
            document.querySelector(`[data-coordinates="${cordString(largest)}"]`).style.borderLeft = `none`;
            document.querySelector(`[data-coordinates="${cordString(smallest)}"]`).style.borderRight = `none`;
            grid[largest[1]-1][largest[0]-1].walls.left=false;
            grid[smallest[1]-1][smallest[0]-1].walls.right=false;
            if(!sets[grid[smallest[1]-1][smallest[0]-1].set])
            {
                sets[grid[smallest[1]-1][smallest[0]-1].set] = []
            }
            sets[grid[smallest[1]-1][smallest[0]-1].set].push([grid[largest[1]-1][largest[0]-1].set])
            grid[smallest[1]-1][smallest[0]-1].set = grid[largest[1]-1][largest[0]-1].set;
        }
    }
    function performSetCheck()
    {

    }

    function combine_sets(key1, key2)
    {
        const [set1, set2] = sets[key1].length > sets[key2].length ? [key1,key2] : [key2,key1];
        const combined_data =  [...sets[key1],...sets[key2]];
        sets[set1] = combined_data;
        delete sets[set2];
    }
    onMounted(()=>
    {
        changeAlgorithm();
    })
    const selectedDifficulty =  ref("Medium");
    const selectedAlgorithm =  ref("kruskal");
    function changeAlgorithm()
    {
        if(selectedAlgorithm.value == "kruskal")
        {
            kruskal_generation();
        }
    }
    function changeDifficulty()
    {
        console.log(selectedDifficulty.value);
    }
    function solveMaze()
    {

    }
    function doSomething()
    {
        console.log("SOMETHING HAPPENED");
    }
</script>

<style scoped>
    .maze_container
    {
        display:grid;
        width:800px;
        height:800px;
        background: black;
    }
</style>
<template>
    <div class="maze_container" :key="containerKey"
    :style="{
        gridTemplateRows:  `repeat(${width/node_size},${node_size}px)`,
        gridTemplateColumns: `repeat(${height/node_size},${node_size}px)`
    }" 
    @click="findNearestSquare">
        <div 
            v-for="n in (width/node_size) * (height/node_size)":key="n"
            class="grid_item"
            :style="{width:`${node_size}px`,height:`${node_size}px`,border:`${node_size/10}px solid #FFFFFF`}"
            :data-coordinates="`${assign_cords(n).column},${assign_cords(n).row}`"
        >

        </div>
    </div>
    <div> 
        <form @submit.prevent>
            <button type="button" @click="doSomething" >Visualize New Generation</button>
            <button type="button" @click="">Solve Maze</button>
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
                <option value="rngdfs">Randomized DFS(Possibly Unsolvable)</option>
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
    //in divs its x, y format
    import { ref, onMounted} from 'vue';
    const width = 800;
    const height =  800;
    const node_size = 40;
    const cell_container = {}; 
    let selected_nodes = [];
    let visitied_nodes = [];
    const selectedDifficulty =  ref("Medium");
    const selectedAlgorithm =  ref("rngdfs");
    let visualize = false;
    const containerKey = ref(0);
    const axis_reference = {
        0: 
        {
            maxWall:"left",
            minWall:"right",
            maxStyle:"borderLeft",
            minStyle:"borderRight"
        },
        1:
        {
            maxWall:"top",
            minWall:"bottom",
            maxStyle:"borderTop",
            minStyle:"borderBottom",
        }
    }
    onMounted(()=>
    {
        console.time("timer1");
        generate_grid();
        prim_generation()
        console.timeEnd("timer1")
    })
    function assign_cords(square_position)
    {
        const row = Math.ceil(square_position/(width/node_size))-1;
        const column =  square_position - ((Math.ceil(square_position/(width/node_size)) - 1)*(height/node_size))-1;
        return { column, row }
    }
    function generate_grid()
    {
        for(let y = 0; y<height/node_size; y++)
        {
            const row = {};
            for(let x = 0; x<width/node_size; x++)
            {
                row[x] =  {
                    x:x,
                    y:y,
                    walls:{
                        left:true,
                        right:true, 
                        top:true,
                        bottom:true, 
                    }
                }
            }
            cell_container[y] = row
        }
    }
    function delay(ms)
    {
        return new Promise(resolve=>setTimeout(resolve, ms))
    }
    function cordString(coords)
    {
        return `${coords[0]},${coords[1]}`
    };
    function stringCord(string)
    {
        return string.split(",").map(num=> parseInt(num, 10))
    };
    function isEqualNodes(node1, node2)
    {
        return node1[0]==node2[0]&&node1[1]==node2[1]
    };
    function wall_check(a,b)
    {
        if(a[0]===b[0])
        {
            return {
                max:a[1] > b[1] ? a : b,
                min:a[1] > b[1] ? b : a,
                axis :  1
            }
        }
        else if(a[1]===b[1])
        {
            return {
                max:a[0] > b[0] ? a : b,
                min:a[0] > b[0] ? b : a,
                axis :  0
            }
        }
    }
    function combine_walls(a, b)
    {
        const {max, min, axis} =  wall_check(a, b);
        const axis_change = axis_reference[axis];
        document.querySelector(`[data-coordinates="${cordString(max)}"]`).style[axis_change.maxStyle] = "none";
        document.querySelector(`[data-coordinates="${cordString(min)}"]`).style[axis_change.minStyle] = "none";
        cell_container[max[0]][max[1]].walls[axis_change.maxWall] =  false;
        cell_container[min[0]][min[1]].walls[axis_change.minWall] = false;
    }
    function get_neighbors(cord_x, cord_y, removeSetNeighbors)
    {
        const neighbors = []
        neighbors.push([cord_x-1, cord_y]);
        neighbors.push([cord_x+1, cord_y]);
        neighbors.push([cord_x, cord_y+1]);
        neighbors.push([cord_x, cord_y-1]);
        const possible_neighbors = neighbors.filter(item=>
            {
                if(item[0]<0 || item[1]<0)
                {
                    return false
                }
                if(item[0]>(width/node_size)-1|| item[1]>(height/node_size)-1)
                {
                    return false
                }
                if((new Set(visitied_nodes.map(JSON.stringify))).has(JSON.stringify(item)) && removeSetNeighbors!=false)
                {
                    return false
                }
                return true;
            }
        )
        return possible_neighbors;
    }
    async function changeAlgorithm()
    {

        if(selectedAlgorithm.value == "kruskal")
        {
        }
        else if(selectedAlgorithm.value == "rngdfs")
        {
            await prim_generation();
        }
    }
    function reset_maze()
    {
        containerKey.value+=1;
        selected_nodes = [];
        visitied_nodes.length = 0;
        visualize = false;
    }
    function changeDifficulty()
    {
        console.log(selectedDifficulty.value);
    }
    async function doSomething()
    {
        containerKey.value+=1;
        visitied_nodes.length = 0;
        selected_nodes = [];
        visualize = true
        await changeAlgorithm();
        visualize = false;
    }
    function findNearestSquare(event)
    {
        const gridItem = event.target.closest(".grid_item");
        const node_point = gridItem.dataset.coordinates;
        if(gridItem && selected_nodes.length < 2 && !selected_nodes.includes(node_point))
        {
            selected_nodes.push(node_point);
            gridItem.style.background = "red"
        }
        else if(selected_nodes.includes(node_point))
        {
            selected_nodes = selected_nodes.filter(x => x !== node_point);
            gridItem.style.background = 'green'
        }
        console.log(selected_nodes)
    }
    async function prim_generation()
    {
        //get a random point first 
        const random_x = Math.floor(Math.random() * (width/node_size));
        const random_y = Math.floor(Math.random() * (height/node_size));
        const random_node = document.querySelector(`[data-coordinates="${random_x},${random_y}"]`);
        visitied_nodes.push([random_x, random_y]);
        random_node.style.background = "white";
        let current_neighbor = [random_x, random_y];
        //Find original nodes neighbors. then continue on selecting a random node and getting that nodes neighbors 
        while(visitied_nodes.length!=((width/node_size)*(height/node_size)))
        {
            const current_neighbor_element =  document.querySelector(`[data-coordinates="${current_neighbor[0]},${current_neighbor[1]}"]`)
            current_neighbor_element.style.background =  "green"
            const new_neighbors =  get_neighbors(current_neighbor[0], current_neighbor[1], true);
            new_neighbors.forEach(neighbor_item =>{
                document.querySelector(`[data-coordinates="${neighbor_item[0]},${neighbor_item[1]}"]`).style.background = "red"
            })

            if(new_neighbors.length==0)
            {
                current_neighbor = visitied_nodes[Math.floor(Math.random()*visitied_nodes.length)];
                continue;
            }
            const new_neighbor =  new_neighbors[Math.floor(Math.random()*(new_neighbors.length))];
            if(visualize == true){await delay(10);}
            const new_neighbor_element = document.querySelector(`[data-coordinates="${new_neighbor[0]},${new_neighbor[1]}"]`)
            new_neighbor_element.style.background = "green"
            combine_walls(current_neighbor, new_neighbor);
            current_neighbor =  new_neighbor;
            visitied_nodes.push(new_neighbor);

        }
        console.log(cell_container)
        document.querySelectorAll(".grid_item").forEach(element => {
            element.style.background = "green"
        });
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
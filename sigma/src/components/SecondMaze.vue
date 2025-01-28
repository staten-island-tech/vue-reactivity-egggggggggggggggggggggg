<template>
    <div class="functional_container">
    <div class="maze_container" :key="containerKey"
    :style="{
        gridTemplateRows:  `repeat(${width/node_size},${node_size}px)`,
        gridTemplateColumns: `repeat(${height/node_size},${node_size}px)`
    }" 
    @click="findNearestSquare">
        <div 
            v-for="n in (width/node_size) * (height/node_size)":key="n"
            class="grid_item"
            :style="{width:`${node_size}px`,height:`${node_size}px`,border:`${node_size/40}px solid #FFFFFF`}"
            :data-coordinates="`${assign_cords(n).column},${assign_cords(n).row}`"
        >

        </div>
    </div>
    <div class="options_menu"> 
        <form @submit.prevent>
            <button type="button" @click="doSomething" >Regenerate</button>
            <button type="button" @click="">Solve Points</button>
        </form>
        <form @submit.prevent="" @change="changeDifficulty" class="change_difficulty">
            <select v-model="selectedDifficulty">
                <option value="Hard">Hard</option>
                <option value="Medium">Medium</option>
                <option value="Easy">Easy</option>
            </select>
        </form>
        <form @submit.prevent="" @change="changeAlgorithm" class="change_algorithm">
            <select v-model="selectedAlgorithm">
                <option value="kruskal">Kruskal's Algorithm</option>
                <option value="rngdfs">Randomized DFS</option>
                <option value="back_recursive">Recursive Backtracker</option>
                <option value="treegrow">Growing Tree</option>
                <option value="huntkill">Hunt and Kill</option>
                <option value="wilson">Wilson's</option>
                <option value="eller">Eller's</option>
            </select>
        </form>
        <form>
            <input type="number" min="10" step="10" v-model="delayTime">Delay
        </form>
    </div>
    </div>
</template>
<script setup>  
    //note x =  column and y = row
    //in divs its x, y format
    import { ref, onMounted} from 'vue';
    const width = 800;
    const height =  800;
    const node_size = 20;
    let running=false;
    const cell_container = {}; 
    let selected_nodes = [];
    let visited_nodes = [];
    const selectedDifficulty =  ref("Medium");
    const selectedAlgorithm =  ref("rngdfs");
    let visualize = false;
    const containerKey = ref(0);
    const delayTime = ref(100);
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
    function removeGrid(){

    }

    onMounted(()=>
    {
        generate_grid(true);
        prim_generation();
    })
    function assign_cords(square_position)//Function called by html to get current grid position and assign to dataset
    {
        const row = Math.ceil(square_position/(width/node_size))-1;
        const column =  square_position - ((Math.ceil(square_position/(width/node_size)) - 1)*(height/node_size))-1;
        return { column, row }
    }
    function generate_grid(border)//Border determines whether walls are generated. if true yes otherwise nah
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
                        left:border,
                        right:border, 
                        top:border,
                        bottom:border, 
                    }
                }
            }
            cell_container[y] = row
        }
    }
    function delay(ms)//Delay function utilizing promise
    {
        return new Promise(resolve=>setTimeout(resolve, ms))
    }
    function cordString(coords)//Convert cord to string
    {
        return `${coords[0]},${coords[1]}`
    };
    function stringCord(string)//Same thing but string to cord now
    {
        return string.split(",").map(num=> parseInt(num, 10))
    };
    function isEqualNodes(node1, node2)//Checks if cords are equal, might remove
    {
        return node1[0]==node2[0]&&node1[1]==node2[1]
    };
    function wall_check(a,b)//Checks two cords and return what walls to modify or check
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
    function manipulate_walls(a, b, add) //add condition specifies whether to add or remove walls
    {
        const adadada = ""
        const {max, min, axis} =  wall_check(a, b);
        const axis_change = axis_reference[axis];
        document.querySelector(`[data-coordinates="${cordString(max)}"]`).style[axis_change.maxStyle] = "none";
        document.querySelector(`[data-coordinates="${cordString(min)}"]`).style[axis_change.minStyle] = "none";
        `${node_size/40}px; solid; #FFFFFF;`

        cell_container[max[0]][max[1]].walls[axis_change.maxWall] =  add;
        cell_container[min[0]][min[1]].walls[axis_change.minWall] = add;
    }
    function get_neighbors(cord_x, cord_y, removeSetNeighbors)//Return neighbors of a given cord, could prob remove having to add two cords
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
                if((new Set(visited_nodes.map(JSON.stringify))).has(JSON.stringify(item)) && removeSetNeighbors!=false)
                {
                    return false
                }
                return true;
            }
        )
        return possible_neighbors;
    }
    async function changeAlgorithm()//Async algo cuz im using delay to make it easier for user to see the cvhanges happen
    {

        if(selectedAlgorithm.value == "kruskal")
        {
        }
        else if(selectedAlgorithm.value == "rngdfs")
        {
            await prim_generation();
        }
        //Grid_generation will be based on whether the algorithm calls for
    }
    function reset_maze()//Resets everything back to a clean slate in a single function 
    {
        containerKey.value+=1;
        selected_nodes = [];
        visited_nodes.length = 0;
        visualize = false;
    }
    function changeDifficulty()//Just changes the node size thats really it
    {
        console.log(selectedDifficulty.value);
    }
    async function doSomething()//Visualizier for the current algorithm
    {
        if(running==true){return};
        running=true;
        containerKey.value+=1;
        visited_nodes.length = 0;
        selected_nodes = [];
        visualize = true
        await changeAlgorithm();
        visualize = false;
        running=false;
    }
    function findNearestSquare(event)//Finds the current square the user has clicked on
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
    async function prim_generation()//Idk if this is even Prim's anymore
    {
        //get a random point first 
        const random_x = Math.floor(Math.random() * (width/node_size));
        const random_y = Math.floor(Math.random() * (height/node_size));
        visited_nodes.push([random_x, random_y]);
        let current_neighbor = [random_x, random_y];
        //Find original nodes neighbors. then continue on selecting a random node and getting that nodes neighbors 
        const unvisted_nodes = JSON.parse(JSON.stringify(cell_container))
        while(visited_nodes.length!=((width/node_size)*(height/node_size)))
        {
            const current_neighbor_element =  document.querySelector(`[data-coordinates="${current_neighbor[0]},${current_neighbor[1]}"]`)
            current_neighbor_element.style.background =  "green"
            const new_neighbors =  get_neighbors(current_neighbor[0], current_neighbor[1], true);
            new_neighbors.forEach(neighbor_item =>{
                document.querySelector(`[data-coordinates="${neighbor_item[0]},${neighbor_item[1]}"]`).style.background = "red"
            })
            if(new_neighbors.length==0)//Improve this 
            {
                current_neighbor = visited_nodes[Math.floor(Math.random()*visited_nodes.length)];
                continue;
            }
            const new_neighbor =  new_neighbors[Math.floor(Math.random()*(new_neighbors.length))];
            if(visualize == true){await delay(delayTime.value);}
            const new_neighbor_element = document.querySelector(`[data-coordinates="${new_neighbor[0]},${new_neighbor[1]}"]`)
            new_neighbor_element.style.background = "green"
            manipulate_walls(current_neighbor, new_neighbor, false);
            current_neighbor =  new_neighbor;
            visited_nodes.push(new_neighbor);

        }
        console.log(cell_container)
        document.querySelectorAll(".grid_item").forEach(element => {
            element.style.background = "green"
        });
    }    


    async function retyped_prims()//Attempt 2
    {
        //Works by selecting a frontier cell and finding the next node part of the set of visited nodes closest to frontier cell
        //green =  visited
        //red = frontiers
        const frontier_cells = [];
        const random_x = Math.floor(Math.random() * (width/node_size));
        const random_y = Math.floor(Math.random() * (height/node_size));
        visited_nodes.push([random_x, random_y]);
        let current_neighbor = [random_x, random_y];
        //Make two arrays one for visited_nodes and one for frontier cells;
        //Conditional that if visited_cells != the total amount of nodes continue running 
        //while(visited_cells.length!=amount_of_nodes){}
        for(let i = 0; i<100; i++)
        {
            const current_neighbor_element =  document.querySelector(`[data-coordinates="${cordString(current_neighbor)}"]`)
            current_neighbor_element.style.background =  "green"
            const new_neighbors =  get_neighbors(current_neighbor[0], current_neighbor[1], true);
            new_neighbors.forEach(neighbor_item =>{
                document.querySelector(`[data-coordinates="${cordString(neighbor_item)}"]`).style.background = "red"
                frontier_cells.push(neighbor_item);
            })
        
            const rFrontIndex = Math.floor(Math.random()*frontier_cells.length);
            const rFrontCell =  frontier_cells[rFrontIndex];
            console.log(rFrontCell, rFrontIndex, fronter)
            const frontier_neighbors = get_neighbors(rFrontCell[0], rFrontCell[1], false);
            for(let a = 0; a<frontier_neighbors.length; a++)
            {
                if(JSON.stringify(visited_nodes).includes(JSON.stringify(frontier_neighbors[a])))//This isnt the problem
                    {
                        const AdjFrontIndex = findArray(visited_nodes,frontier_neighbors[a]);
                        //We have the connection node now
                        //Will always find an adjacent set node      
                        
                        manipulate_walls(frontier_neighbors[a], visited_nodes[AdjFrontIndex]);
                        current_neighbor = frontier_neighbors[a];
                        visited_nodes.push(rFrontCell);
                        frontier_cells.splice(rFrontIndex,1);
                        console.log("terminated")
                        break;
        
                    };
            }
            console.log("YAY")
            //If we dont have any more frontier cells then randomly select a frontier cell;

            //Implement frontier logic here
        }
        console.log(cell_container) 

    }
    function findArray(nestedArray, array)
    {
        const itemIndex = nestedArray.findIndex(subarray=>
            {
                return subarray.length ==  array.length && subarray.every((val, i)=>val===array[i])
            }
        )
        return itemIndex;
    }
    function RBT()
    {
                //get a random point first 
        const random_x = Math.floor(Math.random() * (width/node_size));
        const random_y = Math.floor(Math.random() * (height/node_size));
        visited_nodes.push([random_x, random_y]);
        let current_neighbor = [random_x, random_y];
        //Find original nodes neighbors. then continue on selecting a random node and getting that nodes neighbors 
        const unvisted_nodes = JSON.parse(JSON.stringify(cell_container))
        while(visited_nodes.length!=((width/node_size)*(height/node_size)))
        {
            const current_neighbor_element =  document.querySelector(`[data-coordinates="${current_neighbor[0]},${current_neighbor[1]}"]`)
            current_neighbor_element.style.background =  "green"
            const new_neighbors =  get_neighbors(current_neighbor[0], current_neighbor[1], true);
            new_neighbors.forEach(neighbor_item =>{
                document.querySelector(`[data-coordinates="${neighbor_item[0]},${neighbor_item[1]}"]`).style.background = "red"
            })
            if(new_neighbors.length==0)//Improve this 
            {
                current_neighbor = visited_nodes[Math.floor(Math.random()*visited_nodes.length)];
                continue;
            }
            const new_neighbor =  new_neighbors[Math.floor(Math.random()*(new_neighbors.length))];
            const new_neighbor_element = document.querySelector(`[data-coordinates="${new_neighbor[0]},${new_neighbor[1]}"]`)
            new_neighbor_element.style.background = "green"
            manipulate_walls(current_neighbor, new_neighbor, false);
            current_neighbor =  new_neighbor;
            visited_nodes.push(new_neighbor);

        }
        console.log(cell_container)
        document.querySelectorAll(".grid_item").forEach(element => {
            element.style.background = "green"
        });

    }


    function EllerAttempt()
    {
        //get the first row        
        // //randomly join the cells and ensure they belong to different sets 
        const row_length =  width/node_size;
        const random_cells = Math.floor(Math.random() * (row_length-1)+1)//Make sure there is atleast one set fuse that happens

        for(let i = 0; i<random_cells;i++)
        {
            
        }
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
    button[type="button"]
    {
        border-radius: 5px;
        border:none;
        margin: 10px;
        width:200px;
        height:30px;
        background:orange;
        font-family: 'Lucida Sans', 'Lucida Sans Regular',
         'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
        
    }
    .options_menu
    {
        background-color: white;
        align-items: center;
        text-align: center;
        border-bottom-right-radius: 30px;
        border-bottom-left-radius: 30px;
    }
    .change_algorithm 
    {
        border-radius: 0px;

    }
    .change_difficulty
    {
        border-radius: 0px; 
    }
</style>
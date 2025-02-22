<template>
    <div class="functional_container">
    <div class="maze_container" :key="containerKey"
    :style="{
        display:`grid`,
        gridTemplateRows:  `repeat(${width/node_size},${node_size}px)`,
        gridTemplateColumns: `repeat(${height/node_size},${node_size}px)`
    }" 
    @click="findNearestSquare">
        <div
            v-for="(valueY, keyY) in cell_container"
            :key="keyY"
            class="row"
        >
            <div
                v-for="(valueX, keyX) in valueY"
                :key="keyX"
                class="grid_item"
                :style="
                {
                    width:`${node_size}px`,
                    height:`${node_size}px`,
                    borderLeft:`${valueX.walls.left}`,
                    borderRight:`${valueX.walls.right}`,
                    borderTop:`${valueX.walls.top}`,
                    borderBottom:`${valueX.walls.bottom}`,
                    background:`${valueX.background}`
                }"
                :data-coordinates="`${keyY},${keyX}`"
            >
            </div>
        </div>
    </div>
    <OptionsMenu
    @regenerate="Regenerate" @solve="solve" @clearChanges="clearChanges" @stopGeneration="stopGeneration" @update:settings="updateSettings"
    ></OptionsMenu>
 
    <div class="time_stats">
        <div>Maze Generation Time : {{ mazeGenerationTime }} ms</div>
        <div>Maze Solving Time: {{ mazeSolvingTime }} ms</div>
    </div>



    </div>
</template>
<script setup>  
    import { ref, reactive, onMounted} from 'vue'; 
    import { delay, stringCord, cordString, compareNodes, wall_check, randNumb, getRSetItem, getMDIST } from './mazeutils'
    import { BinaryHeap } from './datastructs'
    import OptionsMenu from './OptionsMenu.vue';
    
    //to do list
    //break apart the stuff into files
    //try and remove some of the global variables
    //break the options bar thingie into a new component 
    //try and make it compatible with other devices by looking at user vh and limiting the node_sizes based off of thjat
    //look for optimizations

    let width = 800;
    let height =  800;
    let node_size = ref(40);
    let running=false;
    let visualize = ref(false);
    let cell_container = reactive({}); 
    let selected_nodes = [];
    let terminate=false;
    const selectedAlgorithm =  ref("prims");
    const selectedSolvingAlgorithm =  ref("astar")
    const containerKey = ref(0);
    const delayTime = ref(10);
    const totalNodes =  ((width/node_size.value)*(height/node_size.value));
    const WindowWidth =  window.innerWidth;
    const WindowHeight =  window.innerHeight;
    const mazeGenerationTime=ref(0);
    const mazeSolvingTime =  ref(0);
    console.log(WindowWidth, WindowHeight);

    function updateSettings(newSettings)
    {   
        node_size.value =  newSettings.node_size;
        selectedAlgorithm.value =  newSettings.selectedAlgorithm;
        selectedSolvingAlgorithm.value = newSettings.selectedSolvingAlgorithm;
        delayTime.value = newSettings.delayTime;
        visualize.value =  newSettings.visualize;
        generate_grid(`1px solid #FFFFFF`);
        
    }
    //formula for delay bypass =  n/4ms = x; 
    //n =  how many loopiterations has occured
    //x =  how much time the user wants to have passed;

    //if user sets a limit lower than 4ms
    //ex: 1ms
    //x/4ms = 1ms
    //given this we can subsitute 4 for x and therefore 4 loopiteraitons must have occured
    //delayTime will be just a reference wheras the actual limitwill always 
    
    // let amountOfLoops =  delayTime.value/4;
    // let loop = 10;
    // if(visualize.value)
    // {
    //     if(loop%x===amountOfLoops)
    //     {
    //         await delay(4);
    //     }
    // }
    //prototype code
    
    if(WindowHeight<500 || WindowWidth<500)
    {
        width = 400;
        height= 400;
    }
    else if(WindowHeight||WindowWidth)
    {
        width = 600;
        height = 600;
    }
    else if(WindowHeight||WindowWidth)
    {
        width = 800;
        height = 800;
    }



    function clearChanges()
    {
        for(let y = 0; y<height/node_size.value; y++)
        {
            for(let x = 0; x<width/node_size.value; x++)
            {
                cell_container[y][x].background="black"
            }
        }
        selected_nodes = [];
    }
    function stopGeneration()
    {
        terminate=true;
    }
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
        const start =  performance.now();
        prim_generation();
        const end = performance.now();
        console.log(`took ${end-start} ms`)
        mazeGenerationTime.value = Math.round(end-start);
    })

    
    generate_grid(`1px solid #FFFFFF`);
    async function changeAlgorithm()
    {
        if(selectedAlgorithm.value == "prims")
        {
            await prim_generation();
        }
        else if(selectedAlgorithm.value == "back_recursive")
        {
            await RBT();
        }
    }
    async function Regenerate()
    {
        if(running==true){return};
        running=true;
        selected_nodes = [];
        visualize.value = true
        generate_grid(`1px solid #FFFFFF`);
        await changeAlgorithm();
        running=false;
    }
    function solve()
    {
        if(selected_nodes.length<2)
        {
            console.log("select two points");
            return
        }
        if(selectedSolvingAlgorithm.value=="astar")
        {
            Astar();
        }
        else if(selectedSolvingAlgorithm.value == "bfs")
        {
            BFS();
        }
        selected_nodes.length == 0;
    }
    function wallWrapper(array, orig)
    {
        return array.filter(arr=>
            {
                const {max,min,axis} =  wall_check(arr, orig)
                const axisInfo = axis_reference[axis];
                const wall = cell_container[max[0]][max[1]].walls[axisInfo.maxWall]=="none"?true:false;
                return wall;
            }
        )
    }
    function generate_grid(border)
    {
        for(let y = 0; y<height/node_size.value; y++)
        {
            const row = {};
            for(let x = 0; x<width/node_size.value; x++)
            {
                row[x] =  {
                    x:x,
                    y:y,
                    walls:{
                        left:border,
                        right:border, 
                        top:border,
                        bottom:border, 
                    },
                    background:"black"
                }
            }
            cell_container[y] = row
        }
    }
    function manipulate_walls(a, b, add)
    {
        const borderStyle = add!=true? "none":`${node_size.value/40}px solid #FFFFFF`;
        const {max, min, axis} =  wall_check(a, b);
        const axis_change = axis_reference[axis];
        cell_container[max[0]][max[1]].walls[axis_change.maxWall] =  borderStyle;
        cell_container[min[0]][min[1]].walls[axis_change.minWall] = borderStyle;
    }
    function get_neighbors(cord)
    {
        const neighbors = []
        neighbors.push([cord[0]-1, cord[1]]);
        neighbors.push([cord[0]+1, cord[1]]);
        neighbors.push([cord[0], cord[1]+1]);
        neighbors.push([cord[0], cord[1]-1]);
        const possible_neighbors = neighbors.filter(item=>
            {
                if(item[0]<0 || item[1]<0)
                {
                    return false
                }
                if(item[0]>(width/node_size.value)-1|| item[1]>(height/node_size.value)-1)
                {
                    return false
                }
                return true;
            }
        )
        return possible_neighbors;
    }
    function findNearestSquare(event)
    {
        const gridItem = event.target.closest(".grid_item");
        const node_point = gridItem.dataset.coordinates;
        if(gridItem && selected_nodes.length < 2 && !selected_nodes.includes(node_point))
        {
            selected_nodes.push(node_point);
            gridItem.style.background = "#0FFF50";
            return;
        }
        else if(selected_nodes.includes(node_point))
        {
            selected_nodes = selected_nodes.filter(x => x !== node_point);
            gridItem.style.background = 'black';
        }
        console.log(selected_nodes)
    }



//Manipulating elements stuff
    async function prim_generation()
    {
        const frontier =  new Map();
        const visited = new Set();
        const random_x = randNumb(0, (width/node_size.value));
        const random_y = randNumb(0, (height/node_size.value));
        let current = [random_x, random_y];
        visited.add(cordString(current));
        let loopCounter = 0;
        while(visited.size!=totalNodes)
        {
            if(visualize.value){
                if(loopCounter%100==0)
                {
                    await delay(delayTime.value); 
                }
                cell_container[current[0]][current[1]].background = "black"
            };
            if(terminate==true)
            {
                return;
            }
            const newNeighbors = get_neighbors(current);
            for(let i=0;i<newNeighbors.length;i++)
            {
                const serializedNeighbor = cordString(newNeighbors[i]);
                if(visited.has(serializedNeighbor))
                {
                    continue;
                }
                if(!frontier.has(cordString(newNeighbors[i])))
                {
                    frontier.set(serializedNeighbor,current);
                    if(visualize.value)
                    {
                        cell_container[newNeighbors[i][0]][newNeighbors[i][1]].background = "red"
                    }
                }
            }
            const randFrontNode = getRSetItem(frontier);
            manipulate_walls(stringCord(randFrontNode[0]), randFrontNode[1], false);
            visited.add(randFrontNode[0]);
            frontier.delete(randFrontNode[0]);
            current = stringCord(randFrontNode[0]);
            loopCounter+=1;
        }
        console.log(cell_container)
    }
    async function RBT()
    {
        const random_x = randNumb(0, (width/node_size.value));
        const random_y = randNumb(0, (height/node_size.value));
        const visited = new Set();
        const stack = [];
        let current = [random_x, random_y];
        visited.add(cordString(current));
        let loopIterations = 0;
        while(visited.size!=totalNodes)
        {
            loopIterations+=1;
            
            if(visualize.value){
                if(loopIterations%100==0)
                {
                    await delay(delayTime.value);
                }
                cell_container[current[0]][current[1]].background="black";
            }
            if(terminate==true)
            {
                return;
            }
            const newNeighbors = get_neighbors(current, true).filter(item=>
                {
                if(visited.has(cordString(item))){
                    return false;
                }
                if(visualize.value){
                    cell_container[item[0]][item[1]].background = "red"}
                return true;
                }
            );
            if(newNeighbors.length>0)
            {
                const newNeighbor =  newNeighbors[randNumb(0, newNeighbors.length)];
                manipulate_walls(current, newNeighbor, false);
                current = newNeighbor;
                visited.add(cordString(newNeighbor));
                stack.push(newNeighbor);
            }
            else
            {
                current =  stack.at(-1)
                if(visualize.value){cell_container[current[0]][current[1]].background = "orange";}
                stack.pop();
            }
        }
    } 
    async function Astar()
    {
        const startingNode = stringCord(selected_nodes[0]);
        const endingNode =  stringCord(selected_nodes[1]);
        const closedList =  {};
        const pQueue =  new BinaryHeap();
        const visited = new Set();
        const testObj =
        {
            parent:null, 
            coordinate:startingNode, 
            f:getMDIST(startingNode, endingNode),
            g:0,
            h:getMDIST(startingNode, endingNode)
        }
        pQueue.heapadd(testObj)
        let currentNode;
        let loopCounter=0;
        const start = performance.now();
        while(pQueue.length()>0)
        {
            currentNode = pQueue.getRoot();
            if(compareNodes(currentNode.coordinate, endingNode))
            {
                const solutionSet=[currentNode.parent]
                let parentNode =  currentNode.parent;
                while(compareNodes(parentNode, startingNode)!=true)
                {
                    solutionSet.push(closedList[parentNode].coordinate)
                    cell_container[parentNode[0]][parentNode[1]].background =  "blue"
                    parentNode = closedList[parentNode].parent;
                }
                mazeSolvingTime.value = Math.floor(performance.now() - start);
                return;
            }
            cell_container[startingNode[0]][startingNode[1]].background = "blue";
            cell_container[endingNode[0]][endingNode[1]].background = "blue";
            const newNeighbors = wallWrapper(get_neighbors(currentNode.coordinate), currentNode.coordinate);
            for(let i = 0; i<newNeighbors.length;i++)
            {
                if(visited.has(cordString(newNeighbors[i])))continue;
                const h = getMDIST(endingNode, newNeighbors[i])
                const g =  1+currentNode.g
                const f =  h+g;
                pQueue.heapadd(
                    {
                        parent:currentNode.coordinate,
                        coordinate:newNeighbors[i],
                        f:f,
                        g:g,
                        h:h
                    }
                )
                if(visualize.value){
                if(loopCounter%10==0)
                {
                    await delay(delayTime.value);
                }        
                cell_container[newNeighbors[i][0]][newNeighbors[i][1]].background="red"};
                visited.add(cordString(newNeighbors[i]));
            }
            loopCounter+=1;
            const serializedKey = cordString(currentNode.coordinate)
            closedList[serializedKey] =  currentNode;
        }   
    }
    async function BFS()
    {
        const endingNode  = stringCord(selected_nodes[1]);
        const startingNode =  stringCord(selected_nodes[0]);
        let currentNode = stringCord(selected_nodes[0]);
        const visited =  new Map();
        const queue = [currentNode];
        console.log("BFS RUNNING")
        visited.set(currentNode, null);
        while(queue.length > 0)
        {
            if(visualize.value){await delay(delayTime.value)};
            currentNode = queue.shift();
            if(cordString(currentNode)==cordString(endingNode))
            {   
                let bt = currentNode;
                const solutionSet = [bt]
                while(true)
                {
                    cell_container[bt[0]][bt[1]].background =  "blue";
                    if(cordString(bt)==(cordString(startingNode)))
                    {
                        return;
                    }
                    bt = visited.get(cordString(bt));
                    solutionSet.push(bt);
                }
            }
            const newNeighbors = wallWrapper(get_neighbors(currentNode), currentNode);
            for(let i = 0; i<newNeighbors.length;i++)
            {
                if(!visited.has(cordString(newNeighbors[i])))
                {
                    cell_container[newNeighbors[i][0]][newNeighbors[i][1]].background =  "purple";
                    queue.push(newNeighbors[i]);
                    visited.set(cordString(newNeighbors[i]), currentNode);
                }
            }

        }
    }
</script>
<style scoped>
    .maze_container
    {
        display:grid;
        background: black;
    }
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
    .functional_container
    {
        display:flex;
        gap:20px;
        align-items: flex-start;
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

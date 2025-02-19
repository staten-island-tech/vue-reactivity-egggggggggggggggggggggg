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
    <div class="options_menu"> 
        <form @submit.prevent>
            <button type="button" @click="doSomething" >Regenerate</button>
            <button type="button" @click="solve">Solve Points</button>
        </form>
        <form @submit.prevent="" @change="doSomething" class="change_difficulty">
            <select v-model="node_size">
                <option value=10>Hard</option>
                <option value=20>Medium</option>
                <option value=40>Easy</option>
            </select>
        </form>
        <form @submit.prevent="" @change="doSomething" class="change_algorithm">
            <select v-model="selectedAlgorithm">
                <option value="kruskal">Kruskal's Algorithm</option>
                <option value="prims">PRIMS</option>
                <option value="back_recursive">Recursive Backtracker</option>
                <option value="rngdfs">Randomized DFS</option>

            </select>
        </form>
        <form @submit.prevent="" class="chnage_solvingAlgo">
            <select v-model="selectedSolvingAlgorithm">
                <option value="astar">A*</option>
                <option value="bfs">Breadth-First-Search</option>
            </select>
        </form>
        <form>
            <input type="number" min="10" max="1000" step="10" v-model="delayTime">Delay
        </form>
    </div>
    </div>
</template>
<script setup>  
    import { ref, reactive, onMounted} from 'vue';    //use js to determine the vh and assign the node size and height. some options will be limited due to device size 
    import { delay, stringCord, cordString, compareNodes, wall_check, randNumb, getRSetItem, getMDIST } from './mazeutils'
    import { BinaryHeap } from './datastructs'
    
    //to do list
    //break apart the stuff into files
    //move the util functions that aren't linked to global variables to another file
    //try and remove some of the global variables
    //break the options bar thingie into a new component 
    //work on the styles of the css a bit maybe
    //try and make it compatible with other devices by looking at user vh and limiting the node_sizes based off of thjat
    //clean up some of the code 
    //look for optimizations

    const width = 800;
    const height =  800;
    let node_size = ref(10);
    let running=false;
    let cell_container = reactive({}); //FIX THIS
    let selected_nodes = [];
    const selectedDifficulty =  ref("Medium");
    const selectedAlgorithm =  ref("prims");
    const selectedSolvingAlgorithm =  ref("astar")
    let visualize = false;
    const containerKey = ref(0);
    const delayTime = ref(1);//hqrd cap of 4ms set by the browser so anything below 4 is set to 4
    const totalNodes =  ((width/node_size.value)*(height/node_size.value));
    const WindowWidth =  window.innerWidth;
    const WindowHeight =  window.innerHeight;

    console.log(WindowWidth, WindowHeight);

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
    })

    
    generate_grid(`1px solid #FFFFFF`);
//Methods
    async function changeAlgorithm()//Async algo cuz im using delay to make it easier for user to see the cvhanges happen
    {

        if(selectedAlgorithm.value == "kruskal")
        {

        }
        else if(selectedAlgorithm.value == "prims")
        {
            await prim_generation();
        }
        else if(selectedAlgorithm.value == "back_recursive")
        {
            await RBT();
        }
        else if(selectedAlgorithm.value == "rngdfs")
        {
            await  randomizedDFS();
        }
        //Grid_generation will be based on whether the algorithm calls for
    }
    async function doSomething()//Visualizier for the current algorithm
    {
        if(running==true){return};
        running=true;
        containerKey.value+=1;
        selected_nodes = [];
        visualize = true
        Object.keys(cell_container).forEach(row => delete cell_container[row]);
        generate_grid(`1px solid #FFFFFF`);
        await changeAlgorithm();
        containerKey.value+=1;
        visualize = false;
        running=false;
    }
    function solve()
    {
        //check for two points selected
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
    function wallWrapper(array, orig)//made this cuz im lazy
    {
        return array.filter(arr=>
            {
                const {max,min,axis} =  wall_check(arr, orig)
                const axisInfo = axis_reference[axis];
                const wall = cell_container[max[0]][max[1]].walls[axisInfo.maxWall]=="none"?true:false;//FIX THIS
                return wall;
            }
        )
    }
    function generate_grid(border)//Border determines whether walls are generated. if true yes otherwise nah
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
    function manipulate_walls(a, b, add) //add condition specifies whether to add or remove walls
    {
        const borderStyle = add!=true? "none":`${node_size.value/40}px solid #FFFFFF`;
        const {max, min, axis} =  wall_check(a, b);
        const axis_change = axis_reference[axis];
        cell_container[max[0]][max[1]].walls[axis_change.maxWall] =  borderStyle;
        cell_container[min[0]][min[1]].walls[axis_change.minWall] = borderStyle;
    }
    function get_neighbors(cord)//Return neighbors of a given cord, could prob remove having to add two cords
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
    function findNearestSquare(event)//Finds the current square the user has clicked on
    {
        const gridItem = event.target.closest(".grid_item");
        const node_point = gridItem.dataset.coordinates;
        if(gridItem && selected_nodes.length < 2 && !selected_nodes.includes(node_point))
        {
            selected_nodes.push(node_point);
            gridItem.style.background = "red";
        }
        else if(selected_nodes.includes(node_point))
        {
            selected_nodes = selected_nodes.filter(x => x !== node_point);
            gridItem.style.background = 'green';
        }
        console.log(selected_nodes)
    }
    
    async function randomizedDFS()
    {
        const random_x = Math.floor(Math.random() * (width/node_size.value));
        const random_y = Math.floor(Math.random() * (height/node_size.value));
        const visited = new Set();
        let current = [random_x, random_y];
        visited.add(cordString(current));
        while(visited.size<totalNodes)
        {
            if(visualize){await delay(4)};
            const newNeighbors =  get_neighbors(current);
            for(let i = 0;i<newNeighbors.length;i++)
            {
                const serializedCord = cordString(newNeighbors[i])
                if(visited.has(serializedCord)){newNeighbors.splice(i,1); continue;};
                if(visualize){cell_container[newNeighbor[i][0]][newNeighbor[i][1]].background = "red"};
            }
            if(newNeighbors.length==0)
            {
                current = getRSetItem(visited);
            }
            const newNeighbor = newNeighbors[Math.floor(Math.random()*newNeighbors.length)];
            if(visualize){cell_container[newNeighbor[0]][newNeighbor[1]].background = "green"}
            manipulate_walls(current,newNeighbor, false);
            current = newNeighbor;
            visited.add(cordString(newNeighbor));
        }
        //repaint it. 
    } 
    async function prim_generation()
    {
        const frontier =  new Map();
        const visited = new Set();
        const random_x = randNumb(0, (width/node_size.value));
        const random_y = randNumb(0, (height/node_size.value));
        let current = [random_x, random_y];
        visited.add(cordString(current));
        while(visited.size!=totalNodes)
        {
            if(visualize){
                await delay(4); 
                cell_container[current[0]][current[1]].background = "green"
            };
            const newNeighbors = get_neighbors(current);
            for(let i=0;i<newNeighbors.length;i++)
            {
                const serializedNeighbor = cordString(newNeighbors[i]);
                if(visited.has(serializedNeighbor))
                {
                    continue;
                }//combineable
                if(!frontier.has(cordString(newNeighbors[i])))
                {
                    frontier.set(serializedNeighbor,current);
                    if(visualize)
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
        while(visited.size!=totalNodes)
        {
            if(visualize){await delay(1)}
            const newNeighbors = get_neighbors(current, true).filter(item=>
            {
            if(visited.has(cordString(item))){
                return false
            }
            if(visualize){
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
                if(visualize){cell_container[current[0]][current[1]].background = "orange";}
                stack.pop();
            }
        }
    }
//Maze creation




//These works dont tweak

    async function Astar()//implement Map here 
    {
        const startingNode = stringCord(selected_nodes[0]);
        const endingNode =  stringCord(selected_nodes[1]);
        const closedList =  {};//Stores the already traversed nodes 
        const pQueue =  new BinaryHeap();
        //visited should be a set
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
        while(pQueue.length()>0)
        {
            currentNode = pQueue.getRoot();
            if(compareNodes(currentNode.coordinate, endingNode))
            {
                const solutionSet=[currentNode.parent]
                let parentNode =  currentNode.parent;
                while(compareNodes(parentNode, startingNode)!=true)//backtracing
                {
                    solutionSet.push(closedList[parentNode].coordinate)
                    cell_container[parentNode[0]][parentNode[1]].background =  "blue"
                    parentNode = closedList[parentNode].parent;
                }
                return;
            }
            const newNeighbors = wallWrapper(get_neighbors(currentNode.coordinate), currentNode.coordinate);
            for(let i = 0; i<newNeighbors.length;i++)//use binary heap for this
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
                    cell_container[newNeighbors[i][0]][newNeighbors[i][1]].background="red";
                visited.add(cordString(newNeighbors[i]));
            }
            const serializedKey = cordString(currentNode.coordinate)
            closedList[serializedKey] =  currentNode;
            //add to the closed set, also make sure to place is in object order where the coordinate of it is serialized to make it easier to acess.
        }   
    }
    async function BFS()//add visualization mightahve bugs 
    {
        const endingNode  = stringCord(selected_nodes[1]);
        const startingNode =  stringCord(selected_nodes[0]);
        let currentNode = stringCord(selected_nodes[0]);
        const visited =  new Map();
        const queue = [currentNode];
        console.log("BFS RUNNING")
        visited.set(currentNode, null);//no pre existing parent node so just put null
        while(queue.length > 0)
        {
            await delay(4);
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
                    bt = visited.get(cordString(bt));//gets the parent node of the currentNode
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
                }//dont add if its already been visited
            }
            //get the first element from the list and remove it 
            //continue until it finds node
        }
    }
    //just optimize the code and remove clutter
    //maybe add one more algorithm if enough time
    //fix styling 
    //break up the code into diff files
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

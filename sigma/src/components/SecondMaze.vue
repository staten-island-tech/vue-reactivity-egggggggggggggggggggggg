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
            <button type="button" @click="Astar">Solve Points</button>
        </form>
        <form @submit.prevent="" @change="changeDifficulty" class="change_difficulty">
            <select v-model="selectedDifficulty">
                <option value="Hard">Hard</option>
                <option value="Medium">Medium</option>
                <option value="Easy">Easy</option>
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
        <form>
            <input type="number" min="10" max="1000" step="10" v-model="delayTime">Delay
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
    let node_size = 20;
    let running=false;
    const cell_container = {}; 
    let selected_nodes = [];
    let visited_nodes = [];
    const selectedDifficulty =  ref("Medium");
    const selectedAlgorithm =  ref("back_recursive");
    let visualize = false;
    const containerKey = ref(0);
    const delayTime = ref(1);
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
        generate_grid(true);
        RBT();
    })



//Methods
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
        const borderStyle = add!=true? "none":`${node_size/40}px solid #FFFFFF`;
        const {max, min, axis} =  wall_check(a, b);
        const axis_change = axis_reference[axis];
        document.querySelector(`[data-coordinates="${cordString(max)}"]`).style[axis_change.maxStyle] = borderStyle;
        document.querySelector(`[data-coordinates="${cordString(min)}"]`).style[axis_change.minStyle] = borderStyle;
        `${node_size/40}px; solid; #FFFFFF;`

        cell_container[max[0]][max[1]].walls[axis_change.maxWall] =  add;
        cell_container[min[0]][min[1]].walls[axis_change.minWall] = add;
    }
    function get_neighbors(cord,removeSetNeighbors)//Return neighbors of a given cord, could prob remove having to add two cords
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
        else if(selectedAlgorithm.value == "prim")
        {
            await prim_generation();
        }
        else if(selectedAlgorithm.value == "back_recursive")
        {
            await RBT();
        }
        //Grid_generation will be based on whether the algorithm calls for
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
    function searchObjectArray(array, subarray){//find array in an object nested in an array
        const itemIndex = array.findIndex(object =>
            {
                return object.node.every((value, index) => value === subarray[index])
            }
        )
        return itemIndex
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
    function findArrayCubed(arrayCubed, array)
    {
        const itemIndex = arrayCubed.findIndex(subarray=>
            {
                return subarray[0].length ==  array.length && subarray[0].every((val, i)=>val===array[i])
            }
        )
        return itemIndex;
    }
//Methods


//Maze creation
    async function randomizedDFS()
    {
        //get a random point first 
        const random_x = Math.floor(Math.random() * (width/node_size));
        const random_y = Math.floor(Math.random() * (height/node_size));
        visited_nodes.push([random_x, random_y]);
        let current_neighbor = [random_x, random_y];
        //Find original nodes neighbors. then continue on selecting a random node and getting that nodes neighbors 
        while(visited_nodes.length!=((width/node_size)*(height/node_size)))
        {
            const current_neighbor_element =  document.querySelector(`[data-coordinates="${current_neighbor[0]},${current_neighbor[1]}"]`)
            current_neighbor_element.style.background =  "green"
            const new_neighbors =  get_neighbors(current_neighbor, true);
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
    async function prim_generation()//Attempt 2
    {
        console.log("starting prims")
        const frontier_cells = [];
        const random_x = Math.floor(Math.random() * (width/node_size));
        const random_y = Math.floor(Math.random() * (height/node_size));
        visited_nodes.push([random_x, random_y]);
        let current_neighbor = [random_x, random_y];
        while(visited_nodes.length!=((width/node_size)*(height/node_size)))
        {
            await delay(1);
            const new_neighbors =  get_neighbors(current_neighbor, true);
            document.querySelector(`[data-coordinates="${cordString(current_neighbor)}"]`).style.background = "green"
            new_neighbors.forEach(nNeighbor=>
                {
                    if(findArrayCubed(frontier_cells, nNeighbor)==-1)
                    {
                        frontier_cells.push([nNeighbor,current_neighbor]);
                        document.querySelector(`[data-coordinates="${cordString(nNeighbor)}"]`).style.background = "red"
                    }
                }
            )
            const randomFIndex = Math.floor(Math.random()*frontier_cells.length);
            const new_node = frontier_cells[randomFIndex]
            const fCell =  new_node[0];
            const adjSetCell =  new_node[1];
            manipulate_walls(fCell, adjSetCell, false)
            visited_nodes.push(fCell);
            frontier_cells.splice(randomFIndex, 1);
            current_neighbor = fCell;
        }
        console.log(cell_container);
    }
    async function RBT()
    {
        const random_x = Math.floor(Math.random() * (width/node_size));
        const random_y = Math.floor(Math.random() * (height/node_size));
        visited_nodes.push([random_x, random_y]);
        let current_neighbor = [random_x, random_y];
        const stack = [];//will record current path being taken
        while(visited_nodes.length!=((width/node_size)*(height/node_size)))
        {
            {await delay(delayTime.value);}
            const new_neighbors =  get_neighbors(current_neighbor, true);
            new_neighbors.forEach(neighbor_item =>{
                document.querySelector(`[data-coordinates="${neighbor_item[0]},${neighbor_item[1]}"]`).style.background = "red"
            })
            if(new_neighbors.length>0)
            {
                const new_neighbor =  new_neighbors[Math.floor(Math.random()*(new_neighbors.length))];
                const new_neighbor_element = document.querySelector(`[data-coordinates="${new_neighbor[0]},${new_neighbor[1]}"]`)
                new_neighbor_element.style.background = "green"
                manipulate_walls(current_neighbor, new_neighbor, false);
                current_neighbor =  new_neighbor;
                visited_nodes.push(new_neighbor);
                stack.push(new_neighbor);
                //get item into the stack to tell us that it has traced to stack
            }
            else
            {
                current_neighbor = stack.at(-1);
                const new_element = document.querySelector(`[data-coordinates="${current_neighbor[0]},${current_neighbor[1]}"]`)
                new_element.style.background = "orange";
                stack.pop();
            }
        }
        console.log(cell_container)
        document.querySelectorAll(".grid_item").forEach(element => {
            element.style.background = "green"
        });
    }
    function RStartNode()
    {
        return [(Math.floor(Math.random() * (width/node_size))), (Math.floor(Math.random() * (height/node_size)))]
    }
    function combineSets(set, item)
    {
        return JSON.stringify(set).includes(JSON.stringify(item));
    }
    async function Kruskals()
    {
        const randomStart =  RStartNode();
        let currentNode =  randomStart;
        const mazeSet =  new Set();
        while(mazeSet.size!=((width/node_size)*(height/node_size)))
        {
            const new_neighbors = get_neighbors(currentNode);
            const rnIndex = Math.floor(Math.random()*new_neighbors.length);            
            const randNeighbor = new_neighbors[rnIndex];
            if(randNeighbor in mazeSet || currentNode in mazeSet)
            {
                combineSets()
            }
            if(true)
            {
                manipulate_walls(currentNode,new_neighbors[rnIndex], false);
                //change the coloring
            }
            currentNode = RStartNode();//get a new starting node 
        }

    }
    async function huntkill()
    {
        const currentNode = RStartNode();
        const visitedNodes = {
        };
        while(visited_nodes.length!=((width/node_size)*(height/node_size)))
        {
            //Node management 
            //Visited nodes will store based off of row so y value or an index of 1 
            const newNeighbors =  get_neighbors(currentNode, true);//remove nodes that have been visited
            if(newNeighbors.length==0)
            {
                //hunt for a new row to start again
                for(let i = 0; i<(width/node_size); i++)
                {
                    if(visitedNodes[i].length!=(width/node_size))
                    {
                        
                    }
                }
                continue;
            }
            const rnIndex = getRandNumb(newNeighbors.length);
            manipulate_walls(currentNode, newNeighbors[rnIndex], false);
            currentNode = newNeighbors[rnIndex];
            visitedNodes.push(newNeighbors[rnIndex]);
        }
    }
    function getRandNumb(max)
    {
        return Math.floor(Math.random()*max);
    }
//Maze creation




//Maze solving
    async function stupidAstar()
    {
        const startingNode = stringCord(selected_nodes[0]);
        const endingNode =  stringCord(selected_nodes[1]);
        let currentNode =  startingNode;
        const startNodePriority =  Math.abs(endingNode[0]-startingNode[0])+Math.abs(endingNode[1]-startingNode[1]);
        const closedSet = [];
        const openSet = [
            {
                priority:startNodePriority,
                node:startingNode,
                gValue:0
            }
        ];
        while(isEqualNodes(currentNode, endingNode)!=true)
        {
            await delay(100);
            const cNodeNeighbors = get_neighbors(currentNode,false)
            console.log(cNodeNeighbors,"neighbors")
            for(let i = 0; i<cNodeNeighbors.length;i++)//Get possible node traversals
            {

                const {max, min, axis} = wall_check(currentNode,cNodeNeighbors[i]);
                const axisInfo =  axis_reference[axis];
                const wall = cell_container[max[0]][max[1]].walls[axisInfo.maxWall];
                console.log(axisInfo)
                if(wall==true || findArray(closedSet, cNodeNeighbors[i]) != -1 || searchObjectArray(openSet, cNodeNeighbors[i])!=-1)
                {
                    continue;
                }
                const manhattanDist =  Math.abs(endingNode[0]-cNodeNeighbors[i][0])+Math.abs(endingNode[1]-cNodeNeighbors[i][1]);
                const nodeDist = Math.abs(endingNode[0]-startingNode[0])+Math.abs(endingNode[1]-startingNode[1]);
                const priorityValue = manhattanDist+nodeDist;
                openSet.push({
                    priority:priorityValue,
                    node:cNodeNeighbors[i],
                    gValue:nodeDist
                })
    
                openSet.splice(0,1);
                //Use a for loop to iterate through openSet and compare p values to avoid sorting the whole list
                let inserted = false
                for(let q = 0; q<openSet.length;q++)
                {
                    if(openSet[q].gValue>=priorityValue)
                    {
                        openSet.splice(q,0,
                            {
                                priority:priorityValue,
                                node:cNodeNeighbors[i],
                                gValue:nodeDist
                            }
                        )
                        inserted = true;
                        break;
                    }
                }
                if (!inserted) {
                    openSet.push({
                        priority: priorityValue,
                        node: cNodeNeighbors[i],
                        gValue: nodeDist
                    });
                }
            }
            console.log(openSet, closedSet)
            document.querySelector(`[data-coordinates="${cordString(currentNode)}"]`).style.background = "red"
            console.log(openSet[0].node, "newNode")
            closedSet.push(currentNode);
            currentNode = openSet[0].node;
        }
    }
    async function Astar()
    {
        const startingNode = stringCord(selected_nodes[0]);
        const endingNode =  stringCord(selected_nodes[1]);
        let currentNode =  startingNode;
        const openSet = [{
            node:startingNode,
            f:getMDIST(startingNode, endingNode),
            g:0,
            h:getMDIST(startingNode, endingNode),
            parentNode:null
        }]//key =  string cords
        let pushed = false;
        const closedSet = [];
        for(let i=0;i<100;i++)
        {        
            const currentNodeNeighbors =  get_neighbors(currentNode, false);//Dont need to remove setNeighbors yet
            for(let a = 0; a<currentNodeNeighbors.length; a++)
            {
                const {max, min, axis} = wall_check(currentNode,currentNodeNeighbors[a]);
                const axisInfo =  axis_reference[axis];
                const wall = cell_container[max[0]][max[1]].walls[axisInfo.maxWall];
                if(wall==true)//Wont get added to openSet
                {
                    console.log(cell_container[max[0]][max[1]],"cannot go here") 
                    continue;
                }
                if(searchObjectArray(openSet,currentNodeNeighbors[a])!=-1||searchObjectArray(closedSet, currentNodeNeighbors[a])!=-1)
                {
                    continue;
                }
                const priority = getMDIST(currentNode,currentNodeNeighbors[a])+getMDIST(endingNode,currentNodeNeighbors[a]);
                for(let j=0;j<openSet.length;j++)
                {
                    if(openSet[j].priority>priority)
                    {
                        openSet.splice(j,0,{
                            node:currentNodeNeighbors[a],
                            priority:priority,
                        })
                        pushed=true;
                    }
                }
                if(!pushed)
                {
                    openSet.push(
                        {
                            node:currentNodeNeighbors[a],
                            priority:priority,
                        }
                    )
                }
                pushed=false;
            }
            closedSet.push(openSet[0].node);//Prevent re explore
            openSet.splice(0,1);//remove from the open set
            currentNode=openSet[0];//First item = lowest priority node;
        }
        //Continue the loop now
    }
    function verifyPath(array)
    {
        array.forEach()
        {
            //wall check the things to see if they're nodes next to each other and also check for walls
            //
        }
    }
    function getMDIST(node1, node2)
    {
        return Math.abs(node1[0]-node2[0])+Math.abs(node1[1]-[node2[1]])
    }
    function Astar2()
    {
        const startingNode = stringCord(selected_nodes[0]);
        const endingNode =  stringCord(selected_nodes[1]);
        let currentNode =  startingNode;
    
    } 
    function BFS()
    {
        const startingPoint = stringCord(selected_nodes[0]);
        const endingPoint =  stringCord(selected_nodes[1]);
        let currentNode = startingNode;
        const Queue = [];
        const explored = [];
        while(currentNode!=endingPoint)
        {
            const nNeighbors = get_neighbors(currentNode, false)
            nNeighbors.forEach(
                nNeighbor=>
                {
                    const { max, min, axis } =  wall_check(currentNode, nNeighbor);
                    const axisInfo =  axis_reference[axis];
                    const wall =  cell_container[max[0]][max[1]].walls[axisInfo.maxWall];
                    if(wall == true)
                    {
                        nNeighbor.splice(indexof(nNeighbor),1);
                        Queue.push(nNeighbor);
                        //remove the item
                    }
                }
            )//remove invalid paths
            explored.push(currentNode);//add to explored
            Queue.splice(indexOf(currentNode),1);//remove from pQueue
            currentNode =  Queue[0];
        }
    }
    //basic idea
    // f = g+h where h = the heuristic of manhattan dist between current and end 
    //g = the current node minus the starting node. 
    //f= priority, will be used to pick the lowest priority and continue traversing it
    //open set =  priorit quee containing the nodes that can be selected to continue traversing down. will consist of objects and will be ordered based off of lowest priority
    //closed set = nodes that have already been explored. if they've been explored do not traverse or add them to the open set. 
    //Tthis will run in a while loop that does not terminate until the currentNode has arrived at the end node. 
    //travel cost always equals 1 
//Maze solving
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
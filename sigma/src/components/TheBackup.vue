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
    </div>
</template>
<script setup>  
    //note x =  column and y = row
    //in divs its x, y format
    import { ref, onMounted} from 'vue';
    const width = 800;
    const height =  800;
    let node_size = ref(20);
    let running=false;
    let cell_container = {}; 
    let selected_nodes = [];
    let visited_nodes = [];
    const selectedDifficulty =  ref("Medium");
    const selectedAlgorithm =  ref("back_recursive");
    const selectedSolvingAlgorithm =  ref("astar")
    let visualize = false;
    const containerKey = ref(0);
    const delayTime = ref(1);//hqrd cap of 4ms set by the browser so anything below 4 is set to 4

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
        prim_generation();
    })



//Methods
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
    function assign_cords(square_position)//Function called by html to get current grid position and assign to dataset
    {
        const row = Math.ceil(square_position/(width/node_size.value))-1;
        const column =  square_position - ((Math.ceil(square_position/(width/node_size.value)) - 1)*(height/node_size.value))-1;
        return { column, row }
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
    function compareNodes(node1, node2)//Checks if cords are equal, might remove
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
        const borderStyle = add!=true? "none":`${node_size.value/40}px solid #FFFFFF`;
        const {max, min, axis} =  wall_check(a, b);
        const axis_change = axis_reference[axis];
        document.querySelector(`[data-coordinates="${cordString(max)}"]`).style[axis_change.maxStyle] = borderStyle;
        document.querySelector(`[data-coordinates="${cordString(min)}"]`).style[axis_change.minStyle] = borderStyle;
        `${node_size.value/40}px; solid; #FFFFFF;`

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
                if(item[0]>(width/node_size.value)-1|| item[1]>(height/node_size.value)-1)
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
        cell_container = {};
        generate_grid(true)
        await changeAlgorithm();
        visualize = false;
        running=false;
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
        const random_x = Math.floor(Math.random() * (width/node_size.value));
        const random_y = Math.floor(Math.random() * (height/node_size.value));
        visited_nodes.push([random_x, random_y]);
        let current_neighbor = [random_x, random_y];
        //Find original nodes neighbors. then continue on selecting a random node and getting that nodes neighbors 
        while(visited_nodes.length!=((width/node_size.value)*(height/node_size.value)))
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
            if(visualize){await delay(delayTime.value);}
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
        const random_x = Math.floor(Math.random() * (width/node_size.value));
        const random_y = Math.floor(Math.random() * (height/node_size.value));
        visited_nodes.push([random_x, random_y]);
        let current_neighbor = [random_x, random_y];
        while(visited_nodes.length!=((width/node_size.value)*(height/node_size.value)))
        {
            if(visualize){await delay(1)};
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
        const random_x = Math.floor(Math.random() * (width/node_size.value));
        const random_y = Math.floor(Math.random() * (height/node_size.value));
        visited_nodes.push([random_x, random_y]);
        let current_neighbor = [random_x, random_y];
        const stack = [];//will record current path being taken
        while(visited_nodes.length!=((width/node_size.value)*(height/node_size.value)))
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
        return [(Math.floor(Math.random() * (width/node_size.value))), (Math.floor(Math.random() * (height/node_size.value)))]
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
        while(mazeSet.size!=((width/node_size.value)*(height/node_size.value)))
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
        async function randomizedDFS()
    {
        //get a random point first 
        const visitedNodes = []
        let current_neighbor = RStartNode();
        visitedNodes.push(RStartNode);
        //Find original nodes neighbors. then continue on selecting a random node and getting that nodes neighbors 
        while(visited_nodes.length!=((width/node_size.value)*(height/node_size.value)))
        {
            const current_neighbor_element =  document.querySelector(`[data-coordinates="${current_neighbor[0]},${current_neighbor[1]}"]`)
            current_neighbor_element.style.background =  "green"
            const new_neighbors =  get_neighbors(current_neighbor, true);
            new_neighbors.forEach(neighbor_item =>{
                document.querySelector(`[data-coordinates="${neighbor_item[0]},${neighbor_item[1]}"]`).style.background = "red"
            })
            if(new_neighbors.length==0)//Improve this 
            {
                current_neighbor;
                //impelement new selection logic here

                continue;
            }
            const new_neighbor =  new_neighbors[Math.floor(Math.random()*(new_neighbors.length))];
            if(visualize){await delay(delayTime.value);}
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
        
    }
    function getRandNumb(max)
    {
        return Math.floor(Math.random()*max);
    }
    function GrowingTree()
    {   
        const currentNode =  RStartNode();
        const visited = [];
        while(visited.length!=((width/node_size.value)*(height/node_size.value)))
        {

        }
    }
//Maze creation




//Maze solving
    function getMDIST(node1, node2)
    {
        return Math.abs(node1[0]-node2[0])+Math.abs(node1[1]-[node2[1]])
    }
    function wallWrapper(array, orig)
    {
        return array.filter(arr=>
            {
                const {max,min,axis} =  wall_check(arr, orig)
                const axisInfo = axis_reference[axis];
                const wall = cell_container[max[0]][max[1]].walls[axisInfo.maxWall];
                return !wall
            }
        )
    }
    function BFS()
    {
        const startingNode =  stringCord(selected_nodes[0]);
        const endingNode  = stringCord(selected_nodes[1]);
        let currentNode;
        const solution = [];
        const frontier = [];
        const visited = [];
        let cost = 0;
        frontier.push(startingNode);
        visited.push(startingNode);
        while(frontier.length!=0)
        {
            currentNode = frontier[0];
            frontier.shift();
            if(currentNode==endingNode)
            {
                solution.push(currentNode)
                break;
            }
            solution.push(currentNode);
            const nNeighbors =  wallWrapper(get_neighbors(currentNode, false),currentNode);
            for(let i = 0; i<nNeighbors.length;i++)
            {
                document.querySelector(`[data-coordinates="${cordString(nNeighbors[i])}"]`).style.background =  "red"
                if(findArray(visited, nNeighbors[i])==-1)
                {
                    frontier.push(nNeighbors[i]);
                    visited.push(nNeighbors[i]);
                }
            }
            cost+=1;
        }
        solution.forEach(coord=>
            {
                document.querySelector(`[data-coordinates="${cordString(coord)}"]`).style.background =  "blue"
            }
        )
    }
    class BinaryHeap//modify this to hold objects via their f value
    {
        constructor()
        {
            this.heap = []
        }
        heapadd(i)
        {
            this.heap.push(i);
            let currentIndex =  this.heap.length-1;
            if(currentIndex==0)//if only one element in the list total just avoid the checks
            {
                return;
            }
            console.log(this.parent(currentIndex), this.heap[currentIndex].f)
            while(this.parent(currentIndex)&&this.parent(currentIndex).f>this.heap[currentIndex].f)
            {
                const parentIndex =  Math.floor((currentIndex-1)/2);
                this.swap(currentIndex, parentIndex);
                currentIndex =  parentIndex;
            }
        }
        getRoot()
        {
            if(this.heap.length===0){return null}
            this.swap(0,this.heap.length-1);//swap the nodes
            const root = this.heap.pop()
            this.heapify();//make sure nodes satisfy conditions where parent is less than children
            return root;//pops the last element(root node) and returns it afterwards
        }
        heapify()
        {
            let current = 0;
            while(true)
            {
                let smallest = current;
                const leftIndex =  2*current+1;
                const rightIndex =  2*current+2;
    

                if(this.left(current)&&this.heap[leftIndex].f < this.heap[smallest].f)
                {
                    smallest = leftIndex;
                }
                if(this.right(current)&&this.heap[rightIndex].f < this.heap[smallest].f)
                {
                    smallest = rightIndex;
                }
                if(smallest!==current)
                {
                    this.swap(current, smallest);
                    current=smallest;
                }
                else
                {
                    break;
                }

            }
        }
        swap(a,b)
        {
            [this.heap[a], this.heap[b]] =  [this.heap[b], this.heap[a]];
        }
        left(i)//parent node input
        {
            return this.heap[2*i+1];
        }
        right(i)//parent node input
        {
            return this.heap[2*i+2];
        }
        parent(i)//child node input
        {
            return this.heap[Math.floor((i-1)/2)]//round down to get to the parent node
        }
        length()
        {
            return this.heap.length;
        }

    }


    async function Astar()//implement Map here 
    {
        const startingNode = stringCord(selected_nodes[0]);
        const endingNode =  stringCord(selected_nodes[1]);
        const closedList =  {};//Stores the already traversed nodes 
        const openList = [];//Queue based list lowest p =  first out
        const pQueue =  new BinaryHeap();
        //visited should be a set
        const visited = [];
    
        const testObj =
        {
            parent:null, 
            coordinate:startingNode, 
            f:getMDIST(startingNode, endingNode),
            g:0,
            h:getMDIST(startingNode, endingNode)
        }
        const solutionSet = [];
        pQueue.heapadd(testObj)
        let currentNode;
        while(pQueue.length()>0)
        {
            await delay(1)
            currentNode = pQueue.getRoot();
            if(compareNodes(currentNode.coordinate, endingNode))
            {
                let found = false;
                console.log("tracing path")
                const solutionSet=[currentNode.parent]
                //get the solution set here by backtracking 
                //we get this by checking the closedset as since we know that we have moved all the previous explored nodes into this we can search it to backtrack to the start
                let parentNode =  currentNode.parent
                console.log(parentNode);
                while(compareNodes(parentNode, startingNode)!=true)//backtracing
                {
                    solutionSet.push(closedList[parentNode].coordinate)
                    document.querySelector(`[data-coordinates="${cordString(parentNode)}"]`).style.background =  "#ff00f7"
                    parentNode = closedList[parentNode].parent;
                    console.log("attempted node")
                }
                //once the solution has been found return it and also highlight it 
                
    
                return;
            }
            document.querySelector(`[data-coordinates="${cordString(currentNode.coordinate)}"]`).style.background =  "purple"
            const newNeighbors = wallWrapper(get_neighbors(currentNode.coordinate, false), currentNode.coordinate);
            for(let i = 0; i<newNeighbors.length;i++)//use binary heap for this
            {
                if(findArray(visited, newNeighbors[i])!= -1)//use a set method here to optimize it or smth
                {
                    continue;
                }
                const h = getMDIST(endingNode, newNeighbors[i])
                const g =  1+currentNode.g
                const f =  h+g;
                console.log(pQueue)
                pQueue.heapadd(
                    {
                        parent:currentNode.coordinate,
                        coordinate:newNeighbors[i],
                        f:f,
                        g:g,
                        h:h
                    }
                )
                console.log(pQueue)
                visited.push(newNeighbors[i]);
            }
            const serializedKey = cordString(currentNode.coordinate)
            closedList[serializedKey] =  currentNode;
            //add to the closed set, also make sure to place is in object order where the coordinate of it is serialized to make it easier to acess.
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

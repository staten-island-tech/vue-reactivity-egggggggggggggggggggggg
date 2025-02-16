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
            :style="{width:`${node_size}px`,height:`${node_size}px`,border:`1px solid #FFFFFF`}"
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
    //problems
    //recalculation of elements when form submission despite @submit.prevent
    //using classes might fix idk tho

    import { ref, onMounted} from 'vue';
    //pre-defined sizes:  20*20, 40*40, 80*80;
    //use js to determine the vh and assign the node size and height. some options will be limited due to device size 


    //to do list
    //leverage reactive() by creating something with all of the styles properties such as border background etc
    //change those values? 
    //something function or smth idk
    
    const width = 800;
    const height =  800;
    let node_size = ref(10);
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
        generate_grid(true);
        RBT();
        const end = performance.now();
        console.log(`took ${end-start} ms`)
    })

    


//Methods
    function handleChange()
    {

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
        return { column, row };
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
    function compareNodes(node1, node2)//more efficient than stringCord for comparing nodes
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
//Methods


//Maze creation 
    function getRSetItem(set)//works for both map and set
    {
        const index =  Math.floor(Math.random()*set.size);
        let i = 0;
        for(const pair of set)
        {
            if(i===index){return pair};
            i++;
        }
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
                if(visualize){document.querySelector(`[data-coordinates="${serializedCord}"]`).style.background = "red"};
            }
            if(newNeighbors.length==0)
            {
                current = getRSetItem(visited);
            }
            const newNeighbor = newNeighbors[Math.floor(Math.random()*newNeighbors.length)];
            if(visualize){document.querySelector(`[data-coordinates="${cordString(newNeighbor)}"]`).style.background = "green"}
            manipulate_walls(current,newNeighbor, false);
            current = newNeighbor;
            visited.add(cordString(newNeighbor));
        }
        //repaint it. 
    } 
    function randNumb(min, max)
    {
        return Math.floor(Math.random()*(max-min)+min);
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
            if(visualize){await delay(4);document.querySelector(`[data-coordinates="${cordString(current)}"]`).style.background = "green";};
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
                    if(visualize){document.querySelector(`[data-coordinates="${serializedNeighbor}"]`).style.background = "red";}
                }
            }
            const randFrontNode = getRSetItem(frontier);
            manipulate_walls(stringCord(randFrontNode[0]), randFrontNode[1]);
            visited.add(randFrontNode[0]);
            frontier.delete(randFrontNode[0]);
            current = stringCord(randFrontNode[0]);
        }
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
            if(visualize){await delay(4)}
            const newNeighbors = get_neighbors(current, true).filter(item=>
            {
            if(visited.has(cordString(item))){
                return false
            }
            if(visualize){document.querySelector(`[data-coordinates="${cordString(item)}"]`).style.background = "red"}
            return true;
            }
            );
            if(newNeighbors.length>0)
            {
                const newNeighbor =  newNeighbors[randNumb(0, newNeighbors.length)];
                manipulate_walls(current, newNeighbor);
                current = newNeighbor;
                visited.add(cordString(newNeighbor));
                stack.push(newNeighbor);
            }
            else
            {
                current =  stack.at(-1)
                if(visualize){document.querySelector(`[data-coordinates="${cordString(current)}"]`).style.background = "orange";}
                stack.pop();
            }
        }
    }

    async function wrqw()
    {
        const random_x = Math.floor(Math.random() * (width/node_size.value));
        const random_y = Math.floor(Math.random() * (height/node_size.value));
        visited_nodes.push([random_x, random_y]);
        let current_neighbor = [random_x, random_y];
        const stack = [];//will record current path being taken
        while(visited_nodes.length!=((width/node_size.value)*(height/node_size.value)))
        {
            {await delay(delayTime.value);}
            const new_neighbors =  get_neighbors(current_neighbor, true);//FIX THIS
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

//Maze creation




//These works dont tweak
    function getMDIST(node1, node2)
    {
        return Math.abs(node1[0]-node2[0])+Math.abs(node1[1]-[node2[1]])
    }
    function wallWrapper(array, orig)//made this cuz im lazy
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
                let found = false;
                const solutionSet=[currentNode.parent]
                let parentNode =  currentNode.parent
                while(compareNodes(parentNode, startingNode)!=true)//backtracing
                {
                    solutionSet.push(closedList[parentNode].coordinate)
                    document.querySelector(`[data-coordinates="${cordString(parentNode)}"]`).style.background =  "blue"
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
                    document.querySelector(`[data-coordinates="${cordString(bt)}"]`).style.background =  "blue";
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
                    document.querySelector(`[data-coordinates="${cordString(newNeighbors[i])}"]`).style.background =  "purple";
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

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
    const visitedNodes = [];
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
                    const missingCords =  findConsec(visitedNodes[i]);
                    currentNode = [missingCords[0], i];
                }

            }
            continue;
        }
        const rnIndex = getRandNumb(newNeighbors.length);
        const nNeighbor = newNeighbors[rnIndex];
        manipulate_walls(currentNode, nNeighbor, false);
        currentNode = nNeighbor;
        if(!visitedNodes[nNeighbor[1]])
        {
            visitedNodes[nNeighbor[1]]=[];
        }
        visitedNodes[nNeighbor[1]].push(nNeighbor[0]);

    }   
}
function getRandNumb(max)
{
    return Math.floor(Math.random()*max);
}
function findConsec(array)
{
    const missing =  [];
    let missingCounter = 0;
    const arrayLength = array.length;
    if(array[0]!=0)
    {
        missing,push(0)
    }
    if(array[array.length-1]!= (width/node_size-1))
    {
        missing.push((width/node_size-1));
    }
    for(let i = 0; i<(width/node_size);i++)
    {
        if(array[i] != i)
        {
            missing,push(i)
            missingCounter+=1;
        }
    }
}
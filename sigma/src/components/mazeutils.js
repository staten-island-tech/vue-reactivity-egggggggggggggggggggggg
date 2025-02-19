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
function randNumb(min, max)
{
    return Math.floor(Math.random()*(max-min)+min);
}
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
function getMDIST(node1, node2)
{
    return Math.abs(node1[0]-node2[0])+Math.abs(node1[1]-[node2[1]])
}




export { delay, stringCord, cordString, compareNodes, wall_check, randNumb, getRSetItem, getMDIST }
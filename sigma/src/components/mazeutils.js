export default class BinaryHeap//modify this to hold objects via their f value
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
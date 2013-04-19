
function randomlyPermute( array )
{
for(var i = array.length-1; i >= 0; i--)
  {
  var rIdx= Math.floor( Math.random()*(i+1) );
  var tmp = array[ rIdx ];
  array[ rIdx ] = array[ i ];
  array[ i ] = tmp;
  }

return array;
}





function maximalSubForest( nrOfNodes, inputEdges ) // sub-forest with maximal number of edges
{

// Union-Find -- based on Cormen, Leiserson, Rivest textbook
function UnionFindObject( ) // constructor of a new union find object -- corresponds to MAKE-SET
{
this.p= this;
this.rank=0;
}

function union(x, y)
{
link( findSet(x), findSet(y) );
}

function link(x,y)
{
if( x.rank>y.rank ) y.p = x.p;
else
  {
  x.p = y.p;
  if( x.rank == y.rank ) y.rank = y.rank + 1;
  }
}

function findSet(x)
{
if( x != x.p ) x.p = findSet(x.p);
return x.p;
}

// end of Union-Find functions' definitions 

var element=[];

for(i=0; i< nrOfNodes; i++) element[i]= new UnionFindObject();

var output=[];

for(var i = 0; i< inputEdges.length; i++)
   {
   x= findSet( element[ inputEdges[i][0] ] );
   y= findSet( element[ inputEdges[i][1] ] );
   if(x != y) 
     {
     output.push( inputEdges[i] );
     union( x,y );
     } 
   }

return output;

}



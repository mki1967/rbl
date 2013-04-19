
function GridEdge( vertex1, dimm) // constructor of grid edge - representing egde from vertex1 to its succesor in the dimension dimm 
{
this.startVertex = vertex1;
this.dim = dimm;
}


function gridNodeSize(dimArray) // number of nodes in the grid
{
var mult=1;
for(var i=0; i<dimArray.length; i++)
   mult = mult * dimArray[i];
return mult;
}

function gridDimEdgeSize(dimArray, dim) // number of edges in the dimension dim
{
dimArray[dim] = dimArray[ dim ] - 1;
var size=gridNodeSize(dimArray);
dimArray[dim] = dimArray[ dim ] + 1;
return size;
}

function gridEdgeSize(dimArray) // total number of edges
{
var sum=0;
for(var i=0; i<dimArray.length; i++)
    sum = sum + gridDimEdgeSize(dimArray, i);
return sum;
}

function gridEdgeEndpointsCoordinates(gridEdge)
{
endVertex= gridEdge.startVertex.slice(0); // clone the array
endVertex[gridEdge.dim]=endVertex[gridEdge.dim]+1
return [ gridEdge.startVertex.slice(0), endVertex]; 
}

function gridEdgeToIndex(dimArray, gridEdge)
{
var sum=0;
for(var i=0; i<gridEdge.dim; i++) 
  sum = sum + gridDimEdgeSize(dimArray, i);
dimArray[ gridEdge.dim ] = dimArray[ gridEdge.dim ] - 1;
sum = sum + gridNodeCoordinatesToIndex(dimArray, gridEdge.startVertex);
dimArray[ gridEdge.dim ] = dimArray[ gridEdge.dim ] + 1;
return sum;
}


function gridEdgeIndexToEdge(dimArray, edgeIndex)
{
var dim = 0;
var sum1 = 0;
var sum2 = gridDimEdgeSize(dimArray, dim);

while( sum2 <= edgeIndex )
  {
  sum1 = sum2;
  dim = dim + 1;
  sum2 = sum2 + gridDimEdgeSize(dimArray, dim);
  }

dimArray[dim] = dimArray[dim] - 1;
var startVertex = gridNodeIndexToCoordinates(dimArray, edgeIndex-sum1);
dimArray[dim] = dimArray[ dim ] + 1;

return new GridEdge(startVertex, dim);
}




function gridNodeCoordinatesToIndex(dimArray, crdArray) // coputes index of the node of given coordinates
{
var mult=1;
var sum=0;
for(var i=0; i<dimArray.length; i++)
   {
   sum = sum + crdArray[i]*mult;
   mult = mult*dimArray[i]
   }
return sum;
}

function gridNodeIndexToCoordinates(dimArray, idx) // computes coordinates of the node of given index
{
var crd=[];
for(var i=0; i<dimArray.length; i++)
  {
  crd[i]= idx % dimArray[i];
  idx = (idx - crd[i]) / dimArray[i];
  }
return crd;dimArray[dim] = dimArray[ dim ] - 1;

}



function gridExportToGraphEdgeList(dimArray)
{
var listOfEdges=[];

for(var dim=0; dim < dimArray.length; dim++ )
  {
  dimArray[dim] = dimArray[dim] - 1;
  nodeSize= gridNodeSize(dimArray);
  for(var nodeIdx=0; nodeIdx < nodeSize; nodeIdx++)
     listOfEdges.push( new GridEdge( gridNodeIndexToCoordinates(dimArray, nodeIdx), dim ) );
  dimArray[dim] = dimArray[ dim ] + 1;
  }


for(var i=0; i<listOfEdges.length; i++)
   listOfEdges[i] = gridEdgeEndpointsCoordinates( listOfEdges[i] );

for(var i=0; i<listOfEdges.length; i++)
   listOfEdges[i] = [ gridNodeCoordinatesToIndex(dimArray, listOfEdges[i][0]), 
                      gridNodeCoordinatesToIndex(dimArray, listOfEdges[i][1]) ];
return listOfEdges;

}

function gridRandomSpanningTree(dimArray)
{
var listOfEdges=gridExportToGraphEdgeList(dimArray);

randomlyPermute(listOfEdges);

var tree= maximalSubForest(gridNodeSize(dimArray), listOfEdges);

for(var i ; i<tree.length; i++)
   tree[i]=[ gridNodeIndexToCoordinates(dimArray, tree[i][0]),
             gridNodeIndexToCoordinates(dimArray, tree[i][0]) ];

return tree;
}






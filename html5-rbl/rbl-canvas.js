
/* RblCanvas */

function RblCanvas( canvasId ) // constructor of the RblCanvas object assosciated with the canvas on HTML document
{

// get canvas and context from including HTML file

this.canvas = document.getElementById( canvasId );
this.context = this.canvas.getContext("2d");

// set default values

// color constants
this.BLACK = "#000000";
this.RED   = "#FF0000";
this.BLUE  = "#0000FF";
this.WHITE = "#FFFFFF";

this.context.fillStyle = this.BLACK;
this.center=[0,0]; 
this.minSize=2;

this.user=null;
// this.redraw = function () {} ; // default redraw function. Replace with this.setRedrawFunction( ... )

// recompute dependent properties

this.updateAll();

}

RblCanvas.prototype.redraw = function () 
{
if( this.user != null && this.user.redraw != null) this.user.redraw(); 
}

RblCanvas.prototype.updateAll = function () 
{
this.width = parseInt( this.canvas.getAttribute("width") );
this.height = parseInt( this.canvas.getAttribute("height") );
this.updateRealScreen();
}

// updating screen parameters


RblCanvas.prototype.updateRealScreen = function ()  
{

var sizeX = this.minSize; 
var sizeY = this.minSize;
if( this.width > this.height ) sizeX = sizeX * this.width / this.height;
if( this.width < this.height ) sizeY = sizeY * this.height / this.width;

this.cx = this.width / sizeX;
this.minX = this.center[0] - (sizeX / 2);

this.cy = this.height / sizeY;
this.maxY = this.center[1] + (sizeY / 2);

}



// translate real coordinates to pixel coordinates

RblCanvas.prototype.rx = function (x)
{
return (x - this.minX) * this.cx;
}


RblCanvas.prototype.ry = function (y)
{
return (this.maxY - y) * this.cy;
}


// setting  callbacks on HTML includer

function onWindowResizeCallback( rblCanvas )
{
rblCanvas.onWindowResize();
}


RblCanvas.prototype.onWindowResize =   function () {
var wth = parseInt(window.innerWidth);
var hth = parseInt(window.innerHeight);
this.canvas.setAttribute("width", ''+wth);
this.canvas.setAttribute("height", ''+hth-5);

this.updateAll();
this.redraw();
}

RblCanvas.prototype.onLoad = function () {

// set remaining callbacks
// window.onresize= this.onWindowResize;
// window.addEventListener ("keydown", onKeyDown, true);
// window.onkeydown=onKeyDown;

// set canvas size and redraw
// this.onWindowResize(); 
}



// *** API for the user of RblCanvas ***



RblCanvas.prototype.setUser = function( userArg ){
this.user = userArg;
}


RblCanvas.prototype.setCenter = function ( centerArg )
{
this.center= ceneterArg;
this.updateRealScreen();
}

RblCanvas.prototype.setMinSize = function ( minSizeArg )  
{
this.minSize=minSizeArg;
this.updateRealScreen();
}


// drawing operations

RblCanvas.prototype.clearScreen = function()
{
/*
this.context.globalCompositeOperation= 'source-over';
this.context.fillStyle= this.BLACK;

this.context.fillRect(0,0,this.width,this.height);
*/
this.context.clearRect(0,0,this.width,this.height);
}

RblCanvas.prototype.setColorAndMode = function( colorArg, modeArg )
{
// this.context.fillStyle= this.WHITE;
this.context.strokeStyle = colorArg;
this.context.globalCompositeOperation = modeArg;
}

RblCanvas.prototype.beginPath = function()
{
this.context.beginPath();
}

RblCanvas.prototype.stroke = function()
{
this.context.stroke();
} 

RblCanvas.prototype.drawSegment = function( x1, y1, x2, y2 )
{
// this.context.beginPath();
this.context.moveTo(this.rx(x1), this.ry(y1));
this.context.lineTo(this.rx(x2), this.ry(y2));
// this.context.stroke();
// alert([this.rx(x1), this.ry(y1) , this.rx(x2), this.ry(y2)]);
}









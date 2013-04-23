function RblCanvasTester( rblCanvasArg )
{
this.canvas= rblCanvasArg;
rblCanvasArg.setUser(this);
}


myPrototype=RblCanvasTester.prototype; // My prototype in this text file

myPrototype.redraw= function ()
{
var canvas= this.canvas;
canvas.clearScreen();
canvas.context.lineWidth=2;
canvas.setColorAndMode(canvas.RED, 'lighter');
canvas.drawSegment( -10, -10, 0.5, 0.5);
canvas.drawSegment( -10, 0, 1000, 5);
canvas.setColorAndMode(canvas.BLUE, 'lighter');
canvas.drawSegment( 0, 0, 0.5, 0.5);
canvas.setColorAndMode(canvas.BLUE, 'lighter');
canvas.drawSegment( 0.5, 0.5, 1, 1);
}






/* global variables */

HELP_STRING="SHORT INSTRUCTIONS (use keyboard):\n \
-------------------\n \
'?' \t- this help\n \
Arrow keys, 'B', 'F' \t- move the cursor / rotate the object\n \
'L', Space\t- line up to the right angles\n \
'E'\t- switch stereo/mono-scopic' view\n \
'M'\t- switch cursor modes\n \
'+', Enter, double mouse click\t- switch on linking mode/insert new segment\n \
'-', Escape\t- switch off linking mode\n \
'J'\t- jump to the nearest endpoint\n \
'#', Delete\t- remove the selected segments\n \
'S'\t- in linking mode: toggle selection of the segment\n \
'*'\t- select all segments incident to the cursor\n \
'A'\t- select all segments\n \
'X'\t- flip the selection of each segment\n \
'D'\t- dump the text of the current state of the editor and data. (Enable pop-up windows. This text can be copy-pasted to your text editor and saved as an SVG document.)\n \
\nIn stereo-scopic view, use red-blue glasses with the red glass on the left eye and the blue glass on the right eye. \
\nMore info on:\t https://github.com/mki1967/rbl.git\n \
"

/// DATA

rotation= [
          [1,0,0],
          [0,1,0],
          [0,0,1]
          ];

screenZ=0.0;

// eyes

var eyes=new RblEyes();

cursorPosition=[0,0,0];
cursorSize=0.5;
cursorStep=1;

frameSize=10;

/* Color names */
BLACK = "#000000";
RED   = "#A00000";
BLUE  = "#0000FF";
WHITE = "#FFFFFF";



// line styles
LEFT_SEGMENT_LINE= new RblLineStyle(RED, 2);
RIGHT_SEGMENT_LINE= new RblLineStyle(BLUE, 2);

LEFT_SELECTED_LINE= new RblLineStyle(RED, 3);
RIGHT_SELECTED_LINE= new RblLineStyle(BLUE, 3);

LEFT_CURSOR_LINE= new RblLineStyle(RED, 4);
RIGHT_CURSOR_LINE= new RblLineStyle(BLUE, 4);

LEFT_FRAME_LINE= new RblLineStyle(RED, 1);
RIGHT_FRAME_LINE= new RblLineStyle(BLUE, 1);

LEFT_MARKER_LINE= new RblLineStyle(RED, 1);
RIGHT_MARKER_LINE= new RblLineStyle(BLUE, 1);


var editor; // global variable for the rblEditor in this file
var canvas; // global variable for the editor.canvas in this file

function RblEditor( rblCanvasArg ) // constructor of the canvas user
{
this.canvas= rblCanvasArg;
rblCanvasArg.setUser(this);
this.canvas.setMinSize(30);
editor=this;  // set the global variable for editor
canvas=this.canvas; // set the global variable for the canvas
// set event handlers
canvas.onmousedown=onMouseDown;
canvas.onmousemove=onMouseMove;
}

edPrototype=RblEditor.prototype;

edPrototype.redraw= function ()
{
var canvas= this.canvas;
canvas.clearScreen();

redrawCursorAndFrame(canvas);

project(canvas, LEFT_SEGMENT_LINE, eyes.leftEye, screenZ, rotation, segments);
project(canvas, RIGHT_SEGMENT_LINE, eyes.rightEye, screenZ, rotation, segments);

var selected=new Array();
var i;
for(i=0; i<segments.length; i++) 
  if(segments[i].selected) selected.push(segments[i]);

project(canvas, LEFT_SELECTED_LINE, eyes.leftEye, screenZ, rotation, selected);
project(canvas, RIGHT_SELECTED_LINE, eyes.rightEye, screenZ, rotation, selected);

if(isCursorVisible) {
  canvas.printAt(3,3, WHITE, "cursor = "+JSON.stringify(cursorPosition));
  }
}

function redraw() // global redraw in this file
{
editor.redraw();
}

isCursorVisible=true;
isCursorMoving=true;
linkMarker=null;  // either null or vector

var segments=new Array();
var cursorSegments= new Array();
var frameSegments= new Array();
var linkMarkerSegments= new Array();

/* mouse action variables */
var mouseAction=null;
var lastX, lastY;
var X_ROT_STEP=Math.PI/21;
var Y_ROT_STEP=Math.PI/21;




function makeCursorAndFrameSegments(){
var versorsXY=selectVersorsOnXYZ(rotation);

var cSize=cursorSize;
if(!isCursorMoving) cSize/=2;

cursorSegments[0]= [ vAdd(svMul(-cSize, versorsXY[0]),cursorPosition),  vAdd(svMul(cSize, versorsXY[0]),cursorPosition) ];
cursorSegments[1]= [ vAdd(svMul(-cSize, versorsXY[1]),cursorPosition),  vAdd(svMul(cSize, versorsXY[1]),cursorPosition) ];

cursorComponent=[0,0,0];
sumVersors= vAdd(versorsXY[0], versorsXY[1]);
var i=0;
for(i=0; i<3; i++) if(sumVersors[i]==0) cursorComponent[i]=cursorPosition[i];

var framePoint=new Array();
framePoint[0]=vAdd( vAdd( svMul(-frameSize,versorsXY[0]), svMul(-frameSize,versorsXY[1]) ), cursorComponent);
framePoint[1]=vAdd( vAdd( svMul( frameSize,versorsXY[0]), svMul(-frameSize,versorsXY[1]) ), cursorComponent);
framePoint[2]=vAdd( vAdd( svMul( frameSize,versorsXY[0]), svMul( frameSize,versorsXY[1]) ), cursorComponent);
framePoint[3]=vAdd( vAdd( svMul(-frameSize,versorsXY[0]), svMul( frameSize,versorsXY[1]) ), cursorComponent);

frameSegments[0]=[framePoint[0], framePoint[1]];
frameSegments[1]=[framePoint[1], framePoint[2]];
frameSegments[2]=[framePoint[2], framePoint[3]];
frameSegments[3]=[framePoint[3], framePoint[0]];


if(linkMarker!=null) linkMarkerSegments[0]=[linkMarker, cursorPosition]; 

}



function redrawCursorAndFrame(canvas){
if(isCursorVisible){
  makeCursorAndFrameSegments();
  project(canvas, LEFT_CURSOR_LINE, eyes.leftEye, screenZ, rotation, cursorSegments);
  project(canvas, RIGHT_CURSOR_LINE, eyes.rightEye, screenZ, rotation, cursorSegments);
  project(canvas, LEFT_FRAME_LINE, eyes.leftEye, screenZ, rotation, frameSegments);
  project(canvas, RIGHT_FRAME_LINE, eyes.rightEye, screenZ, rotation, frameSegments);
  if(linkMarker!=null) {
     project(canvas, LEFT_MARKER_LINE, eyes.leftEye, screenZ, rotation, linkMarkerSegments);
     project(canvas, RIGHT_MARKER_LINE, eyes.rightEye, screenZ, rotation, linkMarkerSegments);     
     }
  }
}


function project(canvas, lineStyle, eye, screenZ, rotation, segments){
lineStyle.setOnCanvas(canvas);
canvas.beginPath();
var i=0;
for(i=0; i<segments.length; i++){
   v1= zPerspective(eye, screenZ, mvMul(rotation, segments[i][0]));
   v2= zPerspective(eye, screenZ, mvMul(rotation, segments[i][1]));
   canvas.drawSegment(v1[0],v1[1], v2[0], v2[1]);
   }
canvas.stroke();
}


function getData()
{
if(DATA.segments) segments=DATA.segments;
if(DATA.eyes) eyes=DATA.eyes;
// ...
}

function dump()
{
var x;
x=document.getElementById("DataId");
var data={};
data.segments=segments;
data.eyes=eyes;

x.innerHTML="DATA = "+JSON.stringify(data, null, " ");
var serializer= new XMLSerializer();
var string=serializer.serializeToString(document);
var w=window.open('','_blank');
var doc=w.document;
var lt='<';
doc.writeln('<html>');
doc.writeln('<head><title>Dumped RBL</title></head>');
doc.writeln('<body>');
doc.writeln('<h3> RedBlueLines dumped at: '+(new Date())+'</h3>');
doc.writeln('<p> Copy-paste the selected text from the textarea below to any text editor and save as a file with ".html" extension. </p>');
doc.writeln('<p> Also download the script <a href="rbl-edit_exe.js" target="_blank">rbl-edit_exe.js</a> to the same directory. </p>');
doc.writeln(lt+'textarea id="dumped" rows="40" cols="150">');
doc.writeln(string);
doc.writeln(lt+'/textarea>');
doc.writeln('<body>');
doc.writeln('</html>');
doc.close();
var dumped=doc.getElementById("dumped");
dumped.select();
}




/* event handlers */

function onLoad(evt){
redraw();
}



function mouseRotation(x,y){
if(Math.abs(x)<Math.abs(y)) rotation=mmMul(rotationYZ(y*Y_ROT_STEP), rotation);
else rotation=mmMul(rotationXZ(x*X_ROT_STEP), rotation);
redraw();
}



function onMouseMove(evt){
if(mouseAction!=null){
  x=canvas.xr(evt.clientX);
  y=canvas.yr(evt.clientY);

  mouseAction(x-lastX, y-lastY);
  lastX=x; lastY=y;
  }
}

document.onmousemove=onMouseMove;

wasFirstClick=false;

function onMouseDown(evt){
  x=canvas.xr(evt.clientX);
  y=canvas.yr(evt.clientY);

  var doubleClick= (lastX==x && lastY==y && wasFirstClick);
  lastX=x; lastY=y; wasFirstClick=!(doubleClick);

if(isCursorMoving){
  mouseAction=null;
  moveToMouse();
  moveToMouse(); // check it in the future
  if(doubleClick) linkingPlus();
  }
else if(mouseAction==null){
  mouseAction=mouseRotation;
  }
else {
  mouseAction=null;
  }
}

document.onmousedown=onMouseDown;


function onMouseUp(evt){
}


function moveToMouse()
{
var versors=selectVersorsOnXYZ(rotation);
moveToMouseByVector(versors[0]);
moveToMouseByVector(svMul(-1,versors[0]));
moveToMouseByVector(versors[1]);
moveToMouseByVector(svMul(-1,versors[1]));
redraw();
}

function moveToMouseByVector(vDelta)
{
var v1= zPerspective(eyes.MONO_EYE, screenZ, mvMul(rotation,cursorPosition));
var next=vAdd(cursorPosition, vDelta);
var v2= zPerspective(eyes.MONO_EYE, screenZ, mvMul(rotation,next));
var dist1= sqLength2d(lastX-v1[0], lastY-v1[1]);
var dist2= sqLength2d(lastX-v2[0], lastY-v2[1]);
while(vLE([-frameSize,-frameSize,-frameSize],next) &&  vLE(next,[frameSize,frameSize,frameSize]) 
      && dist2<dist1 )
  {
  cursorPosition=next;
  v1=v2;
  dist1=dist2;
  next=vAdd(cursorPosition, vDelta);
  v2= zPerspective(eyes.MONO_EYE, screenZ, mvMul(rotation,next));
  dist2= sqLength2d(lastX-v2[0], lastY-v2[1]);
  }
}


function rotationReset(){
rotation=selectVersorsOnXYZ(rotation);
redraw();
}

function toggleMonoStereo(){
if(eyes.eyesMode=='mono') eyes.setMode('stereo');
else eyes.setMode('mono');
redraw();
}

function help()
{
// window.open('http://sites.google.com/site/redbluelines/','_blank');
alert(HELP_STRING);
}


function switchMode()
{
mouseAction=null;
wasFirstClick=false;
if(isCursorVisible && isCursorMoving)  isCursorMoving=false;
else if(isCursorVisible) isCursorVisible=false;
else isCursorVisible=isCursorMoving=true;
redraw();
}

function cursorMove( x,y,z )
{
var versors=selectVersorsOnXYZ(rotation);
var d=vAdd( svMul(x,versors[0]), svMul(y,versors[1]));
d=vAdd(d, svMul(z,versors[2]) );
d=vAdd(cursorPosition,d);
if(vLE([-frameSize,-frameSize,-frameSize],d) &&  vLE(d,[frameSize,frameSize,frameSize]) )
     cursorPosition=d;
redraw()
} 


function jumpToNearestEndtpoint()
{
if(!isCursorVisible) return;
var v=nearestEndpoint(segments, cursorPosition);
if(v!=null) {
  cursorPosition=v;
  redraw();
  }
}


function linkingPlus()
{
  if(isCursorVisible && isCursorMoving){
    if(linkMarker!=null) // insert new segment
      {
       if(vCmp(linkMarker, cursorPosition)!=0)
         segInsert(segments, newSeg(linkMarker, cursorPosition));
      }
    linkMarker=cursorPosition; 	
    redraw();
  }
}

function linkingMinus()
{
  if(isCursorVisible){
    linkMarker=null;
    redraw();
   }
}


function unlink()
{
  if(isCursorVisible && linkMarker!=null)
    {
    segDelete(segments, newSeg(linkMarker, cursorPosition));
    linkMarker=cursorPosition;
    redraw();
    }
}

function deleteSelected()
{
var i;
for(i=segments.length-1; i>= 0; i--) 
   if(segments[i].selected) segDelete(segments, segments[i]);
redraw();
}

function linkSelect()
{
  if(isCursorVisible && linkMarker!=null && vCmp(linkMarker, cursorPosition) != 0)
    {
    var seg=segFind(segments, newSeg(linkMarker, cursorPosition));
    if(seg!=null) seg.selected=!seg.selected;
    linkMarker=cursorPosition;
    redraw();
    }
}

function selectAll()
{
var i;
for(i=0; i<segments.length; i++) segments[i].selected=true;
redraw();
}

function toggleSelections()
{
var i;
for(i=0; i<segments.length; i++) segments[i].selected=!segments[i].selected;
redraw();
}

function starSelect()
{
if(isCursorVisible){
  for(i=0; i<segments.length; i++) 
     if (isIncidentSegVec(segments[i], cursorPosition)) segments[i].selected=true;
  redraw();
  }
}

function back()
{
    if(isCursorMoving) cursorMove(0,0,-1);
    else { 
      rotation=mmMul(rotationXY(-Math.PI/24), rotation);
      redraw(); 
    }
}


function forward()
{ 
    if(isCursorMoving) cursorMove(0,0,1);
    else {
       rotation=mmMul(rotationXY(Math.PI/24), rotation);
       redraw();
    }
}

function up()
{
    if(isCursorMoving) cursorMove(0,1,0);
    else {
      rotation=mmMul(rotationYZ(Math.PI/24), rotation);
      redraw();
    }
}

function down()
{
    if(isCursorMoving) cursorMove(0,-1,0);
    else {
      rotation=mmMul(rotationYZ(-Math.PI/24), rotation);
      redraw();
    }
}


function left()
{
    if(isCursorMoving) cursorMove(-1,0,0);
    else { 
      rotation=mmMul(rotationXZ(-Math.PI/24), rotation);
      redraw();
    }
}

function right()
{
    if(isCursorMoving) cursorMove(1,0,0);
    else {
      rotation=mmMul(rotationXZ(Math.PI/24), rotation);
      redraw();
    }
}

function onKeyDown(e){
code=e.keyCode? e.keyCode : e.charCode;
switch(code)
{
case 38: // up
    up();
    break;
case 40:
    down();
    break;
case 37:
    left();
    break;
case 39:
    right();
    break;
case 70: // F
    forward();
    break;
case 66: // B
    back();
    break;
case 32: // space
case 76: // L
  rotationReset();break;
case 69: // E
  toggleMonoStereo();break;
case 77: // M
  switchMode(); break;
case 191: // ?
  help(); break;
case 68: // D
  dump(); break;
case 13: // enter
case 187: // +
  linkingPlus();
  break;
case 27: // escape
case 189: // -
  linkingMinus();
  break;
case 86: // V
  break;
case 46: // Delete
case 51: // #
  deleteSelected();
  // unlink();
  break;
case 83: // S
  linkSelect();
  break;
case 65: // A
  selectAll();
  break;
case 56: // *
  starSelect();
  break;
case 88: // X
  toggleSelections();
  break;
case 74: // J
  jumpToNearestEndtpoint();
  break;

};
// editor.redraw();
// alert(code); // for tests
}

document.onkeydown=onKeyDown;


// initializing actions
getData();

alert(HELP_STRING); // test

 




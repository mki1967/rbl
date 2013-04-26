
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



alert(HELP_STRING); // test

rotation= [
          [1,0,0],
          [0,1,0],
          [0,0,1]
          ];
LEFT_EYE=[-3.25,0.0,-60.0];
RIGHT_EYE=[3.25,0.0,-60.0];
MONO_EYE=[0.0,0.0,-60.0];

leftEye=MONO_EYE; ////
rightEye=MONO_EYE; ////
screenZ=0.0;

cursorPosition=[0,0,0];
cursorSize=0.5;
cursorStep=1;

frameSize=10;

/* Color names */
BLACK = "#000000";
RED   = "#FF0000";
BLUE  = "#0000FF";
WHITE = "#FFFFFF";

/* Line style object */
function LineStyle( color1, width1 )
{
this.color=color1;
this.width=width1;
}

LineStyle.prototype.setOnCanvas= function( canvas )
{
canvas.context.lineWidth=this.width;
canvas.setColorAndMode(this.color, 'lighter');
}

LEFT_SEGMENT_LINE= new LineStyle(RED, 2);
RIGHT_SEGMENT_LINE= new LineStyle(BLUE, 2);

LEFT_CURSOR_LINE= new LineStyle(RED, 4);
RIGHT_CURSOR_LINE= new LineStyle(BLUE, 4);

LEFT_FRAME_LINE= new LineStyle(RED, 1);
RIGHT_FRAME_LINE= new LineStyle(BLUE, 1);

function RblEditor( rblCanvasArg ) // constructor of the canvas user
{
this.canvas= rblCanvasArg;
rblCanvasArg.setUser(this);
}

edPrototype=RblEditor.prototype;

edPrototype.redraw= function ()
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



/************************ UPDATE BELOW **********************************/
/* updating XML and SVG document */

/* NOT NEEDED
function vToSource(v){
return ("["+v[0]+","+v[1]+","+v[2]+"]");
}

function vArrayToSource(va){
var s="[";
var i;
for( i=0; i<va.length-1; i++) s=s+vToSource(va[i])+",";
if(va.length>0) s=s+vToSource(va[va.length-1]);
s=s+"]";
return s;
}


function cleanLineAttributes(lines)
{
var i=0;
for(i=0; i<lines.length; i++) 
  {
    lines[i].removeAttribute("x1");
    lines[i].removeAttribute("y1");
    lines[i].removeAttribute("x2");
    lines[i].removeAttribute("y2");
  }
}

*/

function redrawCursorAndFrame(){
var i=0;
if(isCursorVisible){
  makeCursorAndFrameSegments();
  project(redCursorLines, leftEye, screenZ, rotation, cursorSegments);
  project(blueCursorLines, rightEye, screenZ, rotation, cursorSegments);
  project(redFrameLines, leftEye, screenZ, rotation, frameSegments);
  project(blueFrameLines, rightEye, screenZ, rotation, frameSegments);
  if(linkMarker!=null) {
     project(redLinkMarkerLines, leftEye, screenZ, rotation, linkMarkerSegments);
     project(blueLinkMarkerLines, rightEye, screenZ, rotation, linkMarkerSegments);     
     }
  /*
  else{
     cleanLineAttributes(redLinkMarkerLines);
     cleanLineAttributes(blueLinkMarkerLines);
     }
   */
  }
/*
else{
    cleanLineAttributes(redFrameLines);
    cleanLineAttributes(redCursorLines);
    cleanLineAttributes(blueFrameLines);
    cleanLineAttributes(blueCursorLines);
    cleanLineAttributes(redLinkMarkerLines);
    cleanLineAttributes(blueLinkMarkerLines);
  }
if(isCursorVisible)
  cursorTxt.textContent=vToSource(cursorPosition);
else
 cursorTxt.textContent=""
*/
}


function redraw(){
redrawCursorAndFrame();

project(redSegmentsGroup.getElementsByTagName("line"), leftEye, screenZ, rotation, segments);
project(blueSegmentsGroup.getElementsByTagName("line"), rightEye, screenZ, rotation, segments);

var selected=new Array();
var i;
for(i=0; i<segments.length; i++) 
  if(segments[i].selected) selected.push(segments[i]);

project(redSelectedGroup.getElementsByTagName("line"), leftEye, screenZ, rotation, selected);
project(blueSelectedGroup.getElementsByTagName("line"), rightEye, screenZ, rotation, selected);


}

function project(lines, eye, screenZ, rotation, segments){
if(segments.length>lines.length)
  {
   addClonesToGroup(lines[0].parentNode, segments.length+10-lines.length);
   lines=lines[0].parentNode.getElementsByTagName("line");
  }
var i=0;
for(i=0; i<segments.length; i++){
   v1= zPerspective(eye, screenZ, mvMul(rotation, segments[i][0]));
   v2= zPerspective(eye, screenZ, mvMul(rotation, segments[i][1]));
   lines[i].setAttribute("x1", v1[0]);
   lines[i].setAttribute("y1", v1[1]);
   lines[i].setAttribute("x2", v2[0]);
   lines[i].setAttribute("y2", v2[1]);
   }

for(i=segments.length; i<lines.length; i++)
    cleanElementAttributes(lines[i]);

if(lines.length>segments.length+20)
  {
  var x1=lines[segments.length+10];
  var x2=lines[lines.length-1];
  while(x1!=x2){
    var s=x1.nextSibling;
    x1.parentNode.removeChild(x1);
    x1=s;
    }   
  }

}





function cleanElementAttributes(element){
while(element.hasAttributes())
  element.removeAttribute(element.attributes[0].name);
}

function addClonesToGroup(group, n) 
/* the group must be non-empty */
{
var revSeparators=new Array();
var  x=group.lastChild;
var y;
while(x.nodeType != document.ELEMENT_NODE)
  {
    y=x.previousSibling;
    revSeparators.push(x);
    x=y;
  } 
x=x.cloneNode(true);
cleanElementAttributes(x);

var i;
for(i=0; i<n; i++)
  {
   group.appendChild(x.cloneNode(true));
  var j;
  for(j=revSeparators.length-1; j>=0; j--)
      {
       group.appendChild(revSeparators[j].cloneNode(true));      
      }
  }
}


function dumpData(){
if(segments.length==0) segInsert(segments, newSeg([0,0,0],[0,0,0]) ); // have at least one dummy segment in XML data
if(segments.length>rblSegments.length)
  {
  addClonesToGroup(rblSegmentsData, segments.length+10-rblSegments.length);
  rblSegments=rblSegmentsData.getElementsByTagNameNS(rblNS, "seg");
  }
var i;
for(i=0; i<segments.length; i++) rblSegments[i].setAttribute("jsvalue", vArrayToSource(segments[i]) );
for(i=segments.length; i<rblSegments.length; i++) rblSegments[i].removeAttribute("jsvalue");
for(i=1; i<rblSegments.length;) 
  if( !rblSegments[i].hasAttribute("jsvalue") )
    {
     while(rblSegments[i].previousSibling.nodeType!=document.ELEMENT_NODE)
          rblSegmentsData.removeChild(rblSegments[i].previousSibling);
     rblSegmentsData.removeChild(rblSegments[i]); 
    }
    else i++;

rblSegments=rblSegmentsData.getElementsByTagNameNS(rblNS, "seg");

rblRoot.getElementsByTagNameNS(rblNS, "rotation")[0].setAttribute("jsvalue", vArrayToSource(rotation) );
segDelete(segments, newSeg([0,0,0],[0,0,0]) ); // remove dummy segment if exists
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
  x=invCTM.a*evt.clientX+invCTM.e;
  y=invCTM.d*evt.clientY+invCTM.f;
  mouseAction(x-lastX, y-lastY);
  lastX=x; lastY=y;
  }
}


function onMouseDown(evt){
  invCTM=scr.getCTM().inverse();
  x=invCTM.a*evt.clientX+invCTM.e;
  y=invCTM.d*evt.clientY+invCTM.f;
  var doubleClick= (lastX==x && lastY==y);
  lastX=x; lastY=y;

if(isCursorMoving){
  mouseAction=null;
  moveToMouse();
  if(doubleClick) linkingPlus();
  }
else if(mouseAction==null){
  mouseAction=mouseRotation;
  }
else {
  mouseAction=null;
  }
}



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
var v1= zPerspective(MONO_EYE, screenZ, mvMul(rotation,cursorPosition));
var next=vAdd(cursorPosition, vDelta);
var v2= zPerspective(MONO_EYE, screenZ, mvMul(rotation,next));
var dist1= sqLength2d(lastX-v1[0], lastY-v1[1]);
var dist2= sqLength2d(lastX-v2[0], lastY-v2[1]);
while(vLE([-frameSize,-frameSize,-frameSize],next) &&  vLE(next,[frameSize,frameSize,frameSize]) 
      && dist2<dist1 )
  {
  cursorPosition=next;
  v1=v2;
  dist1=dist2;
  next=vAdd(cursorPosition, vDelta);
  v2= zPerspective(MONO_EYE, screenZ, mvMul(rotation,next));
  dist2= sqLength2d(lastX-v2[0], lastY-v2[1]);
  }
}


function rotationReset(){
rotation=selectVersorsOnXYZ(rotation);
redraw();
}

function toggleMonoStereo(){
if(eyesMode=='mono') setEyesMode('stereo');
else setEyesMode('mono');
redraw();
}

function help()
{
// window.open('http://sites.google.com/site/redbluelines/','_blank');
alert(HELP_STRING);
}

function dump()
{
/*
dumpData();
rblSvg=document.getElementById("rblSvg");
var serializer= new XMLSerializer();
var string=serializer.serializeToString(rblSvg);

var w=window.open('','_blank');
// var w=window.open('','Dumped', 'width=400,height=400');

// var w=window.open('dumped RedBlueLines','');

var doc=w.document;
// var doc=document;  /// test only !!!!!!!!!
var lt='<';
doc.writeln('<html>');
doc.writeln('<head><title>Dumped RBL</title></head>');
doc.writeln('<body>');
doc.writeln('<h3> RedBlueLines dumped at: '+(new Date())+'</h3>');
doc.writeln('<p> Copy-paste the selected text from the textarea below to any text editor and save as a file with ".svg" extension </p>');
doc.writeln(lt+'textarea id="dumped" rows="40" cols="150">');
doc.writeln('<?xml version="1.0" standalone="no"?>');
doc.writeln('<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">');
doc.writeln(string);
doc.writeln(lt+'/textarea>');
doc.writeln('<body>');
doc.writeln('</html>');
doc.close();
var dumped=doc.getElementById("dumped");
dumped.select();
*/
}


function switchMode()
{
mouseAction=null;
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
    else rotation=mmMul(rotationXY(-Math.PI/24), rotation);
    redraw();
}


function forward()
{ 
    if(isCursorMoving) cursorMove(0,0,1);
    else rotation=mmMul(rotationXY(Math.PI/24), rotation);
    redraw();
}

function onKeyDown(e){

// isCursorMoving=true; // for tests

code=e.keyCode? e.keyCode : e.charCode;
switch(code)
{
case 38: // up
    if(isCursorMoving) cursorMove(0,1,0);
    else rotation=mmMul(rotationYZ(Math.PI/24), rotation);
    break;
case 40:
    if(isCursorMoving) cursorMove(0,-1,0);
    else rotation=mmMul(rotationYZ(-Math.PI/24), rotation);
    break;
case 37:
    if(isCursorMoving) cursorMove(-1,0,0);
    else rotation=mmMul(rotationXZ(-Math.PI/24), rotation);
    break;
case 39:
    if(isCursorMoving) cursorMove(1,0,0);
    else rotation=mmMul(rotationXZ(Math.PI/24), rotation);
    break;
case 70: // F
/*
    if(isCursorMoving) cursorMove(0,0,1);
    else rotation=mmMul(rotationXY(Math.PI/24), rotation);
*/
    forward();
    break;
case 66: // B
/*
    if(isCursorMoving) cursorMove(0,0,-1);
    else rotation=mmMul(rotationXY(-Math.PI/24), rotation);
*/
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
redraw();
// alert(code); // for tests
}
document.onkeydown=onKeyDown;


function onResize()
{
invCTM=scr.getCTM().inverse();
// alert('onResize  '+invCTM.toString()); //for tests
}

window.onresize=onResize;





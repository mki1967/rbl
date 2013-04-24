/*
   
    RedBlueLines - simple stereoscopic editor to be emeded in self-repicable SVG web pages
    Copyright (C) 2013  Marcin Kik mki1967@gmail.com

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

*/


/* global variables */

HELP_STRING="SHORT INSTRUCTIONS:\n \
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


/* references to SVG elements */

var scr=document.getElementById("screenId");

redCursorLines=document.getElementById("redCursor").getElementsByTagName("line");
redLinkMarkerLines=document.getElementById("redLinkMarker").getElementsByTagName("line");
redFrameLines=document.getElementById("redFrame").getElementsByTagName("line");
redSegmentsGroup=document.getElementById("redSegments");
redSelectedGroup=document.getElementById("redSelected");

blueCursorLines=document.getElementById("blueCursor").getElementsByTagName("line");
blueLinkMarkerLines=document.getElementById("blueLinkMarker").getElementsByTagName("line");
blueFrameLines=document.getElementById("blueFrame").getElementsByTagName("line");
blueSegmentsGroup=document.getElementById("blueSegments");
blueSelectedGroup=document.getElementById("blueSelected");

cursorTxt=document.getElementById("cursorTxt");
// alert(cursorTxt.textContent);

/* importing RBL data */

rblNS="RedBlueLines.mki1967";



function rblTagValues(node, tag)
{
var a=node.getElementsByTagNameNS(rblNS,tag);
if(a==null) return null;
var i;
var out=new Array();
for(i=0; i<a.length; i++)
   out[i]=eval(a[i].getAttribute("jsvalue"));
return out;
}

function setEyesMode(mode)
{
eyesMode=mode;
if(mode=='mono') leftEye=rightEye=MONO_EYE;
else // stereo 
  {
  leftEye=LEFT_EYE;
  rightEye=RIGHT_EYE;
  }
}

rblRoot= document.getElementsByTagNameNS(rblNS,"rbldata")[0];
rblSegmentsData=rblRoot.getElementsByTagNameNS(rblNS,"segments")[0]; // should be exactly one
rblSegments=rblSegmentsData.getElementsByTagNameNS(rblNS, "seg");
segments=rblTagValues(rblSegmentsData, "seg");
segDelete(segments, newSeg([0,0,0],[0,0,0]) ); // remove dummy segment

rotation= rblTagValues(rblRoot, "rotation")[0]; // should be exactly one

LEFT_EYE= rblTagValues(rblRoot, "lefteye")[0]; // should be exactly one
RIGHT_EYE= rblTagValues(rblRoot, "righteye")[0]; // should be exactly one
MONO_EYE= rblTagValues(rblRoot, "monoeye")[0]; // should be exactly one
eyesMode= rblTagValues(rblRoot, "eyesmode")[0]; // should be exactly one
setEyesMode(eyesMode);






/* vectors, segments, projections */

function vCmp(v1, v2) {
    x = v1[0] - v2[0];
    if (x != 0) {
        return x;
    }
    x = v1[1] - v2[1];
    if (x != 0) {
        return x;
    }
    x = v1[2] - v2[2];
    if (x != 0) {
        return x;
    }
    return 0;
}

function vLE(v1,v2)
{
return v1[0]<= v2[0] && v1[1]<= v2[1] && v1[2]<= v2[2];
}

function vAdd(v1,v2)
{
return [v1[0]+v2[0], v1[1]+v2[1], v1[2]+v2[2]];
}

function vMinus(v1,v2)
{
return [v1[0]-v2[0], v1[1]-v2[1], v1[2]-v2[2]];
}

function svMul(s,v)
{
return [s*v[0], s*v[1], s*v[2]];
}



function newSeg(v1, v2) {
    seg = [[v1[0], v1[1], v1[2]], [v2[0], v2[1], v2[2]]].sort(vCmp);
    return seg;
}

function segCmp(s1, s2) {
    d = vCmp(s1[0], s2[0]);
    if (d != 0) {
        return d;
    }
    d = vCmp(s1[1], s2[1]);
    if (d != 0) {
        return d;
    }
    return 0;
}

function segInsert(array, seg) { // array must exist (use 'new Array()')
    var i = 0;
    while (i < array.length && segCmp(array[i], seg) != 0) {
        i++;
    }
    if (i == array.length) {
        array[i] = seg;
    }
}

function segDelete(array, seg) {
    var i = 0;
    while (i < array.length && segCmp(array[i], seg) != 0) {
        i++;
    }
    if (i < array.length) {
        if (i < array.length - 1) {
            array[i] = array.pop();
        } else {
            array.pop();
        }
    }
}

function segFind(array, seg) {
    var i = 0;
    while (i < array.length && segCmp(array[i], seg) != 0) i++;
    if (i < array.length) return array[i];
    else return null;
}





function isIncidentSegVec(seg, v)
{
return vCmp(seg[0], v)==0 || vCmp(seg[1],v)==0;
}

function nearestEndpoint(segments, cursor)
{
var found=null; minSD=null;
var i;
for(i=0; i<segments.length; i++)
  for(j=0; j<2; j++)
  {
  var v=vMinus(segments[i][j], cursor);
  var sD=sp(v,v);
  if(minSD==null || sD<minSD){
     found=segments[i][j];
     minSD=sD;
     }
  }
return found;
}


function zPerspective(eye, screenZ, v){
  f=(screenZ-eye[2])/(v[2]-eye[2]);
  return [(v[0]-eye[0])*f+eye[0], (v[1]-eye[1])*f+eye[1]];
}

function sp(v1, v2){
return v1[0]*v2[0]+v1[1]*v2[1]+v1[2]*v2[2];
}

function mvMul(m, v){
return [sp(m[0],v), sp(m[1],v), sp(m[2],v)];
}

function mCol(m, i){
return [m[0][i], m[1][i], m[2][i]];
}

function mmMul(m1, m2){
return [ [sp(m1[0],mCol(m2,0)), sp(m1[0],mCol(m2,1)), sp(m1[0],mCol(m2,2))],
         [sp(m1[1],mCol(m2,0)), sp(m1[1],mCol(m2,1)), sp(m1[1],mCol(m2,2))],
         [sp(m1[2],mCol(m2,0)), sp(m1[2],mCol(m2,1)), sp(m1[2],mCol(m2,2))] ];
}




function sqLength2d(dx,dy)
{
return dx*dx+dy*dy;
}



function selectVersorsOnXYZ(rotation)
{
var v=[
        [1,0,0],
        [0,1,0],
        [0,0,1]
      ];

var w=new Array();

w[0]=mvMul(rotation, v[0]);
w[1]=mvMul(rotation, v[1]);
w[2]=mvMul(rotation, v[2]);

var d=new Array();

d[0]=sqLength2d(w[0][0],w[0][1]);
d[1]=sqLength2d(w[1][0],w[1][1]);
d[2]=sqLength2d(w[2][0],w[2][1]);

var ix, iy;

if(d[0]<d[1] && d[0]<d[2]){
     iz=0; 
     // {ix,iy} == {1,2}
     if(w[1][0]*w[1][0] > w[2][0]*w[2][0]){
          ix=1;
          iy=2;
          }
     else {
          ix=2;
          iy=1;
          }   
   }
else if(d[1]<d[2]) {
     iz=1; 
     // here: {ix,iy} == {0,2}
     if(w[0][0]*w[0][0] >= w[2][0]*w[2][0]){
          ix=0;
          iy=2;
          }
     else {
          ix=2;
          iy=0;
          }   
   }
else { 
     iz=2;
     // here: {ix,iy}={0,1}
     if(w[0][0]*w[0][0] >= w[1][0]*w[1][0]){
          ix=0;
          iy=1;
          }
     else {
          ix=1;
          iy=0;
          }   
   }

if(w[ix][0]<0) v[ix]= svMul(-1, v[ix]);
if(w[iy][1]<0) v[iy]= svMul(-1, v[iy]);
if(w[iz][2]<0) v[iz]= svMul(-1, v[iz]);

return [v[ix], v[iy], v[iz]]; // versors corresponding to screen's X and Y 
}


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






function rotationXY(alpha){
return [ [Math.cos(alpha), -Math.sin(alpha), 0],
         [Math.sin(alpha),  Math.cos(alpha), 0], 
         [0,               0,                1] ];
}
function rotationXZ(alpha){
return [ [Math.cos(alpha), 0, -Math.sin(alpha)],
         [0,               1,  0              ],
         [Math.sin(alpha), 0,  Math.cos(alpha)] ];
}
function rotationYZ(alpha){
return [ [1,                 0,                0],
         [0,   Math.cos(alpha), -Math.sin(alpha)],
         [0,   Math.sin(alpha),  Math.cos(alpha)] ];
}




/* updating XML and SVG document */


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
  else{
     cleanLineAttributes(redLinkMarkerLines);
     cleanLineAttributes(blueLinkMarkerLines);
     }
  }
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
doc.writeln('<p> Copy-paste the selected text from the textarea below to any text editor and save as a file with ".svg" extension. </p>');
doc.writeln('<p> Also download the script <a href="rbl.js" target="_blank">rbl.js</a> to the same directory. </p>');
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


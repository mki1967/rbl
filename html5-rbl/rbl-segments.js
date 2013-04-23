/*
   
    RedBlueLines segments  
    Copyright (C) 2011  Marcin Kik mki1967@gmail.com

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
    return x;
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





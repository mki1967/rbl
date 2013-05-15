function RblEyes()
{
this.LEFT_EYE=[-3.25,0.0,-60.0];
this.RIGHT_EYE=[3.25,0.0,-60.0];
this.MONO_EYE=[0.0,0.0,-60.0];

this.leftEye=this.MONO_EYE; ////
this.rightEye=this.MONO_EYE; ////
this.eyesMode='mono'
}

RblEyes.prototype.setMode= function(mode) // mode='mono' or mode='stereo'
{
this.eyesMode=mode;
if(mode=='mono') this.leftEye=this.rightEye=this.MONO_EYE;
else // stereo 
  {
  this.leftEye=this.LEFT_EYE;
  this.rightEye=this.RIGHT_EYE;
  }
}

RblEyes.prototype.getData= RblTemplate.prototype.getData;

/*
RblEyes.prototype.getData= function(eyesData)
{
for(field in eyesData) 
  if (typeof(this[field]) != 'function')  this[field]=eyesData[field];
  else alert(" "+field+" : "+eyesData[field]);
}
*/

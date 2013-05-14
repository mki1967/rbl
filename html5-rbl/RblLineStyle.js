/* Line style object */
function RblLineStyle( color1, width1 )
{
this.color=color1;
this.width=width1;
}

RblLineStyle.prototype.setOnCanvas= function( canvas )
{
canvas.context.lineWidth=this.width;
canvas.setColorAndMode(this.color, 'lighter');
}



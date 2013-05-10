<TeXmacs|1.0.7.14>

<style|generic>

<\body>
  <section|Pixel vs real screen coordinates>

  \;

  RblCanvas.prototype.rx = function (x)

  {

  return (x - this.minX) * this.cx;

  }

  \;

  \;

  RblCanvas.prototype.ry = function (y)

  {

  return (this.maxY - y) * this.cy;

  }

  \;

  <\equation*>
    x<rprime|'>=<around*|(|x-x<rsub|min>|)>\<cdot\>c<rsub|x>
  </equation*>

  iff

  <\equation*>
    x=x<rprime|'>/c<rsub|x>+x<rsub|min>
  </equation*>

  \;

  and

  <\equation*>
    y<rprime|'>=<around*|(|y<rsub|max>-y|)>\<cdot\>c<rsub|y>
  </equation*>

  iff

  <\equation*>
    y=y<rsub|max>-y<rprime|'>/c<rsub|y>
  </equation*>

  \;

  \;

  \;
</body>

<\references>
  <\collection>
    <associate|auto-1|<tuple|1|?>>
  </collection>
</references>
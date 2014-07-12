"use strict";

Intro._NUM_MOLECULES=20;
Intro._NUM_TRIANGLES=6;
function Intro()
{
	this._lastWidth=0;
	this._lastHeight=0;
	MyUtils.bindAll(this, "resize", "scroll", "tick");
	this.element=document.getElementById("intro");
	this._height=this.element.offsetHeight;
	this._spaceCrap=this.element.querySelector(".spaceCrap");
	this._isActive=false;
	this._scrollAmount=null;
	this._molecules=[];
	this._moleculeRender=new MyCanvas(this.element.querySelector("canvas"));
	this._moleculeBuffer=new MyCanvas(this.element.offsetWidth, this._height);
	this._web=new Web(this._moleculeBuffer, this._moleculeRender, "/img/intro/headline.png", "/img/intro/headline_outline.png");
	this._triangles=[];
	for(var i=0; i<Intro._NUM_TRIANGLES; i++)
	{
		this._triangles.push(new Triangle(this.element, true));
	}
	this.element.querySelector("button").addEventListener("click", Globals.scrollToOne);
}

Intro.prototype.resize=function()
{
	this._height=this.element.offsetHeight;
	if(this._height!=this._lastHeight || this._lastWidth!=this.element.offsetWidth)
	{
		this._lastWidth=this.element.offsetWidth;
		this._lastHeight=this._height;
		this._moleculeBuffer.width(this._lastWidth);
		this._moleculeBuffer.height(this._height);
		this._moleculeRender.width(this._lastWidth);
		this._moleculeRender.height(this._height);
		this._web.resize();
		this._molecules.length=0;
		for(var i=0; i<Intro._NUM_MOLECULES; i++)
		{
			var randScale=MyMath.random(0.3, 1.2);
			var radius=Molecule.getCanvasRadius(randScale);
			var molecule=new Molecule(MyMath.random(-350, 350, false, 2)+this._lastWidth/2, MyMath.random(-250, 250, false, 2)+this._height/2, randScale, Molecule.WHITE);
			this._molecules.push(molecule);
			if(this._isActive)
				molecule.activate();
		}
		for(i=0; i<Intro._NUM_TRIANGLES; i++)
		{
			var triangle=this._triangles[i];
			triangle.x=MyMath.random(this._lastWidth/2-450, this._lastWidth/2+450, false, 2);
			triangle.y=MyMath.random(this._height/2-175, this._height/2+175, false, 2);
		}
	}
}

Intro.prototype.scroll=function(num)
{
	if(num==Number.MAX_VALUE || num==1)
	{
		this._isActive=false;
		this._web.deactivate();
		for(var i=0; i<Intro._NUM_MOLECULES; i++)
		{
			this._molecules[i].deactivate();
		}
	}
	else
	{
		this._scrollAmount=num;
		if(!this._isActive)
		{
			this._isActive=true;
			this._web.activate();
			for(i=0; i<Intro._NUM_MOLECULES; i++)
			{
				this._molecules[i].activate();
			}
		}
	}
}

Intro.prototype.tick=function()
{
	for(var i=0; i<Intro._NUM_TRIANGLES; i++)
	{
		this._triangles[i].tick(this._scrollAmount);
	}
	var offset=Globals.depthOffset(0.1, this._scrollAmount);
	MyUtils.css(this._spaceCrap, {transform:"translate("+((this._lastWidth-1152)/2+offset.x)+"px,"+((this._height-668)/2+offset.y)+"px)"});

	this._moleculeBuffer.context.clearRect(0,0,this._lastWidth, this._height);
	this._moleculeRender.context.clearRect(0,0,this._lastWidth, this._height);
	this._web.tick();
	for(var i=0; i<Intro._NUM_MOLECULES; i++)
	{
		this._molecules[i].draw(this._moleculeBuffer, this._scrollAmount);
	}
	this._moleculeRender.context.drawImage(this._moleculeBuffer.canvas, 0, 0);
}
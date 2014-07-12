"use strict";

WatchIntro._NUM_TRIANGLES=3;
WatchIntro._NUM_MOLECULES=30;
function WatchIntro()
{
	MyUtils.bindAll(this, "resize", "scroll", "tick", "_randomFrame");
	this.element=document.getElementById("watchIntro");
	this._isActive=false;
	this._scrollAmount;
	this._height=this.element.offsetHeight;
	this._centered=this.element.querySelector(".centered");
	this._moleculeRender=new MyCanvas(this.element.querySelector("canvas"));
	this._moleculeBuffer=new MyCanvas(this.element.offsetWidth, this._height);
	var seq=this.element.querySelector("figure");
	var divs=seq.querySelectorAll("div");
	this._sequence=new MySuperSprite([new MySprite(divs[0], 2, 4), new MySprite(divs[1], 2, 4), new MySprite(divs[2], 2, 4)]);
	MyUtils.loadBigImages(seq);
	this._triangles=[];
	this._molecules=[];
	this._randomFrameTimeout=null;
	for(var i=0; i<WatchIntro._NUM_TRIANGLES; i++)
	{
		this._triangles.push(new Triangle(this._centered, false));
	}
}

WatchIntro.prototype.resize=function()
{
	if(!MyUtils.browser().phone)
	{
		this.element.style.height=Globals.winHeight+"px";
		this.element.style.marginTop=Globals.winHeight+"px";
	}
	this._height=this.element.offsetHeight;
	MyMath.cover(this.element.querySelector("figure"), this.element);
	this._sequence.resize();
	this._moleculeBuffer.width(Globals.winWidth);
	this._moleculeBuffer.height(this._height);
	this._moleculeRender.width(Globals.winWidth);
	this._moleculeRender.height(this._height);
	this._molecules.length=0;
	for(var i=0; i<WatchIntro._NUM_MOLECULES; i++)
	{
		var randScale=MyMath.random(0.3, 1.2);
		var radius=Molecule.getCanvasRadius(randScale);
		var molecule=new Molecule(MyMath.random(radius, Globals.winWidth-radius, false, 3), MyMath.random(radius, this._height-radius, false, 3), randScale, Molecule.WHITE);
		this._molecules.push(molecule);
		if(this._isActive)
			molecule.activate();
	}
	for(i=0; i<WatchIntro._NUM_TRIANGLES; i++)
	{
		if(i==0)
			this._triangles[i].setTo(Globals.winWidth/2-375, this._height/2+50)
		else if(i==1)
			this._triangles[i].setTo(Globals.winWidth/2+300, this._height/2-175)
		else
			this._triangles[i].setTo(Globals.winWidth/2+275, this._height/2+50)
	}
}

WatchIntro.prototype.scroll=function(num)
{
	if(num==Number.MAX_VALUE || num==0)
	{
		this._isActive=false;
		clearTimeout(this._randomFrameTimeout);
		for(var i=0; i<WatchIntro._NUM_MOLECULES; i++)
		{
			this._molecules[i].deactivate();
		}
	}
	else
	{
		this._scrollAmount=num*2-1;
		if(!this._isActive)
		{
			this._isActive=true;
			for(i=0; i<WatchIntro._NUM_MOLECULES; i++)
			{
				this._molecules[i].activate();
			}
			this._randomFrame();
		}
	}
}

WatchIntro.prototype._randomFrame=function()
{
	this._randomFrameTimeout=setTimeout(this._randomFrame, MyMath.random(17,500));
	this._sequence.progress(Math.random());
}

WatchIntro.prototype.tick=function()
{
	this._moleculeBuffer.context.clearRect(0,0,Globals.winWidth, this._height);
	this._moleculeRender.context.clearRect(0,0,Globals.winWidth, this._height);
	for(var i=0; i<WatchIntro._NUM_MOLECULES; i++)
	{
		this._molecules[i].draw(this._moleculeBuffer, this._scrollAmount);
	}
	this._moleculeRender.context.drawImage(this._moleculeBuffer.canvas, 0, 0);
	for(var i=0; i<WatchIntro._NUM_TRIANGLES; i++)
	{
		this._triangles[i].tick(this._scrollAmount);
	}
}
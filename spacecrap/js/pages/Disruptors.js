"use strict";

Disruptors._NUM_TRIANGLES=4;
Disruptors._NUM_MOLECULES=30;
function Disruptors()
{
	this._lastHeight=0;
	this._lastWidth=0;
	MyUtils.bindAll(this, "resize", "scroll", "tick");
	this.element=document.getElementById("disruptors");
	this._isActive=false;
	this._scrollAmount;
	this._moleculeRender=new MyCanvas(this.element.querySelector("canvas"));
	this._moleculeBuffer=new MyCanvas(this.element.offsetWidth, this.element.offsetHeight);
	this._triangles=[];
	this._molecules=[];
	for(var i=0; i<Disruptors._NUM_TRIANGLES; i++)
	{
		this._triangles.push(new Triangle(this.element, true));
	}
	if(!MyUtils.browser().mobile)
	{
		var lens=this.element.querySelector(".lens");
		var divs=lens.querySelectorAll("div");
		this._gif=new MySuperSprite([new MySprite(divs[0], 5, 25), new MySprite(divs[1], 5, 25)], 30);
		MyUtils.loadBigImages(lens);
		Globals.squareGallery1=new SquareGallery(this.element.querySelector(".squareGallery"));
	}
}

Disruptors.prototype.resize=function()
{
	var h=this.element.offsetHeight;
	if(h!=this._lastHeight || this._lastWidth!=Globals.winWidth)
	{
		this._lastWidth=Globals.winWidth;
		this._lastHeight=h;
		this._moleculeBuffer.width(Globals.winWidth);
		this._moleculeBuffer.height(h);
		this._moleculeRender.width(Globals.winWidth);
		this._moleculeRender.height(h);
		this._molecules.length=0;
		for(var i=0; i<Disruptors._NUM_MOLECULES; i++)
		{
			var randScale=MyMath.random(0.3, 0.95);
			var radius=Molecule.getCanvasRadius(randScale);
			var molecule=new Molecule(MyMath.random(0, Globals.winWidth), MyMath.random(h*0.1, h*0.99), randScale, Molecule.WHITE);
			this._molecules.push(molecule);
			if(this._isActive)
				molecule.activate();
		}
		for(i=0; i<Disruptors._NUM_TRIANGLES; i++)
		{
			if(i==0)
				this._triangles[i].setTo(Globals.winWidth/2+350, -100);
			else if(i==1)
				this._triangles[i].setTo(Globals.winWidth/2+250, 50);
			else if(i==2)
				this._triangles[i].setTo(Globals.winWidth/2-500, 400);
			else
				this._triangles[i].setTo(Globals.winWidth/2-100, 1100);
		}
	}
}

Disruptors.prototype.scroll=function(num)
{
	if(num==Number.MAX_VALUE)
	{
		this._isActive=false;
		if(!MyUtils.browser().mobile)
		{
			this._gif.stop();
			Globals.squareGallery1.deactivate();
		}
		for(var i=0; i<Disruptors._NUM_MOLECULES; i++)
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
			if(!MyUtils.browser().mobile)
			{
				this._gif.loop();
				Globals.squareGallery1.activate();
			}
			for(i=0; i<Disruptors._NUM_MOLECULES; i++)
			{
				this._molecules[i].activate();
			}
		}
	}
}

Disruptors.prototype.tick=function()
{
	this._moleculeBuffer.context.clearRect(0,0,this._moleculeBuffer.width(), this._moleculeBuffer.height());
	this._moleculeRender.context.clearRect(0,0,this._moleculeRender.width(), this._moleculeRender.height());
	for(var i=0; i<Disruptors._NUM_MOLECULES; i++)
	{
		this._molecules[i].draw(this._moleculeBuffer, this._scrollAmount);
	}
	this._moleculeRender.context.drawImage(this._moleculeBuffer.canvas, 0, 0);
	for(var i=0; i<Disruptors._NUM_TRIANGLES; i++)
	{
		this._triangles[i].tick(this._scrollAmount);
	}
}
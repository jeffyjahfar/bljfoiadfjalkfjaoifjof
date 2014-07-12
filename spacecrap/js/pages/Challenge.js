"use strict";

// Challenge._NUM_TRIANGLES=2;
// Challenge._NUM_MOLECULES=40;
Challenge._TIME_LAPSE_RATIO=540/960;
function Challenge()
{
	this._lastHeight=0;
	this._lastWidth=0;
	// MyUtils.bindAll(this, "resize", "scroll", "tick");
	MyUtils.bindAll(this, "resize", "scroll");
	this.element=document.getElementById("challenge");
	// this._isActive=false;
	this._scrollAmount;
	/*this._moleculeRender=new MyCanvas(this.element.querySelector("canvas"));
	this._moleculeBuffer=new MyCanvas(this.element.offsetWidth, this.element.offsetHeight);
	this._triangles=[];
	this._molecules=[];
	for(var i=0; i<Challenge._NUM_TRIANGLES; i++)
	{
		this._triangles.push(new Triangle(this.element, true));
	}*/
	if(!MyUtils.browser().mobile)
	{
		/*var rays=this.element.querySelector(".rays");
		var divs=rays.querySelectorAll("div");
		this._gif=new MySuperSprite([new MySprite(divs[0], 4, 28), new MySprite(divs[1], 4, 28), new MySprite(divs[2], 4, 32), new MySprite(divs[3], 4, 32)], 30);
		MyUtils.loadBigImages(rays);
		Globals.squareGallery2=new SquareGallery(this.element.querySelector(".squareGallery.a"));
		Globals.squareGallery3=new SquareGallery(this.element.querySelector(".squareGallery.b"));
		new Twitter(this.element.querySelector("div.twitter"));*/
		var timeLaps=this.element.querySelector(".timeLaps");
		var divs=timeLaps.querySelectorAll("div");
		this._timeLaps=new MySuperSprite([new MySprite(divs[0], 2, 4), new MySprite(divs[1], 2, 6), new MySprite(divs[2], 2, 6), new MySprite(divs[3], 2, 6), new MySprite(divs[4], 2, 6)]);
		MyUtils.loadBigImages(timeLaps);
	}
	else
	{
		MyUtils.loadBigImages(this.element.querySelector(".timeLaps div"));
	}
	this._timeStart=0;
	this._timeEnd=1;
}

Challenge.prototype.resize=function()
{
	var h=this.element.offsetHeight;
	if(h!=this._lastHeight || this._lastWidth!=Globals.winWidth)
	{
		this._lastWidth=Globals.winWidth;
		this._lastHeight=h;
		/*this._moleculeBuffer.width(Globals.winWidth);
		this._moleculeBuffer.height(h);
		this._moleculeRender.width(Globals.winWidth);
		this._moleculeRender.height(h);
		this._molecules.length=0;
		for(var i=0; i<Challenge._NUM_MOLECULES; i++)
		{
			var randScale=MyMath.random(0.2, 0.95);
			var radius=Molecule.getCanvasRadius(randScale);
			var molecule=new Molecule(MyMath.random(0, Globals.winWidth), MyMath.random(h*0.3, h*0.9), randScale, Molecule.WHITE);
			this._molecules.push(molecule);
			if(this._isActive)
				molecule.activate();
		}*/
		var timeH=Challenge._TIME_LAPSE_RATIO*Globals.winWidth;
		var e=this.element.querySelector(".timeLaps");
		e.style.height=timeH+"px";
		var th=this.element.offsetHeight+Globals.winHeight;
		if(!MyUtils.browser().mobile)
		{
			var eh=e.offsetHeight;
			var et=e.offsetTop;
			this._timeLaps.resize();
			this._timeStart=(et+eh/2)/th;
			this._timeEnd=(et+eh/2+Globals.winHeight)/th;
		}
		/*for(i=0; i<Challenge._NUM_TRIANGLES; i++)
		{
			if(i==0)
				this._triangles[i].setTo(Globals.winWidth/2+400, 500);
			else
				this._triangles[i].setTo(Globals.winWidth/2-100, 500);
		}*/
	}
}

Challenge.prototype.scroll=function(num)
{
	if(num==Number.MAX_VALUE)
	{
		/*this._isActive=false;
		if(!MyUtils.browser().mobile)
		{
			this._gif.stop();
			Globals.squareGallery2.deactivate();
			Globals.squareGallery3.deactivate();
		}
		for(var i=0; i<Challenge._NUM_MOLECULES; i++)
		{
			this._molecules[i].deactivate();
		}*/
	}
	else
	{
		this._scrollAmount=1-num;
		if(!MyUtils.browser().mobile)
			this._timeLaps.progress(Math.min(1,Math.max(0,MyMath.relativePercentage(this._timeStart, this._timeEnd, num))));
		/*if(!this._isActive)
		{
			this._isActive=true;
			if(!MyUtils.browser().mobile)
			{
				this._gif.loop();
				Globals.squareGallery2.activate();
				Globals.squareGallery3.activate();
			}
			for(i=0; i<Challenge._NUM_MOLECULES; i++)
			{
				this._molecules[i].activate();
			}
		}*/
	}
}

/*Challenge.prototype.tick=function()
{
	this._moleculeBuffer.context.clearRect(0,0,this._moleculeBuffer.width(), this._moleculeBuffer.height());
	this._moleculeRender.context.clearRect(0,0,this._moleculeRender.width(), this._moleculeRender.height());
	for(var i=0; i<Challenge._NUM_MOLECULES; i++)
	{
		this._molecules[i].draw(this._moleculeBuffer, this._scrollAmount);
	}
	this._moleculeRender.context.drawImage(this._moleculeBuffer.canvas, 0, 0);
	for(var i=0; i<Challenge._NUM_TRIANGLES; i++)
	{
		this._triangles[i].tick(this._scrollAmount);
	}
}*/
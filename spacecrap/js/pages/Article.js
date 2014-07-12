"use strict";

Article._NUM_TRIANGLES=2;
Article._NUM_MOLECULES=5;
Article._TRANS=0.5;
function Article()
{
	this._lastWidth=0;
	this._lastHeight=0;
	this._currentNum=null;
	MyUtils.bindAll(this, "resize", "scroll", "tick", "_onPrevClick", "_onNextClick");
	this.element=document.getElementById("article");
	this._isActive=false;
	this._scrollAmount;
	this._moleculeRender=new MyCanvas(this.element.querySelector("canvas"));
	this._moleculeBuffer=new MyCanvas(this.element.offsetWidth, this.element.offsetHeight);
	this._triangles=[];
	this._molecules=[];
	this._lis=this.element.querySelectorAll("li");
	this._total=this._lis.length;
	for(var i=0; i<Article._NUM_TRIANGLES; i++)
	{
		this._triangles.push(new Triangle(this.element, true));
	}
	if(this._total>1)
	{
		this.element.querySelector(".prev").addEventListener(Globals.CLICK_EVENT, this._onPrevClick);
		this.element.querySelector(".next").addEventListener(Globals.CLICK_EVENT, this._onNextClick);
		if(MyUtils.touch() && !MyUtils.browser().android)
		{
			var hammer=Hammer(this.element);
			hammer.on("swipeleft", this._onNextClick);
			hammer.on("swiperight", this._onPrevClick);
		}
	}
	else
	{
		MyUtils.addClass(this.element, "single");
	}
	this.currentNum(0);
}

Article.prototype.resize=function()
{
	var maxHeight=0;
	for(var i=0; i<this._total; i++)
	{
		maxHeight=Math.max(maxHeight, this._lis[i].offsetHeight);
	}
	if(this._lastWidth!=Globals.winWidth || this._lastHeight!=maxHeight)
	{
		this._lastWidth=Globals.winWidth;
		this._lastHeight=maxHeight;
		MyUtils.addClass(this.element, "resizing");
		this.element.style.height="";
		MyUtils.removeClass(this.element, "resizing");
		this.element.style.height=maxHeight+"px";
		var h=this.element.offsetHeight;
		this._moleculeBuffer.width(Globals.winWidth);
		this._moleculeBuffer.height(h);
		this._moleculeRender.width(Globals.winWidth);
		this._moleculeRender.height(h);
		this._molecules.length=0;
		for(var i=0; i<Article._NUM_MOLECULES; i++)
		{
			var randScale=MyMath.random(0.3, 0.75);
			var radius=Molecule.getCanvasRadius(randScale);
			var molecule=new Molecule(MyMath.random(0, Globals.winWidth), MyMath.random(h*0.25, h*0.75, false, 2), randScale, Molecule.WHITE);
			this._molecules.push(molecule);
			if(this._isActive)
				molecule.activate();
		}
		for(var i=0; i<Article._NUM_TRIANGLES; i++)
		{
			if(i==0)
				this._triangles[i].setTo(Globals.winWidth/2-Math.min(Globals.winWidth/2, 500), h/2-85);
			else
				this._triangles[i].setTo(Globals.winWidth/2+Math.min(Globals.winWidth/2, 500), h/2-35);
		}
	}
}

Article.prototype.scroll=function(num)
{
	if(num==Number.MAX_VALUE)
	{
		this._isActive=false;
		for(var i=0; i<Article._NUM_MOLECULES; i++)
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
			for(i=0; i<Article._NUM_MOLECULES; i++)
			{
				this._molecules[i].activate();
			}
		}
	}
}

Article.prototype.tick=function()
{
	this._moleculeBuffer.context.clearRect(0,0,this._moleculeBuffer.width(), this._moleculeBuffer.height());
	this._moleculeRender.context.clearRect(0,0,this._moleculeRender.width(), this._moleculeRender.height());
	for(var i=0; i<Article._NUM_MOLECULES; i++)
	{
		this._molecules[i].draw(this._moleculeBuffer, this._scrollAmount);
	}
	this._moleculeRender.context.drawImage(this._moleculeBuffer.canvas, 0, 0);
	for(var i=0; i<Article._NUM_TRIANGLES; i++)
	{
		this._triangles[i].tick(this._scrollAmount);
	}
}

Article.prototype.currentNum=function(num)
{
	if(typeof num=="number")
	{
		if(num!=this._currentNum)
		{
			var direction=num-this._currentNum;
			num=MyMath.modulo(num, this._total);
			var oldF=this._lis[this._currentNum];
			var newF=this._lis[num];
			if(oldF)
			{
				TweenLite.to(oldF, Article._TRANS, {left:-direction*100+"%", ease:Cubic.easeInOut, onComplete:MyUtils.css, onCompleteParams:[oldF, {display:""}]});
				TweenLite.fromTo(newF, Article._TRANS, {left:direction*100+"%"}, {left:"0%", ease:Cubic.easeInOut});
			}
			newF.style.display="table";
			this._currentNum=num;
		}
	}
	else
	{
		return this._currentNum;
	}
}

Article.prototype._onPrevClick=function()
{
	this.currentNum(this._currentNum-1);
}

Article.prototype._onNextClick=function()
{
	this.currentNum(this._currentNum+1);
}
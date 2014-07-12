"use strict";

SquareGallery._TRANS=0.5;
SquareGallery._FUCKED=30;
SquareGallery._PRELOAD=3;
SquareGallery._SIZE=320;
function SquareGallery(element)
{
	this._element=element;
	MyUtils.bindAll(this, "_onNextClick", "_onPrevClick", "_onDelay", "_onMouseMove", "_onTick", "_onMouseOver", "_onMouseOut");
	this._glitchNum=0;
	this._currentNum=null;
	this._timeout=null;
	this._glitches=[];
	this._transitioning=false;
	this._mousePos={x:0.5, y:0.5};
	this._mouseDest={x:0.5, y:0.5};
	this._lis=[];
}

SquareGallery.prototype.init=function()
{
	this._lis=this._element.querySelectorAll("li");
	this._total=this._lis.length;
	this._element.querySelector(".next").addEventListener(Globals.CLICK_EVENT, this._onNextClick);
	this._element.querySelector(".prev").addEventListener(Globals.CLICK_EVENT, this._onPrevClick);
	this._showNum(0);
	if(MyUtils.touch() && !MyUtils.browser().android)
	{
		var hammer=Hammer(this._element);
		hammer.on("swipeleft", this._onNextClick);
		hammer.on("swiperight", this._onPrevClick);
	}
}

SquareGallery.prototype._showNum=function(num)
{
	for(var i=num-SquareGallery._PRELOAD, iLen=num+SquareGallery._PRELOAD; i<=iLen; i++)
	{
		var modulo=MyMath.modulo(i, this._total);
		if(!this._glitches[modulo])
		{
			MyUtils.loadBigImages(this._lis[modulo]);
			this._glitches[modulo]=new Glitch(this._lis[modulo]);
		}
	}
	var dir=num>this._currentNum?1:-1;
	num=MyMath.modulo(num, this._total);
	var timeline=new TimelineLite({onComplete:this._transitionDone, onCompleteScope:this});
	this._transitioning=true;
	if(this._currentNum!=null)
	{
		MyUtils.removeClass(this._lis[this._currentNum], "done");
		timeline.append(TweenLite.to(this._glitches[this._currentNum], SquareGallery._TRANS, {fucked:SquareGallery._FUCKED, ease:Linear.easeIn, roundProps:"fucked"}));
		// timeline.append(TweenLite.to(this._lis[this._currentNum], SquareGallery._TRANS, {autoAlpha:0, ease:Linear.easeIn}));
	}
	timeline.call(this._hideShow, [num], this);
	timeline.append(TweenLite.fromTo(this._glitches[num], SquareGallery._TRANS, {fucked:SquareGallery._FUCKED}, {fucked:0, ease:Linear.easeOut, roundProps:"fucked"}));
	// timeline.append(TweenLite.fromTo(this._lis[num], SquareGallery._TRANS, {autoAlpha:0}, {autoAlpha:1, ease:Linear.easeOut}));
	timeline.call(MyUtils.addClass, [this._lis[num], "done"], this);
}

SquareGallery.prototype._hideShow=function(num)
{
	if(this._currentNum!=null)
		this._lis[this._currentNum].style.display=null;
	this._currentNum=num;
	this._lis[this._currentNum].style.display="block";
}

SquareGallery.prototype._transitionDone=function()
{
	this._transitioning=false;
}

SquareGallery.prototype._onPrevClick=function()
{
	this._showNum(this._currentNum-1);
}

SquareGallery.prototype._onNextClick=function()
{
	this._showNum(this._currentNum+1);
}

SquareGallery.prototype.activate=function()
{
	this._onDelay();
	if(!MyUtils.browser().mobile)
	{
		this._element.addEventListener("mousemove", this._onMouseMove);
		this._element.addEventListener("mouseover", this._onMouseOver);
		this._element.addEventListener("mouseout", this._onMouseOut);
	}
}

SquareGallery.prototype.deactivate=function()
{
	clearTimeout(this._timeout);
	this._timeout=null;
	if(!MyUtils.browser().mobile)
	{
		this._element.removeEventListener("mousemove", this._onMouseMove);
		this._element.removeEventListener("mouseover", this._onMouseOver);
		this._element.removeEventListener("mouseout", this._onMouseOut);
		TweenLite.ticker.removeEventListener("tick", this._onTick);
	}
}

SquareGallery.prototype._onDelay=function()
{
	if(this._glitchNum==0)
	{
		this._glitchNum=Math.random()*Globals.GLITCH_AMOUNT;
		this._timeout=setTimeout(this._onDelay, Math.random()*Globals.GLITCH_ON);
	}
	else
	{
		this._glitchNum=0;
		this._timeout=setTimeout(this._onDelay, Math.random()*Globals.GLITCH_OFF);
	}
	var glitch=this._glitches[this._currentNum];
	if(!this._transitioning && glitch)
		glitch.fucked(this._glitchNum);
}

SquareGallery.prototype._onMouseMove=function(evt)
{
	this._mouseDest=MyPoint.relativePosition(evt, this._element);
}

SquareGallery.prototype._onMouseOver=function(evt)
{
	TweenLite.ticker.addEventListener("tick", this._onTick);
}

SquareGallery.prototype._onMouseOut=function(evt)
{
	TweenLite.ticker.removeEventListener("tick", this._onTick);
}

SquareGallery.prototype._onTick=function()
{
	if(this._lis[this._currentNum])
	{
		MyMath.ease(this._mousePos, "x", this._mouseDest.x/SquareGallery._SIZE, 0.1);
		MyMath.ease(this._mousePos, "y", this._mouseDest.y/SquareGallery._SIZE, 0.1);
		this._lis[this._currentNum].style.backgroundPosition=this._mousePos.x*100+"% "+this._mousePos.y*100+"%";
	}
}
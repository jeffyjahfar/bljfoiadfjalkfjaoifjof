"use strict";
	
//////////////////////////////////////////////////
//author:Dane Hansen/////////////////////////////
//www.danehansen.com////////////////////////////
///////////////////////////////////////////////

	//requires greensock/TweenLite.js
	//requires greensock/plugins/RoundPropsPlugin.js
	//requires danehansen/MyUtils.js

function MySprite(elementOrList, numColumns, totalFrames, frameRate)
{
	// this._loop=false;
	this._frameRate=frameRate||60;
	this.elements=[];
	if(elementOrList[0])
	{
		for(var i=0, iLen=elementOrList.length; i<iLen; i++)
		{
			this.elements[i]=elementOrList[i];
		}
	}
	else
	{
		this.elements.push(elementOrList);
	}
	this._progress=0;
	this._currentFrame=0;
	this._destFrame=Number.MAX_VALUE;
	this._destProgress=Number.MAX_VALUE;
	
	this._numColumns=numColumns;
	this.totalFrames=totalFrames;
	this.resize();
}

MySprite.prototype._toFrames=function(num)
{
	return Math.min(this.totalFrames-1,Math.floor(num*this.totalFrames));
}

MySprite.prototype._toProgress=function(integer)
{
	return integer/(this.totalFrames-1);
}

MySprite.prototype.progress=function(num)
{
	if(typeof num=="number")
	{
		this._progress=num;
		var integer=this._toFrames(num);
		if(integer!=this._currentFrame)
		{
			this._currentFrame=integer;
			this._changeFrame();
		}
	}
	else
	{
		return this._progress;
	}
}

MySprite.prototype.currentFrame=function(integer)
{
	if(typeof integer=="number")
	{
		if(integer!=this._currentFrame)
		{
			this._currentFrame=integer;
			this._progress=this._toProgress(integer);
			this._changeFrame();
		}
	}
	else
	{
		return this._currentFrame;
	}
}

MySprite.prototype._changeFrame=function()
{
	var x=this._columnWidth*(this._currentFrame%this._numColumns);
	var y=this._rowHeight*Math.floor(this._currentFrame/this._numColumns);
	for(var i=0, iLen=this.elements.length; i<iLen; i++)
	{
		this.elements[i].style.backgroundPosition=-x+"px "+-y+"px";
	}
}

MySprite.prototype.frameTo=function(integer)
{
	if(this._currentFrame!=integer && this._destFrame!=integer)
	{
		this._destFrame=integer;
		// this._destProgress=this._toProgress(integer);
		var dur=Math.abs(integer-this._currentFrame)/this._frameRate;
		TweenLite.to(this, dur, {currentFrame:integer, ease:Linear.easeNone, roundProps:"currentFrame", onComplete:this._resetDest, onCompleteScope:this});
	}
}

MySprite.prototype.progressTo=function(num)
{
	if(this._progress!=num && this._destProgress!=num)
	{
		this._destProgress=num;
		// this._destFrame=this._toFrames(num);
		var dur=Math.abs(num-this._progress)*this.totalFrames/this._frameRate;
		TweenLite.to(this, dur, {progress:num, ease:Linear.easeNone, onComplete:this._resetDest, onCompleteScope:this});
	}
}

MySprite.prototype._resetDest=function()
{
	this._destProgress=Number.MAX_VALUE;
	this._destFrame=Number.MAX_VALUE;
	if(this._loop)
	{
		this._currentFrame=0;
		this.play();
	}
}

MySprite.prototype.play=function()
{
	if(this._loop)
		this._destFrame=Number.MAX_VALUE;
	this.frameTo(this.totalFrames-1);
}

MySprite.prototype.rewind=function()
{
	this.frameTo(0);
}

MySprite.prototype.resize=function()
{
	this._columnWidth=this.elements[0].offsetWidth || this.elements[0].parentNode.offsetWidth;
	this._rowHeight=this.elements[0].offsetHeight || this.elements[0].parentNode.offsetHeight;
}

MySprite.prototype.loop=function()
{
	this._loop=true;
	this.play();
}

MySprite.prototype.stop=function()
{
	this._loop=false;
	TweenLite.killTweensOf(this);
}
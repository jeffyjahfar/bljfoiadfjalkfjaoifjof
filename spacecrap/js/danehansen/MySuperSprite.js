"use strict";

function MySuperSprite(sprites, frameRate)
{
	this._frameRate=frameRate||60;
	this._progress=0;
	this._currentFrame=0;
	this._sprites=sprites;
	this._frameKey=[];
	this._destFrame=Number.MAX_VALUE;
	this._destProgress=Number.MAX_VALUE;
	this._currentSprite=null;
	for(var i=0, iLen=this._sprites.length; i<iLen; i++)
	{
		var sprite=sprites[i];
		if(i==0)
			this._show(sprite);
		else
			this._hide(sprite);
		for(var j=0; j<sprite.totalFrames; j++)
		{
			this._frameKey.push({sprite:i, frame:j});
		}
	}
	this.totalFrames=this._frameKey.length;
}

MySuperSprite.prototype.progress=function(num)
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

MySuperSprite.prototype.currentFrame=function(integer)
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

MySuperSprite.prototype._changeFrame=function()
{
	var info=this._frameKey[this._currentFrame];
	var sprite=this._sprites[info.sprite];
	if(sprite!=this._currentSprite)
		this._show(sprite, true);
	this._currentSprite.currentFrame(info.frame);
}

MySuperSprite.prototype._toFrames=function(num)
{
	return Math.min(this.totalFrames-1,Math.floor(num*this.totalFrames));
}

MySuperSprite.prototype._toProgress=function(integer)
{
	return integer/(this.totalFrames-1);
}

MySuperSprite.prototype.play=function()
{
	if(this._loop)
		this._destFrame=Number.MAX_VALUE;
	this.frameTo(this.totalFrames-1);
}

MySuperSprite.prototype.frameTo=function(integer)
{
	if(this._currentFrame!=integer && this._destFrame!=integer)
	{
		this._destFrame=integer;
		// this._destProgress=this._toProgress(integer);
		var dur=Math.abs(integer-this._currentFrame)/this._frameRate;
		TweenLite.to(this, dur, {currentFrame:integer, ease:Linear.easeNone, roundProps:"currentFrame", onComplete:this._resetDest, onCompleteScope:this});
	}
}

MySuperSprite.prototype._resetDest=function()
{
	this._destProgress=Number.MAX_VALUE;
	this._destFrame=Number.MAX_VALUE;
	if(this._loop)
	{
		this._currentFrame=0;
		this.play();
	}
}

MySuperSprite.prototype.resize=function()
{
	for(var i=0, iLen=this._sprites.length; i<iLen; i++)
	{
		this._sprites[i].resize();
	}
}

MySuperSprite.prototype.loop=function()
{
	this._loop=true;
	this.play();
}

MySuperSprite.prototype.stop=function()
{
	this._loop=false;
	TweenLite.killTweensOf(this);
}

MySuperSprite.prototype._show=function(sprite)
{
	if(this._currentSprite)
		this._hide(this._currentSprite);
	MyUtils.css(sprite.elements, {display:""});
	this._currentSprite=sprite;
}

MySuperSprite.prototype._hide=function(sprite)
{
	MyUtils.css(sprite.elements, {display:"none"});
}
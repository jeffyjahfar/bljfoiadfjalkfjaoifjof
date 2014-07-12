"use strict";

BigPhotoGallery._TRANS=0.5;
if(MyUtils.touch())
	BigPhotoGallery._hammer=Hammer(document.getElementById("modal"));
function BigPhotoGallery(element)
{
	MyUtils.loadBigImages(element);
	this._onPrevClick=this._onPrevClick.bind(this);
	this._onNextClick=this._onNextClick.bind(this);
	this._prev=element.querySelector(".prev");
	this._next=element.querySelector(".next");
	this._lis=element.querySelectorAll("li");
	MyUtils.css(this._lis, {display:"", left:0});
	this._total=this._lis.length;
	this._currentNum=null;
	this.currentNum(0);

	this._prev.addEventListener(Globals.CLICK_EVENT, this._onPrevClick);
	this._next.addEventListener(Globals.CLICK_EVENT, this._onNextClick);
	if(MyUtils.touch() && !MyUtils.browser().android)
	{
		BigPhotoGallery._hammer.on("swipeleft", this._onNextClick);
		BigPhotoGallery._hammer.on("swiperight", this._onPrevClick);
	}
}

BigPhotoGallery.prototype.destroy=function()
{
	this._prev.removeEventListener(Globals.CLICK_EVENT, this._onPrevClick);
	this._next.removeEventListener(Globals.CLICK_EVENT, this._onNextClick);
	if(MyUtils.touch() && !MyUtils.browser().android)
	{
		BigPhotoGallery._hammer.off("swipeleft", this._onNextClick);
		BigPhotoGallery._hammer.off("swiperight", this._onPrevClick);
	}
}

BigPhotoGallery.prototype._onPrevClick=function()
{
	this.currentNum(this._currentNum-1);
}

BigPhotoGallery.prototype._onNextClick=function()
{
	this.currentNum(this._currentNum+1);
}

BigPhotoGallery.prototype.currentNum=function(num)
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
			newF.style.display="block";
			this._currentNum=num;
		}
		else
		{

		}
	}
	else
	{
		return this._currentNum;
	}
}
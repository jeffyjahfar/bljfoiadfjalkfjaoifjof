"use strict";

Features._TRANS=0.5;
Features._PAGE_AMOUNT=4000;//297 to renable the next/prev square dots
function Features()
{
	this._lastWidth=0;
	MyUtils.bindAll(this, "resize", "_onPrevClick", "_onNextClick", "_onPagePrevClick", "_onPageNextClick", "_onDelay", "scroll");
	this._isActive=false;
	this._pageNum=0;
	this._totalPages=0;
	this._timeout=null;
	//this._glitches=[];
	//this._glitchNum=0;
	this._hammerFeatured=[];
	this._hammerAdditional=[];
	this.element=document.getElementById("features");
	this._features=this.element.querySelectorAll("#features > ul > li");
	this.total=this._features.length;

	this.youtubeAspectRatio = -1;
	this._fluidVideos = [];

	
	// for(var i=0; i<this.total; i++)
	// {
	// 	this._glitches.push(new Glitch(this._features[i].querySelector(".featured")));
	// }
	this._launchers=this.element.querySelectorAll(".launchers");
	this._pages=this.element.querySelectorAll(".page");
	this._featureNum=null;
	this._buttons=null;
	this._onPageClick=this._onPageClick.bind(this);
	if(this.total>1)
	{
		this.element.querySelector(".prev").addEventListener(Globals.CLICK_EVENT, this._onPrevClick);
		this.element.querySelector(".next").addEventListener(Globals.CLICK_EVENT, this._onNextClick);
	}
	else
	{
		MyUtils.addClass(this.element, "single");
	}
	this.featureNum(0);


}

Features.prototype.addYoutubeVideos = function() {
	
	for(var i = 0; i < this._features.length; i++){
		var parent = this._features[i].querySelector(".featured");
		var height = 670;//parent.offsetHeight;
		//console.log("Features:" + height);
		var width = window.innerWidth;
		if (width > 1191) {width=1191};
		if (this._features[i].querySelector(".featured > .youtube")) {
			var wrap = document.createElement("div");
			wrap.className = 'fluids-vids';
			wrap.style.width = width + "px";
			wrap.style.height = height + "px";
			wrap.style.position = 'relative';
			parent.appendChild(wrap);
			var feature = this._features[i].querySelector(".featured > .youtube");
			wrap.appendChild(feature);
			var yt_id = feature.getAttribute("data-youtube-id");
			if (yt_id) {
					this.youtubeAspectRatio = (height/width);//hack for fluid video adjustments later
					var youtube=new YT.Player(feature, { videoId:yt_id, events:{},playerVars: { 'playsinline':'1', 'showinfo':'0', 'autohide':'1' }});
					this._fluidVideos.push(wrap);
			};
		};


	}

};

Features.prototype.resize=function()
{
	if(this._lastWidth!=Globals.winWidth)
	{
		this._lastWidth=Globals.winWidth;
		var page=this._pages[this._featureNum];
		this._totalPages=Math.round(this._launchers[this._featureNum].offsetHeight/Features._PAGE_AMOUNT);
		if(this._totalPages==1)
			this._totalPages=0;
		if(this._totalPages!=page.childNodes.length)
		{
			while(page.childNodes.length>this._totalPages)
			{
				var button=page.firstChild;
				button.removeEventListener("click", this._onPageClick);
				page.removeChild(button)
			}
			while(page.childNodes.length<this._totalPages)
			{
				button=document.createElement("button");
				button.addEventListener("click", this._onPageClick);
				page.appendChild(button);
			}
			this._buttons=page.childNodes;
			this.pageNum(0);
		}

		this.resizeVideos();
	}
}

Features.prototype.resizeVideos=function(){
	if (this.youtubeAspectRatio != -1 ) {
		for (var i = 0; i < this._fluidVideos.length; i++) {
			var width = window.innerWidth;
			if (width > 1191) {width=1191};
			var video_wrap = this._fluidVideos[i];
			video_wrap.style.width = width + "px";

			video_wrap.style.height = (width*this.youtubeAspectRatio) + "px";

			if (width<641) {
				video_wrap.style.margin = "0 0";
			}else{
				video_wrap.style.margin = "0 auto";
			};
		};
	};
}


Features.prototype.featureNum=function(num)
{
	if(typeof num=="number")
	{
		if(num!=this._featureNum)
		{
			var direction=num-this._featureNum;
			num=MyMath.modulo(num, this.total);
			var oldF=this._features[this._featureNum];
			var newF=this._features[num];
			if(oldF)
			{
				if(this._hammerFeatured[this._featureNum])
				{
					this._hammerFeatured[this._featureNum].off("swiperight", this._onPrevClick);
					this._hammerFeatured[this._featureNum].off("swipeleft", this._onNextClick);
				}
				if(this._hammerAdditional[this._featureNum])
				{
					this._hammerAdditional[this._featureNum].off("swiperight", this._onPagePrevClick);
					this._hammerAdditional[this._featureNum].off("swipeleft", this._onPageNextClick);
				}
				TweenLite.to(oldF, Features._TRANS, {left:-direction*100+"%", ease:Cubic.easeInOut, onComplete:MyUtils.css, onCompleteParams:[oldF, {display:""}]});
				TweenLite.fromTo(newF, Features._TRANS, {left:direction*100+"%"}, {left:"0%", ease:Cubic.easeInOut});
			}
			newF.style.display="block";
			this._featureNum=num;
			this.resize();
			if(MyUtils.touch() && !MyUtils.browser().android)
			{
				if(!this._hammerFeatured[num])
					this._hammerFeatured[num]=Hammer(newF.querySelector(".featured"));
				this._hammerFeatured[num].on("swipeleft", this._onNextClick);
				this._hammerFeatured[num].on("swiperight", this._onPrevClick);
				if(this._totalPages>0)
				{
					if(!this._hammerAdditional[num])
						this._hammerAdditional[num]=Hammer(newF.querySelector(".additional"));
					this._hammerAdditional[num].on("swipeleft", this._onPageNextClick);
					this._hammerAdditional[num].on("swiperight", this._onPagePrevClick);
				}
			}
		}
	}
	else
	{
		return this._featureNum;
	}
}

Features.prototype._onPrevClick=function()
{
	this.featureNum(this._featureNum-1);
}

Features.prototype._onNextClick=function()
{
	this.featureNum(this._featureNum+1);
}

Features.prototype._onPageClick=function(evt)
{
	var num=MyUtils.indexOf(this._buttons, evt.currentTarget);
	if(num==-1)
		this._buttons=this._pages[this._featureNum].childNodes;
	num=MyUtils.indexOf(this._buttons, evt.currentTarget);
	this.pageNum(num);
}

Features.prototype.pageNum=function(num)
{
	this._pageNum=num;
	MyUtils.removeClass(this._buttons, "selected");
	TweenLite.to(this._launchers[this._featureNum], Features._TRANS, {top:-Features._PAGE_AMOUNT*num, ease:Cubic.easeInOut});
	if(this._buttons[num])
		this._buttons[num].className="selected";
}

Features.prototype._onPagePrevClick=function()
{
	this.pageNum(MyMath.modulo(this._pageNum-1, this._totalPages));
}

Features.prototype._onPageNextClick=function()
{
	this.pageNum((this._pageNum+1)%this._totalPages);
}

Features.prototype.scroll=function(num)
{
	if(num==Number.MAX_VALUE || num==0)
	{
		this._isActive=false;
		clearTimeout(this._timeout);
		this._timeout=null;
	}
	else
	{
		if(!this._isActive)
		{
			this._isActive=true;
			this._onDelay();
		}
	}
}

Features.prototype._onDelay=function()
{
	// if(this._glitchNum==0)
	// {
	// 	this._glitchNum=Math.random()*Globals.GLITCH_AMOUNT;
	// 	this._timeout=setTimeout(this._onDelay, Math.random()*Globals.GLITCH_ON);
	// }
	// else
	// {
	// 	this._glitchNum=0;
	// 	this._timeout=setTimeout(this._onDelay, Math.random()*Globals.GLITCH_OFF);
	// }
	// this._glitches[this._featureNum].fucked(this._glitchNum);
}
"use strict";

Glitch._canvas=new MyCanvas(100,100);
Glitch._REGEX=/url\(['"]?([^\)'"']+)['"]?\)/;
function Glitch(element)
{
	this._isImg=element.nodeName.toUpperCase()=="IMG";
	if(!this._isImg)
	{
		var bgImg=MyUtils.getStyle(element, "backgroundImage");
		this._hasBG=/url\(/.test(bgImg);
	}
	if(this._isImg || this._hasBG)
	{
		this._offscreen=new Image();
		if(this._isImg)
			this._offscreen.setAttribute("src", element.getAttribute("src"));
		else
			this._offscreen.setAttribute("src", Glitch._REGEX.exec(bgImg)[1]);
		this._fucked=0;
		MyUtils.bindAll(this, "_onLoaded", "_onError", "_onLoad");
		this._element=element;
		if(!this._offscreen.width>0)
			this._offscreen.addEventListener("load", this._onLoaded);
		else
			setTimeout(this._onLoaded, 10);
	}
}

Glitch.prototype._onLoaded=function(evt)
{
	if(evt)
		this._offscreen.removeEventListener("load", this._onLoaded);
	var w=this._offscreen.width;
	var h=this._offscreen.height;
	Glitch._canvas.width(w);
	Glitch._canvas.height(h);
	Glitch._canvas.context.drawImage(this._offscreen, 0, 0);
	try
	{
		var regex=/(data:image\/[\S]+;base64,)([\S]+)/.exec(Glitch._canvas.canvas.toDataURL('image/jpeg'));
		this._prefix=regex[1];
		this._decoded=atob(regex[2]);
		if(this._toFuck)
			this.fucked(this._toFuck);
	}
	catch(err)
	{
		//tainted canvas
	}
}

Glitch.prototype.fucked=function(num)
{
	if(typeof num=="number")
	{
		if(this._decoded)
		{
			this._fucked=num;
			this._offscreen.addEventListener("load", this._onLoad);
			this._offscreen.addEventListener("error", this._onError);
			this._offscreen.setAttribute("src", this._prefix+btoa(this._randomizeCharacter(this._decoded)));
		}
		else
		{
			this._toFuck=num;
		}
	}
	else
	{
		return this._fucked;
	}
}

Glitch.prototype._onError=function()
{
	this._offscreen.setAttribute("src", this._prefix+btoa(this._randomizeCharacter(this._decoded)));
}

Glitch.prototype._onLoad=function(evt)
{
	evt.target.removeEventListener("load", this._onLoad);
	evt.target.removeEventListener("error", this._onError);
	if(this._isImg)
		this._element.src=evt.target.src;
	else
		this._element.style.backgroundImage="url("+evt.target.src+")";
}

Glitch.prototype._randomizeCharacter=function(data)
{
	for(var i=0; i<this._fucked; i++)
	{
		var randomIndex=MyMath.random(0, data.length-1, true);
		data=data.substring(0, randomIndex)+String.fromCharCode(MyMath.random(0,255,true))+data.substring(randomIndex+1);
	}
	return data;
}
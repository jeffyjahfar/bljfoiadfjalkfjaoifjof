"use strict";

function BGButton(element)
{
	MyUtils.bindAll(this, "_onMouseOver", "_onMouseOut");
	this._glitch=new Glitch(element);
	this._id=element.getAttribute("data-modal-id");
	this._youtubeId=element.getAttribute("data-youtube-id");
	element.addEventListener("mouseover", this._onMouseOver);
	element.addEventListener("mouseout", this._onMouseOut);
}

BGButton.prototype._onMouseOver=function(evt)
{
	this._glitch.fucked(Math.random()*Globals.GLITCH_AMOUNT);
}

BGButton.prototype._onMouseOut=function(evt)
{
	this._glitch.fucked(0);
}

BGButton.init=function()
{
	var buttons=document.querySelectorAll(".bgButton");
	for(var i=0, iLen=buttons.length; i<iLen; i++)
	{
		new BGButton(buttons[i]);
	}
}
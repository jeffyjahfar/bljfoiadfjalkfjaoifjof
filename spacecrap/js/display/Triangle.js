"use strict";

Triangle._solid=Math.random()<0.5;
Triangle._RADIUS=50;
function Triangle(parent, constrain)
{
	this._constrain=constrain;
	this.x=0;
	this.y=0;
	this.element=document.createElementNS(Globals.SVG_NAMESPACE, "svg");
	this._scale=MyMath.random(1.1, 1.3);
	this.element.setAttribute("class", "triangle");
	var polygon=document.createElementNS(Globals.SVG_NAMESPACE, "polygon");
	var points=Triangle._randomTriangle();
	Triangle._zero(points);
	Triangle._scaleToArea(points, this._scale*200, this.element);
	var str="";
	for(var i=0; i<3; i++)
	{
		var point=points[i];
		str+=point.x+","+point.y;
		if(i<2)
			str+=" ";
		points.push(Triangle._randomPoint());
	}
	polygon.setAttribute("points", str);
	Triangle._solid=!Triangle._solid;
	polygon.setAttribute("class", Triangle._solid?"solid":"outline");
	this.element.appendChild(polygon);
	this._center=Triangle._findCenter(points);
	parent.appendChild(this.element);
	this._xSpeed=Triangle._randomSpeed();
	this._ySpeed=Triangle._randomSpeed();
	this._zSpeed=Triangle._randomSpeed();
	this._xRotation=MyMath.random(0, Math.PI*2);
	this._yRotation=MyMath.random(0, Math.PI*2);
	this._zRotation=MyMath.random(0, Math.PI*2);
}

Triangle.prototype.tick=function(scroll)
{
	this._xRotation+=this._xSpeed;
	this._yRotation+=this._ySpeed;
	this._zRotation+=this._zSpeed;
	var offset=Globals.depthOffset(this._scale, scroll);
	MyUtils.css(this.element, {transformOrigin:this.x+offset.x+this._center.x+"px "+(this.y+offset.y+this._center.y)+"px 0", transform:"rotateX("+this._xRotation+"rad) rotateY("+this._yRotation+"rad) rotateZ("+this._zRotation+"rad) translate("+(this.x+offset.x)+"px,"+(this.y+offset.y)+"px)"});
}

Triangle.prototype.setTo=function(left, top)
{
	var style=this.element.style;
	if(this._constrain)
		style.left=Math.min(Math.max(Triangle._RADIUS,left), Globals.winWidth-Triangle._RADIUS)+"px";
	else
		style.left=left+"px";
	style.top=top+"px";
}

Triangle._randomTriangle=function()
{
	var points=[];
	do
	{
		for(var i=0; i<3; i++)
		{
			points[i]=Triangle._randomPoint();
		}
	}
	while(Triangle._findArea(points)<0.03)
	return points;
}

Triangle._randomPoint=function()
{
	return {x:Math.random(), y:Math.random()};
}

Triangle._zero=function(points)
{
	var lowestX=Number.MAX_VALUE;
	var lowestY=Number.MAX_VALUE;
	for(var i=0; i<3; i++)
	{
		var point=points[i];
		lowestX=Math.min(point.x, lowestX);
		lowestY=Math.min(point.y, lowestY);
	}
	for(i=0; i<3; i++)
	{
		point=points[i];
		point.x-=lowestX;
		point.y-=lowestY;
	}
}

Triangle._scaleToArea=function(points, destArea, element)
{
	var currentArea=Triangle._findArea(points);
	var ratio=Math.sqrt(destArea/currentArea);
	var highestX=0;
	var highestY=0;
	for(var i=0; i<3; i++)
	{
		var point=points[i];
		point.x*=ratio;
		point.y*=ratio;
		highestX=Math.max(point.x, highestX);
		highestY=Math.max(point.y, highestY);
	}
	element.setAttribute("width", highestX);
	element.setAttribute("height", highestY);
}

Triangle._findArea=function(points)
{
	var a=points[0];
	var b=points[1];
	var c=points[2];
	return Math.abs((a.x*(b.y-c.y)+b.x*(c.y-a.y)+c.x*(a.y-b.y))/2);
}

Triangle._findCenter=function(points)
{
	var center={x:0, y:0};
	for(var i=0; i<3; i++)
	{
		var point=points[i];
		center.x+=point.x;
		center.y+=point.y;
	}
	center.x/=3;
	center.y/=3;
	return center;
}

Triangle._randomSpeed=function()
{
	return MyMath.random(-0.025, 0.025);
}
"use strict";
	
//////////////////////////////////////////////////
//author:Dane Hansen/////////////////////////////
//www.danehansen.com////////////////////////////
///////////////////////////////////////////////

function MyPoint(x, y)
{
	this.x=x||0; 
	this.y=y||0; 
}

MyPoint.prototype.add=function(point)
{
	this.x+=point.x;
	this.y+=point.y;
}

MyPoint.prototype.angle=function()
{
	return Math.atan2(this.y, this.x);
	return Math.atan2(this.y, this.x);
}

MyPoint.prototype.clone=function()
{
	return new MyPoint(this.x, this.y);
}

MyPoint.prototype.copyFrom=function(point)
{
	this.x=point.x;
	this.y=point.y;
}

MyPoint.distance=function(point1, point2)
{
	return Math.sqrt(Math.pow(point1.x-point2.x,2)+Math.pow(point1.y-point2.y,2));
}

MyPoint.prototype.equals=function(point)
{
	return this.x==point.x && this.y==point.y;
}

MyPoint.interpolate=function(point1, point2, amount)
{
	return new MyPoint(point1.x+(point2.x-point1.x)*amount, point1.y+(point2.y-point1.y)*amount);
}

MyPoint.intersection=function(aStart, aEnd, bStart, bEnd)
{
	var x1=aStart.x;
	var y1=aStart.y;
	var x2=aEnd.x;
	var y2=aEnd.y;
	var x3=bStart.x;
	var y3=bStart.y;
	var x4=bEnd.x;
	var y4=bEnd.y;
	var a=x1-x2;
	var b=y3-y4;
	var c=y1-y2;
	var d=x3-x4;
	var e=a*b-c*d;
	if(e==0)
		return null;
	var f=x1*y2-y1*x2;
	var g=x3*y4-y3*x4;
	return new MyPoint((f*d-a*g)/e, (f*b-c*g)/e);
}

MyPoint.prototype.length=function()
{
	return MyPoint.distance(this, new MyPoint());
}

MyPoint.prototype.normalize=function(thickness)
{
	var ratio=thickness/this.length();
	this.x*=ratio;
	this.y*=ratio;
}

MyPoint.prototype.offset=function(x, y)
{
	this.x+=x;
	this.y+=y;
}

MyPoint.polar=function(len, angle)
{
	return new MyPoint(Math.cos(angle)*len, Math.sin(angle)*len);
}

MyPoint.relativePosition=function(evt, relativeTo)
{
	relativeTo=relativeTo?relativeTo:evt.currentTarget;
	return new MyPoint(evt.clientX-relativeTo.getBoundingClientRect().left, evt.clientY-relativeTo.getBoundingClientRect().top);
}

MyPoint.prototype.setTo=function(x, y)
{
	this.x=x;
	this.y=y;
}

MyPoint.prototype.subtract=function(point)
{
	this.x-=point.x;
	this.y-=point.y;
}

MyPoint.prototype.toString=function()
{
	return "(x="+this.x+", y="+this.y+")";
}
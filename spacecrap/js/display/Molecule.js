"use strict";

Molecule.WHITE="rgba(255,255,255,0.4)";
Molecule._ATOM_DIAMETER=5;
Molecule._MOLECULE_DIAMETER=50;
Molecule._STROKE_WIDTH=0.5;
Molecule._WANDER=20;
Molecule._WANDER_SPEED=2;
function Molecule(x, y, scale, color)
{
	this._scroll;
	this._scale=scale;
	this._atomRadius=Molecule._ATOM_DIAMETER/2*this._scale;
	this._canvasRadius=Molecule.getCanvasRadius(this._scale);
	this._center={x:x, y:y};
	this._canvasCenter={x:this._canvasRadius, y:this._canvasRadius};
	this._color=color;
	this._atoms=[];
	this._wander=this._scale*Molecule._WANDER;
	this._canvas=new MyCanvas(this._canvasRadius*2, this._canvasRadius*2);
	this._lineWidth=Molecule._STROKE_WIDTH*this._scale;
	this._pairs=[];
	var pairs={};
	var rand=MyMath.random(2,9,true);
	for(var i=0; i<rand; i++)
	{
		do
		{
			var point={x:MyMath.random(this._atomRadius+this._wander, this._canvasRadius*2-this._atomRadius-this._wander), y:MyMath.random(this._atomRadius+this._wander, this._canvasRadius*2-this._atomRadius-this._wander)};
		}
		while(!this._checkPointValidity(point))
		point.rotation=MyMath.random(0,Math.PI*2);
		point.distance=Math.random();
		point.drawX=0;
		point.drawY=0;
		this._atoms.push(point);
	}
	for(i=0; i<rand; i++)
	{
		Molecule._currentPoint=this._atoms[i];
		var atoms=this._atoms.slice(0);
		atoms.splice(atoms.indexOf(Molecule._currentPoint), 1);
		atoms.sort(Molecule.sortDist);
		var neighbors=Math.min(atoms.length, Math.random()<0.5?2:1);
		for(var j=0; j<neighbors; j++)
		{
			var key=Molecule._getKey(Molecule._currentPoint, atoms[j]);
			if(!pairs[key])
			{
				var pair={start:Molecule._currentPoint, end:atoms[j]};
				pairs[key]=pair;
				this._pairs.push(pair);
			}
		}
	}
}

Molecule.prototype.activate=function()
{
	for(var i=0, iLen=this._atoms.length; i<iLen; i++)
	{
		Molecule._tweenRotation(this._atoms[i]);
		Molecule._tweenDistance(this._atoms[i]);
	}
}

Molecule.prototype.deactivate=function()
{
	for(var i=0, iLen=this._atoms.length; i<iLen; i++)
	{
		TweenLite.killTweensOf(this._atoms[i]);
	}
}

Molecule.prototype.draw=function(canvas, scroll)
{
	var offset=Globals.depthOffset(this._scale, scroll);
	var offsetX=this._center.x-this._canvasRadius+offset.x;
	var offsetY=this._center.y-this._canvasRadius+offset.y;
	canvas.context.lineWidth=this._lineWidth;
	canvas.context.strokeStyle=this._color;
	canvas.context.fillStyle=this._color;
	for(var i=0, iLen=this._atoms.length; i<iLen; i++)
	{
		var atom=this._atoms[i];
		atom.drawX=atom.x+Math.cos(atom.rotation)*atom.distance*this._wander;
		atom.drawY=atom.y+Math.sin(atom.rotation)*atom.distance*this._wander;
		canvas.context.beginPath();
		canvas.context.arc(atom.drawX+offsetX, atom.drawY+offsetY, this._atomRadius, 0, Math.PI*2);
		canvas.context.fill();
	}
	for(i=0, iLen=this._pairs.length; i<iLen; i++)
	{
		canvas.context.beginPath();
		canvas.context.moveTo(this._pairs[i].start.drawX+offsetX, this._pairs[i].start.drawY+offsetY);
		canvas.context.lineTo(this._pairs[i].end.drawX+offsetX, this._pairs[i].end.drawY+offsetY);
		canvas.context.stroke();
	}
}

Molecule.prototype._checkPointValidity=function(point)
{
	return MyPoint.distance(this._canvasCenter, point)<=this._canvasRadius;
}

Molecule._getKey=function(pointA, pointB)
{
	var x=(pointA.x+pointB.x)/2;
	var y=(pointA.y+pointB.y)/2;
	return x+","+y;
}

Molecule._currentPoint;
Molecule.sortDist=function(a, b)
{
	return MyPoint.distance(Molecule._currentPoint, a)-MyPoint.distance(Molecule._currentPoint, b);
}

Molecule.getCanvasRadius=function(scale)
{
	return Math.ceil((Molecule._MOLECULE_DIAMETER/2+Molecule._WANDER)*scale);
}

Molecule._tweenRotation=function(atom)
{
	var dest=MyMath.random(atom.rotation-Math.PI, atom.rotation+Math.PI);
	TweenLite.to(atom, Math.abs(atom.rotation-dest)*Molecule._WANDER_SPEED, {rotation:dest, ease:Sine.easeInOut, onComplete:Molecule._tweenRotation, onCompleteParams:[atom]});
}

Molecule._tweenDistance=function(atom)
{
	var dest=Math.random();
	TweenLite.to(atom, Math.abs(atom.distance-dest)*Molecule._WANDER_SPEED, {distance:dest, ease:Sine.easeInOut, onComplete:Molecule._tweenDistance, onCompleteParams:[atom]});
}
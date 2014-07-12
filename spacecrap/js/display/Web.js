//credit to Capitol Couture as a starting point for this code
"use strict";

Web._PADDING=300;
Web._REPULSION_MIN=80;
Web._REPULSION_MAX=90;
Web._POINT_EASE=0.2;
Web._THRES_BETWEEN_STATIC_POINTS=60;
Web._DENSITY_OF_STATIC_POINTS=0.05;
Web._THRES_BETWEEN_FLYING_POINTS=140;
Web._DENSITY_OF_FLYING_POINTS=0.000002;
Web._MASK_RADIUS=120;
Web._MASK_SIDES=7;
function Web(buffer, render, filledTextURL, outlineTextURL)
{
	this._scale=render.canvas.offsetWidth<=640?0.9:1;
	this._offsetX=0;
	this._offsetY=0;
	this._particles = [];
	this._affectedParticles = [];
	this._mousePos={x:0,y:0};
	this._targetPos={x:0,y:0};
	this._img=new Image();
	this._outlineImg=new Image();
	this._outlineText;
	this._lines=null;
	this._imgsLoaded=0;
	this._maskAngles=[];
	this._maskDistances=[];
	this._maskPoints=[];
	var angle=Math.PI*2/Web._MASK_SIDES;
	for(var i=0; i<Web._MASK_SIDES; i++)
	{
		this._maskPoints.push({});
		this._maskAngles.push(MyMath.random(i*angle, i+1*angle, false, 2));
		this._maskDistances.push(MyMath.random(Web._MASK_RADIUS-30, Web._MASK_RADIUS+30, false, 2));
	}
	MyUtils.bindAll(this, "_onImgLoaded", "_onMouseMove", "_onTouchMove", "_onTouchEnd", "_onTouchStart");
	this._img.addEventListener("load", this._onImgLoaded);
	this._outlineImg.addEventListener("load", this._onImgLoaded);
	this._img.src=filledTextURL;
	this._outlineImg.src=outlineTextURL;
	this.buffer=buffer;
	this.render=render;
	this._flattenedText;
	this._introAlpha=0;
}

Web.prototype._onImgLoaded=function(evt)
{
	evt.currentTarget.removeEventListener("load", this._onImgLoaded);
	evt.currentTarget.width*=this._scale;
	evt.currentTarget.height*=this._scale;
	this._imgsLoaded++
	if(this._imgsLoaded==2)
	{
		this._lines=new MyCanvas(this._img.width+Web._PADDING*2, this._img.height+Web._PADDING*2);
		this.resize();
		this._flattenedText=new MyCanvas(this._lines.width(), this._lines.height());
		this._outlineText=new MyCanvas(this._lines.width(), this._lines.height());
		this._lines.context.strokeStyle = 'rgba(255,255,255,0.2)';
		this._initParticles();
	}
}

Web.prototype._initParticles=function()
{
	this._flattenedText.context.drawImage(this._outlineImg, Web._PADDING, Web._PADDING, this._outlineImg.width, this._outlineImg.height);
	var outlinePixels = this._flattenedText.context.getImageData(0,0,this._lines.width(),this._lines.height());
	var tryParticles=this._lines.width()*this._lines.height()*Web._DENSITY_OF_STATIC_POINTS;
	for(var i=0; i<tryParticles; i++)
	{
		var pX = Math.floor(Math.random()*this._lines.width());
		var pY = Math.floor(Math.random()*this._lines.height());
		var a = outlinePixels.data[(pX+(this._lines.width()*pY))*4+3];
		if(a>255*0.75)
		{
			this._particles.push({
				dist:0,
				x:pX,
				y:pY,
				origin:{x:pX, y:pY},
				isAffected:false,
				isOut:false,
				outDest:Math.random()*20,
				outCount:0,
				offX:Math.random(),
				offY:Math.random(),
				noiseAmount:Math.random()*2,
				randSpeed:Math.random()*0.01,
				angle:0,
				hasRepulsion:false,
				isAnchor:Math.random()>0.85,
				connectsToMouse:Math.random()>0.05,
				mag:0
			});
		}
	}
	
	tryParticles=this._lines.width()*this._lines.width()*Web._DENSITY_OF_FLYING_POINTS;
	for(i=0; i<tryParticles; i++)
	{
		pX = Math.floor(Math.random()*this._lines.width());
		pY = Math.floor(Math.random()*this._lines.width());
		var a = outlinePixels.data[(pX+(this._lines.width()*pY))*4+3];
		if(a>0)
		{
			var noiseA = 10;
			this._particles.push({
				dist:0,
				x:pX,
				y:pY,
				origin:{x:pX, y:pY},
				isAffected:false,
				isOut:false,
				outDest:Math.random()*15,
				outCount:0,
				offX:Math.random(),
				offY:Math.random(),
				noiseAmount:Math.random()*noiseA,
				randSpeed:Math.random()*0.01,
				angle:0,
				hasRepulsion:true,
				isAnchor:Math.random()>0.85,
				mag:MyMath.random(175,250)
			});
		}
	}
	this._flattenedText.context.clearRect(0,0,this._lines.width(),this._lines.height());
	for(var i=0, iLen=this._particles.length; i<iLen; i++)
	{
		if(Math.random()<0.5)
		{
			var triangle=[this._particles[i]];
			for(var j=0; j<iLen; j++)
			{
				if(triangle.indexOf(this._particles[j])<0)
				{
					var shortestDist=Number.MAX_VALUE;
					var longestDist=0;
					for(var k=0, kLen=triangle.length; k<kLen; k++)
					{
						shortestDist=Math.min(shortestDist, MyPoint.distance(triangle[k], this._particles[j]));
						longestDist=Math.max(longestDist, MyPoint.distance(triangle[k], this._particles[j]));
					}
					if(shortestDist>15 && longestDist<40)
					{
						triangle.push(this._particles[j]);
						if(triangle.length==3)
						{
							this._flattenedText.context.beginPath();
							for(var k=0; k<3; k++)
							{
								if(k==0)
									this._flattenedText.context.moveTo(triangle[k].x, triangle[k].y);
								else
									this._flattenedText.context.lineTo(triangle[k].x, triangle[k].y);
							}
							this._flattenedText.context.fillStyle="rgba(255,255,255,"+Math.random()*0.5+")";
							this._flattenedText.context.fill();
							this._flattenedText.context.closePath();
							break;
						}
					}
				}
			}
		}
	}
	this._flattenedText.context.globalCompositeOperation="destination-in";
	this._flattenedText.context.drawImage(this._img, Web._PADDING, Web._PADDING, this._img.width, this._img.height);
	this._flattenedText.context.globalCompositeOperation="source-over";
	this._flattenedText.context.drawImage(this._outlineImg, Web._PADDING, Web._PADDING, this._outlineImg.width, this._outlineImg.height);
	this._outlineImg=null;
	TweenLite.to(this, 1, {_introAlpha:1, ease:Linear.easeNone, delay:0.2});
}

Web.prototype.activate=function()
{
	if(MyUtils.touch())
		window.addEventListener('touchstart', this._onTouchStart);
	else
		window.addEventListener("mousemove", this._onMouseMove);
}

Web.prototype.deactivate=function()
{
	if(MyUtils.touch())
	{
		this.render.canvas.removeEventListener('touchmove', this._onTouchMove);
		window.removeEventListener('touchend', this._onTouchEnd);
		window.removeEventListener('touchstart', this._onTouchStart);
	}
	else
	{
		window.removeEventListener("mousemove", this._onMouseMove);
	}
}

Web.prototype._onMouseMove=function(evt)
{
	this._mousePos.x = evt.clientX-this.render.canvas.getBoundingClientRect().left-this._offsetX;
	this._mousePos.y = evt.clientY-this.render.canvas.getBoundingClientRect().top-this._offsetY;
	this._movement();
}

Web.prototype._onTouchMove=function(evt)
{
	evt.preventDefault();
	var touch=evt.changedTouches[0];
	this._mousePos.x=touch.clientX-this.render.canvas.getBoundingClientRect().left-this._offsetX;
	this._mousePos.y=touch.clientY-this.render.canvas.getBoundingClientRect().top-this._offsetY;
	this._movement();
}

Web.prototype._onTouchStart=function(evt)
{
	var touch=evt.changedTouches[0];
	var x=touch.clientX-this.render.canvas.getBoundingClientRect().left-this._offsetX;
	var y=touch.clientY-this.render.canvas.getBoundingClientRect().top-this._offsetY;
	if(y>this._touchPaddingY-100 && y<this.render.height()-this._touchPaddingY)
	{
		evt.preventDefault();
		window.removeEventListener('touchstart', this._onTouchStart);
		this._mousePos.x=x;
		this._mousePos.y=y
		this._targetPos.x=x;
		this._targetPos.y=y;
		this.render.canvas.addEventListener('touchmove', this._onTouchMove);
		window.addEventListener('touchend', this._onTouchEnd);
	}
}

Web.prototype._onTouchEnd=function(evt)
{
	evt.preventDefault();
	this.render.canvas.removeEventListener('touchmove', this._onTouchMove);
	window.removeEventListener('touchend', this._onTouchEnd);
	this._mousePos.x=Number.MAX_VALUE;
	this._mousePos.y=Number.MAX_VALUE;
	this._movement();
	window.addEventListener('touchstart', this._onTouchStart);
}

Web.prototype._movement=function()
{
	MyMath.ease(this._targetPos, "x", this._mousePos.x, Web._POINT_EASE);
	MyMath.ease(this._targetPos, "y", this._mousePos.y, Web._POINT_EASE);
	for(var i=0; i<Web._MASK_SIDES; i++)
	{
		this._maskAngles[i]+=0.05;
	}
}

Web.prototype.tick=function()
{
	if(this._lines)
	{
		this._update();
		this._draw();
	}
}

Web.prototype._update=function()
{
	for(var i=0, iLen=this._particles.length; i<iLen; i++)
	{
		var p = this._particles[i];
		var distanceor = MyPoint.distance(p.origin, this._mousePos);
		if(distanceor<Web._REPULSION_MIN && !p.isAffected)
		{
			p.isAffected = true;
			this._affectedParticles.push(p);
		}
		else if(distanceor>Web._REPULSION_MAX)
		{
			if(!p.isOut)
			{
				p.isOut = true;
			}
			else
			{
				p.outCount++;
				if(p.outCount>p.outDest)
				{
					p.isAffected = false;
					p.isOut = false;
					p.outCount = 0;
					for(var j=0, jLen=this._affectedParticles.length; j<jLen; j++)
					{
						if(this._affectedParticles[j] == p)
						{
							this._affectedParticles.splice(j,1);
							break;
						}
					}
				}
			}
		}
		if(!p.isAffected)
		{
			MyMath.ease(p, "x", p.origin.x, Web._POINT_EASE);
			MyMath.ease(p, "y", p.origin.y, Web._POINT_EASE);
		}
		p.dist = MyPoint.distance(p, p.origin);
	}

	for(i=0, iLen=this._affectedParticles.length; i<iLen; i++)
	{
		var p = this._affectedParticles[i];
		if(p.hasRepulsion)
		{
			var repelforce = new MyPoint(p.x,p.y);
			repelforce.subtract(this._mousePos); 
			var mag = repelforce.length(); 
			var repelstrength = (mag - p.mag) *-1; 
			if(mag>0)
			{
				repelforce.x*=(repelstrength/mag*Web._POINT_EASE);
				repelforce.y*=(repelstrength/mag*Web._POINT_EASE);
				p.x += repelforce.x;
				p.y += repelforce.y;
			}
			if(i<this._affectedParticles.length-1)
			{
				for(var j=i+1, jLen=this._affectedParticles.length; j<jLen; j++)
				{
					var p2 = this._affectedParticles[j];
					if(p2.hasRepulsion)
					{
						repelforce = new MyPoint(p2.x,p2.y);
						repelforce.subtract(p); 
						mag = repelforce.length(); 
						repelstrength = 150-mag; 
						if((repelstrength>0)&&(mag>0))
						{
							repelforce.x*=(repelstrength/mag*0.025);
							repelforce.y*=(repelstrength/mag*0.025);
							p.x -= repelforce.x;
							p.y -= repelforce.y;
							p2.x += repelforce.x;
							p2.y += repelforce.y;
						}
					}
				}
			}
		}
		MyMath.ease(p, "x", p.origin.x, Web._POINT_EASE);
		MyMath.ease(p, "y", p.origin.y, Web._POINT_EASE);
		p.offX += p.randSpeed;
		p.offY += p.randSpeed;
	}
}

Web.prototype._draw=function()
{
	if(this._introAlpha<1)
		this.buffer.context.globalAlpha=this._introAlpha;
	this.buffer.context.drawImage(this._img, this._offsetX+Web._PADDING, this._offsetY+Web._PADDING, this._img.width, this._img.height);
	this._outlineText.context.clearRect(0, 0, this._outlineText.width(), this._outlineText.height());
	this._lines.context.clearRect(0, 0, this._lines.width(), this._lines.height());
	var y = 0;
	var pLength = 0;
	for(var i=0, iLen=this._affectedParticles.length; i<iLen; i++)
	{
		var p = this._affectedParticles[i];
			for(var j=0, jLen=this._affectedParticles.length; j<jLen; j++)
			{
				if(i!=j)
				{
					var p2 = this._affectedParticles[j];
					var dist;
					if(p.hasRepulsion && p2.hasRepulsion)
					{
						dist = Web._THRES_BETWEEN_FLYING_POINTS;
					}
					else
					{
						if((p.hasRepulsion || p2.hasRepulsion) && (p.isAnchor && p2.isAnchor))
							dist=Web._THRES_BETWEEN_FLYING_POINTS;
						else
							dist=Web._THRES_BETWEEN_STATIC_POINTS;
					}
					if(MyPoint.distance(p,p2)<dist)
					{
						this._lines.context.beginPath();
						this._lines.context.moveTo(p.x, p.y);
						this._lines.context.lineTo(p2.x, p2.y);
						this._lines.context.stroke();
					}
				}
			}
		if(p.connectsToMouse)
		{
			this._lines.context.beginPath();
			this._lines.context.moveTo(p.x, p.y);
			this._lines.context.lineTo(this._mousePos.x, this._mousePos.y);
			this._lines.context.stroke();
		}
		y += p.origin.y;
		pLength++;
	}
	if(pLength != 0)
		y /= pLength;
	for(i=0; i<Web._MASK_SIDES; i++)
	{
		this._maskPoints[i].x=Math.cos(this._maskAngles[i])*this._maskDistances[i];
		this._maskPoints[i].y=Math.sin(this._maskAngles[i])*this._maskDistances[i];
	}
	this.buffer.context.globalCompositeOperation = 'destination-out';
	this.buffer.context.fillStyle="#000";
	this._drawMask(this.buffer.context, this._targetPos.x+this._offsetX, y+this._offsetY, Web._MASK_RADIUS);
	this.buffer.context.globalCompositeOperation = 'source-over';
	this._outlineText.context.globalCompositeOperation = 'source-over';
	this._outlineText.context.drawImage(this._flattenedText.canvas,0,0);
	this._outlineText.context.globalCompositeOperation = 'destination-in';
	this._drawMask(this._outlineText.context, this._targetPos.x, y);
	this.buffer.context.drawImage(this._outlineText.canvas, this._offsetX, this._offsetY);
	this.buffer.context.drawImage(this._lines.canvas, this._offsetX, this._offsetY);
	if(this._introAlpha<1)
		this.buffer.context.globalAlpha=1;
}

Web.prototype._drawMask=function(context, x, y)
{
	context.beginPath();
	// context.arc(x, y, Web._MASK_RADIUS, 0, Math.PI*2, true);
	var point=this._maskPoints[0];
	context.moveTo(point.x+x, point.y+y);
	for(var i=1; i<Web._MASK_SIDES; i++)
	{
		point=this._maskPoints[i];
		context.lineTo(point.x+x, point.y+y);
	}
	context.fill();
	context.closePath();
}

Web.prototype.resize=function()
{
	if(this._lines)
	{
		this.render.width(this.render.canvas.offsetWidth);
		this.render.height(this.render.canvas.offsetHeight);
		this._offsetX=(this.render.width()-this._lines.width())/2;
		this._offsetY=(this.render.height()-this._lines.height())/2;
		this._touchPaddingY=(this.render.height()-this._img.height)/2;
	}
}
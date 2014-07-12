"use strict";
	
//////////////////////////////////////////////////
//author:Dane Hansen/////////////////////////////
//www.danehansen.com////////////////////////////
///////////////////////////////////////////////

var MyUtils=
{
	addClass:function(elements,str)
	{
		if(!MyUtils.isList(elements))
			elements=[elements];
		for(var i=0, iLen=elements.length; i<iLen; i++)
		{
			var targ=elements[i];
			var className=targ.className;
			if(className.split(" ").indexOf(str)==-1)
				targ.className=className+(className.length==0?"":" ")+str;
		}
	},
	addPrefix:function(str)
	{
		if(MyUtils._addPrefixStorage[str])
			return MyUtils._addPrefixStorage[str];
		var prefixed=MyUtils.browser().prefix+str.replace(/\b[a-z]/,  MyUtils._captitalize);
		MyUtils._addPrefixStorage[str]=prefixed;
		return prefixed;
	},
		_addPrefixStorage:{},
		_captitalize:function(str)
		{
			return str.toUpperCase();
		},
		_ADD_PREFIXES_TO:
		{
			transform:true,
			transformOrigin:true,
			transition:true,
			userSelect:true,
			perspective:true
		},
	addEventListener:function(elements,evt,handler)
	{
		if(!MyUtils.isList(elements))
			elements=[elements];
		for(var i=0,iLen=elements.length; i<iLen; i++)
		{
			elements[i].addEventListener(evt,handler);
		}
	},
	addMouseEnter:function(elements,handler)
	{
		if(!MyUtils.isList(elements))
			elements=[elements];
		for(var i=0, iLen=elements.length; i<iLen; i++)
		{
			var element=elements[i];
			if(!element.danehansenID)
				element.danehansenID=String(Math.random());
			MyUtils._ON_MOUSE_ENTER[element.danehansenID]={handler:handler, _handler:MyUtils.bind(MyUtils._onMouseEnter,element)};
			element.addEventListener("mouseover",MyUtils._ON_MOUSE_ENTER[element.danehansenID]._handler);
		}
	},
		_onMouseEnter:function(evt)
		{
			var relTarg=evt.relatedTarget || evt.fromElement;
			if(this.contains(relTarg) || relTarg==this)
				evt.preventDefault();
			else
				MyUtils._ON_MOUSE_ENTER[this.danehansenID].handler(evt);
		},
		_ON_MOUSE_ENTER:{},
	addMouseLeave:function(elements,handler)
	{
		if(!MyUtils.isList(elements))
			elements=[elements];
		for(var i=0, iLen=elements.length; i<iLen; i++)
		{
			var element=elements[i];
			if(!element.danehansenID)
			element.danehansenID=String(Math.random());
			MyUtils._ON_MOUSE_LEAVE[element.danehansenID]={handler:handler, _handler:MyUtils.bind(MyUtils._onMouseLeave,element)};
			element.addEventListener("mouseout",MyUtils._ON_MOUSE_LEAVE[element.danehansenID]._handler);
		}
	},
		_onMouseLeave:function(evt)
		{
			var relTarg=evt.relatedTarget || evt.fromElement;
			if(this.contains(relTarg) || relTarg==this)
				evt.preventDefault();
			else
				MyUtils._ON_MOUSE_LEAVE[this.danehansenID].handler(evt);
		},
		_ON_MOUSE_LEAVE:{},
	autoAlpha:function(elements, num)
	{
		MyUtils.css(elements,{opacity:num,visibility:num==0?"hidden":"visible"});
	},
	bind:function(func, context)
	{
		return Function.prototype.bind.apply(func, Array.prototype.slice.call(arguments, 1));
	},
	bindAll:function(obj)
	{
		var funcs=Array.prototype.slice.call(arguments, 1);
		for(var i=0, iLen=funcs.length; i<iLen; i++)
		{
			obj[funcs[i]]=MyUtils.bind(obj[funcs[i]], obj);
		}
		return obj;
	},
	browser:function()
	{
		if(!MyUtils._browser)
		{
			var ua=navigator.userAgent, 
				msie=/(msie|trident)/i.test(ua),
				chrome=/chrome|crios/i.test(ua),
				phantom=/phantom/i.test(ua),
				safari=/safari/i.test(ua) && !chrome && !phantom,
				firefox=/firefox/i.test(ua),
				webkitVersion=/version\/(\d+(\.\d+)?)/i,
				firefoxVersion=/firefox\/(\d+(\.\d+)?)/i;
			if(chrome)
			{
				MyUtils._browser=
				{
					name:"chrome",
					version:parseFloat(ua.match(/(?:chrome|crios)\/(\d+(\.\d+)?)/i)[1]),
					webkit:true,
					prefix:"webkit"
				}
			}
			else if(firefox)
			{
				MyUtils._browser=
				{
					name:"firefox",
					version:parseFloat(ua.match(firefoxVersion)[1]),
					webkit:false,
					prefix:"moz"
				}
			}
			else if(safari)
			{
				MyUtils._browser=
				{
					name:"safari",
					version:parseFloat(ua.match(webkitVersion)[1]),
					webkit:true,
					prefix:"webkit"
				}
			}
			else if(msie)
			{
				MyUtils._browser=
				{
					name:"msie",
					version:parseFloat(ua.match(/(msie |rv:)(\d+(\.\d+)?)/i)[2]),
					webkit:false,
					prefix:"ms"
				}
			}
			else
			{
				MyUtils._browser=
				{
					name:"",
					version:0,
					webkit:false,
					prefix:""
				}
			}
			MyUtils._browser.tablet=/tablet/i.test(ua);
			MyUtils._browser.phone=!MyUtils._browser.tablet && /[^-]mobi/i.test(ua);
			MyUtils._browser.mobile=MyUtils._browser.tablet || MyUtils._browser.phone;
			MyUtils._browser.ios = /(ipod|iphone|ipad)/i.test(ua);
			MyUtils._browser.android = /android/i.test(ua);
		}
		return MyUtils._browser;
	},
		_browser:null,
	css:function(elements,props)
	{
		if(!MyUtils.isList(elements))
			elements=[elements];
		for(var i=0, iLen=elements.length; i<iLen; i++)
		{
			var style=elements[i].style
			for(var j in props)
			{
				if(MyUtils._ADD_PREFIXES_TO[j])
					style[MyUtils.addPrefix(j)]=props[j];
				style[j]=props[j];
			}
		}
	},
	dropShadow:function(elements,x,y,spread,color)
	{
		if(!_dropShadow)
		{
			if(document.body.style.webkitFilter=="")
				MyUtils._dropShadow="webkitFilter";
			else if(document.body.style.msFilter=="")
				MyUtils._dropShadow="msFilter";
			else
				MyUtils._dropShadow="filter";
		}
	},
		_dropShadow:null,
	getStyle:function(element, property)
	{
		var style=element.style[property];
		if(style!="")
			return style;
		else
			return window.getComputedStyle(element)[property];
	},
	hasClass:function(elements,str)
	{
		if(!MyUtils.isList(elements))
			elements=[elements];
		for(var i=0, iLen=elements.length; i<iLen; i++)
		{
			if(elements[i].className.split(" ").indexOf(str)>=0)
				return true;
		}
		return false;
	},
	indexOf:function(list,element)
	{
		for(var i=0, iLen=list.length; i<iLen; i++)
		{
			if(list[i]==element)
				return i;
		}
		return -1;
	},
	isList:function(list)
	{
		return list.length!=undefined;
	},
	loadBigImages:function(parent)
	{
		if(!parent)
			parent=document;
		var elements=MyUtils.toArray(parent.querySelectorAll("*[data-background-image]"));
		if(parent!=document && (parent.hasAttribute("data-background-image") || parent.hasAttribute("data-src")))
			elements.push(parent);
		for(var i=0, iLen=elements.length; i<iLen; i++)
		{
			var element=elements[i];
			element.style.backgroundImage="url("+element.getAttribute("data-background-image")+")";
			element.removeAttribute("data-background-image");
		}
		elements=parent.querySelectorAll("img[data-src]");
		for(i=0, iLen=elements.length; i<iLen; i++)
		{
			element=elements[i];
			element.setAttribute("src", element.getAttribute("data-src"));
			element.removeAttribute("data-src");
		}
	},
	removeClass:function(elements,str)
	{
		if(!MyUtils.isList(elements))
			elements=[elements];
		for(var i=0, iLen=elements.length; i<iLen; i++)
		{
			var targ=elements[i];
			var className=targ.className;
			var split=className.split(" ");
			var index=split.indexOf(str);
			if(index>=0)
			{
				split.splice(index,1);
				targ.className=split.join(" ");
			}
		}
	},
	removeEventListener:function(elements,event,handler)
	{
		if(!MyUtils.isList(elements))
			elements=[elements];
		for(var i=0,iLen=elements.length; i<iLen; i++)
		{
			elements[i].removeEventListener(event,handler);
		}
	},
	removeMouseEnter:function(elements)
	{
		if(!MyUtils.isList(elements))
			elements=[elements];
		for(var i=0, iLen=elements.length; i<iLen; i++)
		{
			var element=elements[i];
			if(MyUtils._ON_MOUSE_ENTER[element.danehansenID])
			{
				element.removeEventListener("mouseover",MyUtils._ON_MOUSE_ENTER[element.danehansenID]._handler);
				delete MyUtils._ON_MOUSE_ENTER[element.danehansenID];
			}
		}
	},
	removeMouseLeave:function(elements)
	{
		if(!MyUtils.isList(elements))
			elements=[elements];
		for(var i=0, iLen=elements.length; i<iLen; i++)
		{
			var element=elements[i];
			if(MyUtils._ON_MOUSE_LEAVE[element.danehansenID])
			{
				element.removeEventListener("mouseout",MyUtils._ON_MOUSE_LEAVE[element.danehansenID]._handler);
				delete MyUtils._ON_MOUSE_LEAVE[element.danehansenID];
			}
		}
	},
	toArray:function(list)
	{
		var array=[];
		for(var i=0,iLen=list.length; i<iLen; i++)
		{
			array[i]=list[i];
		}
		return array;
	},
	touch:function()
	{
		if(MyUtils._touch==null)
			MyUtils._touch="ontouchstart" in window;
		return MyUtils._touch;
	},
		_touch:null,
	toUnicode:function(str)
	{
		var unicode="";
		for(var i=0, iLen=str.length; i<iLen; i++)
		{
			unicode+=("&#"+str.charCodeAt(i)+";")
		}
		return unicode;
	}
};
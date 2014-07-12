"use strict";

var onYouTubeIframeAPIReady;
var Globals=
{
	RED:"#B62E2E",
	GREEN:"#1E3E42",
	WHITE:"#FFF",
	SVG_NAMESPACE:"http://www.w3.org/2000/svg",
	depthOffset:null,
	winWidth:null,
	winHeight:null,
	CLICK_EVENT:MyUtils.touch()?"touchstart":"click",
	GLITCH_OFF:1500,
	GLITCH_ON:100,
	GLITCH_AMOUNT:5,
	squareGallery1:null,
	squareGallery2:null,
	squareGallery3:null,
	twitter:null
};

(function()
{
	if(MyUtils.browser().mobile)
		document.body.className="mobile";
	//youtube stuff
		var tag=document.createElement('script');
		tag.src="https://www.youtube.com/iframe_api";
		var firstScriptTag=document.getElementsByTagName('script')[0];
		firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
		var youtube;
		onYouTubeIframeAPIReady=function()
		{
			console.log('youtube api frame ready');
		}
		function onPlayerReady(event)
		{
			if (!MyUtils.browser().mobile) {
				console.log('autoplaying');
				event.target.playVideo();
			}else{
				console.log('mobile doesnt get autoplay');
			};



		}
		function onPlayerStateChange(event)
		{
			console.log(event.data);
						if (MyUtils.browser().mobile) {
					setTimeout(function(){
						var content = document.getElementById('video1');
						content.getElementsByTagName('button')[0].style.opacity = 0;
					}, 100);
				};
		}

	var _PARALLAX_MULTIPLIER=100;
	var _SCROLLING_MULTIPLIER=100;
	var mousePosition={x:0, y:0};
	var modal=document.getElementById("modal");
	var _bigPhotoGallery=null;
	Globals.depthOffset=function(scale, scroll)
	{
		var x=mousePosition.x*(scale-1)*_PARALLAX_MULTIPLIER;
		var y=mousePosition.y*(scale-1)*_PARALLAX_MULTIPLIER+scroll*-scale*2*_SCROLLING_MULTIPLIER;
		return {x:x, y:y};
	}

	var sections;
	function onLoad()
	{
		clearTimeout(backupTimer);
		window.removeEventListener("load", onLoad);
		if(MyUtils.browser().phone)
			MyUtils.addClass(document.body, "phone");
		//intro
			var intro=new Intro();
			intro.element.__resize=intro.resize;
			intro.element.__scroll=intro.scroll;
			intro.element.__tick=intro.tick;
		//watch intro
			var watchIntro=new WatchIntro();
			watchIntro.element.__resize=watchIntro.resize;
			watchIntro.element.__scroll=watchIntro.scroll;
			watchIntro.element.__tick=watchIntro.tick;
		//features
			var features=new Features();
			features.element.__resize=features.resize;
			features.element.__scroll=features.scroll;
			features.addYoutubeVideos();
		//article
			var article=new Article();
			article.element.__resize=article.resize;
			article.element.__scroll=article.scroll;
			article.element.__tick=article.tick;
		//disruptors
			var disruptors=new Disruptors();
			disruptors.element.__resize=disruptors.resize;
			disruptors.element.__scroll=disruptors.scroll;
			disruptors.element.__tick=disruptors.tick;
		//challenge
			var challenge=new Challenge();
			challenge.element.__resize=challenge.resize;
			challenge.element.__scroll=challenge.scroll;
			challenge.element.__tick=challenge.tick;
		//footer
			var footer=new Footer();
			footer.element.__resize=footer.resize;
			footer.element.__scroll=footer.scroll;
			footer.element.__tick=footer.tick;

		document.documentElement.className="";
		sections=document.querySelectorAll("body > section");
		for(var i=0, iLen=sections.length; i<iLen; i++)
		{
			if(sections[i].__scroll)
				hasScrollScripts.push(sections[i]);
			if(sections[i].__resize)
				hasResizeScripts.push(sections[i]);
			if(sections[i].__tick)
				hasTickScripts.push(sections[i]);
		}
		
		onResize();
		var modals=document.querySelectorAll("[data-modal-id]");
		MyUtils.addEventListener(modals, "click", onModalClick);
		BGButton.init();
		if(parallax.orientationSupport)
			window.addEventListener('orientationchange', onResize);
		window.addEventListener("resize", onResize);
		window.addEventListener("scroll", onScroll);
		TweenLite.ticker.addEventListener("tick", onTick);
		document.getElementById("blackness").className="loaded";

		//social feed stuff
			if(!MyUtils.browser().mobile)
			{
				var squareGalleryInstagramTemplate=Handlebars.compile(document.getElementById("square-gallery-instagram-template").innerHTML);
				var squareGalleryTwitterImageTemplate=Handlebars.compile(document.getElementById("square-gallery-twitter-image-template").innerHTML);
				var squareGalleryTwitterNoImageTemplate=Handlebars.compile(document.getElementById("square-gallery-twitter-no-image-template").innerHTML);
				var squareGalleryFacebookPhotoTemplate=Handlebars.compile(document.getElementById("square-gallery-facebook-photo-template").innerHTML);
				var squareGalleryFacebookStatusTemplate=Handlebars.compile(document.getElementById("square-gallery-facebook-status-template").innerHTML);
				var twitterTemplate=Handlebars.compile(document.getElementById("twitter-template").innerHTML);
				var wiredTemplate=Handlebars.compile(document.getElementById("wired-template").innerHTML);
				var READ_FILE="/php/getImg.php?url=";
				// var READ_FILE="";
				var templatesDone=0;
				var TOTAL_TEMPLATES=5;
				
				JSONP('http://api.massrelevance.com/oakley/global-campaign_dbdhub_allhashtag.json','jsoncallback',function(json){
					populateSquareGallery(json, document.getElementById('all-mr'));
					Globals.squareGallery1.init();
					templateDone();
				});
				JSONP('http://api.massrelevance.com/oakley/global-campaign_dbdhub_ourinstagram.json','jsoncallback',function(json){
					populateSquareGallery(json, document.getElementById('instagram-mr'));
					Globals.squareGallery2.init();
					templateDone();
				});
				JSONP('http://api.massrelevance.com/oakley/global-campaign_dbdhub_ourfacebook.json','jsoncallback',function(json){
					populateSquareGallery(json, document.getElementById('facebook-mr'));
					Globals.squareGallery3.init();
					templateDone();
				});
				JSONP('http://api.massrelevance.com/oakley/global-campaign_dbdhub_ourtwitter.json','jsoncallback',function(json){
					var html="";
					for(var i=0, iLen=json.length; i<iLen; i++)
					{
						var obj=json[i];
						obj.created_at=obj.created_at.replace(/\+[\d]+ /, "");
						var date=new Date(obj.created_at);
						obj.created_at=date.getMonth()+1+"/"+date.getDate()+"/"+date.getFullYear()
						html+=twitterTemplate(obj);
					}
					document.getElementById('twitter-mr').innerHTML=html;
					Globals.twitter.init();
					templateDone();
				});
				JSONP('http://api.massrelevance.com/oakley/global-campaign_dbdhub_wiredrss.json','jsoncallback',function(json){
					var obj=json[0];
					obj.description=obj.description.replace(/<br>/gi, "\n");
					obj.description=obj.description.replace(/<p.*>/gi, "\n");
					obj.description=obj.description.replace(/<a.*href="(.*?)".*>(.*?)<\/a>/gi, "");
					obj.description=obj.description.replace(/<(?:.|\s)*?>/g, "");
					document.getElementById('wired-mr').innerHTML=wiredTemplate(obj);
					templateDone();
				});
			}
			
			function populateSquareGallery(json, parent)
			{
				var html="";
				for(var i=0, iLen=json.length; i<iLen; i++)
				{
					var obj=json[i];
					var network=obj.network;
					if(network=="instagram")
					{
						var urlHolder=obj.images.standard_resolution;
						if(READ_FILE=="")
							urlHolder.url=urlHolder.url;
						else
							urlHolder.url=READ_FILE+escape(urlHolder.url);
						html+=squareGalleryInstagramTemplate(obj);
					}
					else if(network=="twitter")
					{
						if(obj.entities.media)
						{
							if(obj.entities.media[0].media_url)
							{
								obj.__bgImg=READ_FILE+escape(obj.entities.media[0].media_url);
								if(READ_FILE=="")
									obj.__bgImg=obj.entities.media[0].media_url;
								else
									obj.__bgImg=READ_FILE+escape(obj.entities.media[0].media_url);
								html+=squareGalleryTwitterImageTemplate(obj);
							}
						}
						/*else
							html+=squareGalleryTwitterNoImageTemplate(obj);*/
					}
					else if(network=="facebook")
					{
						var kind=obj.kind;
						if(obj.picture)
						{
							obj.picture=obj.picture.replace(/_s.jpg/, "_b.jpg");
							obj.picture=obj.picture.replace(/_s.png/, "_b.png");
							obj.picture=obj.picture.replace(/_s.gif/, "_b.gif");
							if(READ_FILE=="")
								obj.picture=obj.picture;
							else
								obj.picture=READ_FILE+escape(obj.picture);
							html+=squareGalleryFacebookPhotoTemplate(obj);
						}
						/*else if(obj.kind=="status")
						{
							html+=squareGalleryFacebookStatusTemplate(obj);
						}*/
					}
				}
				parent.innerHTML=html;
			}
			
			function templateDone()
			{
				templatesDone++;
				if(templatesDone==TOTAL_TEMPLATES)
					onResize();
			}
	}

	//resize
		var hasResizeScripts=[];
		var docHeight;
		function onResize()
		{
			parallax.onWindowResize();
			Globals.winHeight=window.innerHeight;
			Globals.winWidth=window.innerWidth;
			for(var i=0, iLen=hasResizeScripts.length; i<iLen; i++)
			{
				var sec=hasResizeScripts[i];
				sec.__resize();
			}
			var heights=0;
			for(i=0, iLen=sections.length; i<iLen; i++)
			{
				heights+=sections[i].offsetHeight;
			}
			docHeight=Math.max(document.body.clientHeight, heights);
			maxScroll=docHeight-Globals.winHeight;
			for(i=0, iLen=hasScrollScripts.length; i<iLen; i++)
			{
				sec=hasScrollScripts[i];
				sec.__top=sec.offsetTop;
				sec.__height=sec.offsetHeight;
				sec.__start=Math.max(0,sec.__top-Globals.winHeight);
				sec.__end=Math.min(docHeight-Globals.winHeight,sec.__height+sec.__top);
			}
			onScroll();
		}

	//scroll
		var maxScroll;
		var hasScrollScripts=[];
		var lastPageYOffset=0;
		var scrollTimeout=null;
		var introShowing=true;
		function onScroll(evt)
		{
			var pageYOffset=window.pageYOffset;
			var top=Math.min(maxScroll,Math.max(0,pageYOffset));
			var diff=pageYOffset-lastPageYOffset;
			for(var i=0, iLen=hasScrollScripts.length; i<iLen; i++)
			{
				var sec=hasScrollScripts[i];
				var perc=MyMath.relativePercentage(sec.__start,sec.__end,top);
				if(i==0 && !MyUtils.browser().phone)
				{
					if(diff>0 && pageYOffset>=Globals.winHeight && introShowing)
					{
						sec.className="hidden";
						introShowing=false;
					}
					else if(diff<0 && pageYOffset<=Globals.winHeight+670 && !introShowing)
					{
						sec.className="";
						introShowing=true;
					}
				}
				if(perc<0 || perc>1)
					perc=Number.MAX_VALUE;
				if(sec.__progress!=perc)
				{
					sec.__progress=perc;
					sec.__scroll(perc);
				}
				if(i==0)
					var sec0Progress=perc;
				else if(i==1)
					var sec1Progress=perc;
			}
			if(scrollTimeout)
			{
				clearTimeout(scrollTimeout);
				scrollTimeout=null;
			}
			if(!MyUtils.browser().phone)
			{
				if(diff>0 && sec0Progress>0.5 && sec0Progress<1)
					scrollTimeout=setTimeout(Globals.scrollToOne, 50);
				else if(diff<0)
				{
					if(sec0Progress<0.5)
						scrollTimeout=setTimeout(Globals.scrollToZero, 50);
					else if(sec1Progress>0.5 && sec1Progress<0.75)
						scrollTimeout=setTimeout(Globals.scrollToOne, 50);
				}
			}
			lastPageYOffset=pageYOffset;
			document.body.style.backgroundPositionY=Math.max(Math.min(pageYOffset/docHeight, 1),0)*100+"%";
		}

		function scrollTo(num)
		{
			scrollTimeout=null;
			TweenLite.to(window, 0.75, {scrollTo:{y:num}, ease:Cubic.easeOut});
		}

		Globals.scrollToZero=function()
		{
			scrollTo(0);
		}

		Globals.scrollToOne=function()
		{
			scrollTo(hasScrollScripts[1].__top);
		}

	//tick
		var hasTickScripts=[];
		var parallax=new Parallax(document.createElement("div"));
		var fpsLastTime=0;
		var fpsTimes=[];
		function onTick()
		{
			var currentTime=TweenLite.ticker.time;
			var diff=currentTime-fpsLastTime;
			var num=1/diff;
			fpsTimes.push(num);
			while(fpsTimes.length>50)
			{
				fpsTimes.shift();
			}
			var currentFPS=MyMath.average(fpsTimes);
			fpsLastTime=currentTime;
			parallax.onAnimationFrame();
			if(currentFPS>25)
			{
				if(parallax.portrait)
				{
					MyMath.ease(mousePosition, "y", parallax.ix, 0.1);
					MyMath.ease(mousePosition, "x", parallax.iy, 0.1);
				}
				else
				{
					MyMath.ease(mousePosition, "x", parallax.ix, 0.1);
					MyMath.ease(mousePosition, "y", parallax.iy, 0.1);
				}
				for(var i=0, iLen=hasTickScripts.length; i<iLen; i++)
				{
					var sec=hasTickScripts[i];
					if(i==0)
					{
						if(sec.__progress>=0 && sec.__progress<1)
							sec.__tick();
					}
					else if(i==1)
					{
						if(i==1 && sec.__progress>0 && sec.__progress<1)
							sec.__tick();
					}
					else
					{
						if(sec.__progress>=0 && sec.__progress<=1)
							sec.__tick();
					}
				}
			}
		}

		function parallaxElements(list)
		{
			for(var i=0, iLen=list.length; i<iLen; i++)
			{
				list[i].style.left=mousePosition.x*list[i].__depth+"px";
				list[i].style.top=mousePosition.y*list[i].__depth+"px";
			}
		}

	//modal
		var videoIsPlaying=false;
		function onModalClick(evt)
		{
			document.documentElement.className="noScroll";
			var selected=modal.querySelector(".selected");
			if(selected)
				MyUtils.removeClass(selected, "selected");
			var id=evt.currentTarget.getAttribute("data-modal-id");
			var content=document.getElementById(id);
			MyUtils.addClass(content, "selected");
			modal.className="show";
			content.querySelector(".x").addEventListener(MyUtils.touch()?"touchstart":"click", onModalXClick)
			modal.addEventListener("click", onModalXClick);
			if(MyUtils.hasClass(content, "photo"))
			{
				_bigPhotoGallery=new BigPhotoGallery(content);
			}
			else if(MyUtils.hasClass(content, "video"))
			{
				videoIsPlaying=true;
				if(!youtube){
					youtube=new YT.Player('player', {height:'540', width:'960', videoId:evt.currentTarget.getAttribute("data-youtube-id"), events:{'onReady':onPlayerReady, 'onStateChange':onPlayerStateChange},playerVars: { 'playsinline':'1' }});
				}else{
					youtube.seekTo(0);
  					youtube.stopVideo();
  					youtube.clearVideo();
					youtube.loadVideoById(evt.currentTarget.getAttribute("data-youtube-id"));
				}


				setTimeout(function(){
						var stuff = document.getElementById('video1');
						stuff.getElementsByTagName('button')[0].style.opacity = 0;
					}, 100);

			}
		}

		function onModalXClick(evt)
		{	
			if(videoIsPlaying)
			{	
				if (youtube) {
					youtube.stopVideo();
				};
				videoIsPlaying=false;
			}
			document.documentElement.className="";
			var xButton=modal.querySelector(".selected .x");
			if(evt.target.parentElement==modal || evt.currentTarget==xButton)
			{
				if(_bigPhotoGallery)
				{
					_bigPhotoGallery.destroy();
					_bigPhotoGallery=null;
				}
				modal.removeEventListener(Globals.CLICK_EVENT, onModalXClick);
				modal.querySelector(".selected .x").removeEventListener("click", onModalXClick);
				modal.className="";
			}
		}
		
	window.addEventListener("load", onLoad);
	var backupTimer=setTimeout(onLoad, 5000);
})();
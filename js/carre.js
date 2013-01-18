$(document).ready(function(){
	AOFSetup();
});
var contentCount=7;
var bgSpeedFactor=0.5;
var contentWidth=980;
var contentHeight=460;
var bgOffsetLeft=-340;
var bgOffsetTop=-638;
var menuHeight=80;
var scrollObj;
var bodyObj;
var windowObj;
var viewportObj;
var scrollPerc=0;
var layerContent;
var layerBG;
var layerMenu;
var postScrollUpdate
var postScrollUpdateDelay=10;
var navActiveRange=0.025//percentage of 'wiggle-room' for setting active nav
var browserIE=false;
var browserSafariIpad=navigator.userAgent.match(/iPad/i) != null;
var browserVer=0;
/*---- methods ----*/
function AOFSetup() {
	//get hash if set
	var startContent=document.location.hash;
	if(startContent!=''){
		window.location.hash='#';
	}
	//set browser vars
	browserIE=$.browser.msie;
	browserVer=parseInt($.browser.version, 10);
	//is ipad?
	if(browserSafariIpad){
		$("html").addClass('ipad');
		AOFResetCameraPathIpad();
	}
	//create elements
	$("body").prepend('<div id="faux-scroll"></div>');
	$("#carre-wrapper").prepend('<div id="layer-bg"></div>');
 	//set object references
	scrollObj = $(window);
	bodyObj = $('body');
	windowObj = $(window);
	viewportObj = $("#carre-wrapper"); //ipad
	layerContent = $("#layer-content");
	layerPI = $("#layer-parallax-items");
	layerBG = $("#layer-bg");
	layerMenu = $("#layer-menu");
	//parallax dom item references
	var pdiNum
	for(var pdi=0;pdi<parallaxItems.length;pdi++){
		pdiNum=pdi+1;
		parallaxDomItems.push($("#parallax-item-"+pdiNum));
	}
	//create scroll listener
	if(browserSafariIpad){
		window.onorientationchange=AOFScroll;
	}else{
		$(window).scroll(AOFScroll);
		$(window).resize(AOFScroll);
	}
	//setup menu/nav links
	AOFNavLinks();
	//init
	AOFScroll();
	//begin at content hash
	if(startContent.indexOf("#content-page-")==0){
		AOFScrollToContent(startContent);
	}
}
function AOFNavLinks() {
	$("#main-menu-items li a, #logo-art-of-flight a").click(function(){
		var targ=$(this);
		var pRef=targ.attr('href');
		AOFSetActiveNav(pRef);
		if(browserSafariIpad){
			AOFIpadSnapAtContent(pRef);
		}else{
			AOFScrollToContent(pRef);
		}
		return false;
	});
}
function AOFNavAlign() {
	var navY=((windowObj.height()-contentHeight-menuHeight)/2)
	layerMenu.css({'top':navY+'px'});
}
function AOFNavSelection() {
	var perc=AOFScrollPercentage();
	var activeNav='';
	for(var cp=0;cp<cameraPath.length;cp++){
		if(cameraPath[cp].a!=''){
			if(cp==cameraPath.length-1 && perc>=1-navActiveRange){
				//last point
				activeNav=cameraPath[cp].a;
			}else if(Math.min(1,cameraPath[cp].p-navActiveRange)<=perc && perc<=Math.max(0,cameraPath[cp+1].p+navActiveRange)){
				activeNav=cameraPath[cp].a;
			}
		}
	}
	//set nav
	AOFSetActiveNav(activeNav)
}
function AOFSetActiveNav(ref) {
	//remove any old active class
	$("#main-menu-items li a.active").removeClass('active');
	//add new active class
	if(ref!=''){
		$('#main-menu-items li a[href="'+ref+'"]').addClass('active');
		trackFloodEvent(ref);
		trackGAEvent(ref);
	}
}
function AOFScrollToContent(ref) {
	var scrollPercCurrent=AOFScrollPercentage();
	var perc=scrollPercCurrent;
	for(var cp=0;cp<cameraPath.length;cp++){
		if(cameraPath[cp].a==ref){
			perc=cameraPath[cp].p;
			//exit loop if moving forward
			if(perc>scrollPerc){
				cp=cameraPath.length;
			}
		}
	}
	var scrollDist=Math.abs(perc-scrollPercCurrent);
	//if movement is more than 1 content area, jump ahead then animate
	if(scrollDist>0.18){
		var preDist;
		if(perc>scrollPerc){
			preDist=perc-0.07;
		}else{
			preDist=perc+0.07;
		}
		 AOFSetScroll(preDist);
	}
	//var scrollSpeed=(scrollDist/(1/contentCount))*750; //0.75 seconds per content piece
	var scrollSpeed=1500;
	var scrollPx=perc*(bodyObj.height() - windowObj.height());
	scrollObj.stop(true,true);
	scrollObj.scrollTo(scrollPx,scrollSpeed);
}
function AOFIpadSnapAtContent(ref) {
	var scrollPercCurrent=AOFScrollPercentage();
	var perc=scrollPercCurrent;
	for(var cp=0;cp<cameraPath.length;cp++){
		if(cameraPath[cp].a==ref){
			perc=cameraPath[cp].p;
			//exit loop if moving forward
			cp=cameraPath.length;
		}
	}
	scrollPerc=perc;
	AOFScroll();
}
function AOFSetScroll(perc) {
	scrollPerc=perc;
	scrollObj.scrollTop(scrollPerc*(bodyObj.height() - windowObj.height()));
}
function AOFScroll() {
	//clear timeout if exists
	clearTimeout(postScrollUpdate);
	//set screen elements
	scrollPerc=AOFScrollPercentage();
	camPos=AOFCameraAtPercentage(scrollPerc);
	camOffset=AOFOffsetCamera(camPos);
	layerContent.css({'left':camOffset.x+'px','top':camOffset.y+'px'});
	bgOffset=AOFOffsetBackground(camOffset);
	layerBG.css({'left':bgOffset.x+'px','top':bgOffset.y+'px'});
	layerPI.css({'left':bgOffset.x+'px','top':bgOffset.y+'px'});
	AOFUpdateParallaxItems(scrollPerc);
	AOFNavAlign();
	//ipad repositioning?
	if(browserSafariIpad){
		AOFIpadUpdate();
	}
	//set new timeout
	postScrollUpdate=setTimeout("AOFPostScrollUpdate()",postScrollUpdateDelay);
}
function AOFIpadUpdate() {
	viewportObj.css({'left':window.pageXOffset+'px','top':window.pageYOffset+'px'});
}
function AOFPostScrollUpdate() {
	AOFNavSelection();
}
function AOFScrollPercentage() {
	var perc = scrollObj.scrollTop() / (bodyObj.height() - windowObj.height());
	if(browserSafariIpad){
		perc = scrollPerc;
	}
	return perc;
}
function AOFCameraAtPercentage(perc) {
	var indexLow=0;
	var indexHigh=0;
	var cam={};
	if(browserSafariIpad){
		var percR=Math.round(perc*100)/100;
		for(var cp=0;cp<cameraPath.length;cp++){
			if(percR==cameraPath[cp].p){
				cam.x=cameraPath[cp].x;
				cam.y=cameraPath[cp].y;
			}
		}
	}else{
		for(var cp=0;cp<cameraPath.length;cp++){
			if(perc>cameraPath[cp].p){
				indexLow=cp;
			}
		}
		indexHigh=indexLow+1;
		if(indexHigh>=cameraPath.length){
			indexHigh=indexLow;
		}
		cam=AOFPointBetweenPoints(cameraPath[indexLow],cameraPath[indexHigh],perc);
	}
	return cam;
}
function AOFPointBetweenPoints(p1,p2,perc) {
	var pDiff={};
	pDiff.x=p2.x-p1.x;
	pDiff.y=p2.y-p1.y;
	pDiff.p=p2.p-p1.p;
	var percNormalized=0;
	if(pDiff.p>0 && perc>0){
		percNormalized=(perc-p1.p)/pDiff.p;
	}
	var midPoint={};
	midPoint.x=p1.x+(pDiff.x*percNormalized);
	midPoint.y=p1.y+(pDiff.y*percNormalized);
	return midPoint;
}
function AOFOffsetCamera(cam) {
	var offset={};
	offset.x=0-cam.x+((windowObj.width()-contentWidth)/2);
	offset.y=0-cam.y+((windowObj.height()-contentHeight)/2)+(menuHeight/2);
	return offset;
}
function AOFOffsetBackground(offsetCamera) {
	var offset={};
	offset.x=(offsetCamera.x+((windowObj.width()-contentWidth)/2))*bgSpeedFactor+bgOffsetLeft;
	offset.y=(offsetCamera.y+((windowObj.height()-contentHeight)/2))*bgSpeedFactor+bgOffsetTop;
	return offset;
}
function AOFUpdateParallaxItems(scrollPerc) {
	var pX=0;
	var pY=0;
	var percDiff=0;
	var radiansInDeg=Math.PI/180;
	var fadeStart=0.10;
	var fadeStop=0.14;
	var fadeRange=fadeStop-fadeStart;
	var opacity=1.0;
	var rotPerc=0;
	var rotation=0;
	for(var pdi=0;pdi<parallaxItems.length;pdi++){
		if(scrollPerc>parallaxItems[pdi].p2){
			//passed default
			percDiff=scrollPerc-parallaxItems[pdi].p2;
			pX=parallaxItems[pdi].x+(parallaxItems[pdi].speed*percDiff)*Math.cos(parallaxItems[pdi].dir * radiansInDeg);
			pY=parallaxItems[pdi].y+(parallaxItems[pdi].speed*percDiff)*Math.sin(parallaxItems[pdi].dir * radiansInDeg);
			if(parallaxItems[pdi].rot>0){
				rotPerc=Math.min(1.0,percDiff/(fadeStop/4));
				rotation=Math.round(percDiff*parallaxItems[pdi].rot);
			}else{
				rotation=0;
			}
		}else if(scrollPerc<parallaxItems[pdi].p1){
			//before default
			percDiff=parallaxItems[pdi].p1-scrollPerc;
			pX=parallaxItems[pdi].x+(parallaxItems[pdi].speed*percDiff)*Math.cos((parallaxItems[pdi].dir+180) * radiansInDeg);
			pY=parallaxItems[pdi].y+(parallaxItems[pdi].speed*percDiff)*Math.sin((parallaxItems[pdi].dir+180) * radiansInDeg);
			if(parallaxItems[pdi].rot>0){
				rotPerc=Math.min(1.0,percDiff/fadeStop);
				rotation=Math.round(percDiff*(360-parallaxItems[pdi].rot));
			}else{
				rotation=0;
			}
		}else{
			percDiff=0;
			//default (locked in)
			pX=parallaxItems[pdi].x;
			pY=parallaxItems[pdi].y;
			rotation=0;
		}
		rotation=Math.min(360,rotation);
		//opacity
		opacity=Math.max(0,1.0-(Math.max(0,percDiff-fadeStart)/fadeRange));
		//set position
		parallaxDomItems[pdi].css({
									top:pY+'px',
									left:pX+'px',
									"-moz-transform":"rotate("+rotation+"deg)",
									"-o-transform":"rotate("+rotation+"deg)",
									//"-webkit-transform":"rotate("+rotation+"deg)",
									"-ms-transform":"rotate("+rotation+"deg)"
		});
		//avoid IE8 transparency issues
		if(!browserIE || browserVer>=9){
			parallaxDomItems[pdi].css({opacity:opacity});
		}else{
			if(opacity==0){
				parallaxDomItems[pdi].css({display:"none"});
			}else{
				parallaxDomItems[pdi].css({display:"block"});
			}
		}
	}
}
//create custom Firefox scroll event/listener to fix
(function(doc) {
	var root = doc.documentElement;
	// Not ideal, but better than UA sniffing.
	if ("MozAppearance" in root.style) {
		// determine the vertical scrollbar width
		var scrollbarWidth = root.clientWidth;
		root.style.overflow = "scroll";
		scrollbarWidth -= root.clientWidth;
		root.style.overflow = "";
		// create a synthetic scroll event
		var scrollEvent = doc.createEvent("UIEvent")
		scrollEvent.initEvent("scroll", true, true);
		// event dispatcher
		function scrollHandler() {
			doc.dispatchEvent(scrollEvent)
		}
		// detect mouse events in the document scrollbar track
		doc.addEventListener("mousedown", function(e) {
			if (e.clientX > root.clientWidth - scrollbarWidth) {
				doc.addEventListener("mousemove", scrollHandler, false);
				doc.addEventListener("mouseup", function() {
					doc.removeEventListener("mouseup", arguments.callee, false);
					doc.removeEventListener("mousemove", scrollHandler, false);
				}, false)
			}
		}, false)
		// override mouse wheel behaviour.
		doc.addEventListener("DOMMouseScroll", function(e) {
			// Don't disable hot key behaviours
			if (!e.ctrlKey && !e.shiftKey) {
				root.scrollTop += e.detail * 16;
				scrollHandler.call(this, e);
				e.preventDefault()
			}
		}, false)
	}
})(document);
/*---- parallaxing item animation properties ----*/
var parallaxDomItems = new Array();
var parallaxItems = new Array();
parallaxItems.push({x:689,y:1113,dir:45,rot:180,speed:3000,p1:0.0000,p2:0.0000});
parallaxItems.push({x:1277,y:895,dir:270,rot:180,speed:3000,p1:0.0000,p2:0.0000});
parallaxItems.push({x:1556,y:1425,dir:55,rot:180,speed:3000,p1:0.0000,p2:0.0000});
parallaxItems.push({x:2007,y:1090,dir:17,rot:180,speed:3000,p1:0.6583,p2:0.6833});
parallaxItems.push({x:3154,y:936,dir:10,rot:800,speed:1000,p1:0.6583,p2:0.6833}); //5
parallaxItems.push({x:3650,y:924,dir:310,rot:720,speed:3000,p1:0.4875,p2:0.5125});
parallaxItems.push({x:535,y:1875,dir:180,rot:1000,speed:3000,p1:0.8292,p2:0.8542});
parallaxItems.push({x:2309,y:1761,dir:180,rot:180,speed:5000,p1:0.1458,p2:0.1708});
parallaxItems.push({x:2850,y:2240,dir:164,rot:720,speed:3000,p1:0.1458,p2:0.1708});
parallaxItems.push({x:3994,y:1974,dir:130,rot:180,speed:3000,p1:0.4016,p2:0.4016}); //10
parallaxItems.push({x:4456,y:1475,dir:90,rot:360,speed:3000,p1:0.4216,p2:0.4216});
parallaxItems.push({x:1326,y:3153,dir:315,rot:720,speed:5000,p1:1.0000,p2:1.0000});
parallaxItems.push({x:1963,y:2989,dir:140,rot:180,speed:6000,p1:1.0000,p2:1.0000});
parallaxItems.push({x:3868,y:2936,dir:-45,rot:720,speed:3000,p1:0.3167,p2:0.3417});
parallaxItems.push({x:5012,y:2933,dir:180,rot:720,speed:3000,p1:0.3167,p2:0.3417});
/*---- camera path samples ----*/
var cameraPath = new Array();
cameraPath.push({x:1000,y:1040,p:0.0000,a:"#content-page-1"});
cameraPath.push({x:1320,y:850,p:0.0220,a:""});
cameraPath.push({x:1620,y:890,p:0.0327,a:""});
cameraPath.push({x:1760,y:930,p:0.0379,a:""});
cameraPath.push({x:1910,y:1000,p:0.0437,a:""});
cameraPath.push({x:1990,y:1060,p:0.0473,a:""});
cameraPath.push({x:2080,y:1150,p:0.0518,a:""});
cameraPath.push({x:2160,y:1270,p:0.0569,a:""});
cameraPath.push({x:2250,y:1450,p:0.0640,a:""});
cameraPath.push({x:2340,y:1590,p:0.0699,a:""});
cameraPath.push({x:2480,y:1730,p:0.0770,a:""});
cameraPath.push({x:2640,y:1840,p:0.0838,a:""});
cameraPath.push({x:2800,y:1910,p:0.0900,a:""});
cameraPath.push({x:2990,y:1970,p:0.0971,a:""});
cameraPath.push({x:3250,y:2030,p:0.1066,a:""});
cameraPath.push({x:3500,y:2070,p:0.1155,a:""});
cameraPath.push({x:3740,y:2110,p:0.1242,a:""});
cameraPath.push({x:3970,y:2160,p:0.1325,a:""});
cameraPath.push({x:4170,y:2220,p:0.1399,a:""});
cameraPath.push({x:4326,y:2280,p:0.1458,a:"#content-page-2"});
cameraPath.push({x:4326,y:2280,p:0.1708,a:"#content-page-2"});
cameraPath.push({x:4620,y:2430,p:0.1821,a:""});
cameraPath.push({x:4860,y:2600,p:0.1921,a:""});
cameraPath.push({x:5000,y:2740,p:0.1989,a:""});
cameraPath.push({x:5140,y:2920,p:0.2066,a:""});
cameraPath.push({x:5250,y:3130,p:0.2147,a:""});
cameraPath.push({x:5470,y:3640,p:0.2336,a:""});
cameraPath.push({x:5590,y:3860,p:0.2422,a:""});
cameraPath.push({x:5730,y:4070,p:0.2508,a:""});
cameraPath.push({x:5910,y:4270,p:0.2600,a:""});
cameraPath.push({x:6060,y:4400,p:0.2667,a:""});
cameraPath.push({x:6220,y:4500,p:0.2732,a:""});
cameraPath.push({x:6440,y:4590,p:0.2813,a:""});
cameraPath.push({x:6640,y:4640,p:0.2883,a:""});
cameraPath.push({x:6810,y:4650,p:0.2941,a:""});
cameraPath.push({x:7020,y:4640,p:0.3013,a:""});
cameraPath.push({x:7200,y:4600,p:0.3075,a:""});
cameraPath.push({x:7330,y:4550,p:0.3123,a:""});
cameraPath.push({x:7440,y:4484,p:0.3167,a:"#content-page-3"});
cameraPath.push({x:7440,y:4484,p:0.3417,a:"#content-page-3"});
cameraPath.push({x:7560,y:4380,p:0.3474,a:""});
cameraPath.push({x:7660,y:4250,p:0.3532,a:""});
cameraPath.push({x:7720,y:4110,p:0.3587,a:""});
cameraPath.push({x:7750,y:3970,p:0.3638,a:""});
cameraPath.push({x:7760,y:3840,p:0.3685,a:""});
cameraPath.push({x:7760,y:1800,p:0.4415,a:""});
cameraPath.push({x:7750,y:1640,p:0.4472,a:""});
cameraPath.push({x:7700,y:1450,p:0.4542,a:""});
cameraPath.push({x:7590,y:1220,p:0.4634,a:""});
cameraPath.push({x:7420,y:1000,p:0.4733,a:""});
cameraPath.push({x:7260,y:850,p:0.4812,a:""});
cameraPath.push({x:7120,y:742,p:0.4875,a:"#content-page-4"});
cameraPath.push({x:7120,y:742,p:0.5125,a:"#content-page-4"});
cameraPath.push({x:6930,y:650,p:0.5213,a:""});
cameraPath.push({x:6750,y:600,p:0.5291,a:""});
cameraPath.push({x:6460,y:550,p:0.5413,a:""});
cameraPath.push({x:6200,y:530,p:0.5521,a:""});
cameraPath.push({x:5900,y:520,p:0.5646,a:""});
cameraPath.push({x:5570,y:530,p:0.5784,a:""});
cameraPath.push({x:5120,y:560,p:0.5971,a:""});
cameraPath.push({x:4590,y:620,p:0.6193,a:""});
cameraPath.push({x:4120,y:690,p:0.6391,a:""});
cameraPath.push({x:3666,y:782,p:0.6583,a:"#content-page-5"});
cameraPath.push({x:3666,y:782,p:0.6833,a:"#content-page-5"});
cameraPath.push({x:3400,y:880,p:0.6949,a:""});
cameraPath.push({x:3070,y:1020,p:0.7096,a:""});
cameraPath.push({x:820,y:2090,p:0.8113,a:""});
cameraPath.push({x:690,y:2160,p:0.8173,a:""});
cameraPath.push({x:580,y:2250,p:0.8231,a:""});
cameraPath.push({x:494,y:2370,p:0.8292,a:"#content-page-6"});
cameraPath.push({x:494,y:2370,p:0.8542,a:"#content-page-6"});
cameraPath.push({x:460,y:2480,p:0.8596,a:""});
cameraPath.push({x:450,y:2590,p:0.8648,a:""});
cameraPath.push({x:470,y:2700,p:0.8701,a:""});
cameraPath.push({x:510,y:2800,p:0.8752,a:""});
cameraPath.push({x:560,y:2900,p:0.8804,a:""});
cameraPath.push({x:650,y:3030,p:0.8879,a:""});
cameraPath.push({x:800,y:3210,p:0.8989,a:""});
cameraPath.push({x:1050,y:3530,p:0.9181,a:""});
cameraPath.push({x:1270,y:3830,p:0.9356,a:""});
cameraPath.push({x:1540,y:4220,p:0.9580,a:""});
cameraPath.push({x:1780,y:4620,p:0.9800,a:""});
cameraPath.push({x:1860,y:4780,p:0.9884,a:""});
cameraPath.push({x:1910,y:4890,p:0.9941,a:""});
cameraPath.push({x:1950,y:5008,p:1.0000,a:"#content-page-7"});
cameraPath.push({x:1950,y:5008,p:1.0300,a:"#content-page-7"});

function AOFResetCameraPathIpad() {
	cameraPath = new Array();
	cameraPath.push({x:1000,y:1040,p:0.00,a:"#content-page-1"});
	cameraPath.push({x:4326,y:2280,p:0.17,a:"#content-page-2"});
	cameraPath.push({x:7440,y:4484,p:0.34,a:"#content-page-3"});
	cameraPath.push({x:7120,y:742,p:0.51,a:"#content-page-4"});
	cameraPath.push({x:3666,y:782,p:0.68,a:"#content-page-5"});
	cameraPath.push({x:494,y:2370,p:0.85,a:"#content-page-6"});
	cameraPath.push({x:1950,y:5008,p:1.00,a:"#content-page-7"});
}
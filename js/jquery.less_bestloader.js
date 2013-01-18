/**
	Attention, this is a lesser version of the plugin.
*/
(function(a){a.fn.less_bestloader=function(b){return this.each(function(){var b=a(this),c=a("<span />").addClass("loader").css({"background-position":"left bottom"});b.prepend(c);var d=24;c.data("animation",setInterval(function(){if(d==24*20)d=0;c.css({"background-position":" -"+d+"px"+" bottom"});d=d+24},30));b.on("stoploader",function(){var a=c.data("animation");clearTimeout(a);c.fadeOut(180,function(){c.remove()});b.off("stoploader")})})}})(jQuery)
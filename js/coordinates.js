$(document).ready(function() { 
		   $spin = $(".spinner");
		   spinTop = ($(window).height()-24)/2+"px";
		   spinLeft = ($(window).width()-24)/2+"px";
		   	  
			  $spin.css({
                   left:spinLeft,
				   top:spinTop
                   });
				   
				   
				   		   $logo = $(".logo");

						   logoWidth = $logo.width();
						   logoLeft = ($(window).width()-logoWidth)/2+"px";

					$logo.css({
                   left:logoLeft
                   });
				   				   $logo.fadeIn("slow").css("display","block");

});



$(window).bind("load", function() { 
    
       var footerHeight = 0,
           footerTop = 0,
           $footer = $("#layer-menu");
		   $footermenu = $("#main-menu-content");
           
       positionFooter();

       function positionFooter() {
       
                footerHeight = $footer.height();
				footerWidth = $footermenu.width();
				
                footerTop = ($(window).height()-footerHeight)+35+"px";
				
               

				footerLeft = ($(window).width()-footerWidth)/2+"px";

                   $footer.css({
                   top: footerTop
                   });
				   
				   $footermenu.css({
                   left:footerLeft
                   });
				   
				  
				   
			
				   
				   $footer.fadeIn("slow").css("display","block");
				   $spin.trigger('stoploader');
				   $("#carre-wrapper").addClass('enhanced');
               
       }
	   
	     

       $(window)
               .scroll(positionFooter)
               .resize(positionFooter)
               
});
// JavaScript Document

$(function()

{
	
var path = $("#main-menu-items li");
	
	

	path.hover(function(){
		
		var browserName = navigator.appName; // explorer için
		
		var imgurl =$(this).css('background-image');
		var sonuc = imgurl.substring(imgurl.lastIndexOf('/') + 1); //anasayfa) böyle sonuç verdi.
		var len = sonuc.length;
		
		
		if ((browserName == 'Microsoft Internet Explorer') || ($.browser.mozilla == true) || (browserName == 'Opera'))
		{
		var son = sonuc.substring(0,len-2); //parantez kaldırıldı.
		}
		else
		{
		var son = sonuc.substring(0,len-1); //parantez kaldırıldı.
		}


						
		$(this).css('background-image','url(img/menu/over/'+ son +')');
		
		},
		
		function()
		{
			
		var browserName = navigator.appName;
		var imgurl =$(this).css('background-image');
		var sonuc = imgurl.substring(imgurl.lastIndexOf('/') + 1); //anasayfa) böyle sonuç verdi.
		var len = sonuc.length;
		if ((browserName == 'Microsoft Internet Explorer') || ($.browser.mozilla == true) || (browserName == 'Opera'))
		{
		var son = sonuc.substring(0,len-2); //parantez kaldırıldı.
		}
		else
		{
		var son = sonuc.substring(0,len-1); //parantez kaldırıldı.
		}
			
					$(this).css('background-image','url(img/menu/pasif/'+ son +')');			
		}
		
		 );
	
});
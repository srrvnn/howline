function showElement(xpath) {

	var all_elements_on_page = document.getElementsByTagName('*');

	for(var i=0 ; i<all_elements_on_page.length ; i++) 
	{
		all_elements_on_page[i].className = all_elements_on_page[i].className.replace(/\bshowinred\b/,'');
		all_elements_on_page[i].className = all_elements_on_page[i].className.replace(/\bshowingreen\b/,'');

	}

	var element = document.evaluate( "//"+xpath ,document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue;	
	element.style.border = "6px solid black";
}

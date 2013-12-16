function showElement(xpath) {

	var element = document.evaluate( "//"+xpath ,document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue;	
	element.style.border = "6px solid black";
}

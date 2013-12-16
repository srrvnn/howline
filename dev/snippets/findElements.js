	// function to return xpath given an element 

	function getPathTo(node){

		var comp, comps = [];
		var parent = null;
		var xpath = '';
		var getPos = function(node) {
			var position = 1, curNode;
			if (node.nodeType == Node.ATTRIBUTE_NODE) {
				return null;
			}
			for (curNode = node.previousSibling; curNode; curNode = curNode.previousSibling) {
				if (curNode.nodeName == node.nodeName) {
					++position;
				}
			}
			return position;
		}

		if (node instanceof Document) {
			return '/';
		}

		for (; node && !(node instanceof Document); node = node.nodeType == Node.ATTRIBUTE_NODE ? node.ownerElement : node.parentNode) {
			comp = comps[comps.length] = {};
			switch (node.nodeType) {
				case Node.TEXT_NODE:
				comp.name = 'text()';
				break;
				case Node.ATTRIBUTE_NODE:
				comp.name = '@' + node.nodeName;
				break;
				case Node.PROCESSING_INSTRUCTION_NODE:
				comp.name = 'processing-instruction()';
				break;
				case Node.COMMENT_NODE:
				comp.name = 'comment()';
				break;
				case Node.ELEMENT_NODE:
				comp.name = node.nodeName;
				break;
			}
			comp.position = getPos(node);
		}

		for (var i = comps.length - 1; i >= 0; i--) {
			comp = comps[i];
			xpath += '/' + comp.name;
			if (comp.position != null) {
				xpath += '[' + comp.position + ']';
			}
		}

		return xpath;
	}

	// function to return an element's position on the page

	function getPageXY(element){
		var x= 0, y= 0;
		while (element) {
			x+= element.offsetLeft;
			y+= element.offsetTop;
			element= element.offsetParent;
		}

		return [x, y];
	}

	function getTop(element){

		return element.getBoundingClientRect().top;
	}

	function getRight(element){

		return element.getBoundingClientRect().right;
	}

	function getBottom(element){

		return element.getBoundingClientRect().bottom;
	}

	function getLeft(element){

		return element.getBoundingClientRect().left;
	}



	// add class styles to be used further

	var style = document.createElement('style');	
	style.type = 'text/css';
	style.innerHTML = '.showingreen { border: 2px solid green; } .showinred { border: 2px solid red} .increasePadding1 { padding: 25px} .increasePadding2 { padding: 40px}';	
	document.getElementsByTagName('head')[0].appendChild(style);

	// on a click, calculate friend elements are log their xpaths. 

	document.onclick = function(event) {

		event.preventDefault();

		// remove showingreen and showinred classes from all elements

		var all_elements_on_page = document.getElementsByTagName('*');

		for(var i=0 ; i<all_elements_on_page.length ; i++) 
		{
			all_elements_on_page[i].className = all_elements_on_page[i].className.replace(/\bshowinred\b/,'');
			all_elements_on_page[i].className = all_elements_on_page[i].className.replace(/\bshowingreen\b/,'');

		}

		// clicks++;	
		// console.log(clicks);		
			
	    if (event === undefined) event = window.event;                   // IE hack
	    var target = 'target' in event? event.target : event.srcElement; // IE hack

	    var root = document.compatMode==='CSS1Compat'? document.documentElement : document.body;
	    var mxy = [event.clientX+root.scrollLeft, event.clientY+root.scrollTop];

	    // console.log(target);

	    // get xpath of the target element

	    // var path = getPathTo(target);
	    // console.log('xpath (Target): ' +path);

	    // TODO return elements array with xpath

	    var array_xpath_elements = new Array();
	    array_xpath_elements = findElements(target);   

		// for(var idx = 0; idx < array_xpath_elements.length; idx++)
		// {
		// 	console.log(array_xpath_elements[idx]);

		// 	// show all these elements. 

		// 	//var element = document.evaluate( '//'+xpathTopElements[idx] ,document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue;
		// 	//console.log(element);
		// }

		// findElements(target);

	    // var txy= getPageXY(target);
	    // alert('Clicked element '+path+' offset '+(mxy[0]-txy[0])+', '+(mxy[1]-txy[1]));    
	}

	/*function getPathTo(element) {
	    /*if (element.id!=='')
	        return 'id("'+element.id+'")';
	    if (element===document.body)
	        return element.tagName;

	    var ix= 0;
	    var siblings= element.parentNode.childNodes;
	    for (var i= 0; i<siblings.length; i++) {
	        var sibling= siblings[i];
	        if (sibling===element)
	            return getPathTo(element.parentNode)+'/'+element.tagName+'['+(ix+1)+']';
	        if (sibling.nodeType===1 && sibling.tagName===element.tagName)
	            ix++;
	    }
	}*/

	function findElements(element) {

		// var topElements = new Array();
		// var j = 0;

		var target_element_coordinates = getPageXY(element);

		var xpathTopElements = new Array();	

		var all_elements_on_page = document.getElementsByTagName('*');
		var leaf_elements_on_page = new Array();
		var top_elements_on_page = new Array();

		// console.log("Count of all elements on page: " + all_elements_on_page.length);

		// looping through all elements to find required ones 

		for(var i = 0; i < all_elements_on_page.length; i++){

			// getting current element

			var current_element = all_elements_on_page[i];

			// getting the coordinates of this element

			var xyCoordAllElem = getPageXY(all_elements_on_page[i]);				
			var left_current_element = getTop(current_element);
			var bottom_current_element	= getBottom(current_element);
			
			// checking if the element is a leaf node
			
			if( all_elements_on_page[i].childNodes.length === 1 && all_elements_on_page[i].firstChild.nodeType === 3){

				leaf_elements_on_page.push(current_element);			

				// show the target element in red 

				if(all_elements_on_page[i] == element){

					current_element.className = current_element.className + " showinred";
				}

				else{				

					// checking if the current element is placed above the target element			
					
					if(bottom_current_element <= target_element_coordinates[1])
					{

						top_elements_on_page.push(current_element);

						//console.log(all_elements_on_page[i]);
						//console.log(xyCoordAllElem[1]+'\n');

						// all_elements_on_page[i].className += 'greenStyleClass';

						current_element.className = current_element.className + " showingreen";

						//all_elements_on_page[i].style.display = "block";
						
						if((typeof current_element != 'undefined') && current_element.tagName != 'SCRIPT' && current_element.tagName != 'STYLE' && current_element.tagName != 'META' && current_element.tagName != 'NOSCRIPT' && current_element.tagName != 'TITLE')
						{
							/*all_elements_on_page[i].className = 'increasePadding1';
							var newtarget_element_coordinates = getPageXY(element);
							if( target_element_coordinates != newtarget_element_coordinates)
							{
						
							//console.log('element change for'+all_elements_on_page[i].tagName);*/

							xpathTopElements.push(getPathTo(current_element));

							/*all_elements_on_page[i].className = all_elements_on_page[i].className.replace(/\bincreasePadding1\b/,'');
							}
							else
							{
							console.log('no change');
							all_elements_on_page[i].className = 'increasePadding2';
							var newtarget_element_coordinates2 = getPageXY(element);
							if( target_element_coordinates != newtarget_element_coordinates2)
							{
						
								console.log('element change for'+all_elements_on_page[i].tagName);
								all_elements_on_page[i].className = all_elements_on_page[i].className.replace(/\bincreasePadding2\b/,'');
							}
						}*/
						}
					}	
				}	
			}

		//console.log(all_elements_on_page[i]);
		}

		for  (var idx = 0; idx < xpathTopElements.length; idx ++)
		{
			console.log(xpathTopElements[idx]);

			var element = document.evaluate( "/"+xpathTopElements[idx] ,document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue;	
			element.style.border = "2px solid green";
		}

		console.log("All elemens on page: " + all_elements_on_page.length);
		console.log("Leaf elements on page: " + leaf_elements_on_page.length);
		console.log("Top and Leaf elements on page: " + top_elements_on_page.length);

		return xpathTopElements;
	}	

	function showElement(xpath) {

		var all_elements_on_page = document.getElementsByTagName('*');

		for(var i=0 ; i<all_elements_on_page.length ; i++) 
		{
			all_elements_on_page[i].className = all_elements_on_page[i].className.replace(/\bshowinred\b/,'');
			all_elements_on_page[i].className = all_elements_on_page[i].className.replace(/\bshowingreen\b/,'');

		}

		var element = document.evaluate( "//"+xpath ,document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue;	
		element.style.border = "6px solid red";
	}


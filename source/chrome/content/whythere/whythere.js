// tutorials page: http://www.softwareishard.com/blog/firebug-tutorial/extending-firebug-inspector-part-x/
// full source code here : https://code.google.com/p/fbug/source/browse/#svn%2Fexamples%2Ffirebug1.7%2FLinkInspector

/* See license.txt for terms of usage */

FBL.ns(function() { with (FBL) {

// ********************************************************************************************* //
// Tracing 

Components.utils.import("resource://firebug/firebug-trace-service.js");
var FBTrace = traceConsoleService.getTracer("extensions.firebug");

// ********************************************************************************************* //
// Panel

var panelName = "linkInspector";
var global_document = "";

/**
 * @panel This panel integrates with Firebug Inspector API and provides own logic
 * and display of custom information for links. This code serves as an example of
 * how to properly use and implement Inspector.
 */
function LinkInspectorPanel() {}
LinkInspectorPanel.prototype = extend(Firebug.Panel,
/** @lends LinkInspectorPanel */
{
    // var script = document.createElement('script');
    // script.src = 'http://jqueryjs.googlecode.com/files/jquery-1.2.6.min.js';
    // script.type = 'text/javascript';
    // document.getElementsByTagName('head')[0].appendChild(script);

    name: panelName,
    title: "Whythere",
    inspectable: true,    
    inspectHighlightColor: "green",       
    inspecting_node : "",
    // parentPanel: "html", // srrvnn: moves positioning panel to the side. TODO: make it work. 

    // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //
    // Initialization

    initialize: function()
    {
        Firebug.Panel.initialize.apply(this, arguments);
        Firebug.Inspector.addListener(this); 

        if (FBTrace.DBG_WHYTHERE)
            FBTrace.sysout("initialize panel function called"); 



    },

    destroy: function(state)
    {
        Firebug.Panel.destroy.apply(this, arguments);

        Firebug.Inspector.removeListener(this);

        if (FBTrace.DBG_WHYTHERE)
            FBTrace.sysout("destroy panel function called");       
    },

    show: function(state)
    {
        Firebug.Panel.show.apply(this, arguments);

        LinkInspectorPlate.defaultContent.replace({}, this.panelNode);

        if (FBTrace.DBG_WHYTHERE)
            FBTrace.sysout("show panel function called");       
    },

    // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //
    // Inspector API implementation

    startInspecting: function()
    {
        if (FBTrace.DBG_WHYTHERE)
            FBTrace.sysout("link-inspector; startInspecting()");
    },

    inspectNode: function(node)
    {

        // compute all required values here, when an element is inspected.

        if (FBTrace.DBG_WHYTHERE)
            FBTrace.sysout("link-inspector; inspectNode(node: " + node.tagName + ")");

        var rect = node.getBoundingClientRect();
        // FBTrace.sysout("this element is at " + rect.top + "," + rect.right + "," + rect.bottom + "," + rect.left);

        // create node with required values. 

        var newnode = {

            "x" : Math.round(rect.left * 100) / 100,
            "y" : Math.round(rect.top * 100) / 100            
            };

        LinkInspectorPlate.linkUrl.replace( {object: newnode}, this.panelNode);
    },

    stopInspecting: function(node, canceled)
    {       

        if (FBTrace.DBG_WHYTHERE)
            FBTrace.sysout("link-inspector; stopInspecting(node: " + node.tagName +
                ", canceled: " + canceled + ")");

        if (canceled)
            return;        

        // srrvnn: testing jquery, TODO: find out how jquery can run on this page. 

        /* if (typeof jQuery != 'undefined') {
            
            alert("this shows!");
        } */

        // function to geth the path to the selected node  
        // function sourced from : http://stackoverflow.com/questions/2631820/im-storing-click-coordinates-in-my-db-and-then-reloading-them-later-and-showing/2631931#2631931     

        function getPathTo(node) {

            // if (node.id!=='')
            //     return 'id("'+node.id+'")';
            if (node===node.ownerDocument.body)
                return "//"+node.tagName;

            var ix= 0;
            var siblings= node.parentNode.childNodes;
            for (var i= 0; i<siblings.length; i++) {
                var sibling= siblings[i];
                if (sibling===node)
                    return getPathTo(node.parentNode)+'/'+node.tagName+'['+(ix+1)+']';
                if (sibling.nodeType===1 && sibling.tagName===node.tagName)
                    ix++;
            }
        }      

        function getPathTo2(node){

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
                return '//';
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

        // function to increase values by one. 
        // srrvnn: i am proud i wrote this in a few minutes :P

        function change_by_one(value, direction){

            var number = value.replace(/[^-\d\.]/g, '');
            var unit = value.replace(number, '').trim();

            if(number == "") number = "0";
            if(unit == "") unit = "px"; 

            var newvalue = "";

            if(direction == "plus")
                newvalue = Number(number) + 1; 
            else newvalue = Number(number) - 1; 

            console.log(newvalue + "" +unit);
            return newvalue+unit; 

            alert("new value after click "+ newvalue+unit);
        }

        // function to detect visibility of an element    

		/**
		* Author: Jason Farrell
		* Author URI: http://useallfive.com/
		*
		* Description: Handles all things involving element visibility.
		* Package URL: https://github.com/UseAllFive/ua5-js-utils
		*/

        var VISIBILITY = (function() {

            /**
            * Checks if a DOM element is visible. Takes into
            * consideration its parents and overflow.
            *
            * @param (el)      the DOM element to check if is visible
            *
            * These params are optional that are sent in recursively,
            * you typically won't use these:
            *
            * @param (t)       Top corner position number
            * @param (r)       Right corner position number
            * @param (b)       Bottom corner position number
            * @param (l)       Left corner position number
            * @param (w)       Element width number
            * @param (h)       Element height number
            */

            function _isVisible(el, t, r, b, l, w, h) {

                // Application.console.log("isVisible called");

                var s1 = 0;
                var s2 = 0;
                var s3 = 0;
                var s4 = 0;

                var p = el.parentNode,
                VISIBLE_PADDING = 2;

                // if ( !_elementInDocument(el) ) {
                //     Application.console.log("rejected in step1");
                //     return false;                  
                // }

                //-- Return true for document node
                if ( 9 === p.nodeType ) {
                    return true;

                    // Application.console.log("rejected in step 2")
                }

                //-- Return false if our element is invisible
                if (
                    '0' === _getStyle(el, 'opacity') ||
                    'none' === _getStyle(el, 'display') ||
                    'hidden' === _getStyle(el, 'visibility')
                    ) {

                    // Application.console.log("rejected in step 3");
                    return false;
                }

                if ( 
                'undefined' === typeof(t) ||
                'undefined' === typeof(r) ||
                'undefined' === typeof(b) ||
                'undefined' === typeof(l) ||
                'undefined' === typeof(w) ||
                'undefined' === typeof(h)
                ) {
                t = el.offsetTop;
                l = el.offsetLeft;
                b = t + el.offsetHeight;
                r = l + el.offsetWidth;
                w = el.offsetWidth;
                h = el.offsetHeight;
                }
                //-- If we have a parent, let's continue:
                if ( p ) {
                //-- Check if the parent can hide its children.
                if ( ('hidden' === _getStyle(p, 'overflow') || 'scroll' === _getStyle(p, 'overflow')) ) {
                  //-- Only check if the offset is different for the parent
                  if (
                    //-- If the target element is to the right of the parent elm
                    l + VISIBLE_PADDING > p.offsetWidth + p.scrollLeft ||
                    //-- If the target element is to the left of the parent elm
                    l + w - VISIBLE_PADDING < p.scrollLeft ||
                    //-- If the target element is under the parent elm
                    t + VISIBLE_PADDING > p.offsetHeight + p.scrollTop ||
                    //-- If the target element is above the parent elm
                    t + h - VISIBLE_PADDING < p.scrollTop
                    ) {
                    //-- Our target element is out of bounds:
                // Application.console.log("rejected in step 4")
                return false;

                s3++;
                }
                }
                //-- Add the offset parent's left/top coords to our element's offset:
                if ( el.offsetParent === p ) {
                  l += p.offsetLeft;
                  t += p.offsetTop;
                }
                //-- Let's recursively check upwards:
                return _isVisible(p, t, r, b, l, w, h);
                }
                return true;
                }

                //-- Cross browser method to get style properties:
                function _getStyle(el, property) {
                    if ( window.getComputedStyle ) {
                        return el.ownerDocument.defaultView.getComputedStyle(el,null)[property];  
                    }
                    if ( el.currentStyle ) {
                        return el.currentStyle[property];
                    }
                }

                // function _elementInDocument(element) {
                //     while (element = element.parentNode) {
                //         if (element == document) {
                //             return true;
                //         }
                //     }
                //     return false;
                // }

                return {
                    'getStyle' : _getStyle,
                    'isVisible' : _isVisible
                }

            })();                    

        // code to add style classes to the document 

        var style = node.ownerDocument.createElement('style');    
        style.type = 'text/css';
        style.innerHTML = '.showingreen { border: 2px solid green; } .showinred { border: 2px solid red} .increasePadding1 { padding: 25px} .increasePadding2 { padding: 40px}';    

        node.ownerDocument.getElementsByTagName('head')[0].appendChild(style);

        // function to calculate affecting elements on page
        // developed by apoorva shetti. 

        function findElements(element) {

            // var topElements = new Array();
            // var j = 0;            

            var target_element_coordinates = getPageXY(element);
            var top_target_element = getTop(element);

            var xpathTopElements = new Array(); 

            var all_elements_on_page = element.ownerDocument.getElementsByTagName('*');           

            var leaf_elements_on_page = new Array();
            var leafbutone_elements_on_page = new Array();
            var top_elements_on_page = new Array();
            var qualified_elements_on_page = new Array();           

            // looping through all elements to find required ones             

            for(var i = 0; i < all_elements_on_page.length; i++){

                // getting current element

                var current_element = all_elements_on_page[i];

                // getting the coordinates of this element

                var xyCoordAllElem = getPageXY(all_elements_on_page[i]);                
                var left_current_element = getLeft(current_element);
                var bottom_current_element  = getBottom(current_element);

                // checking if the element is a leaf node, to see if it has only one child and it is a text node (3).

                // if( all_elements_on_page[i].childNodes.length === 1 && all_elements_on_page[i].firstChild.nodeType === 3){
                if(true){

                    leaf_elements_on_page.push(current_element);     
                    // leafbutone_elements_on_page.push(current_element.parentNode);       

                    // show the target element in red 

                    if(all_elements_on_page[i] == element){

                    // current_element.className = current_element.className + " showinred";
                    }

                    else {               

                        // checking if the current element is placed above the target element           

                        if(bottom_current_element <= target_element_coordinates[1] && xyCoordAllElem[1] >= 0)
                        {

                            top_elements_on_page.push(current_element);

                            // checking if the elements quality as visible elements

                            if((typeof current_element != 'undefined') && current_element.tagName != 'SCRIPT' && current_element.tagName != 'STYLE' && current_element.tagName != 'META' && current_element.tagName != 'NOSCRIPT' && current_element.tagName != 'TITLE' && VISIBILITY.isVisible(current_element) && current_element.tagName != 'OPTION' )
                            {
                                qualified_elements_on_page.push(current_element);                                
                                // xpathTopElements.push(getPathTo(current_element));                                    

                                // checking changes to the current element affects the target element. 

                                // current_element.className = current_element.className +" increasePadding1";



                                var newtarget_element_coordinates = getPageXY(element);              

                                var current_element_padding = current_element.style["paddingTop"];
                                var current_element_margin = current_element.style["marginTop"];                                

                                // changing the padding and margin by 10px

                                current_element.style["paddingTop"] = change_by_one(element.style["paddingTop"], "plus");
                                current_element.style["paddingTop"] = change_by_one(element.style["paddingTop"], "plus");
                                current_element.style["paddingTop"] = change_by_one(element.style["paddingTop"], "plus");
                                current_element.style["paddingTop"] = change_by_one(element.style["paddingTop"], "plus");
                                current_element.style["paddingTop"] = change_by_one(element.style["paddingTop"], "plus");

                                current_element.style["marginTop"] = change_by_one(element.style["marginTop"], "plus"); 
                                current_element.style["marginTop"] = change_by_one(element.style["marginTop"], "plus"); 
                                current_element.style["marginTop"] = change_by_one(element.style["marginTop"], "plus"); 
                                current_element.style["marginTop"] = change_by_one(element.style["marginTop"], "plus"); 
                                current_element.style["marginTop"] = change_by_one(element.style["marginTop"], "plus"); 

                                var newertarget_element_coordinates = getPageXY(element);              

                                // alert(target_element_coordinates[1]);

                                // alert(newtarget_element_coordinates[1]);                  
                                
                                if(newertarget_element_coordinates[1] != newtarget_element_coordinates[1])
                                {

                                    xpathTopElements.push(getPathTo(current_element));                                    

                                    // Application.console.log('element change for'+all_elements_on_page[i].tagName);*/                               

                                // all_elements_on_page[i].className = all_elements_on_page[i].className.replace(/\bincreasePadding1\b/,'');
                                }

                                current_element.style["paddingTop"] = current_element_padding;
                                current_element.style["marginTop"] = current_element_margin; 

                                // else
                                // {
                                //     Application.console.log('no change');
                                //     all_elements_on_page[i].className = 'increasePadding2';
                                //     var newtarget_element_coordinates2 = getPageXY(element);
                                //     if( target_element_coordinates != newtarget_element_coordinates2)
                                //     {

                                //         Application.console.log('element change for'+all_elements_on_page[i].tagName);
                                //         all_elements_on_page[i].className = all_elements_on_page[i].className.replace(/\bincreasePadding2\b/,'');
                                //     }
                                // }
                            }
                        }   
                    }   
                }

                //Application.console.log(all_elements_on_page[i]);
            }

            // for  (var idx = 0; idx < xpathTopElements.length; idx ++)
            // {

            // Application.console.log(xpathTopElements[idx]);

            // var element = element.ownerDocument.evaluate(xpathTopElements[idx] ,element.ownerDocument, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue;    
            // element.style.border = "2px solid green";

            // }

            Application.console.log("All elements on page: " + all_elements_on_page.length);
            Application.console.log("Leaf elements on page: " + leaf_elements_on_page.length);
            // Application.console.log("Leaf But one elements on page: " + leafbutone_elements_on_page.length);
            Application.console.log("Top and Leaf elements on page: " + top_elements_on_page.length);
            Application.console.log("Qualified elements on page: "+ qualified_elements_on_page.length );
            Application.console.log("Qualified and Visible Elements on page: " + xpathTopElements.length);

            return xpathTopElements;
        }

        var options_array =  new Array();

        // pushing the click element first into the array to be displayed first. 

        var node_xpath = getPathTo(node);       
        var options_attributes = ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "marginTop", "marginRight", "marginBottom", "marginLeft"];            

        var options_node = {

            id : "0",
            xpath : node_xpath,            
            attributes : options_attributes
        }

        options_array.push(options_node);

        var array_xpath_elements = findElements(node);   
        // alert("Returned " + array_xpath_elements.length + " elements");        

        // pushing all affecting elements into the array 

        for(var e = 0; e < array_xpath_elements.length; e++){

            var options = {
                id : Number(e)+1,
                xpath : array_xpath_elements[e],
                attributes : options_attributes
            };

            options_array.push(options);
        }        

        LinkInspectorPlate.linkPreview.replace({array: options_array}, this.panelNode);
        global_document = node.ownerDocument;                
    },

    supportsObject: function(object, type)
    {
        // choose what kind of elemets to support. 

        if (object instanceof Element){

            return 1; // support all elements. 
        }

        return 0;
    },

    // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //
    // Inspector Listener

    onStartInspecting: function(context)
    {
        if (FBTrace.DBG_WHYTHERE)
            FBTrace.sysout("link-inspector; Listener.onStartInspecting(context: " +
                context.getTitle() + ")");
    },

    onInspectNode: function(context, node)
    {
        if (FBTrace.DBG_WHYTHERE)
            FBTrace.sysout("link-inspector; Listener.onInspectNode(context: " +
                context.getTitle() + ", node: " + node.tagName + ")");
    },

    onStopInspecting: function(context, node, canceled)
    {
        if (FBTrace.DBG_WHYTHERE)
            FBTrace.sysout("link-inspector; Listener.onStopInspecting(context: " +
                context.getTitle() + ", node: " + node.tagName + ", canceled: " +
                canceled + ")");
    },   

    makeChange: function(xpath, attr, direction){        

        function change_by_one(value, direction){

            var number = value.replace(/[^-\d\.]/g, '');
            var unit = value.replace(number, '').trim();

            if(number == "") number = "0";
            if(unit == "") unit = "px"; 

            var newvalue = "";

            if(direction == "plus")
                newvalue = Number(number) + 1; 
            else newvalue = Number(number) - 1; 

            console.log(newvalue + "" +unit);
            return newvalue+unit; 

            alert("new value after click "+ newvalue+unit);
        }

        // alert("from makeChange: "+xpath);
        // alert("from makeChange: "+attr);      

        var element = global_document.evaluate(xpath, global_document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue;                           
        element.style[attr] = change_by_one(element.style[attr], direction);  
        
    }, 

    showElement: function(xpath){

        var element = global_document.evaluate(xpath, global_document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue;                           

        var orig = element.style.border;
        element.style.border = '2px solid red';
        setTimeout(function(){
            element.style.border = orig;
        }, 1000);        
    }
});

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //

var LinkInspectorPlate = domplate(
{

    // display required values here. 

    linkUrl:        
        DIV({"class": "linkUrl"},
            "(" + "$object.x" + " , " + "$object.y" + ")"
        ),

    linkPreview: 
        DIV({"class" : "container"},
        	DIV({"class" : "button-row"},
        		"Element 0 : Clicked Element. Elements 1.2.3.. : Affecting Elements. Click on 'Element' to see the element. Click on '+' and '-' to move them around."
        		),
            FOR("object", "$array",
                DIV({"class": "button-row"}, 
                    A({"class": "element", onclick: "$showElement", data_xpath: "$object.xpath"},
                        "Element " + "$object.id"
                    ),                       
                    FOR("item", "$object.attributes",
                        "$item",                 
                        A({"class":"plusbutton", onclick: "$changeAttribute", data_xpath: "$object.xpath", data_attr: "$item", data_direction: "plus"},
             
                           "+"
                        ),
                        A({"class":"minusbutton", onclick: "$changeAttribute", data_xpath: "$object.xpath", data_attr: "$item", data_direction: "minus"},

                           "-"
                        )
                    )
                )
            )
        ),

    defaultContent:
        DIV({"class": "defaultContent"},
            "Use the Inspector Icon to select an element and see other elements on the page that affect it's position."
        ), 

    changeAttribute: function(event)
    {   

        var xpath = event.target.getAttribute('data_xpath'); 
        var direction = event.target.getAttribute('data_direction');
        var attr = event.target.getAttribute('data_attr');

        // alert("from changeAttribute: " + xpath);
        // alert("from changeAttribute: " + attr);

        LinkInspectorPanel.prototype.makeChange(xpath, attr, direction);        
    }, 

    showElement: function(event)
    {
        var xpath = event.target.getAttribute('data_xpath');

        LinkInspectorPanel.prototype.showElement(xpath);
    }
});

// ********************************************************************************************* //
// Module & Customizing Tracing

/**
 * @module The module object isn't really neccessary for the Inspector API. It serves
 * only to support Firebug tracing console, which is useful when debugging inspector
 * features.
 */
Firebug.LinkInspectorModule = extend(Firebug.Module,
/** @lends Firebug.LinkInspectorModule */
{
    initialize: function()
    {
        Firebug.Module.initialize.apply(this, arguments);

        if (Firebug.TraceModule) 
            Firebug.TraceModule.addListener(this);
    },

    shutdown: function()
    {
        Firebug.Module.shutdown.apply(this, arguments);

        if (Firebug.TraceModule)
            Firebug.TraceModule.removeListener(this);
    },

    // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //
    // Trace Listener

    onLoadConsole: function(win, rootNode)
    {
        appendStylesheet(rootNode.ownerDocument, "chrome://whythere/skin/classic/whythere.css");
    },

    onDump: function(message)
    {
        var index = message.text.indexOf("link-inspector;");
        if (index == 0)
        {
            message.text = message.text.substr("link-inspector;".length);
            message.text = trim(message.text);
            message.type = "DBG_WHYTHERE";
        }
    }
});

// ********************************************************************************************* //
// Registration

Firebug.registerPanel(LinkInspectorPanel);
// Firebug.registerModule(Firebug.LinkInspectorModule);
Firebug.registerStylesheet("chrome://whythere/skin/classic/whythere.css");

// ********************************************************************************************* //
}});

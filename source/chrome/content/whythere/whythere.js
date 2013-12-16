/* See license.txt for terms of usage */

FBL.ns(function() { with (FBL) {


// ********************************************************************************************* //
// Tracing 

Components.utils.import("resource://firebug/firebug-trace-service.js");
var FBTrace = traceConsoleService.getTracer("extensions.firebug");

// ********************************************************************************************* //
// Panel

var panelName = "linkInspector";
var global_node = "";

/**
 * @panel This panel integrates with Firebug Inspector API and provides own logic
 * and display of custom information for links. This code serves as an example of
 * how to properly use and implement Inspector.
 */
function LinkInspectorPanel() {}
LinkInspectorPanel.prototype = extend(Firebug.Panel,
/** @lends LinkInspectorPanel */
{
    name: panelName,
    title: "Positions",
    inspectable: true,
    inspectHighlightColor: "green",       
    inspecting_node : "",
    // parentPanel: "html",

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

        

        // function to geth the path to the selected node        

        function getPathTo(node) {

            // if (node.id!=='')
            //     return 'id("'+node.id+'")';
            if (node===node.ownerDocument.body)
                return node.tagName;

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

        // function showElement(node, xpath) {            

        //     var element = node.ownerDocument.evaluate( "//"+xpath ,node.ownerDocument, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue;   
        //     element.style.border = "6px solid black";
        // }               

        var node_xpath = getPathTo(node); 

        // alert(node_xpath);

        if (FBTrace.DBG_WHYTHERE)
            FBTrace.sysout("link-inspector; stopInspecting(node: " + node.tagName +
                ", canceled: " + canceled + ")");

        if (canceled)
            return;

        var position_object = {
            id : node.id,                                     
            xpath : node_xpath,
            attributes : ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"]            
        };        

        LinkInspectorPlate.linkPreview.replace({object: position_object}, this.panelNode);

        global_node = node.ownerDocument;
        // alert(global_node);
    },

    supportsObject: function(object, type)
    {

        // choose what kind of elemets to support. 

        if (object instanceof Element)
        {

            return 1; // support all elements. 

            // if (object.tagName.toLowerCase() == "a")
                // return 1;
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

    fuckthisshit: function(xpath, attr){

        // alert("from fuckthishit: "+xpath);
        // alert("from fuckthishit: "+attr);

        var doc = global_node;        
        var element = doc.evaluate( "//"+xpath ,doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue;                   
        
        element.style[attr] = "100px";
        
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
        DIV({"class": "buttons"},                        
            FOR("item", "$object.attributes",
                SPAN({"class":"button", onclick: "$handleClick", data_xpath: "$object.xpath"},
     
                   "$item"
                )
            )
        ),

    defaultContent:
        DIV({"class": "defaultContent"},
            "Use Positions to try and move around an element on the current page."
        ), 

    handleClick: function(event)
    {   

        var x = event.target.getAttribute('data_xpath'); 
        var a = event.target.innerHTML;

        // alert("from handleClick: " + event.target.getAttribute('data_xpath'));
        // alert("from handleClick: " + event.target.innerHTML);

        LinkInspectorPanel.prototype.fuckthisshit(x, a);

        // var element_attribute = event.target.innerHTML;
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

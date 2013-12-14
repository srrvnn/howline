/* See license.txt for terms of usage */

FBL.ns(function() { with (FBL) {


// ********************************************************************************************* //
// Tracing 

Components.utils.import("resource://firebug/firebug-trace-service.js");
var FBTrace = traceConsoleService.getTracer("extensions.firebug");

if (FBTrace.DBG_WHYTHERE)
    FBTrace.sysout("Hello World!");

// ********************************************************************************************* //
// Panel

var panelName = "linkInspector";

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
    title: "Link Inspector 1",
    inspectable: true,
    inspectHighlightColor: "green",   
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
        FBTrace.sysout("this element is at " + rect.top + "," + rect.right + "," + rect.bottom + "," + rect.left);

        // create node with required values. 

        var newnode = {

            "x" : Math.round(rect.left * 100) / 100,
            "y" : Math.round(rect.top * 100) / 100
        };

        LinkInspectorPlate.linkUrl.replace({object: newnode}, this.panelNode);
    },

    stopInspecting: function(node, canceled)
    {
        if (FBTrace.DBG_WHYTHERE)
            FBTrace.sysout("link-inspector; stopInspecting(node: " + node.tagName +
                ", canceled: " + canceled + ")");

        if (canceled)
            return;

        // if (node.href.indexOf("http") != 0)
        //     return;

        LinkInspectorPlate.linkPreview.replace({object: node}, this.panelNode);
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
        DIV({"class": "linkPreview"},
            "We will now display all dependent elements on this page."
        ),

    defaultContent:
        DIV({"class": "defaultContent"},
            "Use Positions to try and move around an element on the current page."
        )
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
Firebug.registerModule(Firebug.LinkInspectorModule);
Firebug.registerStylesheet("chrome://whythere/skin/classic/whythere.css");

// ********************************************************************************************* //
}});

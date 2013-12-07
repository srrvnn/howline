FBL.ns(function() { with (FBL) {

function HelloWorldPanel() {}
HelloWorldPanel.prototype = extend(Firebug.Panel,
{
    name: "HelloWorld",
    title: "Hello Good World!",

    initialize: function() {
      Firebug.Panel.initialize.apply(this, arguments);
    },
});

Firebug.registerPanel(HelloWorldPanel);

}});
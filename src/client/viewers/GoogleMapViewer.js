const GoogleMapHelper = require("./GoogleMapHelper")
const TerminusClient = require('@terminusdb/terminus-client');

function GoogleMapViewer(options){}

GoogleMapViewer.prototype.getDOM = function(renderer, dataviewer){
	var value = renderer.value();
	var ty = TerminusClient.FrameHelper.getShorthand(renderer.frame.getType());
	ty = (ty ? ty : renderer.frame.getType())
		var map = document.createElement("div");
	map.setAttribute('class', "gmap-window gmap-viewer");
	var self = this;
	var ghelper = new GoogleMapHelper();
	ghelper.initMap(map, renderer, value, ty);		
    return map;
}

module.exports={GoogleMapViewer};
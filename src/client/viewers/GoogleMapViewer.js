const GoogleMapHelper = require("./GoogleMapHelper")

function GoogleMapViewer(options){}

GoogleMapViewer.prototype.getDOM = function(renderer, dataviewer){
	var value = renderer.value();
	var ty = TerminusClient.FrameHelper.getShorthand(renderer.frame.range);
	var map = document.createElement("div");
	map.setAttribute('class', "gmap-window gmap-viewer");
	var self = this;
	var ghelper = new GoogleMapHelper();
	ghelper.initMap(map, renderer, value, ty);		
    return map;
}

module.exports={GoogleMapViewer};
const GoogleMapHelper = require("./GoogleMapHelper")

function GoogleMapViewer(options){}

GoogleMapViewer.prototype.renderFrame = function(frame, dataviewer){
	return this.render(frame.get());
}

GoogleMapViewer.prototype.renderValue = function(dataviewer){
	return this.render(dataviewer.value());
}
	
GoogleMapViewer.prototype.render = function(value){
	var map = document.createElement("div");
	map.setAttribute('class', "gmap-window gmap-viewer");
	var self = this;
	var ghelper = new GoogleMapHelper();
	ghelper.initMap(map, value, this.type);		
    return map;
}

module.exports={GoogleMapViewer};
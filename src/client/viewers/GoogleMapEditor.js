const GoogleMapHelper = require("./GoogleMapHelper")

function GoogleMapEditor(options){}

GoogleMapEditor.prototype.getDOM = function(renderer, dataviewer){
	var value = renderer.value();
	var ty = TerminusClient.FrameHelper.getShorthand(renderer.frame.getType());
	ty = (ty ? ty : renderer.frame.getType())
	var mapcontainer = document.createElement("div");
	mapcontainer.setAttribute('class', "gmap-window gmap-editor");
	var self = this;
	var ghelper = new GoogleMapHelper();
	var map = ghelper.initMap(mapcontainer, renderer, value, ty);
    if(ty == "xdd:coordinate"){
	    google.maps.event.addListener(map, 'click', function(event) {
	    	var position = event.latLng;
	    	var coo = "[" + position.lat() + "," + position.lng() + "]";
	    	renderer.set(coo);
	        ghelper.clearMarkers();
	        var init = {
	    		position: position, 
	    		map: map
	    	}
	    	var marker = new google.maps.Marker(init);
	    	ghelper.markers.push(marker);
	  	});
	}
    else {
    	google.maps.event.addListener(map, 'click', function(event) {
        	var path = ghelper.polyline.getPath();
        	path.push(event.latLng);
      	    var position = event.latLng;
      	    ghelper.addMarker(position, map, renderer, '#' + path.getLength(), ty);
      	});
    }
    return mapcontainer;
}

module.exports={GoogleMapEditor};
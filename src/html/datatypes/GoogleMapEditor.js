const GoogleMapHelper = require("./GoogleMapHelper")
function GoogleMapEditor(options){}

GoogleMapEditor.prototype.renderFrame = function(frame, dataviewer){
	var mapcontainer = document.createElement("div");
	mapcontainer.setAttribute('class', "gmap-window gmap-editor");
	var self = this;
	var ghelper = new GoogleMapHelper();
	var map = ghelper.initMap(mapcontainer, value, this.type);
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
      	    ghelper.addMarker(position, map, frame, '#' + path.getLength(), this.type);
      	});
    }
    return mapcontainer;
}

module.exports={GoogleMapEditor};
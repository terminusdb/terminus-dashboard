function GoogleMapHelper(options){
	this.polygon = false;
	this.polyline = false;
	this.markers = [];
	this.init(options);
}

GoogleMapHelper.prototype.init = function(config){
	this.type = ((config && config.type) ? config.type: 'Shape'); 
	this.width = ((config && config.width) ? config.width : '400px'); 
	this.height = ((config && config.height ) ? config.height : '400px'); 
	this.mapLat = ((config && config.mapLat) ? config.mapLat : '41.9010004'); 
	this.mapLong = ((config && config.mapLong ) ? config.mapLong : '12.500061500000015');
	this.zoom = ((config && config.zoom) ? config.zoom : 3);
	this.stroke = ((config && config.stroke) ? config.stroke : { color: '#FF0000', opacity: 0.3, weight: 3});
	this.fill = ((config && config.fill) ? config.fill : { color: '#FF0000', opacity: 0.1});
	this.line = ((config && config.line) ? config.line : { color: '#000000', opacity: 0.9, weight: 3});
}

GoogleMapHelper.prototype.destroy = function(){
    this.clear();
} 

GoogleMapHelper.prototype.translatePolygonToArray = function(polygon){
   var data = "[";
   var vertices = polygon.getPath();
   var seenValue = false;
   for (var j=0; j<vertices.getLength(); j++){
       if(seenValue){
           data = data + ",";
       }
       var xy = vertices.getAt(j);
       data = data + "[" + xy.lat() + "," + xy.lng() + "]"
       seenValue = true;
   }
   data = data + "]";
   return data;
};

GoogleMapHelper.prototype.translateArrayToPolygon = function(array){
   var jsonified = JSON.parse(array);
   var output = [];
   for(var i=0;i<jsonified.length;i++){
       var latlong = {}
       latlong.lat = jsonified[i][0];
       latlong.lng = jsonified[i][1];
       output.push(latlong);
   }
   return output;
}

GoogleMapHelper.prototype.createPolygon = function(coords, map) {
	var polygon = new google.maps.Polygon({
        paths: coords,
        strokeColor: this.stroke.color,
        strokeOpacity: this.stroke.opacity,
        strokeWeight: this.stroke.weight,
        fillColor: this.fill.color,
        fillOpacity: this.fill.opacity
	});
    polygon.setMap(map);
	return polygon;
}

GoogleMapHelper.prototype.createPolyline = function(coords){
	var init = {
	      strokeColor: this.line.color,
	      strokeOpacity: this.line.opacity,
	      strokeWeight: this.line.weight
	};
	if(coords){
		init.paths = coords;
	}
	var poly = new google.maps.Polyline(init);
	return poly;
}

GoogleMapHelper.prototype.clearMarkers = function() {
	for (var i = 0; i < this.markers.length; i++ ) {
		this.markers[i].setMap(null);
	}
	this.markers.length = 0;
}


GoogleMapHelper.prototype.addMarker = function(position, map, frame, title, ty) {
	var init = {
		position: position, 
		map: map
	}
	if(title){
		init.title = title;
	}
	var marker = new google.maps.Marker(init);
	var self = this;
	if(this.markers.length == 0 && ty == "xdd:coordinatePolygon"){
     	marker.addListener('click', function() {
			var coords = self.getCoordsFromMarkers();
    		self.polygon = self.createPolygon(coords, map);
            self.clearMarkers();
            self.polyline.setMap(null);
            frame.set(self.translatePolygonToArray(self.polygon));
        });                	
    }
	this.markers.push(marker);
	if(ty == "xdd:coordinatePolyline"){
		var x = this.translatePolygonToArray(this.polyline);
		frame.set(x);
	}
	return marker;
}

GoogleMapHelper.prototype.getCoordsFromMarkers = function(){
	return this.polyline.getPath();
}

GoogleMapHelper.prototype.clear = function(){
	if(this.polygon) {
		this.polygon.setMap(null);
		this.polygon = false;
	}
	if(this.polyline) {
		this.clearMarkers();
		this.polyline.setMap(null);
	}
}

GoogleMapHelper.prototype.initMap = function(mapContainer, value, type){
	mapContainer.style.width = this.width;
	mapContainer.style.height = this.height;
	if(typeof google == "undefined"){
		alert("google is not effing loaded");
		return false;
	}
	var map = new google.maps.Map(mapContainer, {
	    zoom: this.zoom,
		center: {lat: parseFloat(this.mapLat), lng: parseFloat(this.mapLong)}  
	});
	if(type == "xdd:coordinatePolygon"){
	    this.polyline = this.createPolyline();
		this.polyline.setMap(map);
		var coords = (value ? this.translateArrayToPolygon(value) : []);
		if(value){
	    	this.polygon = this.createPolygon(coords, map);
	    }
	}
	else if(type == "xdd:coordinatePolyline"){
		var coords = (value ? this.translateArrayToPolygon(value) : []);
	    this.polyline = this.createPolyline();
		this.polyline.setMap(map);		
		if(value){
	    	this.polyline.setPath(coords);
	    }
	}	
	else if(type == "xdd:coordinate"){
		if(value){
			this.clearMarkers();
            var lat = parseFloat(value.substring(1, value.indexOf(",")));
			var long = parseFloat(value.substring(value.indexOf(",")+1, value.length-1));
            var init = {
            	position: {lat: lat, lng: long},
        		map: map
	        }
	        var marker = new google.maps.Marker(init);
	        this.markers.push(marker);
		}
	}
    google.maps.event.trigger(map, 'resize');
    return map;
}

module.exports=GoogleMapHelper;
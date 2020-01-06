function HTMLCoordinateViewer(options){
	this.inputs = [];
}

HTMLCoordinateViewer.prototype.parseValue = function(value){
	try {
		var parsed = (value ? JSON.parse(value) : false);
		if(parsed && this.type == "xdd:coordinate"){
			parsed = [parsed];
		}
		return parsed;
	}
	catch(e){
		this.error = this.type + " value " + value + " failed to parse as json", e.toString();
		return [];
	}
}


HTMLCoordinateViewer.prototype.renderFrame = function(frame, dataviewer){
	return this.render(frame.get());
}

HTMLCoordinateViewer.prototype.renderValue = function(dataviewer){
	return this.render(dataviewer.value());
}

HTMLCoordinateViewer.prototype.render = function(value){ 
	var input = document.createElement("span");
	input.setAttribute('class', "terminus-literal-value terminus-literal-coordinate");
	if(value){
		input.setAttribute('data-value', value);		
		var parsed = this.parseValue(value);
		if(parsed){
			for(var i = 0; i < parsed.length; i++){
				var lldom = document.createElement("span");
				lldom.setAttribute("class", "latlong");
				lldom.appendChild(document.createTextNode("Latitude: "));
				lldom.appendChild(document.createTextNode(parsed[i][0] + " °" + " "));
				lldom.appendChild(document.createTextNode("Longitude: "));
				lldom.appendChild(document.createTextNode(parsed[i][1] + " °" ));
				input.appendChild(lldom);
			}
		}
		else {
			input.setAttribute("title", this.error);
		}
	}
	return input;
}

module.exports={HTMLCoordinateViewer}


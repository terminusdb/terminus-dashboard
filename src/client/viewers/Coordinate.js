const TerminusClient = require('@terminusdb/terminus-client');

function HTMLCoordinateViewer(options){
	this.inputs = [];
}

HTMLCoordinateViewer.prototype.getDOM = function(renderer, dataviewer){
	var ty = TerminusClient.FrameHelper.getShorthand(renderer.frame.getType());
	ty = (ty ? ty : renderer.frame.getType());
	var value = renderer.value();
	var input = document.createElement("span");
	input.setAttribute('class', "terminus-literal-value terminus-literal-coordinate");
	input.setAttribute('data-value', value);
	try {
		var parsed = (value ? JSON.parse(value) : false);
	}
	catch(e){
		renderer.badData(ty + " failed to parse as json", e.toString());
		var parsed = false;
		value = false;
	}
	if(value){
		if(ty == "xdd:coordinate"){
			parsed = [parsed];
		}
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
	return input;
}

module.exports={HTMLCoordinateViewer}


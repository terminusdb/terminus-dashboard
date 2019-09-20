const FrameHelper = require('../FrameHelper');
const RenderingMap = require('../RenderingMap');

function HTMLCoordinateViewer(options){
	this.inputs = [];
}

HTMLCoordinateViewer.prototype.getDOM = function(renderer, dataviewer){
	var ty = FrameHelper.getShorthand(renderer.frame.range);
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


function HTMLCoordinateEditor(options){
	this.inputs = [];
}

HTMLCoordinateEditor.prototype.getInputDOMs = function(lat, long, change){
	var latdom = document.createElement("input");
	latdom.setAttribute("type", "text");
	latdom.value = lat;
	var longdom = document.createElement("input");
	longdom.setAttribute("type", "text");
	longdom.value = long;
	latdom.addEventListener("change", change);
	longdom.addEventListener("change", change);
	return [latdom, longdom];
}

HTMLCoordinateEditor.prototype.getLatLongDOM = function(lat, long, ty, index, parent){
	var lldom = document.createElement("span");
	lldom.setAttribute("class", "terminus-lat-long");
	var firstcol = document.createElement("span");
	firstcol.setAttribute("class", "terminus-lat-long-col");
	lldom.appendChild(firstcol);
	if(index > 2 || (ty == "xdd:coordinatePolyline" && index > 1)){
		var delbut = document.createElement("button");
		delbut.setAttribute("class", "delete-coordinate");
		delbut.appendChild(document.createTextNode("Remove"));
		delbut.addEventListener("click", function(){
			long.value = "";
			lat.value = "";
			parent.removeChild(lldom);
		});
		firstcol.appendChild(delbut);
	}
	lldom.appendChild(document.createTextNode("Latitude: "));
	lldom.appendChild(lat);
	lldom.appendChild(document.createTextNode(" °" + " "));
	lldom.appendChild(document.createTextNode("  Longitude: "));
	lldom.appendChild(long);
	lldom.appendChild(document.createTextNode(" ° " ));
	return lldom;
}


HTMLCoordinateEditor.prototype.getDOM = function(renderer, dataviewer){
	var ty = FrameHelper.getShorthand(renderer.frame.range);
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
	var self = this;
	var updateValueFromForm = function(){
		var vals = [];
		for(var i = 0; i<self.inputs.length; i++){
			if(self.inputs[i][0].value && self.inputs[i][1].value){
				var val = "[" + self.inputs[i][0].value + "," + self.inputs[i][1].value + "]";
				vals.push(val);
			}
		}
		if(vals.length == 0){
			renderer.set("");
		}
		else if(ty == "xdd:coordinate"){
			renderer.set(vals[0]);
		}
		else {
			var op = "[";
			for(var i = 0; i<vals.length; i++){
				op += vals[i];
				if(i+1 < vals.length) op += ",";
			}
			op += "]";
			renderer.set(op);
		}
	};
	if(!parsed){
		if(ty == "xdd:coordinate") parsed = ["",""];
		else {
			parsed = [["",""],["",""]];
			if(ty == "xdd:coordinatePolygon") parsed.push(["",""]);
		}
	}
	if(ty == "xdd:coordinate"){
		parsed = [parsed];
	}
	for(var i = 0; i < parsed.length; i++){
		this.inputs.push(this.getInputDOMs(parsed[i][0], parsed[i][1], updateValueFromForm))
	}
	var lldoms = document.createElement("span");
	for(var i = 0; i < this.inputs.length; i++){
		var lldom = this.getLatLongDOM(this.inputs[i][0], this.inputs[i][1], ty, i, lldoms);
		lldoms.appendChild(lldom);
	}
	input.appendChild(lldoms);
	var self = this;
	if(ty != "xdd:coordinate"){
		var butspan = document.createElement("span");
		butspan.setAttribute("class", "terminus-add-coordinate")
		var addbut = document.createElement("button");
		addbut.setAttribute("class", "terminus-add-coordinate");
		addbut.appendChild(document.createTextNode("Add"));
		addbut.addEventListener("click", function(){
			var ipdoms = self.getInputDOMs("", "", updateValueFromForm);
			var lldom = self.getLatLongDOM(ipdoms[0], ipdoms[1], ty, self.inputs.length, lldoms);
			lldoms.appendChild(lldom);
			self.inputs.push(ipdoms);
		});
		butspan.appendChild(addbut);
		input.appendChild(butspan);			
	}
	return input;
}

RenderingMap.registerViewerForTypes("HTMLCoordinateViewer", "Coordinate Viewer", ["xdd:coordinate", "xdd:coordinatePolyline", "xdd:coordinatePolygon"]);
RenderingMap.registerEditorForTypes("HTMLCoordinateEditor", "Coordinate Editor", ["xdd:coordinate", "xdd:coordinatePolyline", "xdd:coordinatePolygon"]);



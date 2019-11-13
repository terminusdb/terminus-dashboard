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


HTMLCoordinateEditor.prototype.renderFrame = function(frame, dataviewer){
	var value = frame.get();
	var input = document.createElement("span");
	input.setAttribute('class', "terminus-literal-value terminus-literal-coordinate");
	input.setAttribute('data-value', value);
	try {
		var parsed = (value ? JSON.parse(value) : false);
	}
	catch(e){
		this.error = this.type + " failed to parse as json", e.toString();
		var parsed = false;
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
			frame.set("");
		}
		else if(this.type == "xdd:coordinate"){
			frame.set(vals[0]);
		}
		else {
			var op = "[";
			for(var i = 0; i<vals.length; i++){
				op += vals[i];
				if(i+1 < vals.length) op += ",";
			}
			op += "]";
			frame.set(op);
		}
	};
	if(!parsed){
		if(this.type == "xdd:coordinate") parsed = ["",""];
		else {
			parsed = [["",""],["",""]];
			if(this.type == "xdd:coordinatePolygon") parsed.push(["",""]);
		}
	}
	if(this.type == "xdd:coordinate"){
		parsed = [parsed];
	}
	for(var i = 0; i < parsed.length; i++){
		this.inputs.push(this.getInputDOMs(parsed[i][0], parsed[i][1], updateValueFromForm))
	}
	var lldoms = document.createElement("span");
	for(var i = 0; i < this.inputs.length; i++){
		var lldom = this.getLatLongDOM(this.inputs[i][0], this.inputs[i][1], this.type, i, lldoms);
		lldoms.appendChild(lldom);
	}
	input.appendChild(lldoms);
	var self = this;
	if(this.type != "xdd:coordinate"){
		var butspan = document.createElement("span");
		butspan.setAttribute("class", "terminus-add-coordinate")
		var addbut = document.createElement("button");
		addbut.setAttribute("class", "terminus-add-coordinate");
		addbut.appendChild(document.createTextNode("Add"));
		addbut.addEventListener("click", function(){
			var ipdoms = self.getInputDOMs("", "", updateValueFromForm);
			var lldom = self.getLatLongDOM(ipdoms[0], ipdoms[1], this.type, self.inputs.length, lldoms);
			lldoms.appendChild(lldom);
			self.inputs.push(ipdoms);
		});
		butspan.appendChild(addbut);
		input.appendChild(butspan);			
	}
	return input;
}

module.exports={HTMLCoordinateEditor}
function SimpleDocument(){}

SimpleDocument.prototype.render = function(frame){
	var s = document.createElement("div");
	for(var p in frame.properties){
		var pr = this.renderProperty(frame.properties[p])
		if(pr) s.appendChild(pr);
	}
	return s;
}

SimpleDocument.prototype.renderProperty = function(frame){
	var s = document.createElement("div");
	s.appendChild(document.createTextNode(frame.getLabel() + ": "));
	for(var i = 0 ; i < frame.values.length; i++){
		if(frame.values[i].isData()){
			var pr = this.renderValue(frame.values[i]);
		}
		else {
			var pr = this.render(frame.values[i]);			
		}
		if(pr) s.appendChild(pr);
	}
	return s;
}

SimpleDocument.prototype.renderValue = function(frame){
	var s = document.createElement("span");
	s.appendChild(document.createTextNode(frame.get() + " "));
	return s;
}

module.exports = SimpleDocument;
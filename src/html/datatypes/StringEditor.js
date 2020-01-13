function HTMLStringEditor(options){
	this.options(options);	
}

HTMLStringEditor.prototype.options = function(options){	
	this.css = ((options && options.css) ? "terminus-literal-value " + options.css : "terminus-literal-value");
	this.opts = options;
}

HTMLStringEditor.prototype.renderFrame = function(frame, dataviewer){
	var value = frame.get();
	var big = ((this.opts && typeof this.opts.big != "undefined") ? this.opts.big : this.isBigType(this.type, value));
	if(big){
		var input = document.createElement("textarea");
		this.css += " terminus-literal-big-value";		
	}
	else {
		var size = ((this.opts && typeof this.opts.size != "undefined") ? this.opts.size : this.getTypeSize(this.type, value));
		var input = document.createElement("input");
		input.setAttribute('type', "text");
		input.setAttribute('size', size);
	}
	input.setAttribute('class', this.css);
	input.setAttribute("data-value", value);
	
	input.value = value;
	var self = this;
	input.addEventListener("input", function(){
		frame.set(this.value);
	});
	return input;
}

HTMLStringEditor.prototype.isBigType = function(ty, value){
	if(value && value.length && value.length > 100) return true;
	var longs = ["xdd:coordinatePolyline", "xdd:coordinatePolygon", "xsd:base64Binary", "xdd:html", "xdd:json", "rdf:XMLLiteral"];
	if(longs.indexOf(ty) == -1) return false;
	return true;
}

HTMLStringEditor.prototype.getTypeSize = function(ty, value){
	if(value && value.length && value.length > 40) return 80;
	var bigs = ["xdd:url", "xdd:coordinate", "xsd:anyURI"];
	var smalls = ["xsd:gYearMonth", "xdd:gYearRange", "xsd:decimal", "xsd:float", "xsd:time", "xsd:date", 
		"xsd:dateTimeStamp","xsd:gYearMonth", "xsd:gMonthDay", "xsd:duration", "xsd:yearMonthDuration", "xsd:dayTimeDuration", 
		"xsd:nonNegativeInteger", "xsd:positiveInteger", "xsd:negativeInteger",	"xsd:nonPositiveInteger", "xsd:integer","xsd:unsignedInt"];
	var tinys = ["xsd:boolean", "xsd:gYear", "xsd:gMonth", "xsd:gDay", "xsd:byte", "xsd:short", "xsd:unsignedByte", "xsd:language"];
	if(bigs.indexOf(ty) != -1) return 80;
	if(smalls.indexOf(ty) != -1) return 16;
	if(tinys.indexOf(ty) != -1) return 8;
	return 32;
}

module.exports={HTMLStringEditor}



const FrameHelper = require('../../FrameHelper');

function HTMLStringEditor(options){
	this.css = ((options && options.css) ? "terminus-literal-value " + options.css : "terminus-literal-value");
	this.options = options; 
}

HTMLStringEditor.prototype.getDOM = function(renderer, dataviewer){
	var ty = FrameHelper.getShorthand(renderer.frame.range);
	var value = renderer.value();
	var big = ((this.options && typeof this.options.big != "undefined") ? this.options.big : this.isBigType(ty, value));
	if(big){
		var input = document.createElement("textarea");
		this.css += " terminus-literal-big-value";		
	}
	else {
		var size = ((this.options && typeof this.options.size != "undefined") ? this.options.size : this.getTypeSize(ty, value));
		var input = document.createElement("input");
		input.setAttribute('type', "text");
		input.setAttribute('size', size);
	}
	input.setAttribute('class', this.css);
	input.value = value;
	var self = this;
	input.addEventListener("input", function(){
		renderer.set(this.value);
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



function HTMLNumberViewer(options){
	this.commas = (options && options.commas ? options.commas : true);
}

HTMLNumberViewer.prototype.getDOM = function(renderer, dataviewer){
	var value = renderer.value();
	if(value === 0) value = "0";
	var input = document.createElement("span");
	input.setAttribute('class', 'terminus-number-value terminus-literal-value');
	input.setAttribute('data-value', value);
	value = (this.commas ? FrameHelper.numberWithCommas(value) : value);
	input.appendChild(document.createTextNode(value));
	return input;
}

RenderingMap.registerViewerForTypes("HTMLNumberViewer", "Number with commas", 
		["xsd:decimal", "xsd:double", "xsd:float", "xsd:short", "xsd:integer", "xsd:long", 
			"xsd:nonNegativeInteger", "xsd:positiveInteger", "xsd:negativeInteger", "xsd:nonPositiveInteger"]);

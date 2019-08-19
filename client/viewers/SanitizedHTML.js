function SantizedHTMLViewer(options){
	this.css = ((options && options.css) ? "literal-value " + options.css : "literal-value");
}

SantizedHTMLViewer.prototype.getDOM = function(renderer, dataviewer){
	var val = renderer.value();
	var input = document.createElement("span");
	input.setAttribute('class', this.css);
	input.setAttribute('data-value', val);
	input.innerHTML = val;
	return input;
}

RenderingMap.registerViewerForTypes("SantizedHTMLViewer", "Sanitized HTML", ["xsd:string", "xdd:html"]);

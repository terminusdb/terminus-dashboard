const RenderingMap = require('../RenderingMap');
function HTMLLinkViewer(options){
	this.css = "terminus-literal-value terminus-literal-value-range " + ((options && options.css) ?  options.css : "");
}

HTMLLinkViewer.prototype.getDOM = function(renderer, dataviewer){
	var value = renderer.value();
	var input = document.createElement("span");
	input.setAttribute('class', this.css);
	input.setAttribute('size', 80);
	input.setAttribute('data-value', value);
	if(value){
		var a = document.createElement("a");
		a.setAttribute('href', value);
		a.appendChild(document.createTextNode(value));
		input.appendChild(a);
	}
	return input;
}

RenderingMap.registerViewerForTypes("HTMLLinkViewer", "Link Viewer", ["xdd:url", "xsd:anyURI"]);

const RenderingMap = require('../RenderingMap');

function HTMLBooleanViewer(options){
	this.css = "terminus-literal-value terminus-literal-value-range " + ((options && options.css) ?  options.css : "");
}

HTMLBooleanViewer.prototype.getDOM = function(renderer, dataviewer){
	var value = renderer.value();
	var input = document.createElement("span");
	input.setAttribute('class', this.css);
	if(value){
		var vallab = document.createTextNode(value);
		input.appendChild(vallab);
	}
	return input;
}

RenderingMap.registerViewerForTypes("HTMLBooleanViewer", "Checkbox Viewer", ["xsd:boolean"]);

module.exports={HTMLBooleanViewer}


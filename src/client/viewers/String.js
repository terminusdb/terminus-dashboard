const FrameHelper = require('../../FrameHelper');

function HTMLStringViewer(options){
	this.size = ((options && options.size) ? options.size : false);
	this.css = ((options && options.css) ? "terminus-literal-value " + options.css : "terminus-literal-value");
}

HTMLStringViewer.prototype.getDOM = function(renderer, dataviewer){
	var value = renderer.value();
	var input = document.createElement("span");
	input.setAttribute('class', this.css);
	input.setAttribute('data-value', value);
	value = document.createTextNode(value);
	input.appendChild(value);
	return input;
}

module.exports={HTMLStringViewer}



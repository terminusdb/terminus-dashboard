function SantizedHTMLViewer(options){
	this.css = ((options && options.css) ? "literal-value " + options.css : "literal-value");
}

SantizedHTMLViewer.prototype.render = function(value){
	var input = document.createElement("span");
	input.setAttribute('class', this.css);
	input.setAttribute('data-value', value);
	input.innerHTML = value;
	return input;
}

SantizedHTMLViewer.prototype.renderFrame = function(frame, dataviewer){
	var value = frame.get();
	return this.render(value);
}

SantizedHTMLViewer.prototype.renderValue = function(dataviewer){
	return this.render(dataviewer.value());
}

module.exports={SantizedHTMLViewer}

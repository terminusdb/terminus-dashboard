function HTMLLinkViewer(options){
	this.options(options);
}

HTMLLinkViewer.prototype.options = function(options){
	this.css = "terminus-literal-value terminus-literal-value-range " + ((options && options.css) ?  options.css : "");
}

HTMLLinkViewer.prototype.renderFrame = function(frame, dataviewer){
	return this.render(frame.get());
}

HTMLLinkViewer.prototype.renderValue = function(dataviewer){
	return this.render(dataviewer.value());
}
	
HTMLLinkViewer.prototype.render = function(value){
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

module.exports={HTMLLinkViewer}


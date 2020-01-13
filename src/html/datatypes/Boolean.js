function HTMLBooleanViewer(options){
	this.options(options);
}

HTMLBooleanViewer.prototype.options = function(options){
	this.css = "terminus-literal-value terminus-literal-value-boolean " + ((options && options.css) ?  options.css : "");
}

HTMLBooleanViewer.prototype.renderFrame = function(frame, dataviewer){
	return this.render(frame.get());
}

HTMLBooleanViewer.prototype.renderValue = function(dataviewer){
	return this.render(dataviewer.value());	
}

HTMLBooleanViewer.prototype.render = function(value){
	var input = document.createElement("span");
	input.setAttribute('class', this.css);
	if(value){
		var vallab = document.createTextNode(value);
		input.appendChild(vallab);
	}
	return input;
}


module.exports={HTMLBooleanViewer}


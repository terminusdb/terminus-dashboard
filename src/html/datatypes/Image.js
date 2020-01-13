function HTMLImageViewer(options){}

HTMLImageViewer.prototype.options = function(options){}


HTMLImageViewer.prototype.renderFrame = function(frame, dataviewer){
	return this.render(frame.get());
}

HTMLImageViewer.prototype.renderValue = function(dataviewer){
	return this.render(dataviewer.value());
}
	
HTMLImageViewer.prototype.render = function(value){
	var input = document.createElement("span");
	input.setAttribute('class', "terminus-literal-value terminus-literal-image-value");
	input.setAttribute('data-value', value);
	if(value){
		var img = document.createElement("a");
		img.setAttribute('src', value);
		input.appendChild(img);
	}
	return input;
}

module.exports={HTMLImageViewer}



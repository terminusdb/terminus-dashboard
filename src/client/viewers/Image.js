function HTMLImageViewer(options){}
HTMLImageViewer.prototype.getDOM = function(renderer, dataviewer){
	var value = renderer.value();
	var ty = TerminusClient.FrameHelper.getShorthand(renderer.frame.range);
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



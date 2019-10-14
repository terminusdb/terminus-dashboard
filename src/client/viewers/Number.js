const TerminusClient = require('@terminusdb/terminus-client');
function HTMLNumberViewer(options){
	this.commas = (options && options.commas ? options.commas : true);
}

HTMLNumberViewer.prototype.getDOM = function(renderer, dataviewer){
	var value = renderer.value();
	if(value === 0) value = "0";
	var input = document.createElement("span");
	input.setAttribute('class', 'terminus-number-value terminus-literal-value');
	input.setAttribute('data-value', value);
	value = (this.commas ? TerminusClient.FrameHelper.numberWithCommas(value) : value);
	input.appendChild(document.createTextNode(value));
	return input;
}

module.exports={HTMLNumberViewer}

const TerminusClient = require('@terminusdb/terminus-client');

function HTMLNumberViewer(options){
	this.options(options);
}

HTMLNumberViewer.prototype.options = function(options){
	this.commas = (options && options.commas ? options.commas : true);
}

HTMLNumberViewer.prototype.renderFrame = function(frame, dataviewer){
	return this.render(frame.get());
}

HTMLNumberViewer.prototype.renderValue = function(dataviewer){
	return this.render(dataviewer.value());
}
	
HTMLNumberViewer.prototype.render = function(value){
	if(value === 0) value = "0";
	var input = document.createElement("span");
	input.setAttribute('class', 'terminus-number-value terminus-literal-value');
	input.setAttribute('data-value', value);
	value = (this.commas ? TerminusClient.UTILS.TypeHelper.numberWithCommas(value) : value);
	input.appendChild(document.createTextNode(value));
	return input;
}

module.exports={HTMLNumberViewer}

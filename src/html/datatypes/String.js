const HTMLHelper = require('../HTMLHelper');

function HTMLStringViewer(options){
	this.options(options);	
}

HTMLStringViewer.prototype.options = function(options){
	this.size = ((options && options.size) ? options.size : false);
	this.css = ((options && options.css) ? "terminus-literal-value " + options.css : "terminus-literal-value");
	this.max_word_size = (options && options.max_word_size ? options.max_word_size : false);
	this.max_cell_size = (options && options.max_cell_size ? options.max_cell_size : false);
	this.show_types = (options && options.show_types ? options.show_types : false);
}

HTMLStringViewer.prototype.renderFrame = function(frame, dataviewer){
	var value = frame.get();
	return this.render(value);
}

HTMLStringViewer.prototype.renderValue = function(dataviewer){
	return this.render(dataviewer.value());
}

HTMLStringViewer.prototype.render = function(value){
	var input = document.createElement("span");
	input.setAttribute('class', this.css);
	input.setAttribute('data-value', value);
	if(this.show_types && this.type != "id"){
		value += " (" + this.type + ")";
	}
	if(this.max_word_size || this.max_cell_size){
		HTMLHelper.wrapShortenedText(input, value, this.max_cell_size, this.max_word_size);
	}
	else {
		value = document.createTextNode(value);
		input.appendChild(value);
	}
	return input;
}

module.exports={HTMLStringViewer}



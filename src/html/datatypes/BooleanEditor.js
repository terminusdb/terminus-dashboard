function HTMLBooleanEditor(options){
	this.options(options);
}

HTMLBooleanEditor.prototype.options = function(options){	
	this.css = "terminus-literal-value terminus-literal-value-range " + ((options && options.css) ?  options.css : "");
}

HTMLBooleanEditor.prototype.renderFrame = function(frame, dataviewer){
	var value = frame.get();
	var input = document.createElement("input");
	input.setAttribute('type', "checkbox");
	if(value){
		input.setAttribute("checked", "checked");					
	}
	input.addEventListener("change", function(){
		if(value){
			frame.set("");
		}
		else {
			frame.set("true");
		}
	});
	return input;
}

module.exports={HTMLBooleanEditor}


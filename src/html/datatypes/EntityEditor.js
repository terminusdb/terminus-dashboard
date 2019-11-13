function HTMLEntityEditor(options){}
HTMLEntityEditor.prototype.renderFrame = function(frame, dataviewer){
	var value = frame.get();
	var input = document.createElement("input");
	input.setAttribute("class", "terminus-literal-value terminus-entity-reference-value");
	input.setAttribute("type", "text");
	input.setAttribute('size', 80);
	input.value = value;
	var self = this;
	input.addEventListener("change", function(){
		var url = this.value;
		if(url.indexOf("/") == -1 && url.indexOf(":") == -1){
			url = "doc:" + url;
		}
		frame.set(url);
	});
	return input;
}

module.exports={HTMLEntityEditor}